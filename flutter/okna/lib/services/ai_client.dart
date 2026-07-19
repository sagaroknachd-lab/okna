import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/subscription.dart';
import '../data/categories.dart';
import '../logic/advisor.dart';
import '../logic/format.dart';

/// Live-AI layer for the advisor chat. Three modes:
///   proxy — ADVISOR_API_URL passed at build (--dart-define); production path,
///           live Claude for every user via the /server backend (no on-device key)
///   key   — user pasted their own Anthropic key in Settings
///   off   — offline deterministic responder (advisor.dart)
const String kProxyUrl = String.fromEnvironment('ADVISOR_API_URL', defaultValue: '');
const String kProxyToken = String.fromEnvironment('ADVISOR_APP_TOKEN', defaultValue: '');
const String kAnthropicUrl = 'https://api.anthropic.com/v1/messages';
const String kModel = 'claude-opus-4-8';
const String _keyPref = 'okna.anthropic.key.v1';

enum LiveMode { proxy, key, off }

const String _instructions =
    "You are okna's AI savings advisor for middle-class Indian households.\n"
    "Your job: help the user minimise recurring monthly spend — subscriptions, bills, insurance, credit-card fees, loans — and suggest cheaper vendor options and concrete tips.\n\n"
    "Style: warm, concise, specific. Prefer a few short sentences or a tight bullet list. Always denominate in rupees (₹).\n"
    "Ground every suggestion in the user's actual portfolio in the context below. Give concrete next steps: switch monthly→annual, cancel unused plans, consolidate duplicates, move to a cheaper vendor, renew insurance before it lapses.\n"
    "Any prices or plans you mention are indicative — say 'typically around' and tell the user to verify the current offer. Never claim a specific plan exists at an exact live price.\n"
    "Do not invent portfolio items the user doesn't have. If you don't have enough info, ask one short clarifying question.";

class AiClient {
  static String _deviceKey = '';

  static Future<void> loadKey() async {
    final p = await SharedPreferences.getInstance();
    _deviceKey = p.getString(_keyPref) ?? '';
  }

  static String get deviceKey => _deviceKey;

  static Future<void> setKey(String k) async {
    final p = await SharedPreferences.getInstance();
    if (k.trim().isEmpty) {
      await p.remove(_keyPref);
      _deviceKey = '';
    } else {
      await p.setString(_keyPref, k.trim());
      _deviceKey = k.trim();
    }
  }

  static LiveMode mode() {
    if (kProxyUrl.isNotEmpty) return LiveMode.proxy;
    if (_deviceKey.startsWith('sk-')) return LiveMode.key;
    return LiveMode.off;
  }

  static bool get hasLiveAI => mode() != LiveMode.off;

  static String _context(List<Subscription> subs) {
    final tips = advisorTips(subs);
    final vendorLines = <String>[];
    for (final m in vendorAlternatives(subs).take(6)) {
      final best = m.options.first;
      vendorLines.add('- ${categoryMeta(m.subscription.category).label}: ${m.subscription.name} → consider ${best.option.provider} ${best.option.plan} (~${formatINR(best.monthlySaving)}/mo less).');
    }
    return [
      'USER PORTFOLIO:',
      portfolioSummary(subs),
      '',
      if (vendorLines.isNotEmpty) 'CHEAPER VENDOR LEADS:\n${vendorLines.join('\n')}',
      '',
      'GENERAL LEVERS:\n${tips.general.map((t) => '- $t').join('\n')}',
    ].where((s) => s.isNotEmpty).join('\n');
  }

  /// Streams incremental reply text. Throws on auth/network errors so the caller
  /// can fall back to the offline responder.
  static Stream<String> streamReply(
    List<Subscription> subs,
    List<Map<String, String>> history,
  ) async* {
    final m = mode();
    final context = _context(subs);
    final client = http.Client();

    late http.Request req;
    if (m == LiveMode.proxy) {
      req = http.Request('POST', Uri.parse(kProxyUrl));
      req.headers['content-type'] = 'application/json';
      if (kProxyToken.isNotEmpty) req.headers['x-app-token'] = kProxyToken;
      req.body = jsonEncode({'context': context, 'messages': history});
    } else if (m == LiveMode.key) {
      req = http.Request('POST', Uri.parse(kAnthropicUrl));
      req.headers.addAll({
        'content-type': 'application/json',
        'x-api-key': _deviceKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      });
      req.body = jsonEncode({
        'model': kModel,
        'max_tokens': 1024,
        'stream': true,
        'thinking': {'type': 'adaptive'},
        'output_config': {'effort': 'low'},
        'system': '$_instructions\n\n$context',
        'messages': history,
      });
    } else {
      client.close();
      throw Exception('Live AI is not configured.');
    }

    http.StreamedResponse resp;
    try {
      resp = await client.send(req);
    } catch (e) {
      client.close();
      throw Exception('Network error: $e');
    }

    if (resp.statusCode >= 400) {
      final body = await resp.stream.bytesToString();
      String msg = 'Request failed (${resp.statusCode})';
      try {
        final e = jsonDecode(body);
        msg = (e['error']?['message'] ?? msg).toString();
      } catch (_) {}
      client.close();
      throw Exception(resp.statusCode == 401 ? 'authentication: $msg' : msg);
    }

    final lines = resp.stream.transform(utf8.decoder).transform(const LineSplitter());
    await for (final line in lines) {
      final t = line.trim();
      if (!t.startsWith('data:')) continue;
      final payload = t.substring(5).trim();
      if (payload.isEmpty || payload == '[DONE]') continue;
      Map<String, dynamic>? ev;
      try {
        ev = jsonDecode(payload) as Map<String, dynamic>;
      } catch (_) {
        continue;
      }
      if (ev['type'] == 'content_block_delta' &&
          ev['delta'] is Map &&
          ev['delta']['type'] == 'text_delta' &&
          ev['delta']['text'] is String) {
        yield ev['delta']['text'] as String;
      }
    }
    client.close();
  }
}

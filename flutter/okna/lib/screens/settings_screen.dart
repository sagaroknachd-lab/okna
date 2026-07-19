import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../theme.dart';
import '../models/subscription.dart';
import '../services/store.dart';
import '../services/backup.dart';
import '../services/ai_client.dart';
import '../widgets/ui.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});
  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late final TextEditingController _apiKey;

  @override
  void initState() {
    super.initState();
    _apiKey = TextEditingController(text: AiClient.deviceKey);
  }

  @override
  void dispose() {
    _apiKey.dispose();
    super.dispose();
  }

  void _snack(String msg) => ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));

  @override
  Widget build(BuildContext context) {
    final store = context.watch<Store>();
    final subs = store.subscriptions;
    final active = subs.where((s) => s.status == SubStatus.active).length;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: C.white,
        surfaceTintColor: C.white,
        elevation: 0,
        title: const Text('Settings', style: TextStyle(color: C.ink900, fontWeight: FontWeight.bold)),
        iconTheme: const IconThemeData(color: C.ink700),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Your portfolio lives only on this device. Back it up, move it, or start fresh.', style: TextStyle(color: C.ink500)),
          const SizedBox(height: 16),

          OknaCard(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Your data', style: TextStyle(fontWeight: FontWeight.bold, color: C.ink900)),
              const SizedBox(height: 12),
              Row(children: [
                _stat('${subs.length}', 'Subscriptions'),
                const SizedBox(width: 24),
                _stat('$active', 'Active'),
                const SizedBox(width: 24),
                _stat('Local', 'Stored'),
              ]),
            ]),
          ),
          const SizedBox(height: 16),

          OknaCard(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Back up & restore', style: TextStyle(fontWeight: FontWeight.bold, color: C.ink900)),
              const SizedBox(height: 4),
              const Text('Copy a JSON backup you can paste elsewhere, or restore one.', style: TextStyle(fontSize: 13, color: C.ink500)),
              const SizedBox(height: 12),
              Wrap(spacing: 10, runSpacing: 10, children: [
                FilledButton.icon(
                  style: FilledButton.styleFrom(backgroundColor: C.brand600),
                  onPressed: subs.isEmpty ? null : () {
                    Clipboard.setData(ClipboardData(text: serializeBackup(subs)));
                    _snack('Backup copied to clipboard (${subs.length} items).');
                  },
                  icon: const Icon(Icons.copy, size: 16),
                  label: const Text('Copy backup'),
                ),
                OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(side: const BorderSide(color: C.ink200), foregroundColor: C.ink800),
                  onPressed: () => _importDialog(store),
                  icon: const Icon(Icons.download, size: 16),
                  label: const Text('Restore'),
                ),
              ]),
            ]),
          ),
          const SizedBox(height: 16),

          OknaCard(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('AI Advisor', style: TextStyle(fontWeight: FontWeight.bold, color: C.ink900)),
              const SizedBox(height: 4),
              const Text('The AI Advisor works offline. Add an Anthropic API key to upgrade its chat to live Claude, grounded in your portfolio.', style: TextStyle(fontSize: 13, color: C.ink500)),
              if (kProxyUrl.isNotEmpty) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: C.brand50, borderRadius: BorderRadius.circular(10)),
                  child: const Text('⚡ Live AI is already on for everyone via your backend — the key below is optional.', style: TextStyle(fontSize: 12, color: C.brand700, fontWeight: FontWeight.w600)),
                ),
              ],
              const SizedBox(height: 12),
              TextField(
                controller: _apiKey,
                obscureText: true,
                decoration: InputDecoration(
                  hintText: 'sk-ant-...',
                  isDense: true,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: C.ink200)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: C.ink200)),
                ),
              ),
              const SizedBox(height: 10),
              FilledButton(
                style: FilledButton.styleFrom(backgroundColor: C.brand600),
                onPressed: () async {
                  await AiClient.setKey(_apiKey.text);
                  _snack(_apiKey.text.trim().isEmpty ? 'Key cleared — advisor uses the offline assistant.' : 'Saved — live AI is now on in the AI Advisor.');
                },
                child: const Text('Save key'),
              ),
              const SizedBox(height: 8),
              const Text('Stored only on this device and sent directly to Anthropic. For distributing to end customers, route the key through the backend proxy instead.', style: TextStyle(fontSize: 11, color: C.ink400)),
            ]),
          ),
          const SizedBox(height: 16),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: C.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: C.rose200)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Danger zone', style: TextStyle(fontWeight: FontWeight.bold, color: C.rose800)),
              const SizedBox(height: 12),
              Row(children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
                  Text('Reset to demo', style: TextStyle(fontWeight: FontWeight.w500, color: C.ink900)),
                  Text('Replace your data with the sample household.', style: TextStyle(fontSize: 12, color: C.ink500)),
                ])),
                OutlinedButton(style: OutlinedButton.styleFrom(side: const BorderSide(color: C.ink200), foregroundColor: C.ink800), onPressed: () async {
                  if (await _confirm('Reset to the demo portfolio?')) { store.reset(); _snack('Restored the demo portfolio.'); }
                }, child: const Text('Reset')),
              ]),
              const Divider(height: 24, color: C.ink100),
              Row(children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: const [
                  Text('Clear everything', style: TextStyle(fontWeight: FontWeight.w500, color: C.ink900)),
                  Text('Remove all subscriptions. Export a backup first.', style: TextStyle(fontSize: 12, color: C.ink500)),
                ])),
                FilledButton(style: FilledButton.styleFrom(backgroundColor: C.rose50, foregroundColor: C.rose700), onPressed: subs.isEmpty ? null : () async {
                  if (await _confirm('Delete all subscriptions? This cannot be undone.')) { store.clear(); _snack('All subscriptions removed.'); }
                }, child: const Text('Delete all')),
              ]),
            ]),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _stat(String value, String label) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: C.ink900)),
        Text(label.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: C.ink400)),
      ]);

  Future<bool> _confirm(String msg) async =>
      await showDialog<bool>(
        context: context,
        builder: (_) => AlertDialog(
          content: Text(msg),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
            FilledButton(style: FilledButton.styleFrom(backgroundColor: C.brand600), onPressed: () => Navigator.pop(context, true), child: const Text('Confirm')),
          ],
        ),
      ) ??
      false;

  void _importDialog(Store store) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Restore from JSON'),
        content: TextField(
          controller: controller,
          maxLines: 6,
          decoration: const InputDecoration(hintText: '{"app":"okna","subscriptions":[ ... ]}', border: OutlineInputBorder()),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: C.brand600),
            onPressed: () {
              try {
                final subs = parseBackup(controller.text);
                store.replaceAll(subs);
                Navigator.pop(ctx);
                _snack('Imported ${subs.length} subscriptions. Previous data replaced.');
              } on BackupError catch (e) {
                _snack(e.message);
              } catch (_) {
                _snack('Import failed.');
              }
            },
            child: const Text('Import'),
          ),
        ],
      ),
    );
  }
}

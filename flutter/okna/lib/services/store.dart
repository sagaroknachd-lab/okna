import 'dart:convert';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/subscription.dart';
import '../data/seed.dart';
import 'notifications.dart';

/// localStorage-equivalent store backed by shared_preferences, exposed as a
/// ChangeNotifier (the Flutter analog of the web app's React context store).
class Store extends ChangeNotifier {
  static const _key = 'okna.subscriptions.v1';

  List<Subscription> _subs = [];
  bool _ready = false;
  SharedPreferences? _prefs;
  final _rnd = Random();

  List<Subscription> get subscriptions => List.unmodifiable(_subs);
  bool get ready => _ready;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    final raw = _prefs!.getString(_key);
    if (raw != null) {
      try {
        _subs = (jsonDecode(raw) as List)
            .map((e) => Subscription.fromJson(e as Map<String, dynamic>))
            .toList();
      } catch (_) {
        _subs = defaultSubscriptions();
      }
    } else {
      _subs = defaultSubscriptions();
    }
    _ready = true;
    notifyListeners();
    _syncNotifications();
  }

  void _commit() {
    _prefs?.setString(_key, jsonEncode(_subs.map((s) => s.toJson()).toList()));
    notifyListeners();
    _syncNotifications();
  }

  void _syncNotifications() {
    // Best-effort; never blocks or throws into the UI.
    syncRenewalNotifications(_subs);
  }

  String newId() =>
      'sub-${DateTime.now().millisecondsSinceEpoch.toRadixString(36)}-${_rnd.nextInt(1 << 20).toRadixString(36)}';

  /// Build a new Subscription (id + createdAt generated) from form fields.
  Subscription create({
    required String name,
    required String provider,
    required CategoryId category,
    required num amount,
    required BillingCycle cycle,
    required String nextRenewal,
    required SubStatus status,
    required bool autoRenew,
    required UsageFrequency usage,
    String? notes,
  }) {
    return Subscription(
      id: newId(),
      createdAt: DateTime.now().toIso8601String(),
      name: name,
      provider: provider,
      category: category,
      amount: amount,
      cycle: cycle,
      nextRenewal: nextRenewal,
      status: status,
      autoRenew: autoRenew,
      usage: usage,
      notes: notes,
    );
  }

  void add(Subscription s) {
    _subs = [s, ..._subs];
    _commit();
  }

  void update(Subscription s) {
    _subs = _subs.map((x) => x.id == s.id ? s : x).toList();
    _commit();
  }

  void remove(String id) {
    _subs = _subs.where((s) => s.id != id).toList();
    _commit();
  }

  void setStatus(String id, SubStatus status) {
    _subs = _subs.map((s) => s.id == id ? s.copyWith(status: status) : s).toList();
    _commit();
  }

  void replaceAll(List<Subscription> subs) {
    _subs = List.of(subs);
    _commit();
  }

  void clear() {
    _subs = [];
    _commit();
  }

  void reset() {
    _subs = defaultSubscriptions();
    _commit();
  }
}

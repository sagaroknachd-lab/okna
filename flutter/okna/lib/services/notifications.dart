import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:timezone/data/latest_all.dart' as tzdata;
import 'package:timezone/timezone.dart' as tz;
import '../models/subscription.dart';
import '../logic/format.dart';

/// Native renewal reminders (the Flutter analog of the web app's
/// local-notifications sync). Best-effort — every call is guarded so a
/// notification failure never breaks the app.

final FlutterLocalNotificationsPlugin _plugin = FlutterLocalNotificationsPlugin();
bool _inited = false;

const int _leadDays = 3;
const int _lapseLeadDays = 5;
const Set<CategoryId> _lapseCategories = {
  CategoryId.insurance,
  CategoryId.electricity,
  CategoryId.gas,
};

Future<void> initNotifications() async {
  try {
    tzdata.initializeTimeZones();
    tz.setLocalLocation(tz.getLocation('Asia/Kolkata'));
    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    await _plugin.initialize(const InitializationSettings(android: android));
    await _plugin
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.requestNotificationsPermission();
    _inited = true;
  } catch (_) {
    _inited = false;
  }
}

int _notificationId(String subId) {
  var h = 0;
  for (final c in subId.codeUnits) {
    h = (h * 31 + c) & 0x7fffffff;
  }
  return (h % 2000000000) + 1;
}

Future<void> syncRenewalNotifications(List<Subscription> subs) async {
  if (!_inited) return;
  try {
    await _plugin.cancelAll();
    const details = NotificationDetails(
      android: AndroidNotificationDetails(
        'okna-renewals',
        'Renewals',
        channelDescription: 'Reminders before your bills and subscriptions renew',
        importance: Importance.high,
        priority: Priority.high,
      ),
    );
    final now = DateTime.now();
    for (final s in subs) {
      if (s.status != SubStatus.active) continue;
      final lapseRisk = !s.autoRenew && _lapseCategories.contains(s.category);
      final lead = lapseRisk ? _lapseLeadDays : _leadDays;
      final at = DateTime.parse('${s.nextRenewal}T09:00:00').subtract(Duration(days: lead));
      if (!at.isAfter(now)) continue;
      final title = lapseRisk
          ? '⚠️ ${s.name} — renew to avoid a lapse'
          : '${s.name} renews ${relativeDay(s.nextRenewal)}';
      final body = lapseRisk
          ? 'Manual renewal due ${formatDate(s.nextRenewal)}. Pay on time to keep cover and your no-claim bonus.'
          : 'Due ${formatDate(s.nextRenewal)}. Open okna to review, switch or cancel if you no longer need it.';
      await _plugin.zonedSchedule(
        _notificationId(s.id),
        title,
        body,
        tz.TZDateTime.from(at, tz.local),
        details,
        androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
        uiLocalNotificationDateInterpretation: UILocalNotificationDateInterpretation.absoluteTime,
      );
    }
  } catch (_) {
    // best-effort
  }
}

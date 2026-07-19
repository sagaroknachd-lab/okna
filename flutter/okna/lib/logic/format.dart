import 'package:intl/intl.dart';
import '../models/subscription.dart';

const Map<BillingCycle, int> kCyclesPerYear = {
  BillingCycle.monthly: 12,
  BillingCycle.quarterly: 4,
  BillingCycle.halfYearly: 2,
  BillingCycle.yearly: 1,
};

const Map<BillingCycle, String> kCycleLabel = {
  BillingCycle.monthly: '/month',
  BillingCycle.quarterly: '/quarter',
  BillingCycle.halfYearly: '/6 months',
  BillingCycle.yearly: '/year',
};

double monthlyEquivalent(num amount, BillingCycle cycle) =>
    amount.toDouble() * kCyclesPerYear[cycle]! / 12.0;

double yearlyEquivalent(num amount, BillingCycle cycle) =>
    amount.toDouble() * kCyclesPerYear[cycle]!;

final NumberFormat _inr =
    NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

String formatINR(num value) => _inr.format(value.round());

String formatINRCompact(num value) {
  final v = value.round();
  if (v >= 10000000) return '₹${(v / 10000000).toStringAsFixed(1)}Cr';
  if (v >= 100000) return '₹${(v / 100000).toStringAsFixed(1)}L';
  if (v >= 1000) return '₹${(v / 1000).toStringAsFixed(1)}K';
  return _inr.format(v);
}

DateTime _parseIso(String iso) => DateTime.parse('${iso}T00:00:00');
final DateFormat _dateFmt = DateFormat('d MMM yyyy');
final DateFormat _dateShort = DateFormat('d MMM');

String formatDate(String iso) => _dateFmt.format(_parseIso(iso));
String formatDateShort(String iso) => _dateShort.format(_parseIso(iso));

/// Whole days from today until the given ISO date (negative if past).
int daysUntil(String iso, [DateTime? today]) {
  final t = today ?? DateTime.now();
  final target = _parseIso(iso);
  final base = DateTime(t.year, t.month, t.day);
  return (target.difference(base).inMilliseconds / 86400000).round();
}

String relativeDay(String iso, [DateTime? today]) {
  final d = daysUntil(iso, today);
  if (d < 0) return '${d.abs()}d overdue';
  if (d == 0) return 'Today';
  if (d == 1) return 'Tomorrow';
  if (d < 7) return 'in $d days';
  if (d < 30) return 'in ${(d / 7).round()} wk';
  return 'in ${(d / 30).round()} mo';
}

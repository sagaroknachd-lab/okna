import '../models/subscription.dart';
import 'format.dart';

class CategoryTotal {
  final CategoryId category;
  double monthly;
  int count;
  CategoryTotal(this.category, this.monthly, this.count);
}

class PortfolioStats {
  final double monthlySpend;
  final double yearlySpend;
  final int activeCount;
  final int upcomingCount; // renewals within 7 days
  final List<CategoryTotal> byCategory;
  const PortfolioStats({
    required this.monthlySpend,
    required this.yearlySpend,
    required this.activeCount,
    required this.upcomingCount,
    required this.byCategory,
  });
}

PortfolioStats computeStats(List<Subscription> subs) {
  final active = subs.where((s) => s.status == SubStatus.active).toList();
  double monthlySpend = 0;
  double yearlySpend = 0;
  final cat = <CategoryId, CategoryTotal>{};

  for (final s in active) {
    final m = monthlyEquivalent(s.amount, s.cycle);
    monthlySpend += m;
    yearlySpend += yearlyEquivalent(s.amount, s.cycle);
    final entry = cat.putIfAbsent(s.category, () => CategoryTotal(s.category, 0, 0));
    entry.monthly += m;
    entry.count += 1;
  }

  final upcomingCount = active.where((s) {
    final d = daysUntil(s.nextRenewal);
    return d >= 0 && d <= 7;
  }).length;

  final byCategory = cat.values.toList()..sort((a, b) => b.monthly.compareTo(a.monthly));

  return PortfolioStats(
    monthlySpend: monthlySpend,
    yearlySpend: yearlySpend,
    activeCount: active.length,
    upcomingCount: upcomingCount,
    byCategory: byCategory,
  );
}

/// Active subscriptions sorted by soonest renewal, within [withinDays].
List<Subscription> upcomingRenewals(List<Subscription> subs, [int withinDays = 45]) {
  final list = subs
      .where((s) => s.status == SubStatus.active)
      .map((s) => (s: s, d: daysUntil(s.nextRenewal)))
      .where((e) => e.d <= withinDays)
      .toList()
    ..sort((a, b) => a.d.compareTo(b.d));
  return list.map((e) => e.s).toList();
}

/// Insurance / statutory renewals with auto-renew off that must not lapse.
List<Subscription> lapseRisks(List<Subscription> subs) {
  return subs
      .where((s) =>
          s.status == SubStatus.active &&
          !s.autoRenew &&
          (s.category == CategoryId.insurance ||
              s.category == CategoryId.electricity ||
              s.category == CategoryId.gas) &&
          daysUntil(s.nextRenewal) <= 15)
      .toList();
}

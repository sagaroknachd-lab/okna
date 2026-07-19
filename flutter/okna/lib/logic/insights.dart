import '../models/subscription.dart';
import '../data/plans.dart';
import 'format.dart';

enum InsightKind { unused, cheaperPlan, duplicate, annualSwitch, renewalSoon, autoRenewOff }

class Insight {
  final String id;
  final InsightKind kind;
  final String subscriptionId;
  final String title;
  final String detail;
  final double monthlySaving;
  final String cta;
  final String? planId;
  const Insight({
    required this.id,
    required this.kind,
    required this.subscriptionId,
    required this.title,
    required this.detail,
    required this.monthlySaving,
    required this.cta,
    this.planId,
  });
}

const Set<CategoryId> _discretionary = {
  CategoryId.ott,
  CategoryId.gym,
  CategoryId.software,
  CategoryId.membership,
  CategoryId.mobile,
};

const Set<CategoryId> _comparable = {
  CategoryId.mobile,
  CategoryId.broadband,
  CategoryId.ott,
  CategoryId.software,
  CategoryId.gym,
};

MarketPlan? _cheapestPlan(CategoryId category) {
  final plans = kMarketPlans.where((p) => p.category == category).toList();
  if (plans.isEmpty) return null;
  return plans.reduce((min, p) =>
      monthlyEquivalent(p.amount, p.cycle) < monthlyEquivalent(min.amount, min.cycle) ? p : min);
}

String _usageLabel(UsageFrequency u) => usageWire(u);

List<Insight> generateInsights(List<Subscription> subs) {
  final insights = <Insight>[];
  final active = subs.where((s) => s.status != SubStatus.cancelled).toList();

  // 1. Unused / rarely used discretionary subscriptions.
  for (final s in active) {
    if (s.status == SubStatus.active &&
        _discretionary.contains(s.category) &&
        (s.usage == UsageFrequency.rarely || s.usage == UsageFrequency.never)) {
      final save = monthlyEquivalent(s.amount, s.cycle);
      insights.add(Insight(
        id: 'unused-${s.id}',
        kind: InsightKind.unused,
        subscriptionId: s.id,
        title: 'You barely use ${s.name}',
        detail: 'Marked as "${_usageLabel(s.usage)}". Cancelling frees up money you\'re not getting value from.',
        monthlySaving: save,
        cta: 'Cancel & save',
      ));
    }
  }

  // 2. Cheaper plan available in the same category.
  for (final s in active) {
    if (!_comparable.contains(s.category)) continue;
    final plan = _cheapestPlan(s.category);
    if (plan == null) continue;
    final current = monthlyEquivalent(s.amount, s.cycle);
    final alt = monthlyEquivalent(plan.amount, plan.cycle);
    final diff = current - alt;
    if (diff >= 50) {
      insights.add(Insight(
        id: 'cheaper-${s.id}',
        kind: InsightKind.cheaperPlan,
        subscriptionId: s.id,
        planId: plan.id,
        title: 'Cheaper option than ${s.name}',
        detail: 'Switch to ${plan.provider} ${plan.name} and get similar value for less.',
        monthlySaving: diff,
        cta: 'Switch to ${plan.provider}',
      ));
    }
  }

  // 3. Duplicate services from the same provider.
  final byProvider = <String, List<Subscription>>{};
  for (final s in active) {
    byProvider.putIfAbsent(s.provider.toLowerCase(), () => []).add(s);
  }
  for (final group in byProvider.values) {
    if (group.length < 2) continue;
    final sorted = [...group]..sort((a, b) =>
        monthlyEquivalent(b.amount, b.cycle).compareTo(monthlyEquivalent(a.amount, a.cycle)));
    for (final dup in sorted.skip(1)) {
      insights.add(Insight(
        id: 'dup-${dup.id}',
        kind: InsightKind.duplicate,
        subscriptionId: dup.id,
        title: 'Duplicate ${dup.provider} subscription',
        detail: "You're paying for ${dup.provider} more than once. Consolidate to a single account.",
        monthlySaving: monthlyEquivalent(dup.amount, dup.cycle),
        cta: 'Remove duplicate',
      ));
    }
  }

  // 4. Monthly → annual switch for software/OTT (~20% cheaper).
  for (final s in active) {
    if (s.status != SubStatus.active) continue;
    if ((s.category == CategoryId.software || s.category == CategoryId.ott) &&
        s.cycle == BillingCycle.monthly) {
      final save = monthlyEquivalent(s.amount, s.cycle) * 0.2;
      if (save >= 30) {
        insights.add(Insight(
          id: 'annual-${s.id}',
          kind: InsightKind.annualSwitch,
          subscriptionId: s.id,
          title: 'Pay ${s.name} yearly to save',
          detail: 'Annual billing is typically ~20% cheaper than paying monthly.',
          monthlySaving: save,
          cta: 'Switch to annual',
        ));
      }
    }
  }

  insights.sort((a, b) => b.monthlySaving.compareTo(a.monthlySaving));
  return insights;
}

/// Total addressable monthly saving, counting at most one insight per subscription.
double potentialMonthlySaving(List<Insight> insights) {
  final best = <String, double>{};
  for (final i in insights) {
    best[i.subscriptionId] =
        (best[i.subscriptionId] ?? 0) > i.monthlySaving ? best[i.subscriptionId]! : i.monthlySaving;
  }
  return best.values.fold(0.0, (a, b) => a + b);
}

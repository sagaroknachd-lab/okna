import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme.dart';
import '../models/subscription.dart';
import '../services/store.dart';
import '../logic/insights.dart';
import '../logic/format.dart';
import '../data/plans.dart';
import '../widgets/ui.dart';

class SavingsScreen extends StatelessWidget {
  const SavingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final store = context.watch<Store>();
    if (!store.ready) return const Center(child: CircularProgressIndicator());
    final subs = store.subscriptions;
    final insights = generateInsights(subs);
    final monthly = potentialMonthlySaving(insights);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Savings opportunities', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: C.ink900)),
        const SizedBox(height: 4),
        const Text('okna scans your plans for waste, cheaper alternatives and duplicates.', style: TextStyle(color: C.ink500)),
        const SizedBox(height: 16),
        _headline(monthly, insights.length),
        const SizedBox(height: 16),
        if (insights.isEmpty)
          OknaCard(
            padding: const EdgeInsets.all(28),
            child: Column(children: const [
              Text('🎉', style: TextStyle(fontSize: 26)),
              SizedBox(height: 8),
              Text('No waste detected', style: TextStyle(fontWeight: FontWeight.bold, color: C.ink900)),
              SizedBox(height: 4),
              Text('Every plan looks used and competitively priced.', textAlign: TextAlign.center, style: TextStyle(color: C.ink500, fontSize: 13)),
            ]),
          )
        else
          ...insights.map((i) => _insightCard(context, store, subs, i)),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _headline(double monthly, int count) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: const LinearGradient(colors: [C.brand600, C.brand800], begin: Alignment.topLeft, end: Alignment.bottomRight),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Total identified savings', style: TextStyle(color: C.brand100, fontSize: 13, fontWeight: FontWeight.w500)),
        const SizedBox(height: 4),
        Text('${formatINR(monthly)}/mo', style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text("that's ${formatINR(monthly * 12)} a year back in your pocket", style: const TextStyle(color: C.brand100)),
        const SizedBox(height: 8),
        Text('$count opportunit${count == 1 ? "y" : "ies"} found across your portfolio', style: const TextStyle(color: C.brand100, fontSize: 13)),
      ]),
    );
  }

  static const _meta = {
    InsightKind.unused: ('🗑️', 'Unused'),
    InsightKind.cheaperPlan: ('🔻', 'Cheaper plan'),
    InsightKind.duplicate: ('👯', 'Duplicate'),
    InsightKind.annualSwitch: ('📅', 'Billing switch'),
    InsightKind.renewalSoon: ('🔔', 'Renewal'),
    InsightKind.autoRenewOff: ('⚠️', 'Risk'),
  };

  Widget _insightCard(BuildContext context, Store store, List<Subscription> subs, Insight i) {
    final meta = _meta[i.kind]!;
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: OknaCard(
        padding: const EdgeInsets.all(14),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Container(
              width: 40, height: 40,
              decoration: BoxDecoration(color: C.brand50, borderRadius: BorderRadius.circular(12)),
              alignment: Alignment.center,
              child: Text(meta.$1, style: const TextStyle(fontSize: 18)),
            ),
            const SizedBox(width: 12),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(i.title, style: const TextStyle(fontWeight: FontWeight.w600, color: C.ink900)),
              const SizedBox(height: 4),
              Text(i.detail, style: const TextStyle(fontSize: 13, color: C.ink500)),
            ])),
          ]),
          const SizedBox(height: 12),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Pill('+${formatINR(i.monthlySaving)}/mo'),
            FilledButton(
              style: FilledButton.styleFrom(backgroundColor: C.ink900, padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8), minimumSize: const Size(0, 0)),
              onPressed: () => _apply(context, store, subs, i),
              child: Text(i.cta, style: const TextStyle(fontSize: 12)),
            ),
          ]),
        ]),
      ),
    );
  }

  Future<void> _apply(BuildContext context, Store store, List<Subscription> subs, Insight i) async {
    Subscription? sub;
    for (final s in subs) {
      if (s.id == i.subscriptionId) sub = s;
    }
    if (sub == null) return;

    Future<bool> confirm(String msg) async {
      return await showDialog<bool>(
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
    }

    switch (i.kind) {
      case InsightKind.unused:
        if (await confirm('Mark as cancelled? It moves out of your active spend.')) {
          store.setStatus(i.subscriptionId, SubStatus.cancelled);
        }
        break;
      case InsightKind.duplicate:
        if (await confirm('Remove this duplicate subscription?')) store.remove(i.subscriptionId);
        break;
      case InsightKind.cheaperPlan:
        MarketPlan? plan;
        for (final p in kMarketPlans) {
          if (p.id == i.planId) plan = p;
        }
        if (plan != null && await confirm('Switch to ${plan.provider} ${plan.name} for ${formatINR(plan.amount)}?')) {
          store.update(sub.copyWith(provider: plan.provider, name: '${plan.provider} ${plan.name}', amount: plan.amount, cycle: plan.cycle));
        }
        break;
      case InsightKind.annualSwitch:
        if (await confirm('Switch to yearly billing (~20% cheaper)?')) {
          final newYearly = (yearlyEquivalent(sub.amount, sub.cycle) * 0.8).round();
          store.update(sub.copyWith(cycle: BillingCycle.yearly, amount: newYearly));
        }
        break;
      default:
        break;
    }
  }
}

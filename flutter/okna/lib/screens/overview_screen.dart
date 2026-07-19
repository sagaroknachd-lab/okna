import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme.dart';
import '../services/store.dart';
import '../logic/stats.dart';
import '../logic/insights.dart';
import '../logic/format.dart';
import '../widgets/ui.dart';

class OverviewScreen extends StatelessWidget {
  const OverviewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final store = context.watch<Store>();
    if (!store.ready) return const Center(child: CircularProgressIndicator());
    final subs = store.subscriptions;
    final stats = computeStats(subs);
    final insights = generateInsights(subs);
    final saving = potentialMonthlySaving(insights);
    final renewals = upcomingRenewals(subs, 30).take(5).toList();
    final risks = lapseRisks(subs);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Your money, at a glance',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: C.ink900)),
        const SizedBox(height: 4),
        const Text('Everything you pay for on repeat — tracked, compared and never forgotten.',
            style: TextStyle(color: C.ink500)),
        const SizedBox(height: 16),
        Row(children: [
          Expanded(child: StatCard(label: 'Monthly spend', value: formatINR(stats.monthlySpend), sub: '${formatINRCompact(stats.yearlySpend)} / year', icon: '💸')),
          const SizedBox(width: 12),
          Expanded(child: StatCard(label: 'Active plans', value: '${stats.activeCount}', sub: 'across ${stats.byCategory.length} categories', icon: '🗂️')),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: StatCard(label: 'Due in 7 days', value: '${stats.upcomingCount}', sub: 'renewals coming up', icon: '🔔', accent: stats.upcomingCount > 0 ? C.amber600 : C.ink900)),
          const SizedBox(width: 12),
          Expanded(child: StatCard(label: 'You could save', value: formatINR(saving), sub: 'per month with okna', icon: '💡', accent: C.brand600)),
        ]),
        if (risks.isNotEmpty) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: C.rose50, borderRadius: BorderRadius.circular(16), border: Border.all(color: C.rose200)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('⚠️ ${risks.length} renewal${risks.length > 1 ? "s" : ""} need your action',
                  style: const TextStyle(fontWeight: FontWeight.bold, color: C.rose800)),
              const SizedBox(height: 4),
              const Text("These aren't on auto-pay — missing them means a lapse or late fee. See the Reminders tab.",
                  style: TextStyle(fontSize: 13, color: C.rose700)),
            ]),
          ),
        ],
        const SizedBox(height: 16),
        OknaCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Where your money goes', style: TextStyle(fontWeight: FontWeight.bold, color: C.ink900)),
            const SizedBox(height: 12),
            CategoryDonut(data: stats.byCategory, total: stats.monthlySpend),
          ]),
        ),
        const SizedBox(height: 16),
        OknaCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Top ways to save', style: TextStyle(fontWeight: FontWeight.bold, color: C.ink900)),
            const SizedBox(height: 12),
            if (insights.isEmpty)
              const Text("You're running a tight ship — no obvious savings right now. 🎉", style: TextStyle(color: C.ink500))
            else
              ...insights.take(3).map((i) => Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: C.ink100)),
                    child: Row(children: [
                      Expanded(child: Text(i.title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: C.ink800))),
                      const SizedBox(width: 8),
                      Pill('+${formatINR(i.monthlySaving)}/mo'),
                    ]),
                  )),
          ]),
        ),
        const SizedBox(height: 16),
        OknaCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Coming up', style: TextStyle(fontWeight: FontWeight.bold, color: C.ink900)),
            const SizedBox(height: 8),
            if (renewals.isEmpty)
              const Text('Nothing due in the next 30 days.', style: TextStyle(color: C.ink500))
            else
              ...renewals.map((s) {
                final d = daysUntil(s.nextRenewal);
                final soon = d <= 7;
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Row(children: [
                    Container(
                      width: 40, height: 40,
                      decoration: BoxDecoration(color: soon ? C.rose50 : C.ink50, borderRadius: BorderRadius.circular(10)),
                      alignment: Alignment.center,
                      child: Column(mainAxisSize: MainAxisSize.min, children: [
                        Text('${d < 0 ? 0 : d}', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: soon ? C.rose700 : C.ink600)),
                        Text('days', style: TextStyle(fontSize: 8, color: soon ? C.rose600 : C.ink500)),
                      ]),
                    ),
                    const SizedBox(width: 12),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(s.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w500, color: C.ink900)),
                      const SizedBox(height: 2),
                      CategoryChip(s.category),
                    ])),
                    const SizedBox(width: 8),
                    Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                      Text('${formatINR(s.amount)}${kCycleLabel[s.cycle]}', style: const TextStyle(fontWeight: FontWeight.w600, color: C.ink900, fontSize: 13)),
                      Text(relativeDay(s.nextRenewal), style: TextStyle(fontSize: 11, color: soon ? C.rose600 : C.ink400)),
                    ]),
                  ]),
                );
              }),
          ]),
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}

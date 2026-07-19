import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme.dart';
import '../models/subscription.dart';
import '../services/store.dart';
import '../logic/stats.dart';
import '../logic/format.dart';
import '../widgets/ui.dart';

class RemindersScreen extends StatelessWidget {
  const RemindersScreen({super.key});

  String _nextCycleDate(String iso, BillingCycle cycle) {
    final d = DateTime.parse('${iso}T00:00:00');
    final monthsToAdd = (12 / kCyclesPerYear[cycle]!).round();
    final next = DateTime(d.year, d.month + monthsToAdd, d.day);
    String two(int n) => n.toString().padLeft(2, '0');
    return '${next.year}-${two(next.month)}-${two(next.day)}';
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<Store>();
    if (!store.ready) return const Center(child: CircularProgressIndicator());
    final subs = store.subscriptions;
    final upcoming = upcomingRenewals(subs, 60);
    final risks = lapseRisks(subs);

    final overdue = upcoming.where((s) => daysUntil(s.nextRenewal) < 0).toList();
    final week = upcoming.where((s) { final d = daysUntil(s.nextRenewal); return d >= 0 && d <= 7; }).toList();
    final month = upcoming.where((s) { final d = daysUntil(s.nextRenewal); return d > 7 && d <= 30; }).toList();
    final later = upcoming.where((s) => daysUntil(s.nextRenewal) > 30).toList();

    void markPaid(Subscription s) => store.update(s.copyWith(nextRenewal: _nextCycleDate(s.nextRenewal, s.cycle)));

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Reminders', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: C.ink900)),
        const SizedBox(height: 4),
        const Text('Never miss a renewal, insurance date or bill again.', style: TextStyle(color: C.ink500)),
        const SizedBox(height: 16),
        if (risks.isNotEmpty) ...[
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: C.rose50, borderRadius: BorderRadius.circular(16), border: Border.all(color: C.rose200)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('⚠️ Must not lapse', style: TextStyle(fontWeight: FontWeight.bold, color: C.rose800)),
              const SizedBox(height: 4),
              const Text('Manual renewals due soon — a miss means a penalty, lost cover or lost no-claim bonus.', style: TextStyle(fontSize: 13, color: C.rose700)),
              const SizedBox(height: 10),
              ...risks.map((s) => Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: C.white, borderRadius: BorderRadius.circular(12)),
                    child: Row(children: [
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(s.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w500, color: C.ink900)),
                        Text('Due ${relativeDay(s.nextRenewal)} · ${formatDate(s.nextRenewal)}', style: const TextStyle(fontSize: 11, color: C.rose600)),
                      ])),
                      Text(formatINR(s.amount), style: const TextStyle(fontWeight: FontWeight.w600, color: C.ink900)),
                      const SizedBox(width: 8),
                      FilledButton(style: FilledButton.styleFrom(backgroundColor: C.brand600, padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), minimumSize: const Size(0, 0)), onPressed: () => markPaid(s), child: const Text('Mark paid', style: TextStyle(fontSize: 12))),
                    ]),
                  )),
            ]),
          ),
          const SizedBox(height: 16),
        ],
        _bucket(context, store, 'Overdue', overdue, markPaid, C.rose600),
        _bucket(context, store, 'This week', week, markPaid, C.amber600),
        _bucket(context, store, 'This month', month, markPaid, C.ink300),
        _bucket(context, store, 'Later', later, markPaid, C.ink300),
        if (overdue.isEmpty && week.isEmpty && month.isEmpty && later.isEmpty)
          const OknaCard(padding: EdgeInsets.all(28), child: Center(child: Text("Nothing due in the next 60 days. You're all caught up. ✅", textAlign: TextAlign.center, style: TextStyle(color: C.ink500)))),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _bucket(BuildContext context, Store store, String title, List<Subscription> items, void Function(Subscription) onPaid, Color dot) {
    if (items.isEmpty) return const SizedBox.shrink();
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: OknaCard(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Container(width: 8, height: 8, decoration: BoxDecoration(color: dot, shape: BoxShape.circle)),
            const SizedBox(width: 8),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: C.ink900)),
            const SizedBox(width: 6),
            Text('(${items.length})', style: const TextStyle(color: C.ink400, fontSize: 13)),
          ]),
          const SizedBox(height: 8),
          ...items.map((s) {
            final d = daysUntil(s.nextRenewal);
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(s.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w500, color: C.ink900)),
                  const SizedBox(height: 4),
                  Row(children: [
                    CategoryChip(s.category),
                    const SizedBox(width: 8),
                    Text('${relativeDay(s.nextRenewal)} · ${formatDate(s.nextRenewal)}', style: TextStyle(fontSize: 11, color: d < 0 ? C.rose600 : C.ink400)),
                  ]),
                ])),
                Text(formatINR(s.amount), style: const TextStyle(fontWeight: FontWeight.w600, color: C.ink900)),
                const SizedBox(width: 8),
                OutlinedButton(
                  style: OutlinedButton.styleFrom(side: const BorderSide(color: C.ink200), padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6), minimumSize: const Size(0, 0)),
                  onPressed: () => onPaid(s),
                  child: const Text('Mark paid', style: TextStyle(fontSize: 12, color: C.ink700)),
                ),
              ]),
            );
          }),
        ]),
      ),
    );
  }
}

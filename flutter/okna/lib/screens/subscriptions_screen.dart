import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme.dart';
import '../models/subscription.dart';
import '../services/store.dart';
import '../logic/format.dart';
import '../widgets/ui.dart';
import '../widgets/subscription_form.dart';

class SubscriptionsScreen extends StatefulWidget {
  const SubscriptionsScreen({super.key});
  @override
  State<SubscriptionsScreen> createState() => _SubscriptionsScreenState();
}

class _SubscriptionsScreenState extends State<SubscriptionsScreen> {
  String _query = '';
  SubStatus? _status;
  String _sort = 'renewal';

  @override
  Widget build(BuildContext context) {
    final store = context.watch<Store>();
    if (!store.ready) return const Center(child: CircularProgressIndicator());

    var list = store.subscriptions.where((s) {
      if (_status != null && s.status != _status) return false;
      if (_query.isNotEmpty) {
        final q = _query.toLowerCase();
        return s.name.toLowerCase().contains(q) || s.provider.toLowerCase().contains(q);
      }
      return true;
    }).toList();

    list.sort((a, b) {
      switch (_sort) {
        case 'amount':
          return monthlyEquivalent(b.amount, b.cycle).compareTo(monthlyEquivalent(a.amount, a.cycle));
        case 'name':
          return a.name.toLowerCase().compareTo(b.name.toLowerCase());
        default:
          return daysUntil(a.nextRenewal).compareTo(daysUntil(b.nextRenewal));
      }
    });

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        TextField(
          onChanged: (v) => setState(() => _query = v),
          decoration: InputDecoration(
            hintText: 'Search subscriptions…',
            prefixIcon: const Icon(Icons.search, color: C.ink400),
            isDense: true,
            filled: true,
            fillColor: C.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: C.ink200)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: C.ink200)),
          ),
        ),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(children: [
                _filterChip('All', _status == null, () => setState(() => _status = null)),
                _filterChip('Active', _status == SubStatus.active, () => setState(() => _status = SubStatus.active)),
                _filterChip('Paused', _status == SubStatus.paused, () => setState(() => _status = SubStatus.paused)),
                _filterChip('Cancelled', _status == SubStatus.cancelled, () => setState(() => _status = SubStatus.cancelled)),
              ]),
            ),
          ),
          PopupMenuButton<String>(
            initialValue: _sort,
            onSelected: (v) => setState(() => _sort = v),
            icon: const Icon(Icons.sort, color: C.ink600),
            itemBuilder: (_) => const [
              PopupMenuItem(value: 'renewal', child: Text('Sort: renewal')),
              PopupMenuItem(value: 'amount', child: Text('Sort: amount')),
              PopupMenuItem(value: 'name', child: Text('Sort: name')),
            ],
          ),
        ]),
        const SizedBox(height: 12),
        if (list.isEmpty)
          const Padding(padding: EdgeInsets.all(32), child: Center(child: Text('No subscriptions match.', style: TextStyle(color: C.ink500))))
        else
          ...list.map((s) => _row(context, store, s)),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _filterChip(String label, bool active, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          decoration: BoxDecoration(
            color: active ? C.brand600 : C.white,
            borderRadius: BorderRadius.circular(999),
            border: Border.all(color: active ? C.brand600 : C.ink200),
          ),
          child: Text(label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: active ? Colors.white : C.ink600)),
        ),
      ),
    );
  }

  Widget _row(BuildContext context, Store store, Subscription s) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: OknaCard(
        padding: const EdgeInsets.all(14),
        child: Row(children: [
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Flexible(child: Text(s.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w600, color: C.ink900))),
                if (s.status != SubStatus.active) ...[
                  const SizedBox(width: 6),
                  _statusBadge(s.status),
                ],
              ]),
              const SizedBox(height: 6),
              Row(children: [
                CategoryChip(s.category),
                const SizedBox(width: 8),
                Text('${formatINR(s.amount)}${kCycleLabel[s.cycle]}', style: const TextStyle(fontSize: 12, color: C.ink500)),
              ]),
            ]),
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert, color: C.ink400),
            onSelected: (v) {
              switch (v) {
                case 'edit':
                  showSubscriptionForm(context, existing: s);
                  break;
                case 'pause':
                  store.setStatus(s.id, s.status == SubStatus.paused ? SubStatus.active : SubStatus.paused);
                  break;
                case 'cancel':
                  store.setStatus(s.id, SubStatus.cancelled);
                  break;
                case 'remove':
                  store.remove(s.id);
                  break;
              }
            },
            itemBuilder: (_) => [
              const PopupMenuItem(value: 'edit', child: Text('Edit')),
              PopupMenuItem(value: 'pause', child: Text(s.status == SubStatus.paused ? 'Resume' : 'Pause')),
              const PopupMenuItem(value: 'cancel', child: Text('Cancel')),
              const PopupMenuItem(value: 'remove', child: Text('Remove')),
            ],
          ),
        ]),
      ),
    );
  }

  Widget _statusBadge(SubStatus status) {
    final label = statusWire(status);
    final color = status == SubStatus.cancelled ? C.rose600 : C.amber600;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(999)),
      child: Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: color)),
    );
  }
}

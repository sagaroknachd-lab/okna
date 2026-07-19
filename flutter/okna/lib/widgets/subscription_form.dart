import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme.dart';
import '../models/subscription.dart';
import '../data/categories.dart';
import '../services/store.dart';

Future<void> showSubscriptionForm(BuildContext context, {Subscription? existing}) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: _SubscriptionForm(existing: existing),
    ),
  );
}

class _SubscriptionForm extends StatefulWidget {
  final Subscription? existing;
  const _SubscriptionForm({this.existing});
  @override
  State<_SubscriptionForm> createState() => _SubscriptionFormState();
}

class _SubscriptionFormState extends State<_SubscriptionForm> {
  late final TextEditingController _name;
  late final TextEditingController _provider;
  late final TextEditingController _amount;
  late final TextEditingController _notes;
  late CategoryId _category;
  late BillingCycle _cycle;
  late SubStatus _status;
  late UsageFrequency _usage;
  late bool _autoRenew;
  late DateTime _renewal;

  @override
  void initState() {
    super.initState();
    final e = widget.existing;
    _name = TextEditingController(text: e?.name ?? '');
    _provider = TextEditingController(text: e?.provider ?? '');
    _amount = TextEditingController(text: e != null ? e.amount.toString() : '');
    _notes = TextEditingController(text: e?.notes ?? '');
    _category = e?.category ?? CategoryId.ott;
    _cycle = e?.cycle ?? BillingCycle.monthly;
    _status = e?.status ?? SubStatus.active;
    _usage = e?.usage ?? UsageFrequency.monthly;
    _autoRenew = e?.autoRenew ?? true;
    _renewal = e != null ? DateTime.parse('${e.nextRenewal}T00:00:00') : DateTime.now().add(const Duration(days: 30));
  }

  @override
  void dispose() {
    _name.dispose();
    _provider.dispose();
    _amount.dispose();
    _notes.dispose();
    super.dispose();
  }

  String _iso(DateTime d) {
    String two(int n) => n.toString().padLeft(2, '0');
    return '${d.year}-${two(d.month)}-${two(d.day)}';
  }

  void _save() {
    final store = context.read<Store>();
    final amount = num.tryParse(_amount.text.trim()) ?? 0;
    if (_name.text.trim().isEmpty || amount <= 0) return;
    final notes = _notes.text.trim().isEmpty ? null : _notes.text.trim();
    if (widget.existing != null) {
      store.update(widget.existing!.copyWith(
        name: _name.text.trim(),
        provider: _provider.text.trim(),
        category: _category,
        amount: amount,
        cycle: _cycle,
        nextRenewal: _iso(_renewal),
        status: _status,
        autoRenew: _autoRenew,
        usage: _usage,
        notes: notes,
      ));
    } else {
      store.add(store.create(
        name: _name.text.trim(),
        provider: _provider.text.trim(),
        category: _category,
        amount: amount,
        cycle: _cycle,
        nextRenewal: _iso(_renewal),
        status: _status,
        autoRenew: _autoRenew,
        usage: _usage,
        notes: notes,
      ));
    }
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: C.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.9),
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(
              child: Container(width: 40, height: 4, margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(color: C.ink200, borderRadius: BorderRadius.circular(2))),
            ),
            Text(widget.existing != null ? 'Edit subscription' : 'Add subscription',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: C.ink900)),
            const SizedBox(height: 16),
            _field('Name', _name),
            _field('Provider', _provider),
            _field('Amount (₹ per cycle)', _amount, keyboard: TextInputType.number),
            const SizedBox(height: 12),
            _dropdown<CategoryId>('Category', _category, CategoryId.values,
                (c) => '${categoryMeta(c).emoji} ${categoryMeta(c).label}', (v) => setState(() => _category = v!)),
            _dropdown<BillingCycle>('Billing cycle', _cycle, BillingCycle.values,
                (c) => cycleWire(c), (v) => setState(() => _cycle = v!)),
            _dropdown<SubStatus>('Status', _status, SubStatus.values,
                (c) => statusWire(c), (v) => setState(() => _status = v!)),
            _dropdown<UsageFrequency>('Usage', _usage, UsageFrequency.values,
                (c) => usageWire(c), (v) => setState(() => _usage = v!)),
            const SizedBox(height: 8),
            Row(
              children: [
                const Text('Next renewal', style: TextStyle(fontSize: 12, color: C.ink500, fontWeight: FontWeight.w600)),
                const Spacer(),
                TextButton(
                  onPressed: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: _renewal,
                      firstDate: DateTime.now().subtract(const Duration(days: 365)),
                      lastDate: DateTime.now().add(const Duration(days: 365 * 3)),
                    );
                    if (picked != null) setState(() => _renewal = picked);
                  },
                  child: Text(_iso(_renewal)),
                ),
              ],
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              activeColor: C.brand600,
              title: const Text('Auto-renew', style: TextStyle(fontSize: 14, color: C.ink800)),
              value: _autoRenew,
              onChanged: (v) => setState(() => _autoRenew = v),
            ),
            _field('Notes (optional)', _notes),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                style: FilledButton.styleFrom(backgroundColor: C.brand600, padding: const EdgeInsets.symmetric(vertical: 14)),
                onPressed: _save,
                child: Text(widget.existing != null ? 'Save changes' : 'Add subscription'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _field(String label, TextEditingController c, {TextInputType? keyboard}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: C.ink500, fontWeight: FontWeight.w600)),
          const SizedBox(height: 6),
          TextField(
            controller: c,
            keyboardType: keyboard,
            decoration: InputDecoration(
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: C.ink200)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: C.ink200)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _dropdown<T>(String label, T value, List<T> items, String Function(T) labelOf, void Function(T?) onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: C.ink500, fontWeight: FontWeight.w600)),
          const SizedBox(height: 6),
          DropdownButtonFormField<T>(
            initialValue: value,
            isExpanded: true,
            decoration: InputDecoration(
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: C.ink200)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: C.ink200)),
            ),
            items: items.map((e) => DropdownMenuItem<T>(value: e, child: Text(labelOf(e)))).toList(),
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }
}

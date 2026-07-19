import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme.dart';
import '../services/store.dart';
import '../services/ai_client.dart';
import '../logic/advisor.dart';
import '../logic/format.dart';
import '../data/categories.dart';
import '../widgets/ui.dart';

class _Msg {
  final String role;
  String content;
  _Msg(this.role, this.content);
}

class AdvisorScreen extends StatefulWidget {
  const AdvisorScreen({super.key});
  @override
  State<AdvisorScreen> createState() => _AdvisorScreenState();
}

class _AdvisorScreenState extends State<AdvisorScreen> {
  final _messages = <_Msg>[];
  final _input = TextEditingController();
  bool _busy = false;
  String? _note;

  static const _suggestions = [
    "What's my biggest saving?",
    'How do I lower my mobile plan?',
    'Which subscriptions am I not using?',
    'Cheaper insurance options?',
  ];

  @override
  void dispose() {
    _input.dispose();
    super.dispose();
  }

  Future<void> _send(String text) async {
    final q = text.trim();
    if (q.isEmpty || _busy) return;
    final store = context.read<Store>();
    final subs = store.subscriptions;
    setState(() {
      _note = null;
      _messages.add(_Msg('user', q));
      _input.clear();
      _busy = true;
    });

    if (AiClient.hasLiveAI) {
      final history = _messages.map((m) => {'role': m.role, 'content': m.content}).toList();
      final assistant = _Msg('assistant', '');
      setState(() => _messages.add(assistant));
      try {
        await for (final delta in AiClient.streamReply(subs, history)) {
          setState(() => assistant.content += delta);
        }
      } catch (e) {
        setState(() {
          assistant.content = answerQuestion(subs, q);
          _note = e.toString().toLowerCase().contains('authentication')
              ? 'Live AI failed (check your API key in Settings) — answered offline.'
              : 'Live AI unavailable — answered offline.';
        });
      }
    } else {
      setState(() => _messages.add(_Msg('assistant', answerQuestion(subs, q))));
    }
    setState(() => _busy = false);
  }

  @override
  Widget build(BuildContext context) {
    final store = context.watch<Store>();
    if (!store.ready) return const Center(child: CircularProgressIndicator());
    final subs = store.subscriptions;
    final plan = buildSavingsPlan(subs);
    final vendors = vendorAlternatives(subs);
    final tips = advisorTips(subs);
    final live = AiClient.hasLiveAI;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Row(children: [
          const Expanded(child: Text('AI Savings Advisor', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: C.ink900))),
          Pill(live ? '⚡ Live AI' : '🤖 Smart assistant', bg: live ? C.brand50 : C.ink100, fg: live ? C.brand700 : C.ink600),
        ]),
        const SizedBox(height: 4),
        const Text('A plan to cut your monthly spend, cheaper vendor options, and answers to your money questions.', style: TextStyle(color: C.ink500)),
        const SizedBox(height: 16),

        // Headline plan
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(16), gradient: const LinearGradient(colors: [C.brand600, C.brand800], begin: Alignment.topLeft, end: Alignment.bottomRight)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Your savings plan targets', style: TextStyle(color: C.brand100, fontSize: 13, fontWeight: FontWeight.w500)),
            const SizedBox(height: 4),
            Text('${formatINR(plan.monthlyTarget)}/mo', style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text('up to ${formatINR(plan.yearlyTarget)} a year', style: const TextStyle(color: C.brand100)),
          ]),
        ),

        if (plan.lapseWarnings.isNotEmpty) ...[
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: C.rose50, borderRadius: BorderRadius.circular(16), border: Border.all(color: C.rose200)),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text("⚠️ Don't let these lapse", style: TextStyle(fontWeight: FontWeight.bold, color: C.rose800)),
              const SizedBox(height: 4),
              ...plan.lapseWarnings.map((w) => Text('• $w', style: const TextStyle(fontSize: 13, color: C.rose700))),
            ]),
          ),
        ],

        const SizedBox(height: 16),
        OknaCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Your action plan', style: TextStyle(fontWeight: FontWeight.bold, color: C.ink900)),
            const SizedBox(height: 12),
            if (plan.steps.isEmpty)
              const Text("You're running lean — no obvious savings right now. 🎉", style: TextStyle(color: C.ink500))
            else
              ...plan.steps.asMap().entries.map((e) => Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Container(width: 24, height: 24, decoration: BoxDecoration(color: C.brand50, shape: BoxShape.circle), alignment: Alignment.center, child: Text('${e.key + 1}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: C.brand700))),
                      const SizedBox(width: 10),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Row(children: [Expanded(child: Text(e.value.title, style: const TextStyle(fontWeight: FontWeight.w500, color: C.ink900))), Pill('+${formatINR(e.value.monthlySaving)}/mo')]),
                        const SizedBox(height: 2),
                        Text(e.value.detail, style: const TextStyle(fontSize: 13, color: C.ink500)),
                      ])),
                    ]),
                  )),
          ]),
        ),

        if (vendors.isNotEmpty) ...[
          const SizedBox(height: 16),
          OknaCard(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Text('Switch & save — vendor options', style: TextStyle(fontWeight: FontWeight.bold, color: C.ink900)),
              const SizedBox(height: 4),
              const Text('Cheaper alternatives in the categories you spend on. Prices are indicative — verify the current offer.', style: TextStyle(fontSize: 13, color: C.ink500)),
              const SizedBox(height: 12),
              ...vendors.map((m) => Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: C.ink100)),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Row(children: [
                        Text(categoryMeta(m.subscription.category).emoji),
                        const SizedBox(width: 6),
                        Expanded(child: Text(m.subscription.name, style: const TextStyle(fontWeight: FontWeight.w500, color: C.ink900))),
                        Text('now ${formatINR(m.currentMonthly)}/mo', style: const TextStyle(fontSize: 11, color: C.ink400)),
                      ]),
                      const SizedBox(height: 8),
                      ...m.options.map((o) => Padding(
                            padding: const EdgeInsets.only(bottom: 6),
                            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Pill('−${formatINR(o.monthlySaving)}/mo'),
                              const SizedBox(width: 8),
                              Expanded(child: RichText(text: TextSpan(style: const TextStyle(fontSize: 13, color: C.ink600), children: [
                                TextSpan(text: '${o.option.provider} ${o.option.plan}. ', style: const TextStyle(fontWeight: FontWeight.w600, color: C.ink800)),
                                TextSpan(text: o.option.note),
                              ]))),
                            ]),
                          )),
                    ]),
                  )),
            ]),
          ),
        ],

        const SizedBox(height: 16),
        OknaCard(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Tips & tricks', style: TextStyle(fontWeight: FontWeight.bold, color: C.ink900)),
            const SizedBox(height: 10),
            ...tips.general.map((t) => Padding(padding: const EdgeInsets.only(bottom: 6), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('✓ ', style: TextStyle(color: C.brand600)), Expanded(child: Text(t, style: const TextStyle(fontSize: 13, color: C.ink700)))]))),
            ...tips.byCategory.map((c) => Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(categoryMeta(c.category).label.toUpperCase(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: C.ink500)),
                    const SizedBox(height: 4),
                    ...c.tips.map((t) => Padding(padding: const EdgeInsets.only(bottom: 4), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('• ', style: TextStyle(color: C.ink300)), Expanded(child: Text(t, style: const TextStyle(fontSize: 13, color: C.ink700)))]))),
                  ]),
                )),
          ]),
        ),

        const SizedBox(height: 16),
        _chatCard(live),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _chatCard(bool live) {
    return OknaCard(
      padding: EdgeInsets.zero,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Ask okna AI', style: TextStyle(fontWeight: FontWeight.bold, color: C.ink900)),
            Text(live ? 'Powered by Claude · grounded in your portfolio' : 'Offline assistant · add an API key in Settings for live AI', style: const TextStyle(fontSize: 11, color: C.ink400)),
          ]),
        ),
        const Divider(height: 1, color: C.ink100),
        Padding(
          padding: const EdgeInsets.all(14),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            if (_messages.isEmpty) ...[
              const Text('Ask me anything about cutting your monthly spend. Try:', style: TextStyle(fontSize: 13, color: C.ink500)),
              const SizedBox(height: 8),
              Wrap(spacing: 8, runSpacing: 8, children: _suggestions.map((s) => GestureDetector(
                    onTap: () => _send(s),
                    child: Container(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7), decoration: BoxDecoration(borderRadius: BorderRadius.circular(999), border: Border.all(color: C.ink200)), child: Text(s, style: const TextStyle(fontSize: 12, color: C.ink700))),
                  )).toList()),
            ] else
              ..._messages.map((m) => Align(
                    alignment: m.role == 'user' ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                      constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.72),
                      decoration: BoxDecoration(
                        color: m.role == 'user' ? C.brand600 : C.ink50,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text(m.content.isEmpty && _busy ? '…' : m.content, style: TextStyle(fontSize: 13, color: m.role == 'user' ? Colors.white : C.ink800)),
                    ),
                  )),
            if (_note != null) Padding(padding: const EdgeInsets.only(bottom: 6), child: Text(_note!, style: const TextStyle(fontSize: 11, color: C.amber600))),
            Row(children: [
              Expanded(child: TextField(
                controller: _input,
                enabled: !_busy,
                onSubmitted: _send,
                decoration: InputDecoration(
                  hintText: 'How can I cut my bills?',
                  isDense: true,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: C.ink200)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: C.ink200)),
                ),
              )),
              const SizedBox(width: 8),
              FilledButton(style: FilledButton.styleFrom(backgroundColor: C.brand600), onPressed: _busy ? null : () => _send(_input.text), child: Text(_busy ? '…' : 'Send')),
            ]),
          ]),
        ),
      ]),
    );
  }
}

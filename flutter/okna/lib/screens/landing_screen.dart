import 'package:flutter/material.dart';
import '../theme.dart';
import 'app_shell.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _logo(),
                const SizedBox(height: 28),
                const Text(
                  'Save money on every\nbill & subscription',
                  style: TextStyle(fontSize: 30, fontWeight: FontWeight.bold, color: C.ink900, height: 1.15),
                ),
                const SizedBox(height: 14),
                const Text(
                  'okna tracks every recurring expense a middle-class Indian household pays for — mobile, broadband, OTT, insurance, EMIs and more — and helps you spot waste, switch to cheaper plans, and never miss a renewal.',
                  style: TextStyle(fontSize: 15, color: C.ink500, height: 1.4),
                ),
                const SizedBox(height: 22),
                ..._bullets(),
                const SizedBox(height: 28),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    style: FilledButton.styleFrom(
                      backgroundColor: C.brand600,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const AppShell()),
                    ),
                    child: const Text('Open dashboard', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  ),
                ),
                const SizedBox(height: 12),
                const Center(
                  child: Text('Prices and plans are illustrative, for demonstration only.',
                      style: TextStyle(fontSize: 11, color: C.ink400)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _logo() => Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(color: C.brand600, borderRadius: BorderRadius.circular(10)),
            alignment: Alignment.center,
            child: const Text('o', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 10),
          const Text('okna', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: C.ink900)),
        ],
      );

  List<Widget> _bullets() {
    const items = [
      ['📊', 'Track', 'every bill in one place, normalised to monthly & yearly.'],
      ['💡', 'Reduce', 'unused plans, cheaper alternatives and duplicates.'],
      ['🔔', 'Remind', 'renewals by urgency + must-not-lapse alerts.'],
      ['🤖', 'AI Advisor', 'a personalised plan to cut your monthly spend.'],
    ];
    return items
        .map((i) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(i[0], style: const TextStyle(fontSize: 18)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: RichText(
                      text: TextSpan(
                        style: const TextStyle(fontSize: 14, color: C.ink600, height: 1.35),
                        children: [
                          TextSpan(text: '${i[1]} ', style: const TextStyle(fontWeight: FontWeight.bold, color: C.ink900)),
                          TextSpan(text: i[2]),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ))
        .toList();
  }
}

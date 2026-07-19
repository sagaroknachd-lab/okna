import 'package:flutter/material.dart';
import '../theme.dart';
import '../widgets/subscription_form.dart';
import 'overview_screen.dart';
import 'subscriptions_screen.dart';
import 'advisor_screen.dart';
import 'savings_screen.dart';
import 'reminders_screen.dart';
import 'settings_screen.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key});
  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _index = 0;

  static const _titles = ['Overview', 'Subscriptions', 'AI Advisor', 'Savings', 'Reminders'];

  final _screens = const [
    OverviewScreen(),
    SubscriptionsScreen(),
    AdvisorScreen(),
    SavingsScreen(),
    RemindersScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: C.white,
        surfaceTintColor: C.white,
        elevation: 0,
        title: Row(
          children: [
            Container(
              width: 28, height: 28,
              decoration: BoxDecoration(color: C.brand600, borderRadius: BorderRadius.circular(8)),
              alignment: Alignment.center,
              child: const Text('o', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(width: 10),
            Text(_titles[_index], style: const TextStyle(color: C.ink900, fontWeight: FontWeight.bold, fontSize: 18)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: C.ink600),
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const SettingsScreen())),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilledButton.icon(
              style: FilledButton.styleFrom(backgroundColor: C.brand600, padding: const EdgeInsets.symmetric(horizontal: 12)),
              onPressed: () => showSubscriptionForm(context),
              icon: const Icon(Icons.add, size: 18),
              label: const Text('Add'),
            ),
          ),
        ],
        bottom: const PreferredSize(preferredSize: Size.fromHeight(1), child: Divider(height: 1, color: C.ink100)),
      ),
      body: IndexedStack(index: _index, children: _screens),
      bottomNavigationBar: NavigationBar(
        backgroundColor: C.white,
        indicatorColor: C.brand50,
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), selectedIcon: Icon(Icons.dashboard, color: C.brand700), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.list_alt_outlined), selectedIcon: Icon(Icons.list_alt, color: C.brand700), label: 'Plans'),
          NavigationDestination(icon: Icon(Icons.auto_awesome_outlined), selectedIcon: Icon(Icons.auto_awesome, color: C.brand700), label: 'Advisor'),
          NavigationDestination(icon: Icon(Icons.lightbulb_outline), selectedIcon: Icon(Icons.lightbulb, color: C.brand700), label: 'Savings'),
          NavigationDestination(icon: Icon(Icons.notifications_outlined), selectedIcon: Icon(Icons.notifications, color: C.brand700), label: 'Reminders'),
        ],
      ),
    );
  }
}

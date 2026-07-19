import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'theme.dart';
import 'services/store.dart';
import 'services/ai_client.dart';
import 'services/notifications.dart';
import 'screens/landing_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await AiClient.loadKey();
  await initNotifications();
  final store = Store();
  await store.init();
  runApp(ChangeNotifierProvider<Store>.value(value: store, child: const OknaApp()));
}

class OknaApp extends StatelessWidget {
  const OknaApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'okna',
      debugShowCheckedModeBanner: false,
      theme: oknaTheme(),
      home: const LandingScreen(),
    );
  }
}

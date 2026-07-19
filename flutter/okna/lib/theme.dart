import 'package:flutter/material.dart';

/// okna palette (mirrors the web app's Tailwind brand/ink scales).
class C {
  static const bg = Color(0xFFF6F7F9);
  static const white = Colors.white;

  static const brand50 = Color(0xFFEEFDF6);
  static const brand100 = Color(0xFFD6F9E8);
  static const brand600 = Color(0xFF0A9264);
  static const brand700 = Color(0xFF097552);
  static const brand800 = Color(0xFF0B5D43);

  static const ink50 = Color(0xFFF6F7F9);
  static const ink100 = Color(0xFFECEEF2);
  static const ink200 = Color(0xFFD5D9E2);
  static const ink300 = Color(0xFFB0B8C8);
  static const ink400 = Color(0xFF8591A8);
  static const ink500 = Color(0xFF66738C);
  static const ink600 = Color(0xFF515C73);
  static const ink700 = Color(0xFF424A5E);
  static const ink800 = Color(0xFF3A4050);
  static const ink900 = Color(0xFF0F1729);

  static const rose50 = Color(0xFFFFF1F2);
  static const rose200 = Color(0xFFFECDD3);
  static const rose600 = Color(0xFFE11D48);
  static const rose700 = Color(0xFFBE123C);
  static const rose800 = Color(0xFF9F1239);
  static const amber600 = Color(0xFFD97706);
}

ThemeData oknaTheme() {
  return ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: C.bg,
    colorScheme: ColorScheme.fromSeed(
      seedColor: C.brand600,
      primary: C.brand600,
    ),
    textTheme: const TextTheme().apply(bodyColor: C.ink900, displayColor: C.ink900),
  );
}

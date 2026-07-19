import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme.dart';
import '../models/subscription.dart';
import '../data/categories.dart';
import '../logic/stats.dart';
import '../logic/format.dart';

/// White rounded card matching the web `.card` utility.
class OknaCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  const OknaCard({super.key, required this.child, this.padding = const EdgeInsets.all(20)});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: C.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: C.ink100),
        boxShadow: const [
          BoxShadow(color: Color(0x0F0F1729), blurRadius: 24, offset: Offset(0, 8)),
        ],
      ),
      child: child,
    );
  }
}

class StatCard extends StatelessWidget {
  final String label;
  final String value;
  final String sub;
  final String icon;
  final Color accent;
  const StatCard({
    super.key,
    required this.label,
    required this.value,
    required this.sub,
    required this.icon,
    this.accent = C.ink900,
  });

  @override
  Widget build(BuildContext context) {
    return OknaCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(fontSize: 12, color: C.ink500, fontWeight: FontWeight.w600)),
              Text(icon, style: const TextStyle(fontSize: 16)),
            ],
          ),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: accent)),
          const SizedBox(height: 2),
          Text(sub, style: const TextStyle(fontSize: 11, color: C.ink400)),
        ],
      ),
    );
  }
}

class CategoryChip extends StatelessWidget {
  final CategoryId category;
  const CategoryChip(this.category, {super.key});

  @override
  Widget build(BuildContext context) {
    final m = categoryMeta(category);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: m.tintBg, borderRadius: BorderRadius.circular(999)),
      child: Text('${m.emoji} ${m.label}',
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: m.tintFg)),
    );
  }
}

class Pill extends StatelessWidget {
  final String text;
  final Color bg;
  final Color fg;
  const Pill(this.text, {super.key, this.bg = C.brand50, this.fg = C.brand700});
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(999)),
        child: Text(text, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: fg)),
      );
}

class CategoryDonut extends StatelessWidget {
  final List<CategoryTotal> data;
  final double total;
  const CategoryDonut({super.key, required this.data, required this.total});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 180,
          child: CustomPaint(
            painter: _DonutPainter(data, total),
            child: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(formatINRCompact(total),
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: C.ink900)),
                  const Text('per month', style: TextStyle(fontSize: 11, color: C.ink400)),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 12,
          runSpacing: 6,
          children: [
            for (final c in data)
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(width: 10, height: 10, decoration: BoxDecoration(color: categoryMeta(c.category).color, borderRadius: BorderRadius.circular(3))),
                  const SizedBox(width: 5),
                  Text('${categoryMeta(c.category).label}  ${formatINR(c.monthly)}',
                      style: const TextStyle(fontSize: 11, color: C.ink600)),
                ],
              ),
          ],
        ),
      ],
    );
  }
}

class _DonutPainter extends CustomPainter {
  final List<CategoryTotal> data;
  final double total;
  _DonutPainter(this.data, this.total);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width, size.height) / 2 - 6;
    final stroke = 26.0;
    final rect = Rect.fromCircle(center: center, radius: radius - stroke / 2);
    if (total <= 0) {
      final p = Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = stroke
        ..color = C.ink100;
      canvas.drawCircle(center, radius - stroke / 2, p);
      return;
    }
    double start = -math.pi / 2;
    for (final c in data) {
      final sweep = (c.monthly / total) * math.pi * 2;
      final paint = Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = stroke
        ..strokeCap = StrokeCap.butt
        ..color = categoryMeta(c.category).color;
      canvas.drawArc(rect, start, sweep - 0.02, false, paint);
      start += sweep;
    }
  }

  @override
  bool shouldRepaint(covariant _DonutPainter old) => old.total != total || old.data != data;
}

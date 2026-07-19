import 'package:flutter/material.dart';
import '../models/subscription.dart';

class CategoryMeta {
  final CategoryId id;
  final String label;
  final String emoji;
  final Color color;
  const CategoryMeta(this.id, this.label, this.emoji, this.color);

  Color get tintBg => color.withValues(alpha: 0.12);
  Color get tintFg => Color.alphaBlend(color.withValues(alpha: 0.85), Colors.black);
}

const List<CategoryMeta> kCategories = [
  CategoryMeta(CategoryId.mobile, 'Mobile', '📱', Color(0xFF0EA5E9)),
  CategoryMeta(CategoryId.broadband, 'Broadband', '🌐', Color(0xFF6366F1)),
  CategoryMeta(CategoryId.ott, 'OTT & Streaming', '🎬', Color(0xFFF43F5E)),
  CategoryMeta(CategoryId.insurance, 'Insurance', '🛡️', Color(0xFF10B981)),
  CategoryMeta(CategoryId.creditCard, 'Credit Card', '💳', Color(0xFF8B5CF6)),
  CategoryMeta(CategoryId.loanEmi, 'Loan EMI', '🏦', Color(0xFFF59E0B)),
  CategoryMeta(CategoryId.electricity, 'Electricity', '⚡', Color(0xFFEAB308)),
  CategoryMeta(CategoryId.gas, 'Gas', '🔥', Color(0xFFF97316)),
  CategoryMeta(CategoryId.schoolFees, 'School Fees', '🎓', Color(0xFF14B8A6)),
  CategoryMeta(CategoryId.gym, 'Gym & Fitness', '🏋️', Color(0xFF84CC16)),
  CategoryMeta(CategoryId.software, 'Software', '🧩', Color(0xFF06B6D4)),
  CategoryMeta(CategoryId.membership, 'Memberships', '⭐', Color(0xFFEC4899)),
];

final Map<CategoryId, CategoryMeta> _byId = {for (final c in kCategories) c.id: c};

CategoryMeta categoryMeta(CategoryId id) => _byId[id] ?? kCategories.last;

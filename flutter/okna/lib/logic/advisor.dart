import '../models/subscription.dart';
import '../data/categories.dart';
import '../data/vendors.dart';
import '../data/tips.dart';
import 'insights.dart';
import 'stats.dart';
import 'format.dart';

class PlanStep {
  final String title;
  final String detail;
  final double monthlySaving;
  const PlanStep(this.title, this.detail, this.monthlySaving);
}

class SavingsPlan {
  final double monthlyTarget;
  final double yearlyTarget;
  final List<PlanStep> steps;
  final List<String> lapseWarnings;
  const SavingsPlan(this.monthlyTarget, this.yearlyTarget, this.steps, this.lapseWarnings);
}

SavingsPlan buildSavingsPlan(List<Subscription> subs) {
  final insights = generateInsights(subs);
  final monthlyTarget = potentialMonthlySaving(insights);

  final bestBySub = <String, PlanStep>{};
  for (final i in insights) {
    final existing = bestBySub[i.subscriptionId];
    if (existing == null || i.monthlySaving > existing.monthlySaving) {
      bestBySub[i.subscriptionId] = PlanStep(i.title, i.detail, i.monthlySaving);
    }
  }
  final steps = bestBySub.values.toList()
    ..sort((a, b) => b.monthlySaving.compareTo(a.monthlySaving));

  final lapseWarnings = lapseRisks(subs)
      .map((s) => '${s.name} renews soon and isn\'t on auto-pay — renew it to avoid a lapse or penalty.')
      .toList();

  return SavingsPlan(monthlyTarget, monthlyTarget * 12, steps, lapseWarnings);
}

class VendorMatchOption {
  final VendorOption option;
  final double monthlySaving;
  const VendorMatchOption(this.option, this.monthlySaving);
}

class VendorMatch {
  final Subscription subscription;
  final double currentMonthly;
  final List<VendorMatchOption> options;
  const VendorMatch(this.subscription, this.currentMonthly, this.options);
}

List<VendorMatch> vendorAlternatives(List<Subscription> subs) {
  final matches = <VendorMatch>[];
  for (final s in subs) {
    if (s.status != SubStatus.active) continue;
    final options = kVendorDirectory[s.category];
    if (options == null) continue;
    final currentMonthly = monthlyEquivalent(s.amount, s.cycle);
    final cheaper = options
        .map((o) => VendorMatchOption(o, currentMonthly - monthlyEquivalent(o.price, o.cycle)))
        .where((o) => o.monthlySaving >= 20)
        .toList()
      ..sort((a, b) => b.monthlySaving.compareTo(a.monthlySaving));
    final top = cheaper.take(3).toList();
    if (top.isNotEmpty) {
      matches.add(VendorMatch(s, currentMonthly, top));
    }
  }
  matches.sort((a, b) =>
      (b.options.isEmpty ? 0.0 : b.options.first.monthlySaving)
          .compareTo(a.options.isEmpty ? 0.0 : a.options.first.monthlySaving));
  return matches;
}

TipsResult advisorTips(List<Subscription> subs) {
  final categories = subs
      .where((s) => s.status == SubStatus.active)
      .map((s) => s.category)
      .toSet()
      .toList();
  return tipsForCategories(categories);
}

String portfolioSummary(List<Subscription> subs) {
  final stats = computeStats(subs);
  final plan = buildSavingsPlan(subs);
  final lines = <String>[];
  lines.add('Monthly spend ${formatINR(stats.monthlySpend)} (${formatINR(stats.yearlySpend)}/yr) across ${stats.activeCount} active plans.');
  lines.add('Identified potential saving: ${formatINR(plan.monthlyTarget)}/mo.');
  lines.add('Active plans:');
  for (final s in subs.where((s) => s.status == SubStatus.active)) {
    lines.add('- ${s.name} (${categoryMeta(s.category).label}): ${formatINR(s.amount)} per ${cycleWire(s.cycle)}, used ${usageWire(s.usage)}, auto-renew ${s.autoRenew ? "on" : "off"}.');
  }
  return lines.join('\n');
}

// ---- Offline rule-based Q&A responder ------------------------------------

const Set<CategoryId> _discretionary = {
  CategoryId.ott,
  CategoryId.gym,
  CategoryId.software,
  CategoryId.membership,
  CategoryId.mobile,
};

CategoryId? _catMatch(String q) {
  const map = <String, CategoryId>{
    'mobile': CategoryId.mobile, 'phone': CategoryId.mobile, 'recharge': CategoryId.mobile, 'sim': CategoryId.mobile,
    'broadband': CategoryId.broadband, 'internet': CategoryId.broadband, 'wifi': CategoryId.broadband, 'fibre': CategoryId.broadband, 'fiber': CategoryId.broadband,
    'ott': CategoryId.ott, 'netflix': CategoryId.ott, 'prime': CategoryId.ott, 'hotstar': CategoryId.ott, 'stream': CategoryId.ott,
    'insurance': CategoryId.insurance, 'policy': CategoryId.insurance, 'premium': CategoryId.insurance,
    'credit card': CategoryId.creditCard, 'card fee': CategoryId.creditCard, 'annual fee': CategoryId.creditCard,
    'loan': CategoryId.loanEmi, 'emi': CategoryId.loanEmi,
    'gym': CategoryId.gym, 'fitness': CategoryId.gym,
    'software': CategoryId.software, 'app subscription': CategoryId.software,
    'membership': CategoryId.membership,
  };
  for (final e in map.entries) {
    if (q.contains(e.key)) return e.value;
  }
  return null;
}

/// Deterministic, portfolio-grounded answer. Used when live AI isn't configured.
String answerQuestion(List<Subscription> subs, String question) {
  final q = question.toLowerCase().trim();
  final active = subs.where((s) => s.status == SubStatus.active).toList();
  final plan = buildSavingsPlan(subs);

  if (q.isEmpty) {
    return 'Ask me how to cut a specific bill, e.g. "how do I lower my mobile plan?"';
  }

  if (RegExp(r'(^|\b)(hi|hello|hey|namaste)\b').hasMatch(q)) {
    return "Hi! I'm your okna savings assistant. Right now I can see ${formatINR(plan.monthlyTarget)}/mo (${formatINR(plan.yearlyTarget)}/yr) you could save. Ask me about any category — mobile, broadband, OTT, insurance, credit cards — or say \"what's my biggest saving?\"";
  }

  final cat = _catMatch(q);
  if (cat != null) {
    final matches = vendorAlternatives(active).where((m) => m.subscription.category == cat).toList();
    final label = categoryMeta(cat).label;
    final tips = tipsForCategories([cat]).byCategory;
    final catTips = tips.isNotEmpty ? tips.first.tips : const <String>[];
    final parts = <String>[];
    if (matches.isNotEmpty) {
      final m = matches.first;
      final best = m.options.first;
      parts.add('For ${m.subscription.name} (${formatINR(m.currentMonthly)}/mo), a cheaper option is ${best.option.provider} ${best.option.plan} — about ${formatINR(best.monthlySaving)}/mo less. ${best.option.note}');
    } else {
      parts.add("I don't see an obvious cheaper $label option in your portfolio right now.");
    }
    if (catTips.isNotEmpty) parts.add('Tips: ${catTips.join(" ")}');
    return parts.join('\n\n');
  }

  if (q.contains('biggest') || q.contains('most') || q.contains('top')) {
    if (plan.steps.isEmpty) return 'Nothing stands out — your plans look lean and competitively priced.';
    final s = plan.steps.first;
    return 'Your biggest single win: ${s.title} — about ${formatINR(s.monthlySaving)}/mo. ${s.detail}';
  }

  if (q.contains('save') || q.contains('cut') || q.contains('reduce') || q.contains('cheaper')) {
    if (plan.steps.isEmpty) return "You're running lean — no obvious savings right now. 🎉";
    final top = plan.steps.take(3).map((s) => '• ${s.title} (~${formatINR(s.monthlySaving)}/mo)').join('\n');
    return "Here's where I'd start — about ${formatINR(plan.monthlyTarget)}/mo in total:\n$top\n\nOpen the Savings tab to action any of these in a tap.";
  }

  if (q.contains('unused') || q.contains('not using') || q.contains('using') ||
      q.contains('rarely') || q.contains('never') || q.contains('barely') || q.contains('waste')) {
    final unused = active
        .where((s) =>
            (s.usage == UsageFrequency.rarely || s.usage == UsageFrequency.never) &&
            _discretionary.contains(s.category))
        .toList();
    if (unused.isEmpty) return "Good news — I don't see any discretionary plans you've marked as rarely/never used.";
    return 'These look barely used — cancelling frees up money:\n' +
        unused.map((s) => '• ${s.name} (${formatINR(monthlyEquivalent(s.amount, s.cycle))}/mo, ${usageWire(s.usage)})').join('\n');
  }

  if (q.contains('insurance') || q.contains('lapse') || q.contains('renew')) {
    if (plan.lapseWarnings.isNotEmpty) return plan.lapseWarnings.join('\n');
    return 'No insurance/utility renewals are at lapse risk right now. Keep auto-renew off ones set as reminders so you never miss a manual renewal.';
  }

  return "You're spending about ${formatINR(computeStats(subs).monthlySpend)}/mo across ${active.length} active plans, with roughly ${formatINR(plan.monthlyTarget)}/mo of savings on the table. Ask me about a specific category (mobile, broadband, OTT, insurance, credit card) or say \"what's my biggest saving?\"";
}

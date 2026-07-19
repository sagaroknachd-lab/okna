import '../models/subscription.dart';

const List<String> kGeneralTips = [
  "Move anything you'll keep 6+ months from monthly to annual billing — it's usually 15–20% cheaper.",
  "Cancel or pause any plan you've marked 'rarely' or 'never' used — that's pure leakage.",
  "Turn off auto-renew on discretionary services so you re-decide each cycle instead of paying by default.",
  "Consolidate duplicates: if two services do the same job, keep the one you use and drop the other.",
  "Set every insurance and utility renewal as a 'must not lapse' reminder — a lapse costs far more than the premium.",
];

const Map<CategoryId, List<String>> kCategoryTips = {
  CategoryId.mobile: [
    'Match the pack validity to how you recharge — 84/90-day packs beat repeated 28-day ones on cost-per-day.',
    'If your plan already bundles OTT, drop the standalone OTT subscription.',
  ],
  CategoryId.broadband: [
    'Ask for the annual-prepay plan — providers often add 1–2 free months.',
    "Right-size your speed: most homes don't need the top tier for streaming and WFH.",
  ],
  CategoryId.ott: [
    'Rotate services — subscribe for the month you binge a show, then pause.',
    'Use a shared family/annual plan instead of multiple individual monthly ones.',
  ],
  CategoryId.insurance: [
    'Prefer pure term + a separate health floater over bundled endowment/ULIP products.',
    'Renew before the due date to protect your no-claim bonus and continuity of cover.',
  ],
  CategoryId.creditCard: [
    'Hit the spend threshold that waives the annual fee — or move to a lifetime-free card.',
    'Never revolve a balance; the interest dwarfs any reward you earn.',
  ],
  CategoryId.loanEmi: [
    'On a running loan, ask your lender to reset the rate to their current best — banks rarely do it automatically.',
    'One extra EMI a year meaningfully shortens the tenure and total interest.',
  ],
  CategoryId.software: [
    'Buy annual, and share family plans (Microsoft 365, Google One) instead of individual seats.',
    'For occasional needs, a free/open-source tool often replaces a paid subscription.',
  ],
  CategoryId.gym: [
    'If you go regularly, annual is ~30% cheaper per month; if you don\'t, cancel and use a free app.',
  ],
  CategoryId.membership: [
    'Check for a free tier — it often covers light usage at zero cost.',
  ],
  CategoryId.electricity: [
    "Shift heavy appliance use off peak hours if you're on a time-of-day tariff.",
  ],
  CategoryId.gas: [
    'Book refills online for cashback/UPI offers rather than paying cash on delivery.',
  ],
};

typedef CategoryTipGroup = ({CategoryId category, List<String> tips});
typedef TipsResult = ({List<String> general, List<CategoryTipGroup> byCategory});

TipsResult tipsForCategories(List<CategoryId> categories) {
  final seen = categories.toSet();
  final byCategory = seen
      .map((c) => (category: c, tips: kCategoryTips[c] ?? const <String>[]))
      .where((g) => g.tips.isNotEmpty)
      .toList();
  return (general: kGeneralTips, byCategory: byCategory);
}

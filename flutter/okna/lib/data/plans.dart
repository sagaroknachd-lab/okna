import '../models/subscription.dart';

/// A small curated marketplace of representative Indian plans used by the
/// savings engine to suggest cheaper alternatives. Prices are illustrative.
class MarketPlan {
  final String id;
  final CategoryId category;
  final String provider;
  final String name;
  final num amount;
  final BillingCycle cycle;
  final List<String> features;
  final String? highlight;
  const MarketPlan({
    required this.id,
    required this.category,
    required this.provider,
    required this.name,
    required this.amount,
    required this.cycle,
    required this.features,
    this.highlight,
  });
}

const List<MarketPlan> kMarketPlans = [
  // Mobile
  MarketPlan(id: 'mob-jio-349', category: CategoryId.mobile, provider: 'Jio', name: '₹349 Unlimited (28 days)', amount: 349, cycle: BillingCycle.monthly, features: ['2GB/day', 'Unlimited calls', 'JioHotstar included'], highlight: 'Best value with OTT'),
  MarketPlan(id: 'mob-airtel-299', category: CategoryId.mobile, provider: 'Airtel', name: '₹299 Smart (28 days)', amount: 299, cycle: BillingCycle.monthly, features: ['1.5GB/day', 'Unlimited calls', 'Wynk Music'], highlight: 'Lowest unlimited'),
  MarketPlan(id: 'mob-vi-319', category: CategoryId.mobile, provider: 'Vi', name: '₹319 Hero (28 days)', amount: 319, cycle: BillingCycle.monthly, features: ['2GB/day', 'Weekend data rollover', 'Unlimited calls']),
  // Broadband
  MarketPlan(id: 'bb-jiofiber-399', category: CategoryId.broadband, provider: 'JioFiber', name: '30 Mbps Broadband', amount: 399, cycle: BillingCycle.monthly, features: ['30 Mbps', 'Unlimited data', '14 OTT apps'], highlight: 'Cheapest fibre'),
  MarketPlan(id: 'bb-airtel-499', category: CategoryId.broadband, provider: 'Airtel Xstream', name: '40 Mbps Entertainment', amount: 499, cycle: BillingCycle.monthly, features: ['40 Mbps', 'Unlimited data', 'Xstream + Wynk']),
  MarketPlan(id: 'bb-bsnl-329', category: CategoryId.broadband, provider: 'BSNL', name: 'Fibre Basic 30 Mbps', amount: 329, cycle: BillingCycle.monthly, features: ['30 Mbps', 'Unlimited data'], highlight: 'Budget pick'),
  // OTT
  MarketPlan(id: 'ott-jiohotstar-499', category: CategoryId.ott, provider: 'JioHotstar', name: 'Super (yearly)', amount: 499, cycle: BillingCycle.yearly, features: ['Sports + shows', '2 screens', '1080p'], highlight: 'Cheapest streaming'),
  MarketPlan(id: 'ott-netflix-149', category: CategoryId.ott, provider: 'Netflix', name: 'Mobile Plan', amount: 149, cycle: BillingCycle.monthly, features: ['1 mobile screen', '480p'], highlight: 'If you mostly watch on phone'),
  MarketPlan(id: 'ott-prime-299', category: CategoryId.ott, provider: 'Amazon Prime', name: 'Prime Quarterly', amount: 299, cycle: BillingCycle.quarterly, features: ['Video + Music', 'Free delivery', '4K']),
  // Software
  MarketPlan(id: 'sw-canva-3999', category: CategoryId.software, provider: 'Canva', name: 'Pro (annual)', amount: 3999, cycle: BillingCycle.yearly, features: ['Save ₹1500 vs monthly', 'Premium assets'], highlight: 'Annual saves ~30%'),
  // Gym
  MarketPlan(id: 'gym-cult-quarterly', category: CategoryId.gym, provider: 'Cult.fit', name: 'Elite Quarterly', amount: 6000, cycle: BillingCycle.quarterly, features: ['All centres', 'Group classes'], highlight: 'Cheaper per-month than monthly'),
];

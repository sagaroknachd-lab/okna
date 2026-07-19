import '../models/subscription.dart';

/// Curated, illustrative directory of cheaper alternatives per category.
class VendorOption {
  final String provider;
  final String plan;
  final num price;
  final BillingCycle cycle;
  final String note;
  const VendorOption(this.provider, this.plan, this.price, this.cycle, this.note);
}

const Map<CategoryId, List<VendorOption>> kVendorDirectory = {
  CategoryId.mobile: [
    VendorOption('Jio', '₹749 / 90-day', 749, BillingCycle.quarterly, 'Long-validity packs cut the effective monthly rate vs 28-day recharges.'),
    VendorOption('Airtel', '₹359 / 28-day', 359, BillingCycle.monthly, 'Mid-tier data with free OTT bundled — drop a separate OTT plan.'),
    VendorOption('Vi', '₹475 / 56-day', 475, BillingCycle.monthly, 'Two-month packs for light users; weekend data rollover.'),
    VendorOption('BSNL', '₹397 / 150-day', 397, BillingCycle.halfYearly, 'Cheapest per-day cost if coverage is fine where you live.'),
  ],
  CategoryId.broadband: [
    VendorOption('Jio AirFiber', '30 Mbps', 599, BillingCycle.monthly, 'Entry fibre/AirFiber tier — enough for 2–3 streams + WFH.'),
    VendorOption('Airtel Xstream', '40 Mbps + OTT', 699, BillingCycle.monthly, 'Bundles OTT you may already be paying for separately.'),
    VendorOption('BSNL Fibre', '60 Mbps', 499, BillingCycle.monthly, 'Lowest sticker price where BSNL fibre is available.'),
    VendorOption('ACT', 'Annual prepay', 6999, BillingCycle.yearly, 'Annual prepay usually adds 1–2 free months vs monthly billing.'),
  ],
  CategoryId.ott: [
    VendorOption('Netflix', 'Mobile', 149, BillingCycle.monthly, 'Single-screen mobile plan if you mostly watch on your phone.'),
    VendorOption('Amazon Prime', 'Annual', 1499, BillingCycle.yearly, 'Annual works out to ~₹125/mo and adds shopping + music.'),
    VendorOption('Hotstar', 'Super (annual)', 899, BillingCycle.yearly, 'Annual is far cheaper per month than the monthly tier.'),
    VendorOption('Telco bundle', 'OTT via recharge', 0, BillingCycle.monthly, 'Many mobile/broadband plans include OTT free — cancel the duplicate.'),
  ],
  CategoryId.software: [
    VendorOption('Google One', '100 GB annual', 1300, BillingCycle.yearly, 'Annual storage plans beat monthly; share across family.'),
    VendorOption('Microsoft 365', 'Family (annual)', 4199, BillingCycle.yearly, 'Up to 6 users — split the cost instead of individual plans.'),
    VendorOption('Open-source', 'Free alternative', 0, BillingCycle.monthly, 'For occasional use, a free tool may replace a paid subscription.'),
  ],
  CategoryId.gym: [
    VendorOption('Local gym', 'Annual membership', 12000, BillingCycle.yearly, 'Annual is ~30% cheaper per month than pay-as-you-go.'),
    VendorOption('cult.fit', 'Elite (quarterly)', 4500, BillingCycle.quarterly, 'Quarterly packs lower the monthly rate if you actually go.'),
    VendorOption('Home + app', 'Free/low-cost app', 0, BillingCycle.monthly, 'If usage is rarely, a free app beats an unused membership.'),
  ],
  CategoryId.insurance: [
    VendorOption('Term (online)', 'Pure term cover', 12000, BillingCycle.yearly, 'Online term plans are cheaper than agent-sold endowment/ULIP.'),
    VendorOption('Family floater', 'Health floater', 18000, BillingCycle.yearly, 'One floater for the family is usually cheaper than separate policies.'),
  ],
  CategoryId.creditCard: [
    VendorOption('No-fee card', 'Lifetime-free', 0, BillingCycle.yearly, 'Switch to a lifetime-free card and stop paying the annual fee entirely.'),
  ],
  CategoryId.membership: [
    VendorOption('Free tier', 'Downgrade', 0, BillingCycle.monthly, 'Many memberships have a free tier that covers light usage.'),
  ],
};

bool hasVendorOptions(CategoryId c) => (kVendorDirectory[c]?.isNotEmpty ?? false);

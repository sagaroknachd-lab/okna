import '../models/subscription.dart';

String _iso(DateTime d) {
  String two(int n) => n.toString().padLeft(2, '0');
  return '${d.year}-${two(d.month)}-${two(d.day)}';
}

String _inDays(int days) => _iso(DateTime.now().add(Duration(days: days)));

/// A realistic starter portfolio for a middle-class Indian household. Renewal
/// dates are relative to today so the demo always feels live.
List<Subscription> defaultSubscriptions() {
  final createdAt = DateTime.now().toIso8601String();
  final base = <Map<String, dynamic>>[
    {'name': 'Jio ₹399 Unlimited', 'provider': 'Jio', 'category': CategoryId.mobile, 'amount': 399, 'cycle': BillingCycle.monthly, 'nextRenewal': _inDays(3), 'status': SubStatus.active, 'autoRenew': true, 'usage': UsageFrequency.daily, 'notes': 'Primary SIM'},
    {'name': 'Airtel ₹359 (2nd SIM)', 'provider': 'Airtel', 'category': CategoryId.mobile, 'amount': 359, 'cycle': BillingCycle.monthly, 'nextRenewal': _inDays(19), 'status': SubStatus.active, 'autoRenew': true, 'usage': UsageFrequency.rarely, 'notes': 'Barely used second number'},
    {'name': 'ACT Fibernet 100 Mbps', 'provider': 'ACT', 'category': CategoryId.broadband, 'amount': 799, 'cycle': BillingCycle.monthly, 'nextRenewal': _inDays(11), 'status': SubStatus.active, 'autoRenew': true, 'usage': UsageFrequency.daily},
    {'name': 'Netflix Premium', 'provider': 'Netflix', 'category': CategoryId.ott, 'amount': 649, 'cycle': BillingCycle.monthly, 'nextRenewal': _inDays(6), 'status': SubStatus.active, 'autoRenew': true, 'usage': UsageFrequency.weekly},
    {'name': 'Amazon Prime', 'provider': 'Amazon Prime', 'category': CategoryId.ott, 'amount': 1499, 'cycle': BillingCycle.yearly, 'nextRenewal': _inDays(58), 'status': SubStatus.active, 'autoRenew': true, 'usage': UsageFrequency.monthly},
    {'name': 'JioHotstar Super', 'provider': 'JioHotstar', 'category': CategoryId.ott, 'amount': 899, 'cycle': BillingCycle.yearly, 'nextRenewal': _inDays(41), 'status': SubStatus.active, 'autoRenew': true, 'usage': UsageFrequency.rarely, 'notes': 'Took it for one cricket season'},
    {'name': 'Spotify Premium', 'provider': 'Spotify', 'category': CategoryId.ott, 'amount': 119, 'cycle': BillingCycle.monthly, 'nextRenewal': _inDays(2), 'status': SubStatus.active, 'autoRenew': true, 'usage': UsageFrequency.daily},
    {'name': 'Term Life Insurance', 'provider': 'HDFC Life', 'category': CategoryId.insurance, 'amount': 18500, 'cycle': BillingCycle.yearly, 'nextRenewal': _inDays(24), 'status': SubStatus.active, 'autoRenew': false, 'usage': UsageFrequency.never, 'notes': '₹1Cr cover — do NOT lapse'},
    {'name': 'Car Insurance', 'provider': 'ICICI Lombard', 'category': CategoryId.insurance, 'amount': 12400, 'cycle': BillingCycle.yearly, 'nextRenewal': _inDays(9), 'status': SubStatus.active, 'autoRenew': false, 'usage': UsageFrequency.never, 'notes': 'Renew before expiry to keep NCB'},
    {'name': 'HDFC Regalia Card Fee', 'provider': 'HDFC Bank', 'category': CategoryId.creditCard, 'amount': 2500, 'cycle': BillingCycle.yearly, 'nextRenewal': _inDays(72), 'status': SubStatus.active, 'autoRenew': true, 'usage': UsageFrequency.monthly, 'notes': 'Fee waived on ₹4L annual spend'},
    {'name': 'Home Loan EMI', 'provider': 'SBI', 'category': CategoryId.loanEmi, 'amount': 32000, 'cycle': BillingCycle.monthly, 'nextRenewal': _inDays(5), 'status': SubStatus.active, 'autoRenew': true, 'usage': UsageFrequency.never},
    {'name': 'Electricity (BESCOM)', 'provider': 'BESCOM', 'category': CategoryId.electricity, 'amount': 2200, 'cycle': BillingCycle.monthly, 'nextRenewal': _inDays(14), 'status': SubStatus.active, 'autoRenew': false, 'usage': UsageFrequency.never},
    {'name': 'Piped Gas (GAIL)', 'provider': 'GAIL', 'category': CategoryId.gas, 'amount': 850, 'cycle': BillingCycle.monthly, 'nextRenewal': _inDays(21), 'status': SubStatus.active, 'autoRenew': false, 'usage': UsageFrequency.never},
    {'name': 'School Fees — Term', 'provider': 'DPS', 'category': CategoryId.schoolFees, 'amount': 45000, 'cycle': BillingCycle.quarterly, 'nextRenewal': _inDays(33), 'status': SubStatus.active, 'autoRenew': false, 'usage': UsageFrequency.never},
    {'name': 'Cult.fit Membership', 'provider': 'Cult.fit', 'category': CategoryId.gym, 'amount': 2500, 'cycle': BillingCycle.monthly, 'nextRenewal': _inDays(8), 'status': SubStatus.active, 'autoRenew': true, 'usage': UsageFrequency.rarely, 'notes': 'Went twice last month'},
    {'name': 'Canva Pro', 'provider': 'Canva', 'category': CategoryId.software, 'amount': 500, 'cycle': BillingCycle.monthly, 'nextRenewal': _inDays(16), 'status': SubStatus.active, 'autoRenew': true, 'usage': UsageFrequency.monthly},
    {'name': 'iCloud+ 200GB', 'provider': 'Apple', 'category': CategoryId.software, 'amount': 219, 'cycle': BillingCycle.monthly, 'nextRenewal': _inDays(1), 'status': SubStatus.active, 'autoRenew': true, 'usage': UsageFrequency.daily},
    {'name': 'Amazon Prime (duplicate)', 'provider': 'Amazon Prime', 'category': CategoryId.ott, 'amount': 299, 'cycle': BillingCycle.quarterly, 'nextRenewal': _inDays(27), 'status': SubStatus.paused, 'autoRenew': false, 'usage': UsageFrequency.never, 'notes': 'Second Prime account — cancel'},
  ];

  return [
    for (var i = 0; i < base.length; i++)
      Subscription(
        id: 'seed-${i + 1}',
        createdAt: createdAt,
        name: base[i]['name'] as String,
        provider: base[i]['provider'] as String,
        category: base[i]['category'] as CategoryId,
        amount: base[i]['amount'] as num,
        cycle: base[i]['cycle'] as BillingCycle,
        nextRenewal: base[i]['nextRenewal'] as String,
        status: base[i]['status'] as SubStatus,
        autoRenew: base[i]['autoRenew'] as bool,
        usage: base[i]['usage'] as UsageFrequency,
        notes: base[i]['notes'] as String?,
      ),
  ];
}

// Domain model — ported from src/lib/types.ts. Wire strings match the web app
// so JSON backups are interchangeable between the two apps.

enum CategoryId {
  mobile,
  broadband,
  ott,
  insurance,
  creditCard,
  loanEmi,
  electricity,
  gas,
  schoolFees,
  gym,
  software,
  membership,
}

enum BillingCycle { monthly, quarterly, halfYearly, yearly }

enum SubStatus { active, paused, cancelled }

enum UsageFrequency { daily, weekly, monthly, rarely, never }

const Map<CategoryId, String> _categoryWire = {
  CategoryId.mobile: 'mobile',
  CategoryId.broadband: 'broadband',
  CategoryId.ott: 'ott',
  CategoryId.insurance: 'insurance',
  CategoryId.creditCard: 'credit-card',
  CategoryId.loanEmi: 'loan-emi',
  CategoryId.electricity: 'electricity',
  CategoryId.gas: 'gas',
  CategoryId.schoolFees: 'school-fees',
  CategoryId.gym: 'gym',
  CategoryId.software: 'software',
  CategoryId.membership: 'membership',
};

const Map<BillingCycle, String> _cycleWire = {
  BillingCycle.monthly: 'monthly',
  BillingCycle.quarterly: 'quarterly',
  BillingCycle.halfYearly: 'half-yearly',
  BillingCycle.yearly: 'yearly',
};

const Map<SubStatus, String> _statusWire = {
  SubStatus.active: 'active',
  SubStatus.paused: 'paused',
  SubStatus.cancelled: 'cancelled',
};

const Map<UsageFrequency, String> _usageWire = {
  UsageFrequency.daily: 'daily',
  UsageFrequency.weekly: 'weekly',
  UsageFrequency.monthly: 'monthly',
  UsageFrequency.rarely: 'rarely',
  UsageFrequency.never: 'never',
};

K _keyFor<K>(Map<K, String> m, String v, K fallback) =>
    m.entries.firstWhere((e) => e.value == v, orElse: () => MapEntry(fallback, '')).key;

String categoryWire(CategoryId c) => _categoryWire[c]!;
CategoryId categoryFromWire(String v) => _keyFor(_categoryWire, v, CategoryId.membership);
String cycleWire(BillingCycle c) => _cycleWire[c]!;
BillingCycle cycleFromWire(String v) => _keyFor(_cycleWire, v, BillingCycle.monthly);
String statusWire(SubStatus s) => _statusWire[s]!;
SubStatus statusFromWire(String v) => _keyFor(_statusWire, v, SubStatus.active);
String usageWire(UsageFrequency u) => _usageWire[u]!;
UsageFrequency usageFromWire(String v) => _keyFor(_usageWire, v, UsageFrequency.monthly);

class Subscription {
  final String id;
  final String name;
  final String provider;
  final CategoryId category;
  final num amount; // rupees per billing cycle
  final BillingCycle cycle;
  final String nextRenewal; // ISO yyyy-mm-dd
  final SubStatus status;
  final bool autoRenew;
  final UsageFrequency usage;
  final String? notes;
  final String createdAt;

  const Subscription({
    required this.id,
    required this.name,
    required this.provider,
    required this.category,
    required this.amount,
    required this.cycle,
    required this.nextRenewal,
    required this.status,
    required this.autoRenew,
    required this.usage,
    required this.createdAt,
    this.notes,
  });

  Subscription copyWith({
    String? name,
    String? provider,
    CategoryId? category,
    num? amount,
    BillingCycle? cycle,
    String? nextRenewal,
    SubStatus? status,
    bool? autoRenew,
    UsageFrequency? usage,
    String? notes,
  }) {
    return Subscription(
      id: id,
      createdAt: createdAt,
      name: name ?? this.name,
      provider: provider ?? this.provider,
      category: category ?? this.category,
      amount: amount ?? this.amount,
      cycle: cycle ?? this.cycle,
      nextRenewal: nextRenewal ?? this.nextRenewal,
      status: status ?? this.status,
      autoRenew: autoRenew ?? this.autoRenew,
      usage: usage ?? this.usage,
      notes: notes ?? this.notes,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'provider': provider,
        'category': categoryWire(category),
        'amount': amount,
        'cycle': cycleWire(cycle),
        'nextRenewal': nextRenewal,
        'status': statusWire(status),
        'autoRenew': autoRenew,
        'usage': usageWire(usage),
        if (notes != null) 'notes': notes,
        'createdAt': createdAt,
      };

  static Subscription fromJson(Map<String, dynamic> j) => Subscription(
        id: (j['id'] ?? '').toString(),
        name: (j['name'] ?? '').toString(),
        provider: (j['provider'] ?? '').toString(),
        category: categoryFromWire((j['category'] ?? 'membership').toString()),
        amount: (j['amount'] is num) ? j['amount'] as num : 0,
        cycle: cycleFromWire((j['cycle'] ?? 'monthly').toString()),
        nextRenewal: (j['nextRenewal'] ?? '').toString(),
        status: statusFromWire((j['status'] ?? 'active').toString()),
        autoRenew: j['autoRenew'] == true,
        usage: usageFromWire((j['usage'] ?? 'monthly').toString()),
        notes: j['notes']?.toString(),
        createdAt: (j['createdAt'] ?? DateTime.now().toIso8601String()).toString(),
      );
}

import 'dart:convert';
import '../models/subscription.dart';

/// Versioned export/import — interchangeable with the web app's backup files.
const int kBackupVersion = 1;

class BackupError implements Exception {
  final String message;
  BackupError(this.message);
  @override
  String toString() => message;
}

Map<String, dynamic> buildBackup(List<Subscription> subs) => {
      'app': 'okna',
      'version': kBackupVersion,
      'exportedAt': DateTime.now().toIso8601String(),
      'subscriptions': subs.map((s) => s.toJson()).toList(),
    };

String serializeBackup(List<Subscription> subs) =>
    const JsonEncoder.withIndent('  ').convert(buildBackup(subs));

String backupFilename([DateTime? now]) {
  final d = now ?? DateTime.now();
  String two(int n) => n.toString().padLeft(2, '0');
  return 'okna-backup-${d.year}-${two(d.month)}-${two(d.day)}.json';
}

List<Subscription> parseBackup(String raw) {
  dynamic data;
  try {
    data = jsonDecode(raw);
  } catch (_) {
    throw BackupError("That doesn't look like valid JSON.");
  }

  List list;
  if (data is List) {
    list = data;
  } else if (data is Map && data['subscriptions'] is List) {
    if (data['app'] != null && data['app'] != 'okna') {
      throw BackupError("This backup isn't from okna.");
    }
    list = data['subscriptions'] as List;
  } else {
    throw BackupError('Expected an okna backup with a "subscriptions" list.');
  }

  if (list.isEmpty) throw BackupError('The backup has no subscriptions in it.');

  final out = <Subscription>[];
  for (var i = 0; i < list.length; i++) {
    final item = list[i];
    if (item is! Map) {
      throw BackupError('Item ${i + 1} is not a subscription object.');
    }
    final m = item.cast<String, dynamic>();
    if (m['name'] is! String || (m['name'] as String).trim().isEmpty) {
      throw BackupError('Item ${i + 1} has an invalid "name".');
    }
    if (m['amount'] is! num || (m['amount'] as num) < 0) {
      throw BackupError('Item ${i + 1} has an invalid "amount".');
    }
    if (m['nextRenewal'] is! String ||
        !RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(m['nextRenewal'] as String)) {
      throw BackupError('Item ${i + 1} has an invalid "nextRenewal".');
    }
    out.add(Subscription.fromJson(m));
  }
  return out;
}

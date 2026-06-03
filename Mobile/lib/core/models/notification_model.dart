class AppNotification {
  final String id;
  final String title;
  final String body;
  final String type;
  final bool isRead;
  final DateTime? createdAt;
  final Map<String, dynamic>? metadata;

  const AppNotification({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.isRead,
    this.createdAt,
    this.metadata,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      body: json['body'] ?? json['message'] ?? '',
      type: json['type'] ?? 'general',
      isRead: json['isRead'] == true || json['read'] == true,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }

  String get icon => switch (type) {
        'order_placed' => '🛍',
        'order_confirmed' => '✅',
        'order_ready' => '🎉',
        'order_cancelled' => '❌',
        'payment' => '💰',
        'business' => '🏪',
        'impact' => '🌿',
        _ => '🔔',
      };
}

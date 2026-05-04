import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../models/notification_model.dart';

// ── Notifications list ────────────────────────────────────────────────────────
final notificationsProvider = FutureProvider<List<AppNotification>>((ref) async {
  final res = await ApiClient.instance.get(AppEndpoints.notifications);
  final data = res.data;
  final List items;
  if (data is List) {
    items = data;
  } else if (data is Map) {
    items = data['notifications'] ?? data['data'] ?? [];
  } else {
    items = [];
  }
  return items
      .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
      .toList();
});

// ── Unread count ──────────────────────────────────────────────────────────────
final unreadCountProvider = FutureProvider<int>((ref) async {
  try {
    final res = await ApiClient.instance.get(AppEndpoints.notificationsUnreadCount);
    final data = res.data;
    if (data is Map) return (data['count'] ?? data['unread'] ?? 0) as int;
    if (data is int) return data;
    return 0;
  } catch (_) {
    return 0;
  }
});

// ── Notifications Notifier ─────────────────────────────────────────────────────
class NotificationsNotifier extends StateNotifier<List<AppNotification>> {
  NotificationsNotifier(List<AppNotification> notifications) : super(notifications);

  void markRead(String id) {
    state = state
        .map((n) => n.id == id
            ? AppNotification(
                id: n.id, title: n.title, body: n.body,
                type: n.type, isRead: true,
                createdAt: n.createdAt, metadata: n.metadata)
            : n)
        .toList();
    ApiClient.instance.put(AppEndpoints.markNotificationRead(id)).catchError((_) {});
  }

  void markAllRead() {
    state = state
        .map((n) => AppNotification(
            id: n.id, title: n.title, body: n.body,
            type: n.type, isRead: true,
            createdAt: n.createdAt, metadata: n.metadata))
        .toList();
    ApiClient.instance.put(AppEndpoints.notificationsMarkAllRead).catchError((_) {});
  }

  void delete(String id) {
    state = state.where((n) => n.id != id).toList();
    ApiClient.instance.delete(AppEndpoints.deleteNotification(id)).catchError((_) {});
  }

  int get unreadCount => state.where((n) => !n.isRead).length;
}

final notificationsNotifierProvider =
    StateNotifierProvider<NotificationsNotifier, List<AppNotification>>(
  (ref) => NotificationsNotifier([]),
);

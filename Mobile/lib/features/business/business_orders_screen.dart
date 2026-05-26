import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/api/api_exception.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/feedback/cn_states.dart';

final _businessOrdersProvider = FutureProvider<List<dynamic>>((ref) async {
  final res = await ApiClient.instance.get(AppEndpoints.orders);
  final data = res.data;
  if (data is List) return data;
  if (data is Map) return (data['orders'] ?? data['data'] ?? []) as List;
  return [];
});

class BusinessOrdersScreen extends ConsumerStatefulWidget {
  const BusinessOrdersScreen({super.key});
  @override
  ConsumerState<BusinessOrdersScreen> createState() => _BusinessOrdersScreenState();
}

class _BusinessOrdersScreenState extends ConsumerState<BusinessOrdersScreen> with SingleTickerProviderStateMixin {
  late TabController _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() { _tabs.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final asyncOrders = ref.watch(_businessOrdersProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Orders', style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        backgroundColor: AppColors.surface,
        automaticallyImplyLeading: false,
        elevation: 0,
        bottom: TabBar(
          controller: _tabs,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
          tabs: const [Tab(text: '🔥 New'), Tab(text: '⏳ Active'), Tab(text: '✅ Done')],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.primary),
            onPressed: () => ref.invalidate(_businessOrdersProvider),
          ),
        ],
      ),
      body: asyncOrders.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (e, _) => CnErrorState(message: e.toString(), onRetry: () => ref.invalidate(_businessOrdersProvider)),
        data: (allOrders) {
          final newOrders = allOrders.where((o) => o['status'] == 'pending').toList();
          final activeOrders = allOrders.where((o) => ['confirmed', 'preparing', 'ready_for_pickup'].contains(o['status'])).toList();
          final doneOrders = allOrders.where((o) => ['completed', 'cancelled'].contains(o['status'])).toList();

          return RefreshIndicator(
            color: AppColors.primary,
            onRefresh: () async => ref.invalidate(_businessOrdersProvider),
            child: TabBarView(
              controller: _tabs,
              children: [
                _OrderList(orders: newOrders, emptyMessage: 'No new orders', onUpdate: (id, status) => _updateStatus(id, status)),
                _OrderList(orders: activeOrders, emptyMessage: 'No active orders', onUpdate: (id, status) => _updateStatus(id, status)),
                _OrderList(orders: doneOrders, emptyMessage: 'No completed orders', showActions: false, onUpdate: (_, __) {}),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _updateStatus(String orderId, String newStatus) async {
    HapticFeedback.mediumImpact();
    try {
      await ApiClient.instance.put(AppEndpoints.orderStatus(orderId), data: {'status': newStatus});
      ref.invalidate(_businessOrdersProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Order status updated to $newStatus'), backgroundColor: AppColors.primary),
        );
      }
    } on Exception catch (e) {
      final msg = e is ApiException ? e.message : 'Failed to update order';
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg), backgroundColor: AppColors.error));
    }
  }
}

class _OrderList extends StatelessWidget {
  final List<dynamic> orders;
  final String emptyMessage;
  final bool showActions;
  final void Function(String id, String status) onUpdate;
  const _OrderList({required this.orders, required this.emptyMessage, required this.onUpdate, this.showActions = true});

  @override
  Widget build(BuildContext context) {
    if (orders.isEmpty) return CnEmptyState(title: emptyMessage, icon: Icons.receipt_long_outlined);
    return ListView.separated(
      padding: const EdgeInsets.all(12),
      itemCount: orders.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (_, i) => _BusinessOrderCard(order: orders[i], showActions: showActions, onUpdate: onUpdate),
    );
  }
}

class _BusinessOrderCard extends StatelessWidget {
  final dynamic order;
  final bool showActions;
  final void Function(String id, String status) onUpdate;
  const _BusinessOrderCard({required this.order, required this.showActions, required this.onUpdate});

  @override
  Widget build(BuildContext context) {
    final status = order['status']?.toString() ?? 'pending';
    final orderId = order['_id']?.toString() ?? '';
    final customerName = order['user'] is Map
        ? '${order['user']['firstName'] ?? ''} ${order['user']['lastName'] ?? ''}'.trim()
        : 'Customer';

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: status == 'pending' ? AppColors.primary.withValues(alpha: 0.3) : AppColors.border),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 6)],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Order #${orderId.length > 8 ? orderId.substring(0, 8) : orderId}',
                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppColors.textPrimary)),
            Text(customerName, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          ])),
          _StatusBadge(status: status),
        ]),
        const SizedBox(height: 8),

        // Items summary
        if (order['items'] != null)
          ...(order['items'] as List).take(2).map((item) {
            final listing = item['listing'] ?? {};
            return Text('${item['quantity']}x ${listing['title'] ?? 'Item'}',
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary));
          }),

        const SizedBox(height: 8),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('RWF ${order['total'] ?? order['totalAmount'] ?? 0}',
              style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.primary, fontSize: 15)),
          Text(order['deliveryType'] == 'delivery' ? '🚚 Delivery' : '🏃 Pickup',
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        ]),

        if (showActions) ...[
          const SizedBox(height: 12),
          const Divider(color: AppColors.border, height: 1),
          const SizedBox(height: 10),
          _actionButtons(status, orderId),
        ],
      ]),
    );
  }

  Widget _actionButtons(String status, String orderId) {
    return switch (status) {
      'pending' => Row(children: [
        Expanded(child: _OutlineBtn(label: 'Reject', color: AppColors.error,
            onTap: () => onUpdate(orderId, 'cancelled'))),
        const SizedBox(width: 8),
        Expanded(child: _FilledBtn(label: '✅ Accept', onTap: () => onUpdate(orderId, 'confirmed'))),
      ]),
      'confirmed' => _FilledBtn(label: '👨‍🍳 Start Preparing', onTap: () => onUpdate(orderId, 'preparing')),
      'preparing' => _FilledBtn(label: '🎉 Mark as Ready', onTap: () => onUpdate(orderId, 'ready_for_pickup')),
      'ready_for_pickup' => _FilledBtn(label: '✅ Mark Completed', onTap: () => onUpdate(orderId, 'completed')),
      _ => const SizedBox.shrink(),
    };
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;
  const _StatusBadge({required this.status});
  @override
  Widget build(BuildContext context) {
    final (color, bg, label) = switch (status) {
      'pending' => (AppColors.warning, AppColors.warningSurface, '🆕 New'),
      'confirmed' => (AppColors.primary, AppColors.primarySurface, '✅ Confirmed'),
      'preparing' => (AppColors.primary, AppColors.primarySurface, '👨‍🍳 Preparing'),
      'ready_for_pickup' => (AppColors.success, AppColors.successSurface, '🎉 Ready'),
      'completed' => (AppColors.success, AppColors.successSurface, '✅ Done'),
      'cancelled' => (AppColors.error, AppColors.errorSurface, '❌ Cancelled'),
      _ => (AppColors.textSecondary, AppColors.surfaceVariant, status),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(100)),
      child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: color)),
    );
  }
}

class _FilledBtn extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  const _FilledBtn({required this.label, required this.onTap});
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(10)),
      child: Center(child: Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13))),
    ),
  );
}

class _OutlineBtn extends StatelessWidget {
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _OutlineBtn({required this.label, required this.color, required this.onTap});
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(10), border: Border.all(color: color)),
      child: Center(child: Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 13))),
    ),
  );
}

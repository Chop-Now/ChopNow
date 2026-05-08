import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/feedback/cn_states.dart';

final _riderAvailableOrdersProvider = FutureProvider<List<dynamic>>((ref) async {
  final res = await ApiClient.instance.get(AppEndpoints.orders, queryParameters: {'status': 'ready_for_pickup'});
  final data = res.data;
  if (data is List) return data;
  if (data is Map) return (data['orders'] ?? data['data'] ?? []) as List;
  return [];
});

final _riderMyDeliveriesProvider = FutureProvider<List<dynamic>>((ref) async {
  final res = await ApiClient.instance.get(AppEndpoints.myOrders);
  final data = res.data;
  if (data is List) return data;
  if (data is Map) return (data['orders'] ?? data['data'] ?? []) as List;
  return [];
});

class RiderDashboardScreen extends ConsumerStatefulWidget {
  const RiderDashboardScreen({super.key});
  @override
  ConsumerState<RiderDashboardScreen> createState() => _RiderDashboardScreenState();
}

class _RiderDashboardScreenState extends ConsumerState<RiderDashboardScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabs;
  bool _isOnline = true;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() { _tabs.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final asyncAvailable = ref.watch(_riderAvailableOrdersProvider);
    final asyncMyDeliveries = ref.watch(_riderMyDeliveriesProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        automaticallyImplyLeading: false,
        elevation: 0,
        title: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Rider Dashboard', style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary, fontSize: 18)),
          Text('Hello ${user?.firstName ?? 'Rider'} 👋', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w400)),
        ]),
        actions: [
          // Online/offline toggle
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: GestureDetector(
              onTap: () {
                HapticFeedback.mediumImpact();
                setState(() => _isOnline = !_isOnline);
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: _isOnline ? AppColors.successSurface : AppColors.errorSurface,
                  borderRadius: BorderRadius.circular(100),
                  border: Border.all(color: _isOnline ? AppColors.success : AppColors.error),
                ),
                child: Row(children: [
                  Container(width: 7, height: 7, decoration: BoxDecoration(color: _isOnline ? AppColors.success : AppColors.error, shape: BoxShape.circle)),
                  const SizedBox(width: 5),
                  Text(_isOnline ? 'Online' : 'Offline',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: _isOnline ? AppColors.success : AppColors.error)),
                ]),
              ),
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabs,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
          tabs: const [Tab(text: '📦 Available Orders'), Tab(text: '🚴 My Deliveries')],
        ),
      ),
      body: Column(
        children: [
          // Stats strip
          Container(
            color: AppColors.surface,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(children: [
              _StatCard(emoji: '✅', label: 'Delivered', value: '24'),
              _StatCard(emoji: '💰', label: 'Today', value: 'RWF 4,200'),
              _StatCard(emoji: '⭐', label: 'Rating', value: '4.8'),
            ]),
          ),
          const Divider(height: 1, color: AppColors.border),

          Expanded(
            child: TabBarView(
              controller: _tabs,
              children: [
                // Available for pickup
                _isOnline
                    ? RefreshIndicator(
                        color: AppColors.primary,
                        onRefresh: () async => ref.invalidate(_riderAvailableOrdersProvider),
                        child: asyncAvailable.when(
                          loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
                          error: (e, _) => CnErrorState(message: e.toString(), onRetry: () => ref.invalidate(_riderAvailableOrdersProvider)),
                          data: (orders) => orders.isEmpty
                              ? const CnEmptyState(title: 'No orders available', subtitle: 'New pickup requests will appear here', icon: Icons.local_shipping_outlined)
                              : ListView.separated(
                                  padding: const EdgeInsets.all(12),
                                  itemCount: orders.length,
                                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                                  itemBuilder: (_, i) => _AvailableOrderCard(
                                    order: orders[i],
                                    onAccept: () => _acceptDelivery(orders[i]['_id']),
                                  ),
                                ),
                        ),
                      )
                    : const CnEmptyState(title: 'You\'re offline', subtitle: 'Go online to start accepting delivery requests', icon: Icons.wifi_off_rounded),

                // My active deliveries
                RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: () async => ref.invalidate(_riderMyDeliveriesProvider),
                  child: asyncMyDeliveries.when(
                    loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
                    error: (e, _) => CnErrorState(message: e.toString()),
                    data: (orders) => orders.isEmpty
                        ? const CnEmptyState(title: 'No deliveries yet', subtitle: 'Accept an order to start delivering!', icon: Icons.delivery_dining_rounded)
                        : ListView.separated(
                            padding: const EdgeInsets.all(12),
                            itemCount: orders.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 10),
                            itemBuilder: (_, i) => _DeliveryCard(order: orders[i]),
                          ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _acceptDelivery(String orderId) async {
    HapticFeedback.mediumImpact();
    try {
      await ApiClient.instance.put(AppEndpoints.orderStatus(orderId), data: {'status': 'delivering'});
      ref.invalidate(_riderAvailableOrdersProvider);
      ref.invalidate(_riderMyDeliveriesProvider);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Order accepted! Go pick it up 🚴'), backgroundColor: AppColors.primary),
      );
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not accept order'), backgroundColor: AppColors.error),
      );
    }
  }
}

class _StatCard extends StatelessWidget {
  final String emoji, label, value;
  const _StatCard({required this.emoji, required this.label, required this.value});
  @override
  Widget build(BuildContext context) => Expanded(child: Column(children: [
    Text(emoji, style: const TextStyle(fontSize: 18)),
    const SizedBox(height: 2),
    Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
    Text(label, style: const TextStyle(fontSize: 10, color: AppColors.textSecondary)),
  ]));
}

class _AvailableOrderCard extends StatelessWidget {
  final dynamic order;
  final VoidCallback onAccept;
  const _AvailableOrderCard({required this.order, required this.onAccept});

  @override
  Widget build(BuildContext context) {
    final biz = order['business'] is Map ? order['business'] : {};
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.primary.withOpacity(0.2)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8)],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(width: 40, height: 40, decoration: BoxDecoration(color: AppColors.primarySurface, borderRadius: BorderRadius.circular(10)),
              child: const Center(child: Text('🏪', style: TextStyle(fontSize: 20)))),
          const SizedBox(width: 10),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(biz['name'] ?? 'Restaurant', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.textPrimary)),
            if (biz['address'] != null) Text(biz['address'], style: const TextStyle(fontSize: 12, color: AppColors.textSecondary), maxLines: 1, overflow: TextOverflow.ellipsis),
          ])),
          Text('RWF ${order['total'] ?? 0}', style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.primary)),
        ]),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: OutlinedButton(
            onPressed: () => context.push('/rider/deliveries/${order['_id']}'),
            style: OutlinedButton.styleFrom(foregroundColor: AppColors.textSecondary, side: const BorderSide(color: AppColors.border)),
            child: const Text('View Route'),
          )),
          const SizedBox(width: 10),
          Expanded(child: ElevatedButton.icon(
            onPressed: onAccept,
            icon: const Icon(Icons.delivery_dining_rounded, size: 18),
            label: const Text('Accept'),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
          )),
        ]),
      ]),
    );
  }
}

class _DeliveryCard extends StatelessWidget {
  final dynamic order;
  const _DeliveryCard({required this.order});
  @override
  Widget build(BuildContext context) {
    final status = order['status']?.toString() ?? '';
    return GestureDetector(
      onTap: () => context.push('/rider/deliveries/${order['_id']}'),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
        child: Row(children: [
          Container(width: 40, height: 40, decoration: BoxDecoration(color: AppColors.primarySurface, borderRadius: BorderRadius.circular(10)),
              child: const Center(child: Text('🚴', style: TextStyle(fontSize: 20)))),
          const SizedBox(width: 12),
          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Order #${(order['_id'] ?? '').toString().substring(0, 8)}',
                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.textPrimary)),
            Text(status, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          ])),
          Text('RWF ${order['total'] ?? 0}', style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.primary)),
          const SizedBox(width: 8),
          const Icon(Icons.chevron_right, color: AppColors.textSecondary, size: 20),
        ]),
      ),
    );
  }
}

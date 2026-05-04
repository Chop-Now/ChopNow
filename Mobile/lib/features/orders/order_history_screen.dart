import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/models/order_model.dart';
import '../../core/providers/orders_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/feedback/cn_states.dart';

class OrderHistoryScreen extends ConsumerStatefulWidget {
  const OrderHistoryScreen({super.key});

  @override
  ConsumerState<OrderHistoryScreen> createState() => _OrderHistoryScreenState();
}

class _OrderHistoryScreenState extends ConsumerState<OrderHistoryScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final asyncOrders = ref.watch(ordersProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Orders', style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        backgroundColor: AppColors.surface,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          indicatorWeight: 2.5,
          labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
          tabs: const [Tab(text: 'Active'), Tab(text: 'Completed'), Tab(text: 'Cancelled')],
        ),
      ),
      body: asyncOrders.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (e, _) => CnErrorState(
          message: e.toString(),
          onRetry: () => ref.invalidate(ordersProvider),
        ),
        data: (orders) {
          final active = orders.where((o) => o.isActive).toList();
          final completed = orders.where((o) => o.isCompleted).toList();
          final cancelled = orders.where((o) => o.isCancelled).toList();
          return TabBarView(
            controller: _tabController,
            children: [
              _OrderList(orders: active, emptyMessage: 'No active orders right now'),
              _OrderList(orders: completed, emptyMessage: 'No completed orders yet'),
              _OrderList(orders: cancelled, emptyMessage: 'No cancelled orders'),
            ],
          );
        },
      ),
    );
  }
}

class _OrderList extends StatelessWidget {
  final List<Order> orders;
  final String emptyMessage;
  const _OrderList({required this.orders, required this.emptyMessage});

  @override
  Widget build(BuildContext context) {
    if (orders.isEmpty) {
      return CnEmptyState(
        title: emptyMessage,
        icon: Icons.receipt_long_outlined,
        subtitle: 'Your orders will appear here',
      );
    }
    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: () async {
        // Pull-to-refresh handled by GoRouter if needed
        await Future.delayed(const Duration(milliseconds: 600));
      },
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: orders.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (_, i) => _OrderCard(order: orders[i]),
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final Order order;
  const _OrderCard({required this.order});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/orders/${order.id}'),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 6, offset: const Offset(0, 2))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Order #${order.id.substring(order.id.length > 8 ? order.id.length - 8 : 0)}',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                CnStatusPill.fromStatus(order.status),
              ],
            ),
            if (order.business != null) ...[
              const SizedBox(height: 4),
              Text('🏪 ${order.business!['name'] ?? ''}',
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            ],
            const SizedBox(height: 8),
            Text('${order.items.length} item${order.items.length == 1 ? '' : 's'} · RWF ${order.total.toStringAsFixed(0)}',
                style: const TextStyle(fontSize: 13, color: AppColors.textPrimary)),
            if (order.isActive) ...[
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => context.push('/orders/${order.id}/tracking'),
                  icon: const Icon(Icons.location_on_outlined, size: 16),
                  label: const Text('Track Order'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.primary),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(vertical: 9),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

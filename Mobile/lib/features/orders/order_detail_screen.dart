import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/models/order_model.dart';
import '../../core/providers/orders_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/feedback/cn_states.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';

class OrderDetailScreen extends ConsumerWidget {
  final String orderId;
  const OrderDetailScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncOrder = ref.watch(orderDetailProvider(orderId));

    return asyncOrder.when(
      loading: () => const Scaffold(
        backgroundColor: AppColors.background,
        body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
      ),
      error: (e, _) => Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(backgroundColor: AppColors.surface, foregroundColor: AppColors.textPrimary, elevation: 0),
        body: CnErrorState(message: e.toString(), onRetry: () => ref.invalidate(orderDetailProvider(orderId))),
      ),
      data: (order) => _OrderDetailView(order: order),
    );
  }
}

class _OrderDetailView extends StatelessWidget {
  final Order order;
  const _OrderDetailView({required this.order});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Order #${order.id.substring(order.id.length > 8 ? order.id.length - 8 : 0)}',
            style: const TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: _gradientForStatus(order.status),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  Text(_emojiForStatus(order.status), style: const TextStyle(fontSize: 36)),
                  const SizedBox(height: 6),
                  Text(_labelForStatus(order.status),
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white)),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Items
            _Card(
              title: 'Items',
              child: Column(
                children: order.items.map((item) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  child: Row(
                    children: [
                      Expanded(child: Text('${item.name} × ${item.quantity}',
                          style: const TextStyle(fontSize: 13, color: AppColors.textPrimary))),
                      Text('RWF ${(item.price * item.quantity).toStringAsFixed(0)}',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                    ],
                  ),
                )).toList()..add(
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                        Text('RWF ${order.total.toStringAsFixed(0)}',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.primary)),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            // CO2 Impact
            if ((order.co2Saved ?? 0) > 0)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(gradient: AppColors.impactGradient, borderRadius: BorderRadius.circular(12)),
                child: Row(
                  children: [
                    const Text('🌿', style: TextStyle(fontSize: 24)),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Planet Impact', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white)),
                          Text('You saved ${order.co2Saved}g of CO₂ from going to landfill!',
                              style: const TextStyle(fontSize: 12, color: Colors.white70)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 16),
            // Actions
            if (order.isActive)
              CnPrimaryButton(
                label: 'Track Order',
                icon: Icons.location_on_outlined,
                onTap: () => context.push('/orders/${ order.id}/tracking'),
              ),
            if (order.isCompleted) ...[
              const SizedBox(height: 10),
              CnSecondaryButton(
                label: 'Leave a Review',
                icon: Icons.star_border_rounded,
                onTap: () {
                  HapticFeedback.lightImpact();
                  context.push('/orders/${order.id}/review');
                },
              ),
            ],
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  LinearGradient _gradientForStatus(String status) {
    if (status == 'completed') return AppColors.primaryGradient;
    if (status == 'cancelled') return const LinearGradient(colors: [Color(0xFFE53935), Color(0xFFEF5350)]);
    return const LinearGradient(colors: [Color(0xFF00897B), Color(0xFF26A69A)]);
  }

  String _emojiForStatus(String status) => switch (status) {
    'completed' => '✅',
    'cancelled' => '❌',
    'ready_for_pickup' => '🛍',
    'out_for_delivery' => '🚴',
    _ => '⏳',
  };

  String _labelForStatus(String status) => switch (status) {
    'pending' => 'Pending Payment',
    'paid' => 'Payment Confirmed',
    'confirmed' => 'Preparing Your Order',
    'ready_for_pickup' => 'Ready for Pickup!',
    'out_for_delivery' => 'Out for Delivery',
    'completed' => 'Order Completed',
    'cancelled' => 'Order Cancelled',
    _ => status,
  };
}

class _Card extends StatelessWidget {
  final String title;
  final Widget child;
  const _Card({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 10),
          const Divider(height: 1, color: AppColors.border),
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }
}

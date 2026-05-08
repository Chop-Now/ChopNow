import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/feedback/cn_states.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';

final _trackingOrderProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  final res = await ApiClient.instance.get(AppEndpoints.orderById(id));
  final data = res.data;
  if (data is Map<String, dynamic>) return (data['order'] ?? data['data'] ?? data) as Map<String, dynamic>;
  return {} as Map<String, dynamic>;
});

class OrderTrackingScreen extends ConsumerStatefulWidget {
  final String orderId;
  const OrderTrackingScreen({super.key, required this.orderId});
  @override
  ConsumerState<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends ConsumerState<OrderTrackingScreen> {
  static const _steps = [
    ('Order Placed', 'pending', Icons.shopping_bag_outlined),
    ('Confirmed', 'confirmed', Icons.check_circle_outline),
    ('Preparing', 'preparing', Icons.restaurant_outlined),
    ('Ready', 'ready_for_pickup', Icons.inventory_2_outlined),
    ('Completed', 'completed', Icons.celebration_outlined),
  ];

  @override
  Widget build(BuildContext context) {
    final asyncOrder = ref.watch(_trackingOrderProvider(widget.orderId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Track Order', style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.primary),
            onPressed: () => ref.invalidate(_trackingOrderProvider(widget.orderId)),
          ),
        ],
      ),
      body: asyncOrder.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (e, _) => CnErrorState(message: e.toString(), onRetry: () => ref.invalidate(_trackingOrderProvider(widget.orderId))),
        data: (order) {
          final status = order['status']?.toString() ?? 'pending';
          final currentStep = _steps.indexWhere((s) => s.$2 == status);

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Status hero card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.25), blurRadius: 16, offset: const Offset(0, 6))],
                  ),
                  child: Column(children: [
                    Text(_statusEmoji(status), style: const TextStyle(fontSize: 48)),
                    const SizedBox(height: 8),
                    Text(_statusLabel(status), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white)),
                    const SizedBox(height: 4),
                    Text('Order #${order['_id']?.toString().substring(0, 8) ?? '...'}',
                        style: const TextStyle(color: Colors.white70, fontSize: 13)),
                  ]),
                ),
                const SizedBox(height: 28),

                // Order timeline
                const Text('Order Progress', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                const SizedBox(height: 16),
                ..._steps.asMap().entries.map((entry) {
                  final i = entry.key;
                  final step = entry.value;
                  final isDone = i <= currentStep;
                  final isCurrent = i == currentStep;
                  return _TimelineStep(
                    icon: step.$3,
                    label: step.$1,
                    isDone: isDone,
                    isCurrent: isCurrent,
                    isLast: i == _steps.length - 1,
                  );
                }),

                const SizedBox(height: 24),

                // Pickup code if ready
                if (status == 'ready_for_pickup' && order['pickupCode'] != null)
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.successSurface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.success.withOpacity(0.3)),
                    ),
                    child: Column(children: [
                      const Text('Your Pickup Code', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.success)),
                      const SizedBox(height: 8),
                      Text('${order['pickupCode']}',
                          style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w900, color: AppColors.success, letterSpacing: 8)),
                      const SizedBox(height: 4),
                      const Text('Show this code at the restaurant', style: TextStyle(fontSize: 12, color: AppColors.success)),
                    ]),
                  ),

                const SizedBox(height: 24),

                // Order items
                const Text('Order Items', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                const SizedBox(height: 12),
                if (order['items'] != null)
                  ...((order['items'] as List).map((item) => _OrderItem(item: item))),

                const SizedBox(height: 16),

                // Total
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border)),
                  child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    const Text('Total Paid', style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                    Text('RWF ${order['total'] ?? order['totalAmount'] ?? 0}',
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18, color: AppColors.primary)),
                  ]),
                ),

                if (status == 'completed') ...[
                  const SizedBox(height: 20),
                  CnPrimaryButton(label: 'Write a Review ⭐', onTap: () => context.push('/orders/${widget.orderId}/review')),
                ],
                const SizedBox(height: 20),
              ],
            ),
          );
        },
      ),
    );
  }

  String _statusEmoji(String s) => switch (s) {
    'confirmed' => '✅', 'preparing' => '👨‍🍳', 'ready_for_pickup' => '🎉',
    'completed' => '🏆', 'cancelled' => '❌', _ => '⏳',
  };

  String _statusLabel(String s) => switch (s) {
    'confirmed' => 'Order Confirmed!', 'preparing' => 'Being Prepared',
    'ready_for_pickup' => 'Ready for Pickup! 🎉', 'completed' => 'Completed!',
    'cancelled' => 'Cancelled', _ => 'Order Placed',
  };
}

class _TimelineStep extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isDone;
  final bool isCurrent;
  final bool isLast;
  const _TimelineStep({required this.icon, required this.label, required this.isDone, required this.isCurrent, required this.isLast});

  @override
  Widget build(BuildContext context) {
    final color = isDone ? AppColors.primary : AppColors.border;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              color: isDone ? AppColors.primary : AppColors.surfaceVariant,
              shape: BoxShape.circle,
              border: Border.all(color: isCurrent ? AppColors.primary : Colors.transparent, width: 2),
            ),
            child: Icon(icon, size: 18, color: isDone ? Colors.white : AppColors.textSecondary),
          ),
          if (!isLast)
            Container(width: 2, height: 32, color: color),
        ]),
        const SizedBox(width: 12),
        Padding(
          padding: const EdgeInsets.only(top: 6),
          child: Text(label, style: TextStyle(
            fontSize: 14,
            fontWeight: isCurrent ? FontWeight.w700 : FontWeight.w500,
            color: isDone ? AppColors.textPrimary : AppColors.textSecondary,
          )),
        ),
      ],
    );
  }
}

class _OrderItem extends StatelessWidget {
  final dynamic item;
  const _OrderItem({required this.item});
  @override
  Widget build(BuildContext context) {
    final listing = item['listing'] ?? {};
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.border))),
      child: Row(children: [
        ClipRRect(borderRadius: BorderRadius.circular(8),
          child: Container(width: 52, height: 52, color: AppColors.surfaceVariant,
            child: listing['photos'] != null && (listing['photos'] as List).isNotEmpty
                ? Image.network(listing['photos'][0], fit: BoxFit.cover)
                : const Icon(Icons.fastfood_outlined, color: AppColors.textSecondary))),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(listing['title'] ?? item['name'] ?? 'Item',
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: AppColors.textPrimary)),
          Text('x${item['quantity']} · RWF ${item['price'] ?? 0}',
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        ])),
      ]),
    );
  }
}

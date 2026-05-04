import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/cart_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';
import '../../shared/widgets/feedback/cn_states.dart';
import '../../shared/animations/scale_tap.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(cartProvider);
    final total = ref.watch(cartTotalProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Cart', style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        backgroundColor: AppColors.surface,
        elevation: 0,
        actions: [
          if (items.isNotEmpty)
            TextButton(
              onPressed: () {
                HapticFeedback.lightImpact();
                ref.read(cartProvider.notifier).clear();
              },
              child: const Text('Clear', style: TextStyle(color: AppColors.error)),
            ),
        ],
      ),
      body: items.isEmpty
          ? CnEmptyState(
              title: 'Your cart is empty',
              subtitle: 'Find discounted meals near you and rescue them!',
              icon: Icons.shopping_bag_outlined,
              actionLabel: 'Browse Deals',
              onAction: () => context.go('/home'),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (_, i) => _CartItemCard(item: items[i]),
                  ),
                ),
                // Order Summary footer
                Container(
                  padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(context).padding.bottom + 8),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    border: const Border(top: BorderSide(color: AppColors.border)),
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 12, offset: const Offset(0, -4))],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Subtotal', style: TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                          Text('RWF ${total.toStringAsFixed(0)}',
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: const [
                          Text('Service fee', style: TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                          Text('RWF 0', style: TextStyle(fontSize: 14, color: AppColors.primary)),
                        ],
                      ),
                      const Divider(height: 24, color: AppColors.border),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Total', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                          Text('RWF ${total.toStringAsFixed(0)}',
                              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primary)),
                        ],
                      ),
                      const SizedBox(height: 14),
                      CnPrimaryButton(
                        label: 'Proceed to Checkout',
                        onTap: () => context.push('/checkout'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}

class _CartItemCard extends ConsumerWidget {
  final CartItem item;
  const _CartItemCard({required this.item});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartNotifier = ref.read(cartProvider.notifier);
    final listing = item.listing;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 6, offset: const Offset(0, 2))],
      ),
      child: Row(
        children: [
          // Image
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: SizedBox(
              width: 72,
              height: 72,
              child: listing.firstPhoto != null
                  ? CachedNetworkImage(imageUrl: listing.firstPhoto!, fit: BoxFit.cover,
                      placeholder: (_, __) => Container(color: AppColors.surfaceVariant),
                      errorWidget: (_, __, ___) => Container(color: AppColors.surfaceVariant,
                          child: const Icon(Icons.fastfood_rounded, color: AppColors.border)))
                  : Container(color: AppColors.surfaceVariant,
                      child: const Icon(Icons.fastfood_rounded, color: AppColors.border)),
            ),
          ),
          const SizedBox(width: 12),
          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(listing.title,
                    maxLines: 1, overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                const SizedBox(height: 2),
                Text('RWF ${listing.offerPrice.toStringAsFixed(0)} each',
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    // Qty stepper
                    _SmallStepper(
                      qty: item.quantity,
                      onDecrement: () => cartNotifier.decrementItem(listing.id),
                      onIncrement: item.quantity < listing.quantity
                          ? () => cartNotifier.addItem(listing)
                          : null,
                    ),
                    const Spacer(),
                    Text('RWF ${item.subtotal.toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary)),
                  ],
                ),
              ],
            ),
          ),
          // Remove
          ScaleTap(
            onTap: () {
              HapticFeedback.lightImpact();
              cartNotifier.removeItem(listing.id);
            },
            child: const Padding(
              padding: EdgeInsets.all(6),
              child: Icon(Icons.delete_outline_rounded, color: AppColors.error, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}

class _SmallStepper extends StatelessWidget {
  final int qty;
  final VoidCallback onDecrement;
  final VoidCallback? onIncrement;
  const _SmallStepper({required this.qty, required this.onDecrement, this.onIncrement});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(8)),
      child: Row(
        children: [
          GestureDetector(
            onTap: () { HapticFeedback.selectionClick(); onDecrement(); },
            child: const Padding(
              padding: EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              child: Icon(Icons.remove_rounded, size: 14, color: AppColors.primary),
            ),
          ),
          Text('$qty', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          GestureDetector(
            onTap: onIncrement == null ? null : () { HapticFeedback.selectionClick(); onIncrement!(); },
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              child: Icon(Icons.add_rounded, size: 14,
                  color: onIncrement == null ? AppColors.border : AppColors.primary),
            ),
          ),
        ],
      ),
    );
  }
}

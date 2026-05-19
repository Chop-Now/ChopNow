import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import 'package:animate_do/animate_do.dart';
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
    final totalSavings = items.fold(0.0, (sum, item) => sum + (item.listing.price - item.listing.offerPrice) * item.quantity);

    return Scaffold(
      backgroundColor: AppColors.surfaceIvory,
      appBar: AppBar(
        title: const Text('Rescue Cart', style: TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 24, fontWeight: FontWeight.w800, color: AppColors.primary, letterSpacing: -0.5)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: false,
        actions: [
          if (items.isNotEmpty)
            FadeInRight(
              child: TextButton(
                onPressed: () {
                  HapticFeedback.heavyImpact();
                  ref.read(cartProvider.notifier).clear();
                },
                child: const Text('Empty Cart', style: TextStyle(fontFamily: 'Inter', color: AppColors.error, fontWeight: FontWeight.w700)),
              ),
            ),
        ],
      ),
      body: items.isEmpty
          ? FadeInUp(
              child: CnEmptyState(
                title: 'Your cart is empty',
                subtitle: 'Meals are waiting to be rescued! Grab a deal and save the planet.',
                icon: Icons.shopping_basket_outlined,
                actionLabel: 'Explore Near Me',
                onAction: () => context.go('/home'),
              ),
            )
          : Column(
              children: [
                // ── Savings Tracker ──
                FadeInDown(
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradientHorz,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.2),
                          blurRadius: 15,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        const Text('💰', style: TextStyle(fontSize: 24)),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Total Rescue Savings', style: TextStyle(fontFamily: 'Inter', color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600)),
                              const SizedBox(height: 2),
                              Text(
                                'You are saving RWF ${totalSavings.toStringAsFixed(0)}!',
                                style: const TextStyle(fontFamily: 'Hanken Grotesk', color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                Expanded(
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(20, 12, 20, 140),
                    physics: const BouncingScrollPhysics(),
                    itemCount: items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 16),
                    itemBuilder: (_, i) => FadeInLeft(
                      delay: Duration(milliseconds: 100 * i),
                      child: _CartItemCard(item: items[i]),
                    ),
                  ),
                ),
              ],
            ),
      
      // ── Premium Checkout Bar ──
      bottomSheet: items.isEmpty ? null : FadeInUp(
        child: Container(
          padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).padding.bottom + 20),
          decoration: BoxDecoration(
            color: AppColors.surfaceIvory,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.04),
                blurRadius: 30,
                offset: const Offset(0, -10),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Total Price', style: TextStyle(fontFamily: 'Inter', color: AppColors.textSecondary, fontWeight: FontWeight.w600, fontSize: 15)),
                      SizedBox(height: 4),
                      Text('Incl. all fees', style: TextStyle(fontFamily: 'Inter', color: AppColors.textTertiary, fontSize: 12)),
                    ],
                  ),
                  Text(
                    'RWF ${total.toStringAsFixed(0)}',
                    style: const TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 28, fontWeight: FontWeight.w900, color: AppColors.textPrimary, letterSpacing: -0.5),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              CnPrimaryButton(
                label: 'Confirm & Checkout',
                onTap: () => context.push('/checkout'),
              ),
            ],
          ),
        ),
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
        color: AppColors.surfaceIvory,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.border.withOpacity(0.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          // Image
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: SizedBox(
              width: 90,
              height: 90,
              child: listing.firstPhoto != null
                  ? CachedNetworkImage(
                      imageUrl: listing.firstPhoto!, 
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(color: AppColors.surfaceVariant),
                      errorWidget: (_, __, ___) => Container(color: AppColors.surfaceVariant, child: const Icon(Icons.fastfood_rounded, color: AppColors.border)),
                    )
                  : Container(color: AppColors.surfaceVariant, child: const Icon(Icons.fastfood_rounded, color: AppColors.border)),
            ),
          ),
          const SizedBox(width: 16),
          // Details
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  listing.title,
                  maxLines: 1, 
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontFamily: 'Inter', fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 4),
                Text(
                  'RWF ${listing.offerPrice.toStringAsFixed(0)} each',
                  style: TextStyle(fontFamily: 'Inter', fontSize: 13, color: AppColors.textSecondary.withOpacity(0.7), fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _PremiumStepper(
                      qty: item.quantity,
                      onDecrement: () => cartNotifier.decrementItem(listing.id),
                      onIncrement: item.quantity < listing.quantity ? () => cartNotifier.addItem(listing) : null,
                    ),
                    ScaleTap(
                      onTap: () {
                        HapticFeedback.lightImpact();
                        cartNotifier.removeItem(listing.id);
                      },
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.error.withOpacity(0.08),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.delete_outline_rounded, color: AppColors.error, size: 18),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PremiumStepper extends StatelessWidget {
  final int qty;
  final VoidCallback onDecrement;
  final VoidCallback? onIncrement;
  const _PremiumStepper({required this.qty, required this.onDecrement, this.onIncrement});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant.withOpacity(0.5),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          ScaleTap(
            onTap: () { HapticFeedback.selectionClick(); onDecrement(); },
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(color: AppColors.surfaceIvory, borderRadius: BorderRadius.circular(8)),
              child: const Icon(Icons.remove_rounded, size: 14, color: AppColors.primary),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            child: Text('$qty', style: const TextStyle(fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          ),
          ScaleTap(
            onTap: onIncrement == null ? null : () { HapticFeedback.selectionClick(); onIncrement!(); },
            child: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: onIncrement == null ? Colors.transparent : AppColors.surfaceIvory,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                Icons.add_rounded, 
                size: 14, 
                color: onIncrement == null ? AppColors.textTertiary.withOpacity(0.3) : AppColors.primary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

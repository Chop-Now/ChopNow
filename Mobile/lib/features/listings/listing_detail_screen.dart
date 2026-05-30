import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import '../../core/models/listing_model.dart';
import '../../core/providers/listings_provider.dart';
import '../../core/providers/cart_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';
import '../../shared/widgets/feedback/cn_states.dart';
import '../../shared/animations/scale_tap.dart';
import '../../shared/widgets/listings/expiry_countdown.dart';

class ListingDetailScreen extends ConsumerWidget {
  final String listingId;
  const ListingDetailScreen({super.key, required this.listingId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncListing = ref.watch(listingDetailProvider(listingId));

    return asyncListing.when(
      loading: () => const Scaffold(
        backgroundColor: AppColors.background,
        body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
      ),
      error: (e, _) => Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(foregroundColor: AppColors.textPrimary, backgroundColor: AppColors.surface, elevation: 0),
        body: CnErrorState(message: e.toString(), onRetry: () => ref.invalidate(listingDetailProvider(listingId))),
      ),
      data: (listing) => _ListingDetailView(listing: listing),
    );
  }
}

class _ListingDetailView extends ConsumerStatefulWidget {
  final Listing listing;
  const _ListingDetailView({required this.listing});

  @override
  ConsumerState<_ListingDetailView> createState() => _ListingDetailViewState();
}

class _ListingDetailViewState extends ConsumerState<_ListingDetailView> {
  int _qty = 1;
  int _imageIndex = 0;

  @override
  Widget build(BuildContext context) {
    final listing = widget.listing;
    final cart = ref.watch(cartProvider.notifier);
    final cartQty = cart.quantityOf(listing.id);
    final maxQty = listing.quantity - cartQty;

    return Scaffold(
      backgroundColor: AppColors.background,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: ScaleTap(
          onTap: () => context.pop(),
          child: Container(
            margin: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.9),
              shape: BoxShape.circle,
              boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 8)],
            ),
            child: const Icon(Icons.arrow_back_rounded, color: AppColors.textPrimary, size: 20),
          ),
        ),
        actions: [
          ScaleTap(
            onTap: () {
              HapticFeedback.lightImpact();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Added to favorites!')),
              );
            },
            child: Container(
              margin: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.9),
                shape: BoxShape.circle,
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 8)],
              ),
              child: const Padding(
                padding: EdgeInsets.all(8),
                child: Icon(Icons.favorite_border_rounded, color: AppColors.textPrimary, size: 20),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Hero image gallery
                  _buildGallery(listing),
                  // Content
                  Padding(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // badges row
                        Row(
                          children: [
                            if (listing.discountPercent > 0)
                              _Badge(
                                label: '-${listing.discountPercent}% OFF',
                                color: AppColors.accent,
                              ),
                            if (listing.isLowStock) ...[
                              const SizedBox(width: 8),
                              _Badge(
                                label: '⚠ Only ${listing.quantity} left',
                                color: AppColors.warning,
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 10),
                        Text(listing.title,
                            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                        const SizedBox(height: 4),
                        if (listing.businessName.isNotEmpty)
                          Text('🏪 ${listing.businessName}',
                              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                        if (listing.availableUntil != null) ...[
                          const SizedBox(height: 8),
                          ExpiryCountdown(availableUntil: listing.availableUntil?.toIso8601String()),
                        ],
                        const SizedBox(height: 14),
                        // Price row
                        Row(
                          children: [
                            Text('RWF ${listing.offerPrice.toStringAsFixed(0)}',
                                style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: AppColors.primary)),
                            if (listing.price > listing.offerPrice) ...[
                              const SizedBox(width: 10),
                              Text('RWF ${listing.price.toStringAsFixed(0)}',
                                  style: const TextStyle(fontSize: 16, color: AppColors.textSecondary, decoration: TextDecoration.lineThrough)),
                            ],
                          ],
                        ),
                        const SizedBox(height: 16),
                        // CO2 impact pill
                        if ((listing.co2Saved ?? 0) > 0)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                            decoration: BoxDecoration(
                              gradient: AppColors.impactGradient,
                              borderRadius: BorderRadius.circular(100),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Text('🌿', style: TextStyle(fontSize: 14)),
                                const SizedBox(width: 6),
                                Text(
                                  'Saves ${listing.co2Saved}g CO₂ from landfill',
                                  style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.w600),
                                ),
                              ],
                            ),
                          ),
                        const SizedBox(height: 20),
                        const Divider(color: AppColors.border),
                        const SizedBox(height: 16),
                        // Description
                        const Text('About this meal', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                        const SizedBox(height: 6),
                        Text(listing.description,
                            style: const TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.6)),
                        // Allergens
                        if ((listing.allergens ?? []).isNotEmpty) ...[
                          const SizedBox(height: 20),
                          const Text('⚠ Allergens', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.warning)),
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 8,
                            runSpacing: 6,
                            children: listing.allergens!
                                .map((a) => Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                      decoration: BoxDecoration(
                                        color: AppColors.warningSurface,
                                        borderRadius: BorderRadius.circular(100),
                                      ),
                                      child: Text(a, style: const TextStyle(fontSize: 12, color: AppColors.warning, fontWeight: FontWeight.w500)),
                                    ))
                                .toList(),
                          ),
                        ],
                        const SizedBox(height: 100), // space for bottom bar
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      // Bottom add-to-cart bar
      bottomNavigationBar: Container(
        padding: EdgeInsets.fromLTRB(20, 12, 20, MediaQuery.of(context).padding.bottom + 12),
        decoration: BoxDecoration(
          color: AppColors.surface,
          border: const Border(top: BorderSide(color: AppColors.border)),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 12, offset: const Offset(0, -4))],
        ),
        child: listing.isSoldOut
            ? const CnErrorState(message: 'Sorry, this item is sold out')
            : Row(
                children: [
                  // Quantity stepper
                  Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.border),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        _StepperButton(
                          icon: Icons.remove_rounded,
                          onTap: _qty > 1 ? () => setState(() => _qty--) : null,
                        ),
                        SizedBox(
                          width: 32,
                          child: Text('$_qty', textAlign: TextAlign.center,
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                        ),
                        _StepperButton(
                          icon: Icons.add_rounded,
                          onTap: _qty < maxQty ? () => setState(() => _qty++) : null,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: CnPrimaryButton(
                      label: 'Add to Cart  ·  RWF ${(listing.offerPrice * _qty).toStringAsFixed(0)}',
                      onTap: () {
                        HapticFeedback.mediumImpact();
                        for (var i = 0; i < _qty; i++) {
                          ref.read(cartProvider.notifier).addItem(listing);
                        }
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('$_qty × ${listing.title} added to cart 🛒'),
                            behavior: SnackBarBehavior.floating,
                            backgroundColor: AppColors.primary,
                            duration: const Duration(seconds: 2),
                          ),
                        );
                        context.pop();
                      },
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildGallery(Listing listing) {
    final photos = listing.photos;
    if (photos.isEmpty) {
      return Container(
        height: 280,
        color: AppColors.surfaceVariant,
        child: const Center(child: Icon(Icons.fastfood_rounded, size: 60, color: AppColors.border)),
      );
    }
    return Stack(
      children: [
        SizedBox(
          height: 300,
          child: PageView.builder(
            itemCount: photos.length,
            onPageChanged: (i) => setState(() => _imageIndex = i),
            itemBuilder: (_, i) => CachedNetworkImage(
              imageUrl: photos[i],
              fit: BoxFit.cover,
              width: double.infinity,
              placeholder: (_, __) => Container(color: AppColors.surfaceVariant),
              errorWidget: (_, __, ___) => Container(
                color: AppColors.surfaceVariant,
                child: const Icon(Icons.broken_image_rounded, color: AppColors.border, size: 48),
              ),
            ),
          ),
        ),
        if (photos.length > 1)
          Positioned(
            bottom: 12,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(photos.length, (i) => AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: const EdgeInsets.symmetric(horizontal: 3),
                width: i == _imageIndex ? 20 : 6,
                height: 6,
                decoration: BoxDecoration(
                  color: i == _imageIndex ? Colors.white : Colors.white54,
                  borderRadius: BorderRadius.circular(3),
                ),
              )),
            ),
          ),
      ],
    );
  }
}

class _Badge extends StatelessWidget {
  final String label;
  final Color color;
  const _Badge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(100)),
      child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: color)),
    );
  }
}

class _StepperButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;
  const _StepperButton({required this.icon, this.onTap});

  @override
  Widget build(BuildContext context) {
    return ScaleTap(
      onTap: onTap,
      child: Container(
        constraints: const BoxConstraints(minWidth: 48, minHeight: 48),
        child: Center(
          child: Icon(icon, size: 18, color: onTap == null ? AppColors.border : AppColors.primary),
        ),
      ),
    );
  }
}

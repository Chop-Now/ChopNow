import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:go_router/go_router.dart';
import 'package:animate_do/animate_do.dart';
import '../../core/models/listing_model.dart';
import '../../core/providers/listings_provider.dart';
import '../../core/providers/cart_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';
import '../../shared/widgets/feedback/cn_states.dart';

class ListingDetailScreen extends ConsumerWidget {
  final String listingId;
  const ListingDetailScreen({super.key, required this.listingId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncListing = ref.watch(listingDetailProvider(listingId));

    return asyncListing.when(
      loading: () => const Scaffold(
        backgroundColor: AppColors.surfaceIvory,
        body: Center(child: CircularProgressIndicator(color: AppColors.primary)),
      ),
      error: (e, _) => Scaffold(
        backgroundColor: AppColors.surfaceIvory,
        appBar: AppBar(foregroundColor: AppColors.textPrimary, backgroundColor: AppColors.surfaceIvory, elevation: 0),
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
      backgroundColor: AppColors.surfaceIvory,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: CircleAvatar(
            backgroundColor: AppColors.surfaceIvory.withOpacity(0.8),
            child: IconButton(
              icon: const Icon(Icons.arrow_back_rounded, color: AppColors.textPrimary, size: 20),
              onPressed: () => context.pop(),
            ),
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: CircleAvatar(
              backgroundColor: AppColors.surfaceIvory.withOpacity(0.8),
              child: IconButton(
                icon: const Icon(Icons.favorite_border_rounded, color: AppColors.textPrimary, size: 20),
                onPressed: () {
                  HapticFeedback.lightImpact();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Added to favorites!')),
                  );
                },
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Hero image gallery
                  _buildGallery(listing),
                  // Content
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // badges row
                        FadeInUp(
                          child: Row(
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
                        ),
                        const SizedBox(height: 12),
                        FadeInUp(
                          delay: const Duration(milliseconds: 100),
                          child: Text(
                            listing.title,
                            style: const TextStyle(
                              fontFamily: 'Hanken Grotesk',
                              fontSize: 26,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textPrimary,
                              letterSpacing: -0.5,
                            ),
                          ),
                        ),
                        const SizedBox(height: 6),
                        if (listing.businessName.isNotEmpty)
                          FadeInUp(
                            delay: const Duration(milliseconds: 150),
                            child: GestureDetector(
                              onTap: () {
                                if (listing.businessId.isNotEmpty) {
                                  context.push('/business/${listing.businessId}');
                                }
                              },
                              child: Row(
                                children: [
                                  const Icon(Icons.storefront_rounded, size: 16, color: AppColors.textSecondary),
                                  const SizedBox(width: 4),
                                  Text(
                                    listing.businessName,
                                    style: const TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.textSecondary, fontWeight: FontWeight.w600, decoration: TextDecoration.underline),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        const SizedBox(height: 16),
                        // Price row
                        FadeInUp(
                          delay: const Duration(milliseconds: 200),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                'RWF ${listing.offerPrice.toStringAsFixed(0)}',
                                style: const TextStyle(fontFamily: 'Inter', fontSize: 26, fontWeight: FontWeight.w800, color: AppColors.primary),
                              ),
                              if (listing.price > listing.offerPrice) ...[
                                const SizedBox(width: 10),
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 4),
                                  child: Text(
                                    'RWF ${listing.price.toStringAsFixed(0)}',
                                    style: const TextStyle(fontFamily: 'Inter', fontSize: 16, color: AppColors.textSecondary, decoration: TextDecoration.lineThrough),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                        const SizedBox(height: 24),
                        // CO2 impact pill
                        if ((listing.co2Saved ?? 0) > 0)
                          FadeInUp(
                            delay: const Duration(milliseconds: 250),
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: const Color(0xFFE6F6F0), // Forest Light
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: AppColors.secondary.withOpacity(0.1)),
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: const BoxDecoration(color: AppColors.secondary, shape: BoxShape.circle),
                                    child: const Icon(Icons.eco_rounded, color: Colors.white, size: 20),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text('Eco Impact', style: TextStyle(fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                                        const SizedBox(height: 2),
                                        Text(
                                          'Saves ${listing.co2Saved}g CO₂ from landfill',
                                          style: const TextStyle(fontFamily: 'Inter', fontSize: 13, color: AppColors.textSecondary),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        const SizedBox(height: 24),
                        const Divider(color: AppColors.border),
                        const SizedBox(height: 24),
                        // Description
                        FadeInUp(
                          delay: const Duration(milliseconds: 300),
                          child: const Text('About this meal', style: TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                        ),
                        const SizedBox(height: 12),
                        FadeInUp(
                          delay: const Duration(milliseconds: 350),
                          child: Text(
                            listing.description,
                            style: const TextStyle(fontFamily: 'Inter', fontSize: 15, color: AppColors.textSecondary, height: 1.6),
                          ),
                        ),
                        // Allergens
                        if ((listing.allergens ?? []).isNotEmpty) ...[
                          const SizedBox(height: 32),
                          FadeInUp(
                            delay: const Duration(milliseconds: 400),
                            child: Row(
                              children: [
                                const Icon(Icons.warning_amber_rounded, size: 20, color: AppColors.warning),
                                const SizedBox(width: 6),
                                const Text('Allergens', style: TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.warning)),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),
                          FadeInUp(
                            delay: const Duration(milliseconds: 450),
                            child: Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: listing.allergens!
                                  .map((a) => Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                        decoration: BoxDecoration(
                                          color: AppColors.warning.withOpacity(0.1),
                                          borderRadius: BorderRadius.circular(100),
                                        ),
                                        child: Text(a, style: const TextStyle(fontFamily: 'Inter', fontSize: 13, color: AppColors.warning, fontWeight: FontWeight.w600)),
                                      ))
                                  .toList(),
                            ),
                          ),
                        ],
                        const SizedBox(height: 40), // space for bottom bar
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
        padding: EdgeInsets.fromLTRB(24, 16, 24, MediaQuery.of(context).padding.bottom + 16),
        decoration: BoxDecoration(
          color: AppColors.surfaceIvory,
          border: const Border(top: BorderSide(color: AppColors.border)),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 15, offset: const Offset(0, -5))],
        ),
        child: listing.isSoldOut
            ? const CnErrorState(message: 'Sorry, this item is sold out')
            : Row(
                children: [
                  // Quantity stepper
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant.withOpacity(0.4),
                      borderRadius: BorderRadius.circular(30),
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
                              style: const TextStyle(fontFamily: 'Inter', fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                        ),
                        _StepperButton(
                          icon: Icons.add_rounded,
                          onTap: _qty < maxQty ? () => setState(() => _qty++) : null,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
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
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
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
        height: 320,
        color: AppColors.surfaceVariant,
        child: const Center(child: Icon(Icons.fastfood_rounded, size: 60, color: AppColors.border)),
      );
    }
    return Stack(
      children: [
        SizedBox(
          height: 320,
          child: PageView.builder(
            itemCount: photos.length,
            physics: const BouncingScrollPhysics(),
            onPageChanged: (i) => setState(() => _imageIndex = i),
            itemBuilder: (_, i) => Stack(
              fit: StackFit.expand,
              children: [
                CachedNetworkImage(
                  imageUrl: photos[i],
                  fit: BoxFit.cover,
                  placeholder: (_, __) => Container(color: AppColors.surfaceVariant),
                  errorWidget: (_, __, ___) => Container(
                    color: AppColors.surfaceVariant,
                    child: const Icon(Icons.broken_image_rounded, color: AppColors.border, size: 48),
                  ),
                ),
                // Bottom gradient for smooth transition
                Positioned(
                  bottom: 0, left: 0, right: 0, height: 80,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter, end: Alignment.topCenter,
                        colors: [AppColors.surfaceIvory, Colors.transparent],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        if (photos.length > 1)
          Positioned(
            bottom: 24,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(photos.length, (i) => AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.symmetric(horizontal: 4),
                width: i == _imageIndex ? 24 : 8,
                height: 8,
                decoration: BoxDecoration(
                  color: i == _imageIndex ? AppColors.primary : AppColors.primary.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(4),
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
      decoration: BoxDecoration(color: color.withOpacity(0.12), borderRadius: BorderRadius.circular(100)),
      child: Text(label, style: TextStyle(fontFamily: 'Inter', fontSize: 11, fontWeight: FontWeight.w700, color: color)),
    );
  }
}

class _StepperButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;
  const _StepperButton({required this.icon, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        if (onTap != null) HapticFeedback.lightImpact();
        onTap?.call();
      },
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: const BoxDecoration(shape: BoxShape.circle),
        child: Icon(icon, size: 18, color: onTap == null ? AppColors.textTertiary : AppColors.primary),
      ),
    );
  }
}

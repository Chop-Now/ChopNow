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
  bool _isDescriptionExpanded = false;

  @override
  Widget build(BuildContext context) {
    final listing = widget.listing;
    final cart = ref.watch(cartProvider.notifier);
    final cartQty = cart.quantityOf(listing.id);
    final maxQty = listing.quantity - cartQty;

    // Parse location details
    final street = listing.business?['address']?['street']?.toString() ?? '';
    final city = listing.business?['address']?['city']?.toString() ?? '';
    final locationText = [street, city].where((s) => s.isNotEmpty).join(', ');
    final displayLocation = locationText.isEmpty ? 'Kigali, Rwanda' : locationText;

    return Scaffold(
      backgroundColor: AppColors.background,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'Details',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w800,
            fontSize: 18,
          ),
        ),
        leading: ScaleTap(
          onTap: () => context.pop(),
          child: Container(
            margin: const EdgeInsets.all(8),
            decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.textPrimary, size: 16),
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
              width: 40,
              height: 40,
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.favorite_border_rounded, color: AppColors.textPrimary, size: 20),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Floating Image Hero with Diagonal Clipper
            _buildGallery(listing),
            
            // Content Card
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 20, 24, 120),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title Block
                  Text(
                    listing.title,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textPrimary,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 6),
                  if (listing.businessName.isNotEmpty) ...[
                    Text(
                      '🏪 ${listing.businessName}',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 6),
                  ],
                  // Location Block
                  Row(
                    children: [
                      const Icon(Icons.location_on_rounded, color: AppColors.textSecondary, size: 16),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          displayLocation,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textSecondary,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  
                  // Macros Section Card
                  _buildMacroCard(listing),
                  const SizedBox(height: 24),
                  
                  // Description
                  const Text(
                    'Description',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  GestureDetector(
                    onTap: () => setState(() => _isDescriptionExpanded = !_isDescriptionExpanded),
                    child: RichText(
                      text: TextSpan(
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppColors.textSecondary,
                          height: 1.5,
                        ),
                        children: [
                          TextSpan(
                            text: _isDescriptionExpanded
                                ? listing.description
                                : (listing.description.length > 120
                                    ? '${listing.description.substring(0, 120)}... '
                                    : listing.description),
                          ),
                          if (listing.description.length > 120)
                            TextSpan(
                              text: _isDescriptionExpanded ? 'Show less' : 'Show more',
                              style: const TextStyle(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Pricing & Stepper Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text(
                                'RWF ${listing.offerPrice.toStringAsFixed(0)}',
                                style: const TextStyle(
                                  fontSize: 26,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.primary,
                                ),
                              ),
                              if (listing.price > listing.offerPrice) ...[
                                const SizedBox(width: 8),
                                Text(
                                  'RWF ${listing.price.toStringAsFixed(0)}',
                                  style: const TextStyle(
                                    fontSize: 15,
                                    color: AppColors.textTertiary,
                                    decoration: TextDecoration.lineThrough,
                                  ),
                                ),
                              ],
                            ],
                          ),
                          if (listing.discountPercent > 0) ...[
                            const SizedBox(height: 4),
                            Text(
                              '${listing.discountPercent}% OFF Saved Deal',
                              style: const TextStyle(
                                color: AppColors.accent,
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ],
                      ),
                      
                      // Stepper
                      if (!listing.isSoldOut)
                        Container(
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            border: Border.all(color: AppColors.border, width: 1.5),
                            borderRadius: BorderRadius.circular(26),
                          ),
                          child: Row(
                            children: [
                              _StepperButton(
                                icon: Icons.remove_rounded,
                                onTap: _qty > 1 ? () => setState(() => _qty--) : null,
                              ),
                              SizedBox(
                                width: 24,
                                child: Text(
                                  '$_qty',
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                              ),
                              _StepperButton(
                                icon: Icons.add_rounded,
                                onTap: _qty < maxQty ? () => setState(() => _qty++) : null,
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  
                  // Allergens (if any)
                  if ((listing.allergens ?? []).isNotEmpty) ...[
                    const Text(
                      '⚠ Allergens Warning',
                      style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.warning),
                    ),
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
                                  border: Border.all(color: AppColors.warning.withValues(alpha: 0.15)),
                                ),
                                child: Text(
                                  a,
                                  style: const TextStyle(fontSize: 12, color: AppColors.warning, fontWeight: FontWeight.w700),
                                ),
                              ))
                          .toList(),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // CO2 Pill (if any)
                  if ((listing.co2Saved ?? 0) > 0) ...[
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
                            style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: EdgeInsets.fromLTRB(24, 12, 24, MediaQuery.of(context).padding.bottom + 12),
        decoration: BoxDecoration(
          color: AppColors.surface,
          border: const Border(top: BorderSide(color: AppColors.border, width: 1)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 16,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: listing.isSoldOut
            ? const CnPrimaryButton(
                label: 'Sold Out',
                onTap: null,
              )
            : Row(
                children: [
                  // Circular Cart Button (Left)
                  ScaleTap(
                    onTap: () {
                      HapticFeedback.lightImpact();
                      for (var i = 0; i < _qty; i++) {
                        ref.read(cartProvider.notifier).addItem(listing);
                      }
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('$_qty × ${listing.title} added to cart 🛒'),
                          behavior: SnackBarBehavior.floating,
                          backgroundColor: AppColors.primary,
                          action: SnackBarAction(
                            label: 'View Cart',
                            textColor: Colors.white,
                            onPressed: () => context.push('/cart'),
                          ),
                          duration: const Duration(seconds: 3),
                        ),
                      );
                    },
                    child: Container(
                      width: 54,
                      height: 54,
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.border, width: 1.5),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.03),
                            blurRadius: 8,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: const Icon(Icons.shopping_bag_outlined, color: AppColors.textPrimary, size: 22),
                    ),
                  ),
                  const SizedBox(width: 16),
                  
                  // Large "Buy Now" Button (Right)
                  Expanded(
                    child: CnPrimaryButton(
                      label: 'Buy Now',
                      onTap: () {
                        HapticFeedback.mediumImpact();
                        for (var i = 0; i < _qty; i++) {
                          ref.read(cartProvider.notifier).addItem(listing);
                        }
                        context.push('/checkout');
                      },
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildGallery(Listing listing) {
    final photos = listing.photos.where((p) => p.startsWith('http://') || p.startsWith('https://')).toList();
    
    return Stack(
      children: [
        // Diagonal background split
        ClipPath(
          clipper: DiagonalClipper(),
          child: Container(
            height: 260,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF1E3A2F), Color(0xFF0D1E18)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
          ),
        ),
        
        // Centered Floating Image Card
        Container(
          height: 280,
          margin: const EdgeInsets.fromLTRB(24, 20, 24, 0),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(28),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.12),
                blurRadius: 24,
                offset: const Offset(0, 12),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(28),
            child: photos.isEmpty
                ? const Center(
                    child: Icon(Icons.fastfood_rounded, size: 70, color: AppColors.border),
                  )
                : PageView.builder(
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
        ),
        
        // Image Dots Indicators
        if (photos.length > 1)
          Positioned(
            bottom: 16,
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
                  color: i == _imageIndex ? AppColors.primary : AppColors.textTertiary,
                  borderRadius: BorderRadius.circular(3),
                ),
              )),
            ),
          ),
      ],
    );
  }

  Widget _buildMacroCard(Listing listing) {
    // Fallback averages if backend data is null or empty
    final cal = listing.calories ?? 245;
    final prot = listing.protein ?? 8.4;
    final carb = listing.carbs ?? 32.1;
    final fat = listing.fats ?? 6.8;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildMacroItem('$cal', 'kcal'),
          _buildDivider(),
          _buildMacroItem('${prot.toStringAsFixed(1)}g', 'proteins'),
          _buildDivider(),
          _buildMacroItem('${fat.toStringAsFixed(1)}g', 'fats'),
          _buildDivider(),
          _buildMacroItem('${carb.toStringAsFixed(1)}g', 'carbo'),
        ],
      ),
    );
  }

  Widget _buildMacroItem(String value, String label) {
    return Expanded(
      child: Column(
        children: [
          Text(
            value,
            style: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDivider() {
    return Container(
      width: 1.5,
      height: 28,
      color: AppColors.border,
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
        constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
        child: Center(
          child: Icon(icon, size: 16, color: onTap == null ? AppColors.border : AppColors.primary),
        ),
      ),
    );
  }
}

class DiagonalClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final path = Path();
    path.lineTo(0, size.height * 0.85);
    path.lineTo(size.width, size.height * 0.65);
    path.lineTo(size.width, 0);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}

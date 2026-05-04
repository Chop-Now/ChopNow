import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:shimmer/shimmer.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../animations/scale_tap.dart';

enum CardVariant { grid, list }

/// ListingCard — core card matching the web's ProductCard
/// Shows: livephoto, business name, discount badge, selling-fast badge,
/// price, countdown timer, distance, and add-to-cart button.
class ListingCard extends StatelessWidget {
  final Map<String, dynamic> listing;
  final CardVariant variant;
  final VoidCallback? onTap;
  final VoidCallback? onAddToCart;

  const ListingCard({
    super.key,
    required this.listing,
    this.variant = CardVariant.grid,
    this.onTap,
    this.onAddToCart,
  });

  @override
  Widget build(BuildContext context) {
    final price = (listing['price'] as num?)?.toDouble() ?? 0;
    final offerPrice = (listing['offerPrice'] as num?)?.toDouble() ?? price;
    final discount = price > 0 ? ((price - offerPrice) / price * 100).round() : 0;
    final qty = (listing['quantity'] as num?)?.toInt() ?? 0;
    final isLowStock = qty > 0 && qty <= 3;
    final name = listing['title'] ?? listing['name'] ?? '';
    final business = listing['business']?['name'] ?? listing['vendor'] ?? '';
    final distance = listing['distance'];
    final img = (listing['photos'] as List?)?.firstOrNull ?? listing['image']?[0];

    return ScaleTap(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.06),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: variant == CardVariant.grid ? _buildGrid(img, name, business, price, offerPrice, discount, qty, isLowStock, distance) : _buildList(img, name, business, price, offerPrice, discount, qty, isLowStock, distance),
      ),
    );
  }

  Widget _buildGrid(img, name, business, price, offerPrice, discount, qty, isLowStock, distance) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Image with badges
        ClipRRect(
          borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
          child: Stack(
            children: [
              AspectRatio(
                aspectRatio: 1.4,
                child: img != null
                    ? CachedNetworkImage(
                        imageUrl: img,
                        fit: BoxFit.cover,
                        placeholder: (_, __) => _shimmerBox(),
                        errorWidget: (_, __, ___) => _placeholder(),
                      )
                    : _placeholder(),
              ),
              if (discount > 0)
                Positioned(
                  top: 8,
                  right: 8,
                  child: _DiscountBadge(discount: discount),
                ),
            ],
          ),
        ),
        // Body
        Padding(
          padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 2),
              Row(
                children: [
                  Text(
                    business,
                    style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                  ),
                  if (distance != null) ...[
                    const Text(' • ', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                    Text(
                      '${distance}km',
                      style: const TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.w500),
                    ),
                  ],
                ],
              ),
              if (isLowStock) ...[
                const SizedBox(height: 4),
                Text(
                  '⚠ Only $qty left',
                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.accent),
                ),
              ],
              const SizedBox(height: 6),
              Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'RWF ${offerPrice.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary,
                        ),
                      ),
                      if (price > offerPrice)
                        Text(
                          'RWF ${price.toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppColors.textSecondary,
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                    ],
                  ),
                  const Spacer(),
                  ScaleTap(
                    onTap: onAddToCart,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                      decoration: BoxDecoration(
                        gradient: AppColors.primaryGradient,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Add',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildList(img, name, business, price, offerPrice, discount, qty, isLowStock, distance) {
    return Row(
      children: [
        ClipRRect(
          borderRadius: const BorderRadius.horizontal(left: Radius.circular(12)),
          child: SizedBox(
            width: 90,
            height: 90,
            child: img != null
                ? CachedNetworkImage(
                    imageUrl: img,
                    fit: BoxFit.cover,
                    placeholder: (_, __) => _shimmerBox(),
                    errorWidget: (_, __, ___) => _placeholder(),
                  )
                : _placeholder(),
          ),
        ),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  Expanded(child: Text(name, maxLines: 1, overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary))),
                  if (discount > 0) _DiscountBadge(discount: discount),
                ]),
                const SizedBox(height: 2),
                Text(business, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                const SizedBox(height: 4),
                Row(children: [
                  Text('RWF ${offerPrice.toStringAsFixed(0)}',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primary)),
                  if (price > offerPrice) ...[
                    const SizedBox(width: 6),
                    Text('RWF ${price.toStringAsFixed(0)}',
                      style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, decoration: TextDecoration.lineThrough)),
                  ],
                ]),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _shimmerBox() {
    return Shimmer.fromColors(
      baseColor: AppColors.shimmerBase,
      highlightColor: AppColors.shimmerHighlight,
      child: Container(color: AppColors.shimmerBase),
    );
  }

  Widget _placeholder() {
    return Container(
      color: AppColors.surfaceVariant,
      child: const Center(
        child: Icon(Icons.fastfood_rounded, color: AppColors.border, size: 32),
      ),
    );
  }
}

class _DiscountBadge extends StatelessWidget {
  final int discount;
  const _DiscountBadge({required this.discount});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.accent,
        borderRadius: BorderRadius.circular(AppRadius.pill),
      ),
      child: Text(
        '-$discount%',
        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white),
      ),
    );
  }
}

/// ListingCardSkeleton — shimmer placeholder while loading
class ListingCardSkeleton extends StatelessWidget {
  const ListingCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: AppColors.shimmerBase,
      highlightColor: AppColors.shimmerHighlight,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 120,
              decoration: const BoxDecoration(
                color: AppColors.shimmerBase,
                borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(height: 12, width: double.infinity, color: AppColors.shimmerBase),
                  const SizedBox(height: 6),
                  Container(height: 10, width: 100, color: AppColors.shimmerBase),
                  const SizedBox(height: 10),
                  Container(height: 12, width: 80, color: AppColors.shimmerBase),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

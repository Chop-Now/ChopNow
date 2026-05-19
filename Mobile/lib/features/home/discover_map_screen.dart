import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:animate_do/animate_do.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme/app_colors.dart';

/// Discover Map Screen — map-based discovery with discount pins
/// and a bottom-sheet vendor preview card.
/// Uses a styled map image background (matching the prototype) until
/// a native map SDK (google_maps_flutter) is integrated.
class DiscoverMapScreen extends ConsumerStatefulWidget {
  const DiscoverMapScreen({super.key});

  @override
  ConsumerState<DiscoverMapScreen> createState() => _DiscoverMapScreenState();
}

class _DiscoverMapScreenState extends ConsumerState<DiscoverMapScreen> {
  int _selectedPin = 2; // index of currently selected pin

  static const _pins = [
    _MapPin(discount: '-60%', top: 0.30, left: 0.22, name: 'Mama Amina Kitchen', category: 'West African', distance: '1.2km', rating: 4.6, price: 3000, originalPrice: 7500, image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200&q=80'),
    _MapPin(discount: '-40%', top: 0.42, left: 0.72, name: 'Green Basket Grocery', category: 'Organic Produce', distance: '0.8km', rating: 4.3, price: 2000, originalPrice: 3500, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80'),
    _MapPin(discount: '-50%', top: 0.55, left: 0.38, name: 'Brioche Cafe', category: 'Bakery & Pastries', distance: '0.5km', rating: 4.8, price: 2000, originalPrice: 4000, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&q=80'),
    _MapPin(discount: '-35%', top: 0.25, left: 0.55, name: 'Kigali Fresh Juice', category: 'Beverages', distance: '1.5km', rating: 4.5, price: 1500, originalPrice: 2300, image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=200&q=80'),
  ];

  @override
  Widget build(BuildContext context) {
    final selected = _pins[_selectedPin];

    return Scaffold(
      body: Stack(
        children: [
          // ── Map Background ──
          Positioned.fill(
            child: Container(
              color: const Color(0xFFE8EDDF),
              child: CustomPaint(
                painter: _MapGridPainter(),
                child: const SizedBox.expand(),
              ),
            ),
          ),

          // ── Map Pins ──
          ..._pins.asMap().entries.map((e) {
            final i = e.key;
            final pin = e.value;
            final isSelected = i == _selectedPin;
            return Positioned(
              top: MediaQuery.of(context).size.height * pin.top,
              left: MediaQuery.of(context).size.width * pin.left - 28,
              child: GestureDetector(
                onTap: () {
                  HapticFeedback.selectionClick();
                  setState(() => _selectedPin = i);
                },
                child: AnimatedScale(
                  scale: isSelected ? 1.15 : 1.0,
                  duration: const Duration(milliseconds: 200),
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: isSelected ? AppColors.primary : AppColors.primarySurface,
                          borderRadius: BorderRadius.circular(100),
                          border: Border.all(color: AppColors.surfaceIvory, width: 2),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(isSelected ? 0.2 : 0.1),
                              blurRadius: 12,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Text(
                          pin.discount,
                          style: TextStyle(
                            fontFamily: 'Inter',
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.5,
                            color: isSelected ? Colors.white : AppColors.onPrimaryContainer,
                          ),
                        ),
                      ),
                      // Pin arrow
                      CustomPaint(
                        size: const Size(12, 8),
                        painter: _PinArrowPainter(color: isSelected ? AppColors.primary : AppColors.primarySurface),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }),

          // ── Top Header ──
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: EdgeInsets.fromLTRB(16, MediaQuery.of(context).padding.top + 8, 16, 12),
              decoration: BoxDecoration(
                color: AppColors.surfaceIvory,
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10)],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  GestureDetector(
                    onTap: () => context.pop(),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.warningSurface,
                        borderRadius: BorderRadius.circular(100),
                      ),
                      child: const Icon(Icons.location_on, color: AppColors.primary, size: 22),
                    ),
                  ),
                  const Text('ChopNow', style: TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 28, fontWeight: FontWeight.w800, color: AppColors.primary)),
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.surfaceVariant, width: 2),
                      color: AppColors.surfaceVariant,
                    ),
                    child: const Icon(Icons.person, size: 20, color: AppColors.textSecondary),
                  ),
                ],
              ),
            ),
          ),

          // ── Search Pill ──
          Positioned(
            top: MediaQuery.of(context).padding.top + 72,
            left: 0,
            right: 0,
            child: Center(
              child: FadeInDown(
                child: GestureDetector(
                  onTap: () => context.push('/browse'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceIvory,
                      borderRadius: BorderRadius.circular(100),
                      border: Border.all(color: AppColors.surfaceVariant),
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 20, offset: const Offset(0, 4))],
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.search_rounded, color: AppColors.primary, size: 20),
                        SizedBox(width: 8),
                        Text('Search this area', style: TextStyle(fontFamily: 'Inter', fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),

          // ── Bottom Preview Card ──
          Positioned(
            bottom: 24,
            left: 16,
            right: 16,
            child: FadeInUp(
              key: ValueKey(_selectedPin),
              duration: const Duration(milliseconds: 300),
              child: GestureDetector(
                onTap: () {
                  // Navigate to listing — in production this would use actual listing ID
                  HapticFeedback.lightImpact();
                },
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceIvory.withOpacity(0.97),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: AppColors.surfaceVariant),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 20, offset: const Offset(0, -4))],
                  ),
                  child: Row(
                    children: [
                      // Food image
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 8)],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(16),
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              CachedNetworkImage(
                                imageUrl: selected.image,
                                fit: BoxFit.cover,
                                placeholder: (_, __) => Container(color: AppColors.surfaceVariant),
                                errorWidget: (_, __, ___) => Container(
                                  color: AppColors.surfaceVariant,
                                  child: const Icon(Icons.fastfood, color: AppColors.textSecondary),
                                ),
                              ),
                              Positioned(
                                top: 4,
                                left: 4,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.accent,
                                    borderRadius: BorderRadius.circular(100),
                                  ),
                                  child: const Text('Eco', style: TextStyle(fontFamily: 'Inter', fontSize: 9, fontWeight: FontWeight.w700, color: Colors.white)),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      // Details
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(selected.name, style: const TextStyle(fontFamily: 'Inter', fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary), overflow: TextOverflow.ellipsis),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(color: AppColors.surfaceVariant, borderRadius: BorderRadius.circular(6)),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.star_rounded, size: 14, color: AppColors.primary),
                                      const SizedBox(width: 2),
                                      Text('${selected.rating}', style: const TextStyle(fontFamily: 'Inter', fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primary)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text('${selected.category} • ${selected.distance} away', style: const TextStyle(fontFamily: 'Inter', fontSize: 13, color: AppColors.textSecondary), overflow: TextOverflow.ellipsis),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(color: AppColors.errorSurface, borderRadius: BorderRadius.circular(6)),
                                  child: Text('${selected.discount} Off', style: const TextStyle(fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.error)),
                                ),
                                const SizedBox(width: 8),
                                Text('${selected.originalPrice.toInt()}', style: const TextStyle(fontFamily: 'Inter', fontSize: 13, color: AppColors.textSecondary, decoration: TextDecoration.lineThrough)),
                                const SizedBox(width: 6),
                                Text('${selected.price.toInt()} RWF', style: const TextStyle(fontFamily: 'Inter', fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.primary)),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MapPin {
  final String discount;
  final double top;
  final double left;
  final String name;
  final String category;
  final String distance;
  final double rating;
  final double price;
  final double originalPrice;
  final String image;

  const _MapPin({
    required this.discount,
    required this.top,
    required this.left,
    required this.name,
    required this.category,
    required this.distance,
    required this.rating,
    required this.price,
    required this.originalPrice,
    required this.image,
  });
}

/// Draws a small downward-pointing arrow under each pin
class _PinArrowPainter extends CustomPainter {
  final Color color;
  _PinArrowPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = color..style = PaintingStyle.fill;
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width / 2, size.height)
      ..lineTo(size.width, 0)
      ..close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Draws a subtle grid pattern to simulate a map background
class _MapGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFFD5DAC8)
      ..strokeWidth = 0.5
      ..style = PaintingStyle.stroke;

    // Horizontal lines (roads)
    for (double y = 0; y < size.height; y += 60) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
    // Vertical lines
    for (double x = 0; x < size.width; x += 80) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }

    // Some diagonal accent roads
    final accentPaint = Paint()
      ..color = const Color(0xFFCCD4BD)
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;
    canvas.drawLine(Offset(0, size.height * 0.3), Offset(size.width, size.height * 0.7), accentPaint);
    canvas.drawLine(Offset(size.width * 0.2, 0), Offset(size.width * 0.8, size.height), accentPaint);

    // Green area patches
    final parkPaint = Paint()..color = const Color(0xFFD9E8D0).withOpacity(0.5);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(size.width * 0.6, size.height * 0.15, 80, 60), const Radius.circular(12)), parkPaint);
    canvas.drawRRect(RRect.fromRectAndRadius(Rect.fromLTWH(size.width * 0.1, size.height * 0.65, 100, 50), const Radius.circular(12)), parkPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

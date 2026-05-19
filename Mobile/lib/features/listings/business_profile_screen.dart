import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:animate_do/animate_do.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/feedback/cn_states.dart';

final _businessProfileProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  final res = await ApiClient.instance.get(AppEndpoints.businessById(id));
  final data = res.data;
  if (data is Map<String, dynamic>) return (data['business'] ?? data['data'] ?? data) as Map<String, dynamic>;
  return data as Map<String, dynamic>;
});

final _businessListingsForProfileProvider = FutureProvider.family<List<dynamic>, String>((ref, id) async {
  final res = await ApiClient.instance.get(AppEndpoints.listingsByBusiness(id));
  final data = res.data;
  if (data is List) return data;
  if (data is Map) return (data['listings'] ?? data['data'] ?? []) as List;
  return [];
});

class BusinessProfileScreen extends ConsumerWidget {
  final String businessId;
  const BusinessProfileScreen({super.key, required this.businessId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncBiz = ref.watch(_businessProfileProvider(businessId));
    final asyncListings = ref.watch(_businessListingsForProfileProvider(businessId));

    return Scaffold(
      backgroundColor: AppColors.surfaceIvory,
      body: asyncBiz.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (e, _) => Scaffold(
          appBar: AppBar(foregroundColor: AppColors.textPrimary, backgroundColor: AppColors.surfaceIvory, elevation: 0),
          body: CnErrorState(message: e.toString(), onRetry: () => ref.invalidate(_businessProfileProvider(businessId))),
        ),
        data: (biz) => CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // Cover / Hero
            SliverAppBar(
              expandedHeight: 250,
              pinned: true,
              backgroundColor: AppColors.surfaceIvory,
              foregroundColor: AppColors.textPrimary,
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
                      onPressed: () {},
                    ),
                  ),
                ),
              ],
              flexibleSpace: FlexibleSpaceBar(
                background: Stack(
                  fit: StackFit.expand,
                  children: [
                    if (biz['coverImage'] != null)
                      Image.network(biz['coverImage'], fit: BoxFit.cover)
                    else
                      Container(
                        decoration: BoxDecoration(gradient: AppColors.heroGradient),
                        child: const Icon(Icons.storefront_rounded, size: 80, color: Colors.white54),
                      ),
                    // Gradient overlay at bottom
                    Positioned(
                      bottom: 0, left: 0, right: 0,
                      height: 80,
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [Colors.transparent, AppColors.surfaceIvory],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    FadeInUp(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              biz['name'] ?? 'Vendor Name',
                              style: const TextStyle(
                                fontFamily: 'Hanken Grotesk',
                                fontSize: 28,
                                fontWeight: FontWeight.w800,
                                color: AppColors.textPrimary,
                                letterSpacing: -0.5,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceVariant,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.star_rounded, color: AppColors.primary, size: 16),
                                const SizedBox(width: 4),
                                Text(
                                  '${biz['rating'] ?? '4.8'}',
                                  style: const TextStyle(fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                    
                    FadeInUp(
                      delay: const Duration(milliseconds: 100),
                      child: Row(
                        children: [
                          const Icon(Icons.location_on_outlined, size: 16, color: AppColors.textSecondary),
                          const SizedBox(width: 4),
                          Text(
                            biz['address'] != null ? '${biz['address']} • 1.2 km away' : '1.2 km away • Kigali',
                            style: const TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Impact Summary
                    FadeInUp(
                      delay: const Duration(milliseconds: 200),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE6F6F0), // Forest Light
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4)),
                          ],
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 48, height: 48,
                              decoration: const BoxDecoration(
                                color: AppColors.secondary,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.eco_rounded, color: Colors.white),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Vendor Impact Score', style: TextStyle(fontFamily: 'Inter', fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                                  const SizedBox(height: 2),
                                  Text('Saved 50kg of food this week', style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.textSecondary.withOpacity(0.9))),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 32),
                    const Divider(color: AppColors.border),
                    const SizedBox(height: 24),

                    FadeInUp(
                      delay: const Duration(milliseconds: 300),
                      child: const Text(
                        'Available Rescue Packs',
                        style: TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),

            asyncListings.when(
              loading: () => const SliverToBoxAdapter(child: Padding(padding: EdgeInsets.all(32), child: Center(child: CircularProgressIndicator(color: AppColors.primary)))),
              error: (e, _) => SliverToBoxAdapter(child: CnErrorState(message: e.toString())),
              data: (listings) => listings.isEmpty
                  ? const SliverToBoxAdapter(child: Padding(padding: EdgeInsets.all(24), child: CnEmptyState(title: 'No deals right now', subtitle: 'Check back later for fresh surplus.', icon: Icons.shopping_basket_outlined)))
                  : SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      sliver: SliverGrid(
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                          childAspectRatio: 0.72, // Taller cards for image + text
                        ),
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            final l = listings[index];
                            final imageUrl = (l['photos'] != null && (l['photos'] as List).isNotEmpty) ? l['photos'][0] : null;
                            final isSoldOut = false; // Could be derived from l['status']

                            return FadeInUp(
                              delay: Duration(milliseconds: 300 + (index * 100)),
                              child: GestureDetector(
                                onTap: () => context.push('/listings/${l['_id']}'),
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: AppColors.surface,
                                    borderRadius: BorderRadius.circular(24),
                                    border: Border.all(color: AppColors.border.withOpacity(0.5)),
                                    boxShadow: [
                                      BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 15, offset: const Offset(0, 6)),
                                    ],
                                  ),
                                  clipBehavior: Clip.antiAlias,
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      // Image Stack
                                      Expanded(
                                        flex: 4,
                                        child: Stack(
                                          fit: StackFit.expand,
                                          children: [
                                            if (imageUrl != null)
                                              Image.network(imageUrl, fit: BoxFit.cover)
                                            else
                                              Container(
                                                color: AppColors.surfaceVariant,
                                                child: const Icon(Icons.fastfood_outlined, color: AppColors.textSecondary, size: 32),
                                              ),
                                            
                                            // Badges
                                            Positioned(
                                              top: 12, right: 12,
                                              child: Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                                decoration: BoxDecoration(
                                                  color: isSoldOut ? AppColors.surfaceVariant : AppColors.secondary,
                                                  borderRadius: BorderRadius.circular(20),
                                                ),
                                                child: Row(
                                                  mainAxisSize: MainAxisSize.min,
                                                  children: [
                                                    if (!isSoldOut) const Icon(Icons.bolt_rounded, color: Colors.white, size: 14),
                                                    if (!isSoldOut) const SizedBox(width: 4),
                                                    Text(
                                                      isSoldOut ? 'Sold Out' : '3 Left',
                                                      style: TextStyle(
                                                        fontFamily: 'Inter',
                                                        fontSize: 10,
                                                        fontWeight: FontWeight.w700,
                                                        color: isSoldOut ? AppColors.textSecondary : Colors.white,
                                                        letterSpacing: 0.5,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              ),
                                            ),

                                            // Timer Gradient
                                            if (!isSoldOut)
                                              Positioned(
                                                bottom: 0, left: 0, right: 0,
                                                height: 50,
                                                child: Container(
                                                  decoration: BoxDecoration(
                                                    gradient: LinearGradient(
                                                      begin: Alignment.bottomCenter,
                                                      end: Alignment.topCenter,
                                                      colors: [Colors.black.withOpacity(0.7), Colors.transparent],
                                                    ),
                                                  ),
                                                  padding: const EdgeInsets.all(8),
                                                  alignment: Alignment.bottomLeft,
                                                  child: Row(
                                                    children: const [
                                                      Icon(Icons.timer_outlined, color: Colors.white, size: 12),
                                                      SizedBox(width: 4),
                                                      Text('Rescue within 45m', style: TextStyle(fontFamily: 'Inter', fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white)),
                                                    ],
                                                  ),
                                                ),
                                              ),
                                          ],
                                        ),
                                      ),
                                      
                                      // Content
                                      Expanded(
                                        flex: 5,
                                        child: Padding(
                                          padding: const EdgeInsets.all(12),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                l['title'] ?? 'Surplus Pastry Box',
                                                style: const TextStyle(fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              const SizedBox(height: 4),
                                              Expanded(
                                                child: Text(
                                                  l['description'] ?? 'A delicious assortment of today\'s unsold items. Perfectly good.',
                                                  style: const TextStyle(fontFamily: 'Inter', fontSize: 12, color: AppColors.textSecondary),
                                                  maxLines: 2,
                                                  overflow: TextOverflow.ellipsis,
                                                ),
                                              ),
                                              Row(
                                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                                crossAxisAlignment: CrossAxisAlignment.end,
                                                children: [
                                                  Column(
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    mainAxisSize: MainAxisSize.min,
                                                    children: [
                                                      Text(
                                                        'RWF ${l['price'] ?? '15000'}',
                                                        style: const TextStyle(fontFamily: 'Inter', fontSize: 10, decoration: TextDecoration.lineThrough, color: AppColors.textSecondary),
                                                      ),
                                                      Text(
                                                        'RWF ${l['offerPrice'] ?? '4500'}',
                                                        style: const TextStyle(fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.primary),
                                                      ),
                                                    ],
                                                  ),
                                                  if (!isSoldOut)
                                                    Container(
                                                      padding: const EdgeInsets.all(6),
                                                      decoration: BoxDecoration(
                                                        color: AppColors.primaryContainer,
                                                        shape: BoxShape.circle,
                                                        boxShadow: [BoxShadow(color: AppColors.primaryContainer.withOpacity(0.3), blurRadius: 4, offset: const Offset(0, 2))],
                                                      ),
                                                      child: const Icon(Icons.add_shopping_cart_rounded, color: AppColors.onPrimaryContainer, size: 16),
                                                    ),
                                                ],
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                          childCount: listings.length,
                        ),
                      ),
                    ),
            ),
            
            // Bottom Info Sections
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 16),
                    const Divider(color: AppColors.border),
                    const SizedBox(height: 24),
                    
                    FadeInUp(
                      child: const Text('Vendor Story', style: TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                    ),
                    const SizedBox(height: 12),
                    FadeInUp(
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF3E7), // Amber Muted
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.primary.withOpacity(0.1)),
                        ),
                        child: Text(
                          biz['description'] ?? 'Simba Bakery has been a staple in Kigali, known for combining traditional Rwandan flavors with modern baking techniques. Committed to sustainability, we partner with ChopNow to ensure zero waste.',
                          style: const TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.textSecondary, height: 1.6),
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: 24),
                    const Divider(color: AppColors.border),
                    const SizedBox(height: 24),

                    FadeInUp(
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceVariant.withOpacity(0.5),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.verified_user_outlined, color: AppColors.secondary, size: 24),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: const [
                                  Text('Food Safety Note', style: TextStyle(fontFamily: 'Inter', fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                                  SizedBox(height: 4),
                                  Text(
                                    'All items are perfectly safe to eat and adhere to strict local health standards. Best consumed within 24 hours of rescue.',
                                    style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.textSecondary, height: 1.5),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

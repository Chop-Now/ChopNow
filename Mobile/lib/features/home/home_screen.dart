import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shimmer/shimmer.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../shared/widgets/cards/listing_card.dart';
import '../../shared/widgets/inputs/cn_text_field.dart';
import '../../shared/widgets/feedback/cn_states.dart';
import '../../shared/animations/scale_tap.dart';

// ── Providers ──────────────────────────────────────────────────────────────────
final listingsProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  final response = await ApiClient.instance.get(AppEndpoints.listings, queryParameters: {
    'status': 'active',
    'sort': 'offerPrice',
    'limit': 20,
  });
  final data = response.data;
  if (data is Map && data['listings'] != null) return List.from(data['listings']);
  if (data is List) return List.from(data);
  return [];
});

final selectedCategoryProvider = StateProvider<String>((ref) => 'All');
final searchQueryProvider = StateProvider<String>((ref) => '');

// ── Home Screen ────────────────────────────────────────────────────────────────
class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final _searchCtrl = TextEditingController();

  static const _categories = ['All', '🍔 Food', '🛒 Grocery', '🥗 Salads', '🥐 Bakery', '🍱 Asian', '🥩 Meat'];

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final listingsAsync = ref.watch(listingsProvider);
    final auth = ref.watch(authProvider);
    final user = auth is AuthAuthenticated ? auth.user : null;
    final selectedCat = ref.watch(selectedCategoryProvider);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(statusBarColor: Colors.transparent, statusBarIconBrightness: Brightness.dark),
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: CustomScrollView(
            slivers: [
              // ── Premium Vibe Header (Web Parity) ──
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 380, // Taller header to fit blobs
                  child: Stack(
                    children: [
                      // Organic Blob 1: Primary Green
                      Positioned(
                        top: -50,
                        right: -80,
                        child: Container(
                          width: 300,
                          height: 300,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.primary.withValues(alpha: 0.15),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withValues(alpha: 0.2),
                                blurRadius: 100,
                                spreadRadius: 50,
                              ),
                            ],
                          ),
                        ),
                      ),
                      // Organic Blob 2: Orange Accent
                      Positioned(
                        top: 150,
                        left: -100,
                        child: Container(
                          width: 250,
                          height: 250,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: AppColors.accent.withValues(alpha: 0.10),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.accent.withValues(alpha: 0.15),
                                blurRadius: 80,
                                spreadRadius: 40,
                              ),
                            ],
                          ),
                        ),
                      ),
                      
                      // Foreground Content
                      SafeArea(
                        bottom: false,
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Top row: greeting + notification bell
                              Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          _greeting(),
                                          style: const TextStyle(fontSize: 14, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
                                        ),
                                        Text(
                                          user != null ? '${user.firstName} 👋' : 'Food Rescuer 👋',
                                          style: const TextStyle(
                                            fontSize: 28, // Bigger
                                            fontWeight: FontWeight.w900, // Heavier
                                            color: AppColors.textPrimary,
                                            letterSpacing: -0.5,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  ScaleTap(
                                    onTap: () => context.push('/notifications'),
                                    child: Container(
                                      width: 46,
                                      height: 46,
                                      decoration: BoxDecoration(
                                        color: AppColors.surface,
                                        shape: BoxShape.circle,
                                        border: Border.all(color: AppColors.border, width: 1.5),
                                        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 12, offset: const Offset(0, 4))],
                                      ),
                                      child: Stack(
                                        alignment: Alignment.center,
                                        children: [
                                          const Icon(Icons.notifications_rounded, size: 22, color: AppColors.textPrimary),
                                          Positioned(
                                            top: 10, right: 10,
                                            child: Container(
                                              width: 10, height: 10,
                                              decoration: BoxDecoration(color: AppColors.accent, shape: BoxShape.circle, border: Border.all(color: AppColors.surface, width: 2)),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 24),
        
                              // Search bar
                              CnSearchBar(
                                hint: 'Search deals near you…',
                                onChanged: (v) => ref.read(searchQueryProvider.notifier).state = v,
                                onFilterTap: () {},
                              ),
                              const SizedBox(height: 24),
        
                              // Impact strip
                              ScaleTap(
                                onTap: () => context.go('/impact'),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                                  decoration: BoxDecoration(
                                    gradient: AppColors.primaryGradient,
                                    borderRadius: BorderRadius.circular(24),
                                    boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.35), blurRadius: 16, offset: const Offset(0, 6))],
                                  ),
                                  child: Row(
                                    children: [
                                      const DefaultTextStyle(style: TextStyle(fontSize: 28), child: Text('🌍')),
                                      const SizedBox(width: 16),
                                      const Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text('You\'ve rescued 12 meals', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800)),
                                            SizedBox(height: 2),
                                            Text('Saving 8.4 kg CO₂ — keep going!', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500)),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // ── Category filter chips ──
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 38,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    itemCount: _categories.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (_, i) {
                      final cat = _categories[i];
                      final active = cat == selectedCat;
                      return ScaleTap(
                        onTap: () => ref.read(selectedCategoryProvider.notifier).state = cat,
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: active ? AppColors.primary : AppColors.surface,
                            borderRadius: BorderRadius.circular(100),
                            border: Border.all(color: active ? AppColors.primary : AppColors.border),
                            boxShadow: active ? [BoxShadow(color: AppColors.primary.withValues(alpha: 0.25), blurRadius: 6, offset: const Offset(0, 2))] : null,
                          ),
                          child: Text(
                            cat,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: active ? Colors.white : AppColors.textSecondary,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 20)),

              // ── Flash Deals header ──
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    children: [
                      const Text('⚡ Flash Deals', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                      const Spacer(),
                      ScaleTap(
                        onTap: () {},
                        child: const Text('See all', style: TextStyle(fontSize: 13, color: AppColors.primary, fontWeight: FontWeight.w500)),
                      ),
                    ],
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 12)),

              // ── Listings grid ──
              listingsAsync.when(
                loading: () => SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  sliver: SliverGrid.builder(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 0.78,
                    ),
                    itemCount: 6,
                    itemBuilder: (_, __) => const ListingCardSkeleton(),
                  ),
                ),
                error: (e, _) => SliverFillRemaining(
                  child: CnErrorState(
                    message: e.toString(),
                    onRetry: () => ref.refresh(listingsProvider),
                  ),
                ),
                data: (listings) => listings.isEmpty
                    ? const SliverFillRemaining(
                        child: CnEmptyState(
                          title: 'No deals near you yet',
                          subtitle: 'We\'re expanding across Africa — check back soon!',
                          icon: Icons.fastfood_outlined,
                        ),
                      )
                    : SliverPadding(
                        padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
                        sliver: SliverGrid.builder(
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                            childAspectRatio: 0.78,
                          ),
                          itemCount: listings.length,
                          itemBuilder: (_, i) => ListingCard(
                            listing: listings[i],
                            onTap: () => context.push('/listings/${listings[i]['_id']}'),
                            onAddToCart: () {},
                          ),
                        ),
                      ),
              ),
            ],
          ),
        ),
    );
  }

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    return 'Good evening,';
  }
}

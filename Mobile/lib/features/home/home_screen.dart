import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:animate_do/animate_do.dart';
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

  static const _categories = [
    {'name': 'All', 'icon': '🥘'},
    {'name': 'Food', 'icon': '🍔'},
    {'name': 'Grocery', 'icon': '🛒'},
    {'name': 'Salads', 'icon': '🥗'},
    {'name': 'Bakery', 'icon': '🥐'},
    {'name': 'Asian', 'icon': '🍱'},
    {'name': 'Meat', 'icon': '🥩'},
  ];

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
            physics: const BouncingScrollPhysics(),
            slivers: [
              // ── Modern Animated Header ──
              SliverToBoxAdapter(
                child: Container(
                  height: 380,
                  child: Stack(
                    children: [
                      // Animated Background Blobs
                      Positioned(
                        top: -60,
                        right: -100,
                        child: FadeInDown(
                          duration: const Duration(seconds: 3),
                          child: Container(
                            width: 320,
                            height: 320,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.primary.withOpacity(0.12),
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        top: 140,
                        left: -80,
                        child: FadeInLeft(
                          duration: const Duration(seconds: 3),
                          child: Container(
                            width: 240,
                            height: 240,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.accent.withOpacity(0.08),
                            ),
                          ),
                        ),
                      ),
                      
                      SafeArea(
                        child: Padding(
                          padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        FadeInLeft(
                                          child: Text(
                                            _greeting(),
                                            style: TextStyle(
                                              fontSize: 14, 
                                              color: AppColors.textSecondary.withOpacity(0.6), 
                                              fontWeight: FontWeight.w700,
                                              letterSpacing: 0.5,
                                            ),
                                          ),
                                        ),
                                        FadeInLeft(
                                          delay: const Duration(milliseconds: 200),
                                          child: Text(
                                            user != null ? '${user.firstName} 👋' : 'Food Rescuer 👋',
                                            style: const TextStyle(
                                              fontSize: 32,
                                              fontWeight: FontWeight.w900,
                                              color: AppColors.textPrimary,
                                              letterSpacing: -1,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  FadeInRight(
                                    child: ScaleTap(
                                      onTap: () => context.push('/notifications'),
                                      child: Container(
                                        padding: const EdgeInsets.all(12),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withOpacity(0.8),
                                          shape: BoxShape.circle,
                                          border: Border.all(color: AppColors.border.withOpacity(0.5)),
                                          boxShadow: [
                                            BoxShadow(
                                              color: Colors.black.withOpacity(0.05),
                                              blurRadius: 15,
                                              offset: const Offset(0, 5),
                                            ),
                                          ],
                                        ),
                                        child: const Badge(
                                          label: Text('3'),
                                          child: Icon(Icons.notifications_outlined, size: 24, color: AppColors.textPrimary),
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 32),
        
                              FadeInDown(
                                delay: const Duration(milliseconds: 400),
                                child: CnSearchBar(
                                  hint: 'Search delicious deals...',
                                  onChanged: (v) => ref.read(searchQueryProvider.notifier).state = v,
                                  onFilterTap: () {},
                                ),
                              ),
                              const SizedBox(height: 32),
        
                              // Impact Strip (Glassmorphic)
                              FadeInUp(
                                delay: const Duration(milliseconds: 600),
                                child: ScaleTap(
                                  onTap: () => context.go('/impact'),
                                  child: Container(
                                    padding: const EdgeInsets.all(20),
                                    decoration: BoxDecoration(
                                      gradient: AppColors.primaryGradient,
                                      borderRadius: BorderRadius.circular(28),
                                      boxShadow: [
                                        BoxShadow(
                                          color: AppColors.primary.withOpacity(0.3),
                                          blurRadius: 20,
                                          offset: const Offset(0, 10),
                                        ),
                                      ],
                                    ),
                                    child: Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.all(12),
                                          decoration: BoxDecoration(
                                            color: Colors.white.withOpacity(0.2),
                                            borderRadius: BorderRadius.circular(16),
                                          ),
                                          child: const Text('🌍', style: TextStyle(fontSize: 28)),
                                        ),
                                        const SizedBox(width: 16),
                                        const Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                'Rescue impact summary', 
                                                style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600),
                                              ),
                                              SizedBox(height: 4),
                                              Text(
                                                '12 meals rescued • 8.4kg CO₂ saved', 
                                                style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900),
                                              ),
                                            ],
                                          ),
                                        ),
                                        const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white54, size: 16),
                                      ],
                                    ),
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

              // ── Category Selector ──
              SliverToBoxAdapter(
                child: FadeInUp(
                  delay: const Duration(milliseconds: 800),
                  child: Container(
                    height: 50,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      itemCount: _categories.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 12),
                      itemBuilder: (_, i) {
                        final cat = _categories[i];
                        final name = cat['name']!;
                        final icon = cat['icon']!;
                        final active = name == selectedCat;
                        return ScaleTap(
                          onTap: () => ref.read(selectedCategoryProvider.notifier).state = name,
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            decoration: BoxDecoration(
                              color: active ? AppColors.primary : AppColors.surface,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: active ? AppColors.primary : AppColors.border.withOpacity(0.5),
                                width: 1.5,
                              ),
                              boxShadow: active ? [
                                BoxShadow(
                                  color: AppColors.primary.withOpacity(0.2),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                )
                              ] : null,
                            ),
                            child: Row(
                              children: [
                                Text(icon, style: const TextStyle(fontSize: 16)),
                                const SizedBox(width: 8),
                                Text(
                                  name,
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: active ? FontWeight.w800 : FontWeight.w600,
                                    color: active ? Colors.white : AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 32)),

              // ── Section Header ──
              SliverToBoxAdapter(
                child: FadeInUp(
                  delay: const Duration(milliseconds: 900),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          '⚡ Flash Deals Nearby', 
                          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.textPrimary, letterSpacing: -0.5),
                        ),
                        TextButton(
                          onPressed: () {},
                          child: const Text('View all', style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary)),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 16)),

              // ── Listings Grid with Staggered Animations ──
              listingsAsync.when(
                loading: () => SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  sliver: SliverGrid.builder(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 16,
                      mainAxisSpacing: 16,
                      childAspectRatio: 0.72,
                    ),
                    itemCount: 6,
                    itemBuilder: (_, __) => const ListingCardSkeleton(),
                  ),
                ),
                error: (e, _) => SliverFillRemaining(
                  child: CnErrorState(
                    message: 'Couldn\'t load deals. Tap to retry.',
                    onRetry: () => ref.refresh(listingsProvider),
                  ),
                ),
                data: (listings) => listings.isEmpty
                    ? const SliverFillRemaining(
                        child: CnEmptyState(
                          title: 'Nothing here yet',
                          subtitle: 'New deals arrive every hour. Check back soon!',
                          icon: Icons.search_off_rounded,
                        ),
                      )
                    : SliverPadding(
                        padding: const EdgeInsets.fromLTRB(20, 0, 20, 120),
                        sliver: SliverGrid.builder(
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            crossAxisSpacing: 16,
                            mainAxisSpacing: 16,
                            childAspectRatio: 0.72,
                          ),
                          itemCount: listings.length,
                          itemBuilder: (_, i) => FadeInUp(
                            delay: Duration(milliseconds: 100 * (i % 6)),
                            child: ListingCard(
                              listing: listings[i],
                              onTap: () => context.push('/listings/${listings[i]['_id']}'),
                              onAddToCart: () {
                                HapticFeedback.lightImpact();
                              },
                            ),
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
    if (hour < 12) return 'GOOD MORNING';
    if (hour < 17) return 'GOOD AFTERNOON';
    return 'GOOD EVENING';
  }
}

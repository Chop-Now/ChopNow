import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:animate_do/animate_do.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../shared/widgets/cards/listing_card.dart';
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
    {'name': 'Bakery', 'icon': Icons.bakery_dining, 'color': AppColors.primary},
    {'name': 'Meals', 'icon': Icons.restaurant, 'color': Color(0xFF006878)}, // tertiary
    {'name': 'Groceries', 'icon': Icons.local_grocery_store, 'color': AppColors.secondary},
    {'name': 'Desserts', 'icon': Icons.icecream, 'color': Color(0xFFD81B60)},
  ];

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final listingsAsync = ref.watch(listingsProvider);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(statusBarColor: Colors.transparent, statusBarIconBrightness: Brightness.dark),
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // ── Mobile Header ──
            SliverAppBar(
              backgroundColor: AppColors.surfaceIvory,
              surfaceTintColor: Colors.transparent,
              pinned: true,
              elevation: 0,
              shadowColor: Colors.black.withOpacity(0.05),
              scrolledUnderElevation: 4,
              collapsedHeight: 140,
              expandedHeight: 140,
              flexibleSpace: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                  child: Column(
                    children: [
                      // Location & Profile
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'DELIVERING TO',
                                style: TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.5,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                              ScaleTap(
                                onTap: () {},
                                child: Row(
                                  children: [
                                    const Text(
                                      'Kigali Heights, Kigali',
                                      style: TextStyle(
                                        fontFamily: 'Inter',
                                        fontSize: 18,
                                        fontWeight: FontWeight.w600,
                                        color: AppColors.textPrimary,
                                      ),
                                    ),
                                    const Icon(Icons.expand_more, color: AppColors.primary, size: 24),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: AppColors.surfaceVariant,
                              shape: BoxShape.circle,
                              image: const DecorationImage(
                                image: NetworkImage('https://lh3.googleusercontent.com/aida-public/AB6AXuBUVnvgKIfhzthoPk28UPCfsbRVzgDaJustTrK8eYuFBPzQFxMT_nbUDR-moTzLWT3Tu2myxJtWi5OhvpJqG-RBMm0tzONO8nLXcVi-95oa-AEOG6HiNYs6n1bmiZP_7tuULGqtr3FX2aWZ9F4mH3n5idUDstmrhPokCVb-mIsETwQSoeSs_0eRyldpBTxPvjXIz-JTDe9iAcSn66b0UM2dSSH20rPWEEvSk_J-nqZiqkwSEDD59gQGPrxp_GAdGJcMqx8C45h09LyZ'),
                                fit: BoxFit.cover,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      // Search Bar
                      Container(
                        height: 48,
                        decoration: BoxDecoration(
                          color: const Color(0xFFEFF4FF), // surface-container-low
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(color: AppColors.border.withOpacity(0.5)),
                        ),
                        child: Row(
                          children: [
                            const SizedBox(width: 12),
                            const Icon(Icons.search, color: Color(0xFF867366)),
                            const SizedBox(width: 8),
                            Expanded(
                              child: TextField(
                                controller: _searchCtrl,
                                decoration: const InputDecoration(
                                  hintText: 'Search for food, groceries...',
                                  hintStyle: TextStyle(color: Color(0xFFD9C2B3), fontSize: 16),
                                  border: InputBorder.none,
                                  enabledBorder: InputBorder.none,
                                  focusedBorder: InputBorder.none,
                                  contentPadding: EdgeInsets.zero,
                                  isDense: true,
                                ),
                              ),
                            ),
                            Container(
                              margin: const EdgeInsets.all(4),
                              padding: const EdgeInsets.all(8),
                              decoration: const BoxDecoration(
                                color: AppColors.surfaceIvory,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.tune, color: AppColors.textSecondary, size: 20),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // ── Hero Banner ──
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                child: FadeInUp(
                  duration: const Duration(milliseconds: 600),
                  child: Container(
                    height: 200,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(24),
                      image: const DecorationImage(
                        image: NetworkImage('https://lh3.googleusercontent.com/aida-public/AB6AXuAL9yQaKNUD_rmAgBL1GM4f8ixnwGja6KU2RuA0xxEFWMdM18ya9SjagMWfCKVeTXP09ZDc7AlAj1QOk01DrU53uEX7r93o3EOgdWjvXpnlTluy7SF8GV0MW8pKqJOnnK_17EwFfJWwNVGJ1oJECEHewYTe5hBF7uO05pO44S4cOmhtxL8NxMOGV3SLfLdPccncti6lw4SBaXkgSXp2pj912sCiwhKrZlIvQVEVxIiQxsegOr_a36CARDTQwxj0-6yLjUZkv7gDu-du'),
                        fit: BoxFit.cover,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.06),
                          blurRadius: 20,
                          offset: const Offset(0, 4),
                        )
                      ],
                    ),
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(24),
                        gradient: LinearGradient(
                          colors: [
                            AppColors.textPrimary.withOpacity(0.8),
                            AppColors.textPrimary.withOpacity(0.4),
                            Colors.transparent,
                          ],
                          stops: const [0.0, 0.6, 1.0],
                        ),
                      ),
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.secondary,
                              borderRadius: BorderRadius.circular(100),
                            ),
                            child: const Text(
                              'LIMITED TIME',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          RichText(
                            text: const TextSpan(
                              style: TextStyle(
                                fontFamily: 'Hanken Grotesk',
                                fontSize: 28,
                                fontWeight: FontWeight.w800,
                                color: AppColors.surfaceIvory,
                                height: 1.1,
                              ),
                              children: [
                                TextSpan(text: 'Flash Discounts\n'),
                                TextSpan(
                                  text: '70% Off Now',
                                  style: TextStyle(color: Color(0xFFFFDCC3)), // primary-fixed
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
            ),

            // ── Categories ──
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: _categories.map((cat) {
                    return ScaleTap(
                      onTap: () {},
                      child: Column(
                        children: [
                          Container(
                            width: 64,
                            height: 64,
                            decoration: const BoxDecoration(
                              color: Color(0xFFDEE9FC), // surface-container-high
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Icon(
                                cat['icon'] as IconData,
                                color: cat['color'] as Color,
                                size: 32,
                              ),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            cat['name'] as String,
                            style: const TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 24)),

            // ── Section Title ──
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Nearby Rescue Deals',
                      style: TextStyle(
                        fontFamily: 'Hanken Grotesk',
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    TextButton(
                      onPressed: () {},
                      child: const Text(
                        'See all',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // ── Listings Grid ──
            listingsAsync.when(
              loading: () => SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: SliverGrid.builder(
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                    childAspectRatio: 0.72,
                  ),
                  itemCount: 4,
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
                      padding: const EdgeInsets.fromLTRB(16, 8, 16, 120),
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
}

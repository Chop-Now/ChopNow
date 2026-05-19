import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:animate_do/animate_do.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/cards/listing_card.dart';
import '../../shared/widgets/feedback/cn_states.dart';
import '../../shared/animations/scale_tap.dart';

final _browseCategoryProvider = StateProvider<String>((ref) => 'All');
final _browseSearchProvider = StateProvider<String>((ref) => '');

final _browseListingsProvider = FutureProvider.autoDispose<List<dynamic>>((ref) async {
  final category = ref.watch(_browseCategoryProvider);
  final search = ref.watch(_browseSearchProvider);
  final params = <String, dynamic>{'status': 'active', 'limit': 40};
  if (category != 'All') {
    params['category'] = category.replaceAll(RegExp(r'[^\w\s]'), '').trim();
  }
  if (search.isNotEmpty) {
    params['search'] = search;
  }
  final res = await ApiClient.instance.get(AppEndpoints.listings, queryParameters: params);
  final data = res.data;
  if (data is Map && data['listings'] != null) return List.from(data['listings'] as List);
  if (data is List) return List.from(data);
  return [];
});

class BrowseScreen extends ConsumerStatefulWidget {
  const BrowseScreen({super.key});
  @override
  ConsumerState<BrowseScreen> createState() => _BrowseScreenState();
}

class _BrowseScreenState extends ConsumerState<BrowseScreen> {
  final _searchCtrl = TextEditingController();
  final _searchFocus = FocusNode();

  static const _categories = [
    'All', '🍔 Food', '🥗 Salads', '🥐 Bakery',
    '☕ Café', '🍱 Asian', '🛒 Grocery', '🥩 Meat', '🍕 Pizza', '🍜 Noodles'
  ];

  @override
  void dispose() {
    _searchCtrl.dispose();
    _searchFocus.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final asyncListings = ref.watch(_browseListingsProvider);
    final selectedCat = ref.watch(_browseCategoryProvider);

    return Scaffold(
      backgroundColor: AppColors.surfaceIvory,
      body: SafeArea(
        child: Column(
          children: [
            // ── Search Header ──
            FadeInDown(
              duration: const Duration(milliseconds: 400),
              child: Container(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
                color: AppColors.surfaceIvory,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Discover',
                      style: TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 28, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Find surplus deals near you',
                      style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.textSecondary),
                    ),
                    const SizedBox(height: 16),
                    // Search field
                    Container(
                      height: 50,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border.withOpacity(0.5)),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 2))],
                      ),
                      child: Row(
                        children: [
                          const SizedBox(width: 14),
                          const Icon(Icons.search_rounded, color: AppColors.primary, size: 22),
                          const SizedBox(width: 10),
                          Expanded(
                            child: TextField(
                              controller: _searchCtrl,
                              focusNode: _searchFocus,
                              onChanged: (v) => ref.read(_browseSearchProvider.notifier).state = v,
                              style: const TextStyle(fontFamily: 'Inter', fontSize: 15, color: AppColors.textPrimary),
                              decoration: const InputDecoration(
                                hintText: 'Search food, cafés, grocery...',
                                hintStyle: TextStyle(fontFamily: 'Inter', fontSize: 15, color: AppColors.textSecondary),
                                border: InputBorder.none,
                                isDense: true,
                                contentPadding: EdgeInsets.zero,
                              ),
                            ),
                          ),
                          if (_searchCtrl.text.isNotEmpty)
                            GestureDetector(
                              onTap: () {
                                _searchCtrl.clear();
                                ref.read(_browseSearchProvider.notifier).state = '';
                                setState(() {});
                              },
                              child: Container(
                                margin: const EdgeInsets.only(right: 8),
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: AppColors.surfaceVariant,
                                  borderRadius: BorderRadius.circular(100),
                                ),
                                child: const Icon(Icons.close_rounded, size: 16, color: AppColors.textSecondary),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // ── Category chips ──
            SizedBox(
              height: 56,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                itemCount: _categories.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (_, i) {
                  final cat = _categories[i];
                  final active = selectedCat == cat;
                  return ScaleTap(
                    onTap: () {
                      HapticFeedback.selectionClick();
                      ref.read(_browseCategoryProvider.notifier).state = cat;
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      curve: Curves.easeOut,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: active ? AppColors.primary : Colors.white,
                        borderRadius: BorderRadius.circular(100),
                        border: Border.all(color: active ? AppColors.primary : AppColors.border.withOpacity(0.5)),
                        boxShadow: active
                            ? [BoxShadow(color: AppColors.primary.withOpacity(0.25), blurRadius: 12, offset: const Offset(0, 4))]
                            : [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 6)],
                      ),
                      child: Text(
                        cat,
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: active ? Colors.white : AppColors.textSecondary,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),

            // ── Results Grid ──
            Expanded(
              child: RefreshIndicator(
                color: AppColors.primary,
                onRefresh: () async => ref.invalidate(_browseListingsProvider),
                child: asyncListings.when(
                  loading: () => GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2, crossAxisSpacing: 14, mainAxisSpacing: 14, childAspectRatio: 0.78,
                    ),
                    itemCount: 6,
                    itemBuilder: (_, __) => const ListingCardSkeleton(),
                  ),
                  error: (e, _) => CnErrorState(
                    message: e.toString(),
                    onRetry: () => ref.invalidate(_browseListingsProvider),
                  ),
                  data: (listings) => listings.isEmpty
                      ? const CnEmptyState(
                          title: 'No deals found',
                          subtitle: 'Try a different category or search term',
                          icon: Icons.search_off_rounded,
                        )
                      : GridView.builder(
                          padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2, crossAxisSpacing: 14, mainAxisSpacing: 14, childAspectRatio: 0.78,
                          ),
                          itemCount: listings.length,
                          itemBuilder: (_, i) => FadeInUp(
                            delay: Duration(milliseconds: i * 40),
                            duration: const Duration(milliseconds: 350),
                            child: ListingCard(
                              listing: listings[i],
                              onTap: () => context.push('/listings/${listings[i]['_id']}'),
                              onAddToCart: () {},
                            ),
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

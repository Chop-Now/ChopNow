import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:animate_do/animate_do.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/feedback/cn_states.dart';
import '../../shared/widgets/cards/listing_card.dart';

final _favoritesProvider = FutureProvider<List<dynamic>>((ref) async {
  final res = await ApiClient.instance.get(AppEndpoints.favorites);
  final data = res.data;
  if (data is List) return data;
  if (data is Map) return (data['favorites'] ?? data['data'] ?? []) as List;
  return [];
});

class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(_favoritesProvider);

    return Scaffold(
      backgroundColor: AppColors.surfaceIvory,
      appBar: AppBar(
        backgroundColor: AppColors.surfaceIvory,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: const Text(
          'Favourites',
          style: TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.favorite_rounded, color: AppColors.error, size: 22),
            onPressed: () {},
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async => ref.invalidate(_favoritesProvider),
        child: async.when(
          loading: () => _buildSkeletonGrid(),
          error: (e, _) => CnErrorState(message: e.toString(), onRetry: () => ref.invalidate(_favoritesProvider)),
          data: (favs) => favs.isEmpty
              ? _buildEmptyState()
              : _buildFavoritesGrid(context, favs),
        ),
      ),
    );
  }

  Widget _buildSkeletonGrid() {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
        childAspectRatio: 0.78,
      ),
      itemCount: 4,
      itemBuilder: (_, __) => const ListingCardSkeleton(),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  color: AppColors.errorSurface,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.favorite_outline_rounded, size: 48, color: AppColors.error),
              ),
              const SizedBox(height: 24),
              const Text(
                'No favourites yet',
                style: TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 8),
              const Text(
                'Tap the ❤️ on any deal to save it\nhere for quick access',
                textAlign: TextAlign.center,
                style: TextStyle(fontFamily: 'Inter', fontSize: 15, color: AppColors.textSecondary, height: 1.5),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFavoritesGrid(BuildContext context, List<dynamic> favs) {
    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 14,
        mainAxisSpacing: 14,
        childAspectRatio: 0.78,
      ),
      itemCount: favs.length,
      itemBuilder: (_, i) {
        final listing = favs[i]['listing'] ?? favs[i];
        return FadeInUp(
          delay: Duration(milliseconds: i * 60),
          duration: const Duration(milliseconds: 350),
          child: ListingCard(
            listing: listing,
            onTap: () => context.push('/listings/${listing['_id']}'),
            onAddToCart: () {
              HapticFeedback.selectionClick();
            },
          ),
        );
      },
    );
  }
}

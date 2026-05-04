import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
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
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Favourites ❤️', style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        backgroundColor: AppColors.surface, elevation: 0, automaticallyImplyLeading: false,
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async => ref.invalidate(_favoritesProvider),
        child: async.when(
          loading: () => GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.78),
            itemCount: 4,
            itemBuilder: (_, __) => const ListingCardSkeleton(),
          ),
          error: (e, _) => CnErrorState(message: e.toString(), onRetry: () => ref.invalidate(_favoritesProvider)),
          data: (favs) => favs.isEmpty
              ? const CnEmptyState(
                  title: 'No favourites yet',
                  subtitle: 'Tap the ❤️ on any listing to save it here for quick access',
                  icon: Icons.favorite_border_rounded,
                )
              : GridView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.78),
                  itemCount: favs.length,
                  itemBuilder: (_, i) {
                    final listing = favs[i]['listing'] ?? favs[i];
                    return ListingCard(
                      listing: listing,
                      onTap: () => context.push('/listings/${listing['_id']}'),
                      onAddToCart: () {},
                    );
                  },
                ),
        ),
      ),
    );
  }
}

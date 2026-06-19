import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/api_client.dart';
import '../api/api_endpoints.dart';

/// Provider that fetches the user's favorite listings from the API.
final favoritesProvider =
    AsyncNotifierProvider<FavoritesNotifier, List<dynamic>>(
        FavoritesNotifier.new);

class FavoritesNotifier extends AsyncNotifier<List<dynamic>> {
  @override
  Future<List<dynamic>> build() => _fetch();

  Future<List<dynamic>> _fetch() async {
    final res = await ApiClient.instance.get(AppEndpoints.favorites);
    final data = res.data;
    if (data is List) return data;
    if (data is Map) return (data['favorites'] ?? data['data'] ?? []) as List;
    return [];
  }

  /// Toggle a listing as favorite.
  /// Returns `true` if added, `false` if removed.
  Future<bool> toggle(String listingId) async {
    final current = state.valueOrNull ?? [];
    final exists = current.any((f) {
      final fav = f is Map ? f : {};
      final id =
          fav['listing']?['_id'] ?? fav['listingId'] ?? fav['_id'] ?? '';
      return id == listingId;
    });

    if (exists) {
      // Remove favorite
      await ApiClient.instance.delete(AppEndpoints.favoriteBusiness(listingId));
      state = AsyncData(
        current.where((f) {
          final fav = f is Map ? f : {};
          final id =
              fav['listing']?['_id'] ?? fav['listingId'] ?? fav['_id'] ?? '';
          return id != listingId;
        }).toList(),
      );
      return false;
    } else {
      // Add favorite
      await ApiClient.instance.post(
        AppEndpoints.favorites,
        data: {'listingId': listingId},
      );
      // Refetch to get full listing data
      state = AsyncData(await _fetch());
      return true;
    }
  }

  /// Check if a listing is favorited.
  bool isFavorite(String listingId) {
    final current = state.valueOrNull ?? [];
    return current.any((f) {
      final fav = f is Map ? f : {};
      final id =
          fav['listing']?['_id'] ?? fav['listingId'] ?? fav['_id'] ?? '';
      return id == listingId;
    });
  }
}

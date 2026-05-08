import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../api/api_exception.dart';
import '../models/business_model.dart';

// ── My businesses ─────────────────────────────────────────────────────────────
final myBusinessesProvider = FutureProvider<List<Business>>((ref) async {
  final res = await ApiClient.instance.get(AppEndpoints.myBusinesses);
  final data = res.data;
  final List items;
  if (data is List) {
    items = data;
  } else if (data is Map && data['businesses'] != null) {
    items = data['businesses'] as List;
  } else if (data is Map && data['data'] != null) {
    items = data['data'] as List;
  } else {
    items = [];
  }
  return items
      .map((e) => Business.fromJson(e as Map<String, dynamic>))
      .toList();
});

// ── Single business ───────────────────────────────────────────────────────────
final businessDetailProvider = FutureProvider.family<Business, String>((ref, id) async {
  final res = await ApiClient.instance.get(AppEndpoints.businessById(id));
  final data = res.data;
  final json = data is Map<String, dynamic>
      ? (data['business'] ?? data['data'] ?? data) as Map<String, dynamic>
      : data as Map<String, dynamic>;
  return Business.fromJson(json);
});

// ── Public businesses list ────────────────────────────────────────────────────
final businessesProvider = FutureProvider<List<Business>>((ref) async {
  final res = await ApiClient.instance.get(AppEndpoints.businesses);
  final data = res.data;
  final List items;
  if (data is List) {
    items = data;
  } else if (data is Map) {
    items = data['businesses'] ?? data['data'] ?? [];
  } else {
    items = [];
  }
  return items.map((e) => Business.fromJson(e as Map<String, dynamic>)).toList();
});

// ── Business Notifier (create/update) ─────────────────────────────────────────
class BusinessNotifier extends StateNotifier<AsyncValue<Business?>> {
  BusinessNotifier() : super(const AsyncValue.data(null));

  Future<Business> createBusiness(Map<String, dynamic> data) async {
    state = const AsyncValue.loading();
    try {
      final res = await ApiClient.instance.post(AppEndpoints.businesses, data: data);
      final raw = res.data;
      final json = raw is Map<String, dynamic>
          ? (raw['business'] ?? raw['data'] ?? raw) as Map<String, dynamic>
          : raw as Map<String, dynamic>;
      final biz = Business.fromJson(json);
      state = AsyncValue.data(biz);
      return biz;
    } on DioException catch (e) {
      final err = ApiException.fromDioError(e);
      state = AsyncValue.error(err, StackTrace.current);
      throw err;
    }
  }

  Future<Business> updateBusiness(String id, Map<String, dynamic> data) async {
    try {
      final res = await ApiClient.instance.put(AppEndpoints.businessById(id), data: data);
      final raw = res.data;
      final json = raw is Map<String, dynamic>
          ? (raw['business'] ?? raw['data'] ?? raw) as Map<String, dynamic>
          : raw as Map<String, dynamic>;
      return Business.fromJson(json);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<String> uploadLogo(String businessId, String filePath) async {
    try {
      final formData = FormData.fromMap({
        'logo': await MultipartFile.fromFile(filePath, filename: 'logo.jpg'),
      });
      final res = await ApiClient.instance.post(
          AppEndpoints.businessLogo(businessId), data: formData);
      return res.data['logo']?.toString() ?? '';
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<List<String>> uploadPhotos(String businessId, List<String> filePaths) async {
    try {
      final formData = FormData();
      for (int i = 0; i < filePaths.length; i++) {
        formData.files.add(MapEntry(
          'photos',
          await MultipartFile.fromFile(filePaths[i], filename: 'photo_$i.jpg'),
        ));
      }
      final res = await ApiClient.instance.post(
          AppEndpoints.businessPhotos(businessId), data: formData);
      return (res.data['photos'] as List?)?.map((p) => p.toString()).toList() ?? [];
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<String> uploadCover(String businessId, String filePath) async {
    try {
      final formData = FormData.fromMap({
        'cover': await MultipartFile.fromFile(filePath, filename: 'cover.jpg'),
      });
      final res = await ApiClient.instance.post(
          AppEndpoints.businessCover(businessId), data: formData);
      return res.data['coverImage']?.toString() ?? '';
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> uploadKycDocuments(String businessId, List<String> filePaths) async {
    try {
      final formData = FormData();
      for (int i = 0; i < filePaths.length; i++) {
        formData.files.add(MapEntry(
          'documents',
          await MultipartFile.fromFile(filePaths[i], filename: 'kyc_doc_$i.jpg'),
        ));
      }
      await ApiClient.instance.post(
          AppEndpoints.businessKyc(businessId), data: formData);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}

final businessNotifierProvider =
    StateNotifierProvider<BusinessNotifier, AsyncValue<Business?>>(
  (ref) => BusinessNotifier(),
);

// ── Listing Notifier (create/update listings) ─────────────────────────────────
class ListingNotifier extends StateNotifier<AsyncValue<void>> {
  ListingNotifier() : super(const AsyncValue.data(null));

  Future<Map<String, dynamic>> createListing(Map<String, dynamic> data) async {
    state = const AsyncValue.loading();
    try {
      final res = await ApiClient.instance.post(AppEndpoints.listings, data: data);
      final raw = res.data;
      final json = raw is Map<String, dynamic>
          ? (raw['listing'] ?? raw['data'] ?? raw) as Map<String, dynamic>
          : raw as Map<String, dynamic>;
      state = const AsyncValue.data(null);
      return json;
    } on DioException catch (e) {
      final err = ApiException.fromDioError(e);
      state = AsyncValue.error(err, StackTrace.current);
      throw err;
    }
  }

  Future<List<String>> uploadListingPhotos(String listingId, List<String> filePaths) async {
    try {
      final formData = FormData();
      for (int i = 0; i < filePaths.length; i++) {
        formData.files.add(MapEntry(
          'photos',
          await MultipartFile.fromFile(filePaths[i], filename: 'listing_$i.jpg'),
        ));
      }
      final res = await ApiClient.instance.post(
          AppEndpoints.listingPhotos(listingId), data: formData);
      return (res.data['photos'] as List?)?.map((p) => p.toString()).toList() ?? [];
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}

final listingNotifierProvider =
    StateNotifierProvider<ListingNotifier, AsyncValue<void>>(
  (ref) => ListingNotifier(),
);

// ── Business listings provider ────────────────────────────────────────────────
final businessListingsProvider = FutureProvider.family<List<Map<String, dynamic>>, String>(
  (ref, businessId) async {
    final res = await ApiClient.instance.get(AppEndpoints.listingsByBusiness(businessId));
    final data = res.data;
    final List items;
    if (data is List) {
      items = data;
    } else if (data is Map && data['listings'] != null) {
      items = data['listings'] as List;
    } else if (data is Map && data['data'] != null) {
      items = data['data'] as List;
    } else {
      items = [];
    }
    return items.cast<Map<String, dynamic>>();
  },
);

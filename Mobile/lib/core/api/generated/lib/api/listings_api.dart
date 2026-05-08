//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class ListingsApi {
  ListingsApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Get all listings
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [String] category:
  ///   Filter by category
  Future<Response> listingsGetWithHttpInfo({ String? category, }) async {
    // ignore: prefer_const_declarations
    final path = r'/listings';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    if (category != null) {
      queryParams.addAll(_queryParams('', 'category', category));
    }

    const contentTypes = <String>[];


    return apiClient.invokeAPI(
      path,
      'GET',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Get all listings
  ///
  /// Parameters:
  ///
  /// * [String] category:
  ///   Filter by category
  Future<void> listingsGet({ String? category, }) async {
    final response = await listingsGetWithHttpInfo( category: category, );
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Create a new listing
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [ListingsPostRequest] listingsPostRequest (required):
  Future<Response> listingsPostWithHttpInfo(ListingsPostRequest listingsPostRequest,) async {
    // ignore: prefer_const_declarations
    final path = r'/listings';

    // ignore: prefer_final_locals
    Object? postBody = listingsPostRequest;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

    const contentTypes = <String>['application/json'];


    return apiClient.invokeAPI(
      path,
      'POST',
      queryParams,
      postBody,
      headerParams,
      formParams,
      contentTypes.isEmpty ? null : contentTypes.first,
    );
  }

  /// Create a new listing
  ///
  /// Parameters:
  ///
  /// * [ListingsPostRequest] listingsPostRequest (required):
  Future<void> listingsPost(ListingsPostRequest listingsPostRequest,) async {
    final response = await listingsPostWithHttpInfo(listingsPostRequest,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}

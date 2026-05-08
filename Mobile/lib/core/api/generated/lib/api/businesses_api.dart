//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class BusinessesApi {
  BusinessesApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Get all businesses
  ///
  /// Note: This method returns the HTTP [Response].
  Future<Response> businessesGetWithHttpInfo() async {
    // ignore: prefer_const_declarations
    final path = r'/businesses';

    // ignore: prefer_final_locals
    Object? postBody;

    final queryParams = <QueryParam>[];
    final headerParams = <String, String>{};
    final formParams = <String, String>{};

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

  /// Get all businesses
  Future<void> businessesGet() async {
    final response = await businessesGetWithHttpInfo();
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Create a new business
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [BusinessesPostRequest] businessesPostRequest (required):
  Future<Response> businessesPostWithHttpInfo(BusinessesPostRequest businessesPostRequest,) async {
    // ignore: prefer_const_declarations
    final path = r'/businesses';

    // ignore: prefer_final_locals
    Object? postBody = businessesPostRequest;

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

  /// Create a new business
  ///
  /// Parameters:
  ///
  /// * [BusinessesPostRequest] businessesPostRequest (required):
  Future<void> businessesPost(BusinessesPostRequest businessesPostRequest,) async {
    final response = await businessesPostWithHttpInfo(businessesPostRequest,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}

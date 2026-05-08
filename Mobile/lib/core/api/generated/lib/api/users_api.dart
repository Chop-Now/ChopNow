//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;


class UsersApi {
  UsersApi([ApiClient? apiClient]) : apiClient = apiClient ?? defaultApiClient;

  final ApiClient apiClient;

  /// Login a user
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [UsersLoginPostRequest] usersLoginPostRequest (required):
  Future<Response> usersLoginPostWithHttpInfo(UsersLoginPostRequest usersLoginPostRequest,) async {
    // ignore: prefer_const_declarations
    final path = r'/users/login';

    // ignore: prefer_final_locals
    Object? postBody = usersLoginPostRequest;

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

  /// Login a user
  ///
  /// Parameters:
  ///
  /// * [UsersLoginPostRequest] usersLoginPostRequest (required):
  Future<void> usersLoginPost(UsersLoginPostRequest usersLoginPostRequest,) async {
    final response = await usersLoginPostWithHttpInfo(usersLoginPostRequest,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }

  /// Register a new user
  ///
  /// Note: This method returns the HTTP [Response].
  ///
  /// Parameters:
  ///
  /// * [UsersRegisterPostRequest] usersRegisterPostRequest (required):
  Future<Response> usersRegisterPostWithHttpInfo(UsersRegisterPostRequest usersRegisterPostRequest,) async {
    // ignore: prefer_const_declarations
    final path = r'/users/register';

    // ignore: prefer_final_locals
    Object? postBody = usersRegisterPostRequest;

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

  /// Register a new user
  ///
  /// Parameters:
  ///
  /// * [UsersRegisterPostRequest] usersRegisterPostRequest (required):
  Future<void> usersRegisterPost(UsersRegisterPostRequest usersRegisterPostRequest,) async {
    final response = await usersRegisterPostWithHttpInfo(usersRegisterPostRequest,);
    if (response.statusCode >= HttpStatus.badRequest) {
      throw ApiException(response.statusCode, await _decodeBodyBytes(response));
    }
  }
}

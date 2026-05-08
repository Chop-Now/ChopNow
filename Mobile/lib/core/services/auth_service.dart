import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../utils/constants.dart';
// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;

class AuthService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
    webOptions: WebOptions(dbName: 'ChopNowAuth'),
  );

  static bool get _isWeb => kIsWeb;

  // ── Access Token ──
  static Future<void> saveAccessToken(String token) async {
    if (_isWeb) {
      html.window.localStorage[AppConstants.accessTokenKey] = token;
    }
    await _storage.write(key: AppConstants.accessTokenKey, value: token);
  }

  static Future<String?> getAccessToken() async {
    if (_isWeb) {
      return html.window.localStorage[AppConstants.accessTokenKey];
    }
    return _storage.read(key: AppConstants.accessTokenKey);
  }

  // ── Refresh Token ──
  static Future<void> saveRefreshToken(String token) async {
    if (_isWeb) {
      html.window.localStorage[AppConstants.refreshTokenKey] = token;
    }
    await _storage.write(key: AppConstants.refreshTokenKey, value: token);
  }

  static Future<String?> getRefreshToken() async {
    if (_isWeb) {
      return html.window.localStorage[AppConstants.refreshTokenKey];
    }
    return _storage.read(key: AppConstants.refreshTokenKey);
  }

  // ── User ID ──
  static Future<void> saveUserId(String userId) async {
    if (_isWeb) {
      html.window.localStorage[AppConstants.userIdKey] = userId;
    }
    await _storage.write(key: AppConstants.userIdKey, value: userId);
  }

  static Future<String?> getUserId() async {
    if (_isWeb) {
      return html.window.localStorage[AppConstants.userIdKey];
    }
    return _storage.read(key: AppConstants.userIdKey);
  }

  // ── Active Role ──
  static Future<void> saveActiveRole(String role) async {
    if (_isWeb) {
      html.window.localStorage[AppConstants.activeRoleKey] = role;
    }
    await _storage.write(key: AppConstants.activeRoleKey, value: role);
  }

  static Future<String?> getActiveRole() async {
    if (_isWeb) {
      return html.window.localStorage[AppConstants.activeRoleKey];
    }
    return _storage.read(key: AppConstants.activeRoleKey);
  }

  // ── Save all auth data at once ──
  static Future<void> saveAuthData({
    required String accessToken,
    String? refreshToken,
    required String userId,
    required String activeRole,
  }) async {
    await Future.wait([
      saveAccessToken(accessToken),
      if (refreshToken != null) saveRefreshToken(refreshToken),
      saveUserId(userId),
      saveActiveRole(activeRole),
    ]);
  }

  // ── Clear everything on logout ──
  static Future<void> clearAll() async {
    if (_isWeb) {
      html.window.localStorage.clear();
    }
    await _storage.deleteAll();
  }

  // ── Is there a stored token? ──
  static Future<bool> hasToken() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }
}

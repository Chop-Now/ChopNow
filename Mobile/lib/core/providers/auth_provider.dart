import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../api/api_exception.dart';
import '../services/auth_service.dart';
import '../services/socket_service.dart';
import '../services/notification_service.dart';
import '../models/user_model.dart';

// ── Auth States ───────────────────────────────────────────────────────────────
sealed class AuthState {
  const AuthState();
}

class AuthInitial extends AuthState {
  const AuthInitial();
}

class AuthLoading extends AuthState {
  const AuthLoading();
}

class AuthAuthenticated extends AuthState {
  final AppUser user;
  final String token;
  const AuthAuthenticated({required this.user, required this.token});
  String get activeRole => user.activeRole;
}

class AuthUnauthenticated extends AuthState {
  const AuthUnauthenticated();
}

class AuthError extends AuthState {
  final String message;
  const AuthError(this.message);
}

// ── Auth Notifier ─────────────────────────────────────────────────────────────
class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthInitial()) {
    _checkExistingAuth();
  }

  /// Clear error state (e.g., when user starts retyping)
  void clearError() {
    if (state is AuthError) {
      state = const AuthUnauthenticated();
    }
  }

  Future<void> _checkExistingAuth() async {
    if (!await AuthService.hasToken()) {
      state = const AuthUnauthenticated();
      return;
    }
    try {
      final response = await ApiClient.instance.get(AppEndpoints.profile);
      final user = AppUser.fromJson(_extractUser(response.data));
      final token = await AuthService.getAccessToken();
      state = AuthAuthenticated(user: user, token: token!);
      SocketService().connect(token);
    } catch (_) {
      await AuthService.clearAll();
      SocketService().disconnect();
      state = const AuthUnauthenticated();
    }
  }

  Future<void> login({
    required String email,
    required String password,
    String? preferredRole,
  }) async {
    state = const AuthLoading();
    try {
      final res = await ApiClient.instance.post(AppEndpoints.login,
          data: {'email': email, 'password': password});
      await _saveAndSetState(res.data, preferredRole: preferredRole);
    } on DioException catch (e) {
      state = AuthError(ApiException.fromDioError(e).message);
    } catch (e) {
      state = AuthError(e.toString());
    }
  }

  Future<void> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? phone,
  }) async {
    state = const AuthLoading();
    try {
      final res = await ApiClient.instance.post(AppEndpoints.register, data: {
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'password': password,
        if (phone != null && phone.isNotEmpty) 'phone': phone,
      });
      await _saveAndSetState(res.data);
    } on DioException catch (e) {
      state = AuthError(ApiException.fromDioError(e).message);
    } catch (e) {
      state = AuthError(e.toString());
    }
  }

  Future<void> registerAsBusinessOwner({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? phone,
  }) async {
    // 1. Register as consumer
    await register(
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        phone: phone);
    if (state is! AuthAuthenticated) return;
    // 2. Add business_owner role
    try {
      final res = await ApiClient.instance
          .post(AppEndpoints.addRole, data: {'role': 'business_owner'});
      final user = AppUser.fromJson(_extractUser(res.data));
      final current = state as AuthAuthenticated;
      state = AuthAuthenticated(user: user, token: current.token);
      await AuthService.saveActiveRole('business_owner');
    } catch (e) {
      debugPrint('Failed to add business_owner role: $e');
    }
  }

  Future<void> loginWithOtp({
    required String phone,
    required String otp,
    String? preferredRole,
  }) async {
    state = const AuthLoading();
    try {
      final res = await ApiClient.instance
          .post(AppEndpoints.verifyOtp, data: {'phone': phone, 'otp': otp});
      await _saveAndSetState(res.data, preferredRole: preferredRole);
    } on DioException catch (e) {
      state = AuthError(ApiException.fromDioError(e).message);
    } catch (e) {
      state = AuthError(e.toString());
    }
  }

  Future<void> switchRole(String newRole) async {
    if (state is! AuthAuthenticated) return;
    try {
      await ApiClient.instance
          .post(AppEndpoints.switchRole, data: {'role': newRole});
      await AuthService.saveActiveRole(newRole);
      final current = state as AuthAuthenticated;
      final updatedUser = AppUser.fromJson({
        ...current.user.toJson(),
        '_id': current.user.id,
        'firstName': current.user.firstName,
        'lastName': current.user.lastName,
        'email': current.user.email,
        'phone': current.user.phone,
        'avatar': current.user.avatar,
        'roles': current.user.roles,
        'activeRole': newRole,
        'addresses': current.user.addresses.map((a) => a.toJson()).toList(),
        'isEmailVerified': current.user.isEmailVerified,
      });
      state = AuthAuthenticated(user: updatedUser, token: current.token);
    } catch (e) {
      debugPrint('Failed to switch role: $e');
      rethrow;
    }
  }

  Future<void> addBusinessOwnerRole() async {
    if (state is! AuthAuthenticated) return;
    try {
      final res = await ApiClient.instance
          .post(AppEndpoints.addRole, data: {'role': 'business_owner'});
      final user = AppUser.fromJson(_extractUser(res.data));
      final current = state as AuthAuthenticated;
      state = AuthAuthenticated(user: user, token: current.token);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> addRiderRole() async {
    if (state is! AuthAuthenticated) return;
    try {
      final res = await ApiClient.instance.post(AppEndpoints.addRole,
          data: {'role': 'rider', 'switchToNew': true});
      final user = AppUser.fromJson(_extractUser(res.data));
      final current = state as AuthAuthenticated;

      // Update local storage active role
      await AuthService.saveActiveRole('rider');

      state = AuthAuthenticated(user: user, token: current.token);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> updateProfile({
    required String firstName,
    required String lastName,
    String? phone,
  }) async {
    if (state is! AuthAuthenticated) return;
    try {
      final res = await ApiClient.instance.put(AppEndpoints.profile, data: {
        'firstName': firstName,
        'lastName': lastName,
        if (phone != null) 'phone': phone,
      });
      final user = AppUser.fromJson(_extractUser(res.data));
      final current = state as AuthAuthenticated;
      state = AuthAuthenticated(user: user, token: current.token);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<String> uploadAvatar(String filePath) async {
    try {
      final formData = FormData.fromMap({
        'avatar':
            await MultipartFile.fromFile(filePath, filename: 'avatar.jpg'),
      });
      final res =
          await ApiClient.instance.post(AppEndpoints.avatar, data: formData);
      final url = res.data['avatar'] ?? res.data['url'] ?? '';
      // Refresh profile
      await _refreshProfile();
      return url.toString();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> addAddress(Map<String, dynamic> addressData) async {
    try {
      final res = await ApiClient.instance
          .post(AppEndpoints.addresses, data: addressData);
      final user = AppUser.fromJson(_extractUser(res.data));
      final current = state as AuthAuthenticated;
      state = AuthAuthenticated(user: user, token: current.token);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> updateAddress(
      String addressId, Map<String, dynamic> data) async {
    try {
      final res = await ApiClient.instance
          .put(AppEndpoints.address(addressId), data: data);
      final user = AppUser.fromJson(_extractUser(res.data));
      final current = state as AuthAuthenticated;
      state = AuthAuthenticated(user: user, token: current.token);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> deleteAddress(String addressId) async {
    try {
      final res =
          await ApiClient.instance.delete(AppEndpoints.address(addressId));
      final user = AppUser.fromJson(_extractUser(res.data));
      final current = state as AuthAuthenticated;
      state = AuthAuthenticated(user: user, token: current.token);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> logout() async {
    await NotificationService.instance.unregisterToken();
    await AuthService.clearAll();
    SocketService().disconnect();
    state = const AuthUnauthenticated();
  }

  Future<void> refreshProfile() => _refreshProfile();

  Future<void> _refreshProfile() async {
    try {
      final res = await ApiClient.instance.get(AppEndpoints.profile);
      final user = AppUser.fromJson(_extractUser(res.data));
      if (state is! AuthAuthenticated) return;
      final current = state as AuthAuthenticated;
      state = AuthAuthenticated(user: user, token: current.token);
    } catch (e) {
      debugPrint('Failed to refresh profile: $e');
    }
  }

  Future<void> _saveAndSetState(
    dynamic responseData, {
    String? preferredRole,
  }) async {
    final token = responseData['token'] as String?;
    final refreshToken = responseData['refreshToken'] as String?;
    AppUser user = AppUser.fromJson(_extractUser(responseData));

    if (token != null) {
      await AuthService.saveAuthData(
        accessToken: token,
        refreshToken: refreshToken ?? '',
        userId: user.id,
        activeRole: user.activeRole,
      );
    }

    // If caller requested a specific role, switch to it when the user holds that
    // role but it isn't already the active role.
    if (preferredRole != null &&
        preferredRole.isNotEmpty &&
        user.activeRole != preferredRole &&
        user.roles.contains(preferredRole)) {
      try {
        final switchRes = await ApiClient.instance
            .post(AppEndpoints.switchRole, data: {'role': preferredRole});
        // Backend returns updated user on switch-role
        final switchedUser = AppUser.fromJson(_extractUser(switchRes.data));
        await AuthService.saveActiveRole(preferredRole);
        user = switchedUser;
      } catch (_) {
        // If switch fails silently, continue with original role
      }
    }

    state = AuthAuthenticated(user: user, token: token ?? '');
    if (token != null && token.isNotEmpty) {
      SocketService().connect(token);
      // Register FCM token with backend so server can push to this device
      NotificationService.instance.registerToken();
    }
  }

  Map<String, dynamic> _extractUser(dynamic data) {
    if (data is Map<String, dynamic>) {
      return (data['user'] ?? data['data'] ?? data) as Map<String, dynamic>;
    }
    return {};
  }
}

// ── Providers ─────────────────────────────────────────────────────────────────
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});

final isAuthenticatedProvider =
    Provider<bool>((ref) => ref.watch(authProvider) is AuthAuthenticated);

final currentUserProvider = Provider<AppUser?>((ref) {
  final auth = ref.watch(authProvider);
  return auth is AuthAuthenticated ? auth.user : null;
});

final activeRoleProvider = Provider<String>((ref) {
  final auth = ref.watch(authProvider);
  return auth is AuthAuthenticated ? auth.activeRole : 'consumer';
});

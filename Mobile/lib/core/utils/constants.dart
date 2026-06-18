class AppConstants {
  AppConstants._();

  // API base URL — update this to your deployed backend URL
  // Development: http://10.0.2.2:5000  (Android emulator localhost)
  // Production:  https://api.chopnow.app
  // Production backend on Render (shared MongoDB Atlas DB with the web app)
  static const String apiBaseUrl = String.fromEnvironment('API_BASE_URL',
      defaultValue: 'http://10.0.2.2:5000/api/v1');

  static const String socketUrl = String.fromEnvironment('SOCKET_URL',
      defaultValue: 'http://10.0.2.2:5000');

  // Token keys for secure storage
  static const String accessTokenKey = 'chopnow_access_token';
  static const String refreshTokenKey = 'chopnow_refresh_token';
  static const String userIdKey = 'chopnow_user_id';
  static const String activeRoleKey = 'chopnow_active_role';

  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // Pagination
  static const int pageSize = 20;

  // Map defaults (Kigali, Rwanda)
  static const double defaultLat = -1.9441;
  static const double defaultLng = 30.0619;
  static const double defaultSearchRadius = 5.0; // km

  // OTP
  static const int otpResendSeconds = 60;
  static const int otpLength = 6;

  // Upload limits
  static const int maxImageSizeBytes = 5 * 1024 * 1024; // 5MB

  // Currency
  static const String currency = 'RWF';

  // Onboarding
  static const String onboardingCompletedKey = 'chopnow_onboarding_done';
}

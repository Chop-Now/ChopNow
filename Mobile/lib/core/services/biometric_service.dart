import 'package:flutter/material.dart';
import 'package:local_auth/local_auth.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// BiometricService — provides Face ID / Fingerprint authentication
/// for returning users. Works on both iOS and Android.
class BiometricService {
  static final _auth = LocalAuthentication();
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );

  static const _biometricEnabledKey = 'chopnow_biometric_enabled';

  // ── Capability checks ────────────────────────────────────────────────────────
  static Future<bool> get isAvailable async {
    try {
      return await _auth.canCheckBiometrics || await _auth.isDeviceSupported();
    } catch (_) {
      return false;
    }
  }

  static Future<List<BiometricType>> get availableTypes async {
    try {
      return await _auth.getAvailableBiometrics();
    } catch (_) {
      return [];
    }
  }

  static Future<bool> get hasFaceId async {
    final types = await availableTypes;
    return types.contains(BiometricType.face) ||
        types.contains(BiometricType.strong);
  }

  // ── Preference ───────────────────────────────────────────────────────────────
  static Future<bool> get isEnabled async {
    final val = await _storage.read(key: _biometricEnabledKey);
    return val == 'true';
  }

  static Future<void> setEnabled(bool enabled) async {
    await _storage.write(
        key: _biometricEnabledKey, value: enabled ? 'true' : 'false');
    if (!enabled) {
      await clearCredentials();
    }
  }

  // ── Credentials Storage ──────────────────────────────────────────────────────
  static const _biometricEmailKey = 'chopnow_biometric_email';
  static const _biometricPasswordKey = 'chopnow_biometric_password';

  static Future<void> saveCredentials(String email, String password) async {
    await Future.wait([
      _storage.write(key: _biometricEmailKey, value: email),
      _storage.write(key: _biometricPasswordKey, value: password),
    ]);
  }

  static Future<Map<String, String>?> getCredentials() async {
    final email = await _storage.read(key: _biometricEmailKey);
    final password = await _storage.read(key: _biometricPasswordKey);
    if (email != null && password != null) {
      return {'email': email, 'password': password};
    }
    return null;
  }

  static Future<void> clearCredentials() async {
    await Future.wait([
      _storage.delete(key: _biometricEmailKey),
      _storage.delete(key: _biometricPasswordKey),
    ]);
  }

  // ── Authentication ───────────────────────────────────────────────────────────
  /// Returns true if biometric auth succeeded.
  static Future<bool> authenticate(
      {String reason = 'Authenticate to sign in to ChopNow'}) async {
    try {
      return await _auth.authenticate(
        localizedReason: reason,
        biometricOnly: false, // allow PIN as fallback
        persistAcrossBackgrounding: true, // don't cancel if app goes background
      );
    } catch (e) {
      return false;
    }
  }

  // ── Icon helper ──────────────────────────────────────────────────────────────
  static Future<IconData> get biometricIcon async {
    final types = await availableTypes;
    if (types.contains(BiometricType.face)) return Icons.face_rounded;
    if (types.contains(BiometricType.fingerprint)) return Icons.fingerprint_rounded;
    return Icons.vpn_key_rounded;
  }

  static Future<String> get biometricLabel async {
    final types = await availableTypes;
    if (types.contains(BiometricType.face)) return 'Face ID';
    if (types.contains(BiometricType.fingerprint)) return 'Fingerprint';
    return 'Biometrics';
  }
}

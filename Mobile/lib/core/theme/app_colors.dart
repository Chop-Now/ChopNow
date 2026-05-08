import 'package:flutter/material.dart';
import 'tokens.dart';

class AppColors {
  AppColors._();

  // ── Brand Primary: Chowdeck Forest Green ──
  static const Color primary = AppTokens.primary;
  static const Color primaryDark = AppTokens.primaryDark;
  static const Color primaryLight = Color(0xFF13775B);
  static const Color primarySurface = Color(0xFFE6F3EE); // subtle green tint

  // ── Brand Accent: Chowdeck Cream / Orange ──
  static const Color accent = AppTokens.accent;
  static const Color accentDark = Color(0xFFE67E22);
  static const Color accentLight = Color(0xFFFFB266);
  static const Color accentSurface = Color(0xFFFFFDF5); // Cream tint

  // ── Backgrounds ──
  static const Color background = AppTokens.background;
  static const Color surface = AppTokens.surface;
  static const Color surfaceVariant = Color(0xFFE8F8EE);

  // ── Dark Theme (Deep premium greens) ──
  static const Color darkBackground = Color(0xFF0A1410);
  static const Color darkSurface = Color(0xFF111F18);
  static const Color darkSurfaceVariant = Color(0xFF1D3327);
  static const Color darkBorder = Color(0xFF264233);

  // ── Borders ──
  static const Color border = Color(0xFFDDF3E6);
  static const Color borderFocus = Color(0xFF00A86B);

  // ── Text ──
  static const Color textPrimary = AppTokens.textPrimary;
  static const Color textSecondary = AppTokens.textSecondary;
  static const Color textTertiary = AppTokens.textTertiary;
  static const Color textOnPrimary = Color(0xFFFFFFFF);
  static const Color textOnAccent = Color(0xFFFFFFFF);

  // ── Semantic ──
  static const Color success = Color(0xFF00A86B);
  static const Color successSurface = Color(0xFFE8FDF3);
  static const Color warning = Color(0xFFFFB020);
  static const Color warningSurface = Color(0xFFFFF9E8);
  static const Color error = Color(0xFFEE2B4B);
  static const Color errorSurface = Color(0xFFFDEDF0);
  static const Color info = Color(0xFF2081E2);

  // ── Impact Colors ──
  static const Color co2Green = Color(0xFF059669);
  static const Color mealOrange = Color(0xFFFF7A00);
  static const Color savingsGold = Color(0xFFF59E0B);

  // ── Status Pills ──
  static const Color statusPending = Color(0xFFFFB020);
  static const Color statusActive = Color(0xFF00A86B);
  static const Color statusCancelled = Color(0xFFEE2B4B);
  static const Color statusCompleted = Color(0xFF2081E2);

  // ── Gradient Definitions ──
  /// The signature 3-stop rich premium gradient for main CTAs
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF33FFA6), Color(0xFF00A86B), Color(0xFF007A4B)],
    stops: [0.0, 0.5, 1.0],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Dynamic horizontal gradient for badges and highlights
  static const LinearGradient primaryGradientHorz = LinearGradient(
    colors: [Color(0xFF00C97F), Color(0xFF00A86B)],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const LinearGradient accentGradient = LinearGradient(
    colors: [Color(0xFFFF9B3D), Color(0xFFFF7A00), Color(0xFFE56E00)],
    stops: [0.0, 0.5, 1.0],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFF00A86B), Color(0xFF005936)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient impactGradient = LinearGradient(
    colors: [Color(0xFF00A86B), Color(0xFF0CA494)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // ── Overlay ──
  static const Color overlayLight = Color(0x33000000); // 20%
  static const Color overlayDark = Color(0x99000000);  // 60%
  static const Color shimmerBase = Color(0xFFF1F5F3);
  static const Color shimmerHighlight = Color(0xFFFFFFFF);
}

import 'package:flutter/material.dart';
import 'tokens.dart';

class AppColors {
  AppColors._();

  // ── Brand Primary: ChopNow Orange/Brown ──
  static const Color primary = AppTokens.primary;
  static const Color primaryDark = AppTokens.primaryDark;
  static const Color primaryLight = Color(0xFFFFB77D); // inverse-primary
  static const Color primarySurface = AppTokens.primaryContainer; // vibrant orange
  static const Color primaryContainer = AppTokens.primaryContainer;
  static const Color onPrimaryContainer = Color(0xFF663500);

  // ── Brand Accent: ChopNow Green ──
  static const Color accent = AppTokens.secondary; // green
  static const Color secondary = AppTokens.secondary; // green alias
  static const Color accentDark = Color(0xFF005232);
  static const Color accentLight = Color(0xFF75F8B3);
  static const Color accentSurface = Color(0xFFE6F6F0); // forest-light

  // ── Backgrounds ──
  static const Color background = AppTokens.background;
  static const Color surface = AppTokens.surface;
  static const Color surfaceVariant = Color(0xFFF8F9FF);
  static const Color surfaceIvory = Color(0xFFF7FDF9);

  // ── Dark Theme (Deep premium) ──
  static const Color darkBackground = Color(0xFF121C2A);
  static const Color darkSurface = Color(0xFF27313F);
  static const Color darkSurfaceVariant = Color(0xFF544438);
  static const Color darkBorder = Color(0xFF867366);

  // ── Borders ──
  static const Color border = Color(0xFFD9C2B3); // outline-variant
  static const Color borderFocus = Color(0xFF904D00);

  // ── Text ──
  static const Color textPrimary = AppTokens.textPrimary;
  static const Color textSecondary = AppTokens.textSecondary;
  static const Color textTertiary = AppTokens.textTertiary;
  static const Color textOnPrimary = Color(0xFFFFFFFF);
  static const Color textOnAccent = Color(0xFFFFFFFF);

  // ── Semantic ──
  static const Color success = AppTokens.success;
  static const Color successSurface = Color(0xFFE6F6F0);
  static const Color warning = AppTokens.warning;
  static const Color warningSurface = Color(0xFFFEF3E7); // amber-muted
  static const Color error = AppTokens.error;
  static const Color errorSurface = Color(0xFFFFDAD6);
  static const Color info = Color(0xFF34BDD7); // tertiary-container

  // ── Impact Colors ──
  static const Color co2Green = Color(0xFF006D43);
  static const Color mealOrange = Color(0xFF904D00);
  static const Color savingsGold = Color(0xFFF2994A);

  // ── Status Pills ──
  static const Color statusPending = Color(0xFFF2994A);
  static const Color statusActive = Color(0xFF006D43);
  static const Color statusCancelled = Color(0xFFBA1A1A);
  static const Color statusCompleted = Color(0xFF34BDD7);

  // ── Gradient Definitions ──
  /// The signature 3-stop rich premium gradient for main CTAs
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFFFFB77D), Color(0xFFF2994A), Color(0xFF904D00)],
    stops: [0.0, 0.5, 1.0],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Dynamic horizontal gradient for badges and highlights
  static const LinearGradient primaryGradientHorz = LinearGradient(
    colors: [Color(0xFFF2994A), Color(0xFF904D00)],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const LinearGradient accentGradient = LinearGradient(
    colors: [Color(0xFF75F8B3), Color(0xFF006D43), Color(0xFF005232)],
    stops: [0.0, 0.5, 1.0],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient heroGradient = LinearGradient(
    colors: [Color(0xFFF2994A), Color(0xFF904D00)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient impactGradient = LinearGradient(
    colors: [Color(0xFF006D43), Color(0xFF34BDD7)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // ── Overlay ──
  static const Color overlayLight = Color(0x33000000); // 20%
  static const Color overlayDark = Color(0x99000000);  // 60%
  static const Color shimmerBase = Color(0xFFFEF3E7);
  static const Color shimmerHighlight = Color(0xFFFFFFFF);
}

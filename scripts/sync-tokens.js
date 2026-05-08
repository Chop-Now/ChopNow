const fs = require('fs');
const path = require('path');
const tokens = require('../shared/design-tokens.json');

const flutterOutputPath = path.join(__dirname, '../Mobile/lib/core/theme/tokens.dart');

function hexToFlutter(hex) {
  return '0xFF' + hex.replace('#', '').toUpperCase();
}

const dartContent = `// ⚠️ GENERATED CODE - DO NOT MODIFY BY HAND
// Sync via: node scripts/sync-tokens.js

import 'package:flutter/material.dart';

class AppTokens {
  AppTokens._();

  // Colors
  static const Color primary = Color(${hexToFlutter(tokens.colors.primary)});
  static const Color primaryDark = Color(${hexToFlutter(tokens.colors.primaryDark)});
  static const Color secondary = Color(${hexToFlutter(tokens.colors.secondary)});
  static const Color accent = Color(${hexToFlutter(tokens.colors.accent)});
  static const Color background = Color(${hexToFlutter(tokens.colors.background)});
  static const Color surface = Color(${hexToFlutter(tokens.colors.surface)});
  static const Color error = Color(${hexToFlutter(tokens.colors.error)});
  static const Color success = Color(${hexToFlutter(tokens.colors.success)});
  static const Color warning = Color(${hexToFlutter(tokens.colors.warning)});
  
  static const Color textPrimary = Color(${hexToFlutter(tokens.colors.text.primary)});
  static const Color textSecondary = Color(${hexToFlutter(tokens.colors.text.secondary)});
  static const Color textTertiary = Color(${hexToFlutter(tokens.colors.text.tertiary)});

  // Spacing
  static const double spacingXs = ${tokens.spacing.xs};
  static const double spacingSm = ${tokens.spacing.sm};
  static const double spacingMd = ${tokens.spacing.md};
  static const double spacingLg = ${tokens.spacing.lg};
  static const double spacingXl = ${tokens.spacing.xl};
  static const double spacingXxl = ${tokens.spacing.xxl};

  // Border Radius
  static const double radiusSm = ${tokens.borderRadius.sm};
  static const double radiusMd = ${tokens.borderRadius.md};
  static const double radiusLg = ${tokens.borderRadius.lg};
  static const double radiusXl = ${tokens.borderRadius.xl};

  // Typography
  static const double fontXs = ${tokens.typography.sizes.xs};
  static const double fontSm = ${tokens.typography.sizes.sm};
  static const double fontBase = ${tokens.typography.sizes.base};
  static const double fontLg = ${tokens.typography.sizes.lg};
  static const double fontXl = ${tokens.typography.sizes.xl};
  static const double fontXxl = ${tokens.typography.sizes.xxl};
  static const double fontHuge = ${tokens.typography.sizes.huge};
}
`;

fs.writeFileSync(flutterOutputPath, dartContent);
console.log(`✅ Flutter tokens generated at ${flutterOutputPath}`);

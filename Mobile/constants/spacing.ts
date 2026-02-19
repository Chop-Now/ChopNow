// 8pt grid system — industry standard for pixel-perfect layouts
// Minimum touch target: 44pt (Apple HIG) / 48dp (Material Design)
export const Spacing = {
  0:   0,
  1:   4,
  2:   8,
  3:   12,
  4:   16,
  5:   20,
  6:   24,
  7:   28,
  8:   32,
  10:  40,
  12:  48,
  16:  64,
  20:  80,
  // Touch targets
  touchMin:    44,  // Apple HIG minimum
  touchComfort:48,  // Comfortable touch target
  // Layout
  screenPaddingH: 16,
  screenPaddingV: 20,
  cardPadding:    16,
  sectionGap:     24,
} as const;

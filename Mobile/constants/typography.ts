// Type scale based on Apple HIG & Material Design 3
// Minimum 16sp body text for readability (WCAG 1.4.4)
export const Typography = {
  // Font families
  family: {
    regular:  'Inter_400Regular',
    medium:   'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold:     'Inter_700Bold',
  },
  // Size scale (sp)
  size: {
    xs:   11,
    sm:   13,
    base: 15,
    md:   16,
    lg:   18,
    xl:   20,
    '2xl':24,
    '3xl':28,
    '4xl':32,
    '5xl':40,
  },
  // Line heights
  lineHeight: {
    tight:  1.2,
    normal: 1.5,
    relaxed:1.75,
  },
  // Letter spacing
  tracking: {
    tight: -0.5,
    normal: 0,
    wide:   0.5,
    wider:  1,
  },
} as const;

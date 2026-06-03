import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../core/services/auth_service.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/animations/scale_tap.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _ctrl = PageController();
  int _page = 0;

  static const _slides = [
    _OnboardingSlide(
      emoji: '🥡',
      title: 'Rescue Surplus\nMeals Near You',
      subtitle:
          'Discover fresh surplus food from restaurants, bakeries & grocers — up to 70% off. Elevate taste, reduce waste.',
      gradientColors: [Color(0xFF00A86B), Color(0xFF00C97F)],
      accentColor: Color(0xFFE8F8F1),
    ),
    _OnboardingSlide(
      emoji: '📱',
      title: 'Pay Your Way,\nAnywhere in Africa',
      subtitle:
          'M-Pesa, Airtel Money, MTN MoMo, card or cash — flexible payments built for how Africa pays.',
      gradientColors: [Color(0xFFFF7A00), Color(0xFFFFB366)],
      accentColor: Color(0xFFFFF3E8),
    ),
    _OnboardingSlide(
      emoji: '🌍',
      title: 'Track Your\nPlanet Impact',
      subtitle:
          'Every rescue earns you a sustainability score. See the meals, CO₂, and money you save in real time.',
      gradientColors: [Color(0xFF00897B), Color(0xFF00A86B)],
      accentColor: Color(0xFFE0F4F2),
    ),
  ];

  bool get _isLast => _page == _slides.length - 1;

  Future<void> _complete() async {
    await AuthService.setOnboardingCompleted();
    if (mounted) context.go('/auth/login');
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
      ),
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: Column(
            children: [
              // Skip button
              Align(
                alignment: Alignment.topRight,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(0, 12, 20, 0),
                  child: ScaleTap(
                    onTap: _complete,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 7),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceVariant,
                        borderRadius: BorderRadius.circular(100),
                      ),
                      child: const Text(
                        'Skip',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ),
                ),
              ),

              // Page view
              Expanded(
                child: PageView.builder(
                  controller: _ctrl,
                  onPageChanged: (i) => setState(() => _page = i),
                  itemCount: _slides.length,
                  itemBuilder: (_, i) => _SlideWidget(slide: _slides[i]),
                ),
              ),

              // Indicator + CTA
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
                child: Column(
                  children: [
                    // Dots
                    SmoothPageIndicator(
                      controller: _ctrl,
                      count: _slides.length,
                      effect: const ExpandingDotsEffect(
                        activeDotColor: AppColors.primary,
                        dotColor: AppColors.border,
                        dotHeight: 8,
                        dotWidth: 8,
                        expansionFactor: 3,
                        spacing: 6,
                      ),
                    ),
                    const SizedBox(height: 28),
                    // CTA
                    _isLast
                        ? CnPrimaryButton(
                            label: 'Get Started 🚀',
                            onTap: _complete,
                          )
                        : Row(
                            children: [
                              Expanded(
                                child: CnSecondaryButton(
                                  label: 'Previous',
                                  onTap: _page == 0
                                      ? null
                                      : () => _ctrl.previousPage(
                                            duration: const Duration(
                                                milliseconds: 350),
                                            curve: Curves.easeOut,
                                          ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: CnPrimaryButton(
                                  label: 'Next',
                                  onTap: () => _ctrl.nextPage(
                                    duration: const Duration(milliseconds: 350),
                                    curve: Curves.easeOut,
                                  ),
                                ),
                              ),
                            ],
                          ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SlideWidget extends StatelessWidget {
  final _OnboardingSlide slide;
  const _SlideWidget({required this.slide});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Gradient circle with emoji
          Container(
            width: 160,
            height: 160,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: slide.gradientColors,
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: slide.gradientColors.first.withValues(alpha: 0.35),
                  blurRadius: 40,
                  offset: const Offset(0, 16),
                ),
              ],
            ),
            child: Center(
              child: Text(slide.emoji, style: const TextStyle(fontSize: 64)),
            ),
          ),
          const SizedBox(height: 40),
          Text(
            slide.title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
              height: 1.3,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 14),
          Text(
            slide.subtitle,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
              height: 1.65,
              fontWeight: FontWeight.w400,
            ),
          ),
        ],
      ),
    );
  }
}

class _OnboardingSlide {
  final String emoji;
  final String title;
  final String subtitle;
  final List<Color> gradientColors;
  final Color accentColor;

  const _OnboardingSlide({
    required this.emoji,
    required this.title,
    required this.subtitle,
    required this.gradientColors,
    required this.accentColor,
  });
}

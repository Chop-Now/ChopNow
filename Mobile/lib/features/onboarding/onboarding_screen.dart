import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:go_router/go_router.dart';
import '../../core/services/auth_service.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/animations/scale_tap.dart';

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
      image: 'assets/images/food.png',
      icon: Icons.restaurant_menu_rounded,
      eyebrow: 'RESCUE',
      title: 'Surplus meals,\nright near you',
      subtitle:
          'Fresh food from restaurants, bakeries and grocers — up to 70% off, before it goes to waste.',
      panel: AppColors.moringa,
      accent: AppColors.nowYellow,
    ),
    _OnboardingSlide(
      image: 'assets/images/grocery.png',
      icon: Icons.smartphone_rounded,
      eyebrow: 'PAY YOUR WAY',
      title: 'Built for how\nAfrica pays',
      subtitle:
          'MTN MoMo, Airtel Money, card or cash. Pick up your order with a code — no card details ever stored.',
      panel: AppColors.pepper,
      accent: AppColors.fufu,
    ),
    _OnboardingSlide(
      image: 'assets/images/salads.png',
      icon: Icons.eco_rounded,
      eyebrow: 'YOUR IMPACT',
      title: 'Watch the\nwaste drop',
      subtitle:
          'Every rescue is counted. See the meals saved, CO₂ avoided and money kept in your pocket.',
      panel: AppColors.nowYellow,
      accent: AppColors.moringa,
    ),
  ];

  bool get _isLast => _page == _slides.length - 1;

  Future<void> _complete() async {
    await AuthService.setOnboardingCompleted();
    if (mounted) context.go('/auth/login');
  }

  void _next() {
    if (_isLast) {
      _complete();
    } else {
      _ctrl.nextPage(
        duration: const Duration(milliseconds: 380),
        curve: Curves.easeOutCubic,
      );
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final slide = _slides[_page];
    // The top panel is a brand colour, so the status bar icons have to flip
    // with it — Now Yellow needs dark icons, Moringa/Pepper need light ones.
    final lightStatusIcons = slide.panel != AppColors.nowYellow;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        // Android
        statusBarIconBrightness:
            lightStatusIcons ? Brightness.light : Brightness.dark,
        // iOS takes the inverse: it describes the bar's backdrop, not the icons
        statusBarBrightness:
            lightStatusIcons ? Brightness.dark : Brightness.light,
      ),
      child: Scaffold(
        backgroundColor: AppColors.surface,
        body: Column(
          children: [
            // ── Coloured hero panel ──
            Expanded(
              flex: 62,
              child: Stack(
                children: [
                  PageView.builder(
                    controller: _ctrl,
                    onPageChanged: (i) => setState(() => _page = i),
                    itemCount: _slides.length,
                    itemBuilder: (_, i) => _HeroPanel(slide: _slides[i]),
                  ),

                  // Wordmark + Skip, floating over the panel
                  SafeArea(
                    bottom: false,
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(24, 8, 16, 0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          SvgPicture.asset(
                            slide.panel == AppColors.nowYellow
                                ? 'assets/images/wordmarklogo.svg'
                                : 'assets/images/wordmarkwithlogomark.svg',
                            height: 26,
                            semanticsLabel: 'ChopNow',
                          ),
                          ScaleTap(
                            onTap: _complete,
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 6),
                              child: Text(
                                'Skip',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: slide.accent,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // ── Copy + controls on the light sheet ──
            Expanded(
              flex: 38,
              child: SafeArea(
                top: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(28, 28, 28, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      SmoothPageIndicator(
                        controller: _ctrl,
                        count: _slides.length,
                        effect: const ExpandingDotsEffect(
                          activeDotColor: AppColors.moringa,
                          dotColor: AppColors.border,
                          dotHeight: 7,
                          dotWidth: 7,
                          expansionFactor: 3.5,
                          spacing: 5,
                        ),
                      ),
                      const SizedBox(height: 20),
                      Expanded(
                        child: AnimatedSwitcher(
                          duration: const Duration(milliseconds: 260),
                          child: Column(
                            key: ValueKey(_page),
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                slide.title.replaceAll('\n', ' '),
                                style: const TextStyle(
                                  fontSize: 27,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.textPrimary,
                                  height: 1.2,
                                  letterSpacing: -0.5,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Text(
                                slide.subtitle,
                                style: const TextStyle(
                                  fontSize: 14.5,
                                  color: AppColors.textSecondary,
                                  height: 1.55,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      // Back / Next
                      Row(
                        children: [
                          AnimatedOpacity(
                            duration: const Duration(milliseconds: 200),
                            opacity: _page == 0 ? 0 : 1,
                            child: IgnorePointer(
                              ignoring: _page == 0,
                              child: ScaleTap(
                                onTap: () => _ctrl.previousPage(
                                  duration: const Duration(milliseconds: 380),
                                  curve: Curves.easeOutCubic,
                                ),
                                child: Container(
                                  width: 56,
                                  height: 56,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                        color: AppColors.border, width: 1.5),
                                  ),
                                  child: const Icon(Icons.arrow_back_rounded,
                                      color: AppColors.textSecondary, size: 20),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: ScaleTap(
                              onTap: _next,
                              child: Container(
                                height: 56,
                                decoration: BoxDecoration(
                                  // Now Yellow CTA, Char label — never white.
                                  color: AppColors.nowYellow,
                                  borderRadius: BorderRadius.circular(28),
                                  boxShadow: [
                                    BoxShadow(
                                      color: AppColors.nowYellow
                                          .withValues(alpha: 0.4),
                                      blurRadius: 20,
                                      offset: const Offset(0, 8),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      _isLast ? 'Get started' : 'Next',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.textOnAccent,
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    const Icon(Icons.arrow_forward_rounded,
                                        size: 19,
                                        color: AppColors.textOnAccent),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// The full-bleed coloured panel: brand ground, product photo, floating chip.
class _HeroPanel extends StatelessWidget {
  final _OnboardingSlide slide;
  const _HeroPanel({required this.slide});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: slide.panel,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(36),
          bottomRight: Radius.circular(36),
        ),
      ),
      child: ClipRRect(
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(36),
          bottomRight: Radius.circular(36),
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Depth wash
            Positioned(
              top: -70,
              left: -50,
              child: Container(
                width: 240,
                height: 240,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      slide.accent.withValues(alpha: 0.22),
                      slide.accent.withValues(alpha: 0),
                    ],
                  ),
                ),
              ),
            ),

            // Product image on a soft disc
            Padding(
              padding: const EdgeInsets.only(top: 26),
              child: Container(
                width: 236,
                height: 236,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: slide.accent.withValues(alpha: 0.14),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(26),
                  child: Image.asset(
                    slide.image,
                    fit: BoxFit.contain,
                    errorBuilder: (_, __, ___) => Icon(
                      slide.icon,
                      size: 96,
                      color: slide.accent,
                    ),
                  ),
                ),
              ),
            ),

            // Eyebrow chip
            Positioned(
              bottom: 30,
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: slide.accent,
                  borderRadius: BorderRadius.circular(100),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(slide.icon, size: 14, color: slide.panel),
                    const SizedBox(width: 7),
                    Text(
                      slide.eyebrow,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.1,
                        color: slide.panel,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OnboardingSlide {
  final String image;
  final IconData icon;
  final String eyebrow;
  final String title;
  final String subtitle;

  /// Panel background — always a brand colour.
  final Color panel;

  /// Foreground used on the panel. Chosen per slide so it stays legible:
  /// the chip puts [panel] text on [accent], so the pair must be a
  /// high-contrast brand combination.
  final Color accent;

  const _OnboardingSlide({
    required this.image,
    required this.icon,
    required this.eyebrow,
    required this.title,
    required this.subtitle,
    required this.panel,
    required this.accent,
  });
}

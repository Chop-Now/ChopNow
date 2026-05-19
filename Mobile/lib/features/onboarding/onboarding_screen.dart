import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/constants.dart';
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
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnjv16YimQEUkNprr0OnDTToagmsgid6672_5L20wTjl6AyEfkJ81-2J_PQPCHETn4Ndi-3b6kV_cpF05XK093JGrH0VmXnLJiPu1kCUWBHZ9wba3ANB8SmRWAENonJaon57E-b132GF6sLk8YxLlr8F_1AWno1AfdJWoHfM_cSnJj0hAmj9YNE-1wJ0t_3vW_NrlwLmJ0QOLhxOkX0s65CCrjMa_nLnQIzL_4RsRobOV3Sooy44kA4Sq0iVAElissz-9d0gyA7jb7',
      title: 'Save Money on Meals',
      subtitle: 'Discover surplus meals from your favorite local spots at unbeatable prices.',
    ),
    _OnboardingSlide(
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAL9yQaKNUD_rmAgBL1GM4f8ixnwGja6KU2RuA0xxEFWMdM18ya9SjagMWfCKVeTXP09ZDc7AlAj1QOk01DrU53uEX7r93o3EOgdWjvXpnlTluy7SF8GV0MW8pKqJOnnK_17EwFfJWwNVGJ1oJECEHewYTe5hBF7uO05pO44S4cOmhtxL8NxMOGV3SLfLdPccncti6lw4SBaXkgSXp2pj912sCiwhKrZlIvQVEVxIiQxsegOr_a36CARDTQwxj0-6yLjUZkv7gDu-du',
      title: 'Rescue Fresh Food',
      subtitle: 'Be a hero. Help reduce food waste in Kigali and support local vendors while eating well.',
    ),
  ];

  bool get _isLast => _page == _slides.length - 1;

  Future<void> _complete() async {
    const storage = FlutterSecureStorage();
    await storage.write(key: AppConstants.onboardingCompletedKey, value: 'true');
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
        backgroundColor: AppColors.surfaceIvory,
        body: Column(
          children: [
            // Top App Bar
            SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    ScaleTap(
                      onTap: _complete,
                      child: const Text(
                        'Skip',
                        style: TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.5,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Page View
            Expanded(
              child: PageView.builder(
                controller: _ctrl,
                onPageChanged: (i) => setState(() => _page = i),
                itemCount: _slides.length,
                itemBuilder: (_, i) => _SlideWidget(slide: _slides[i]),
              ),
            ),

            // Bottom Actions Container
            Container(
              padding: const EdgeInsets.fromLTRB(24, 24, 24, 48),
              decoration: const BoxDecoration(
                color: AppColors.surfaceIvory,
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
              ),
              child: Column(
                children: [
                  SmoothPageIndicator(
                    controller: _ctrl,
                    count: _slides.length,
                    effect: const ExpandingDotsEffect(
                      activeDotColor: AppColors.primary,
                      dotColor: AppColors.surfaceVariant,
                      dotHeight: 8,
                      dotWidth: 8,
                      expansionFactor: 4,
                      spacing: 8,
                    ),
                  ),
                  const SizedBox(height: 32),
                  ScaleTap(
                    onTap: () {
                      if (_isLast) {
                        _complete();
                      } else {
                        _ctrl.nextPage(
                          duration: const Duration(milliseconds: 350),
                          curve: Curves.easeOutCubic,
                        );
                      }
                    },
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      decoration: BoxDecoration(
                        color: AppColors.primarySurface, // primary-container (Orange)
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primarySurface.withOpacity(0.2),
                            blurRadius: 20,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            _isLast ? 'Get Started' : 'Continue',
                            style: const TextStyle(
                              fontFamily: 'Inter',
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: AppColors.onPrimaryContainer,
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Icon(
                            Icons.arrow_forward,
                            color: AppColors.onPrimaryContainer,
                            size: 20,
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
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
    return Column(
      children: [
        Expanded(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
            child: Container(
              width: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(32),
                color: const Color(0xFFEFF4FF),
                border: Border.all(color: AppColors.border.withOpacity(0.5)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.06),
                    blurRadius: 20,
                    offset: const Offset(0, 4),
                  ),
                ],
                image: DecorationImage(
                  image: NetworkImage(slide.imageUrl),
                  fit: BoxFit.cover,
                ),
              ),
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(32),
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [
                      AppColors.surfaceIvory.withOpacity(0.4),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: [
              Text(
                slide.title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontFamily: 'Hanken Grotesk',
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                slide.subtitle,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 16,
                  color: AppColors.textSecondary,
                  height: 1.5,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _OnboardingSlide {
  final String imageUrl;
  final String title;
  final String subtitle;

  const _OnboardingSlide({
    required this.imageUrl,
    required this.title,
    required this.subtitle,
  });
}

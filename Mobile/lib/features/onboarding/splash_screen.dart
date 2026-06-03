import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/services/auth_service.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _scale;
  late final Animation<double> _fade;

  bool _animationDone = false;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    _scale = Tween<double>(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.elasticOut),
    );
    _fade = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
          parent: _ctrl, curve: const Interval(0, 0.5, curve: Curves.easeIn)),
    );
    _ctrl.forward();

    // Wait for minimum splash duration
    Future.delayed(const Duration(milliseconds: 1800), () {
      if (mounted) {
        _animationDone = true;
        _tryNavigate();
      }
    });
  }

  Future<void> _tryNavigate() async {
    if (!mounted || !_animationDone) return;

    final auth = ref.read(authProvider);
    // If auth is still loading (e.g. backend offline or slow), we must wait!
    // The ref.listen in build() will call this again once auth resolves.
    if (auth is AuthInitial || auth is AuthLoading) return;

    // Check if onboarding has been seen
    final onboardingDone = await AuthService.hasCompletedOnboarding();

    if (!mounted) return; // Guard after await

    if (auth is AuthAuthenticated) {
      final role = auth.activeRole;
      if (role == 'business_owner') {
        context.go('/business/dashboard');
      } else if (role == 'rider') {
        context.go('/rider/dashboard');
      } else {
        context.go('/home');
      }
    } else if (!onboardingDone) {
      context.go('/onboarding');
    } else {
      context.go('/auth/login');
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Listen to auth state changes so we navigate as soon as it resolves
    ref.listen<AuthState>(authProvider, (previous, next) {
      if (next is! AuthInitial && next is! AuthLoading) {
        _tryNavigate();
      }
    });

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppColors
              .heroGradient, // A deep, stunning Premium green background
        ),
        child: Center(
          child: AnimatedBuilder(
            animation: _ctrl,
            builder: (_, child) => Opacity(
              opacity: _fade.value,
              child: Transform.scale(scale: _scale.value, child: child),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // ChopNow logo circle
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.15),
                        blurRadius: 30,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Text(
                      'CN',
                      style: TextStyle(
                        color: AppColors.primaryDark,
                        fontSize: 38,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -1,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'ChopNow',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Rescue food. Save money. Sustain tomorrow.',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withValues(alpha: 0.8),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

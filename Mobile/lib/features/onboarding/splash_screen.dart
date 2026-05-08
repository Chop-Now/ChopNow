import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;
import '../../core/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/constants.dart';

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
  bool _navigated = false;

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
      CurvedAnimation(parent: _ctrl, curve: const Interval(0, 0.5, curve: Curves.easeIn)),
    );
    _ctrl.forward();

    // Safety fallback: force navigate after 3 seconds no matter what
    Future.delayed(const Duration(seconds: 3), () {
      if (!_navigated && mounted) {
        debugPrint('[SplashScreen] Safety timeout triggered — forcing navigation');
        _doNavigate(const AuthUnauthenticated());
      }
    });
  }

  void _doNavigate(AuthState auth) {
    if (_navigated || !mounted) return;
    _navigated = true;

    String destination;
    if (auth is AuthAuthenticated) {
      final role = auth.activeRole;
      destination = role == 'business_owner'
          ? '/business/dashboard'
          : (role == 'rider' ? '/rider/dashboard' : '/home');
    } else {
      // Check onboarding status from localStorage (web only, instant)
      String? onboardingDone;
      if (kIsWeb) {
        onboardingDone = html.window.localStorage[AppConstants.onboardingCompletedKey];
      }
      destination = (onboardingDone == 'true') ? '/auth/login' : '/onboarding';
    }

    debugPrint('[SplashScreen] Navigating to: $destination');
    context.go(destination);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    debugPrint('[SplashScreen] build() called, authState = ${authState.runtimeType}');

    // Schedule navigation after this frame if auth is resolved
    if (authState is! AuthInitial && authState is! AuthLoading && !_navigated) {
      Future.microtask(() => _doNavigate(authState));
    }

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppColors.heroGradient,
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
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.15),
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
                    color: Colors.white.withOpacity(0.8),
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

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

    if (authState is! AuthInitial && authState is! AuthLoading && !_navigated) {
      Future.microtask(() => _doNavigate(authState));
    }

    return Scaffold(
      backgroundColor: AppColors.primarySurface, // primary-container
      body: Center(
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
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  color: AppColors.surfaceIvory,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.06),
                      blurRadius: 20,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Center(
                  child: Icon(
                    Icons.shopping_bag,
                    color: AppColors.primary,
                    size: 48,
                  ),
                ),
              ),
              const SizedBox(height: 32),
              const Text(
                'ChopNow',
                style: TextStyle(
                  fontFamily: 'Hanken Grotesk',
                  fontSize: 40,
                  fontWeight: FontWeight.w800,
                  color: AppColors.onPrimaryContainer,
                  letterSpacing: -0.8,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Rescue Food. Save Money.',
                style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 18,
                  color: AppColors.onPrimaryContainer.withOpacity(0.9),
                  fontWeight: FontWeight.w600,
                  height: 1.3,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:animate_do/animate_do.dart';
import '../../../core/theme/app_colors.dart';
import '../../animations/scale_tap.dart';

/// ConsumerShell — bottom navigation shell for the Consumer role.
/// 5 tabs: Home, Browse, Orders, Impact, Profile
class ConsumerShell extends StatelessWidget {
  final Widget child;

  const ConsumerShell({super.key, required this.child});

  static const _tabs = [
    _TabItem(label: 'Home', icon: Icons.home_outlined, activeIcon: Icons.home_rounded, path: '/home'),
    _TabItem(label: 'Browse', icon: Icons.explore_outlined, activeIcon: Icons.explore_rounded, path: '/home'),
    _TabItem(label: 'Orders', icon: Icons.receipt_long_outlined, activeIcon: Icons.receipt_long_rounded, path: '/orders'),
    _TabItem(label: 'Impact', icon: Icons.eco_outlined, activeIcon: Icons.eco_rounded, path: '/impact'),
    _TabItem(label: 'Profile', icon: Icons.person_outline_rounded, activeIcon: Icons.person_rounded, path: '/profile'),
  ];

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    if (location.startsWith('/orders')) return 2;
    if (location.startsWith('/impact')) return 3;
    if (location.startsWith('/profile')) return 4;
    return 0; // home + browse share index 0
  }

  @override
  Widget build(BuildContext context) {
    final current = _currentIndex(context);
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return Scaffold(
      extendBody: true,
      body: Stack(
        children: [
          Positioned.fill(
            child: child,
          ),
          
          // ── Floating Glass Nav Bar ──
          Positioned(
            left: 24,
            right: 24,
            bottom: bottomPadding + 20,
            child: FadeInUp(
              duration: const Duration(milliseconds: 800),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(32),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
                  child: Container(
                    height: 72,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.85),
                      borderRadius: BorderRadius.circular(32),
                      border: Border.all(color: Colors.white.withOpacity(0.4), width: 1.5),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.12),
                          blurRadius: 30,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: List.generate(_tabs.length, (i) {
                        final tab = _tabs[i];
                        final isActive = i == current;
                        
                        return Expanded(
                          child: ScaleTap(
                            onTap: () {
                              if (!isActive) {
                                HapticFeedback.lightImpact();
                                context.go(tab.path);
                              }
                            },
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                AnimatedContainer(
                                  duration: const Duration(milliseconds: 400),
                                  curve: Curves.elasticOut,
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: isActive ? AppColors.primary.withOpacity(0.12) : Colors.transparent,
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(
                                    isActive ? tab.activeIcon : tab.icon,
                                    color: isActive ? AppColors.primary : AppColors.textSecondary.withOpacity(0.6),
                                    size: 26,
                                  ),
                                ),
                                if (isActive)
                                  FadeInUp(
                                    duration: const Duration(milliseconds: 400),
                                    from: 4,
                                    child: Container(
                                      width: 4,
                                      height: 4,
                                      margin: const EdgeInsets.only(top: 2),
                                      decoration: const BoxDecoration(
                                        color: AppColors.primary,
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        );
                      }),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TabItem {
  final String label;
  final IconData icon;
  final IconData activeIcon;
  final String path;

  const _TabItem({
    required this.label,
    required this.icon,
    required this.activeIcon,
    required this.path,
  });
}

import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';

/// ConsumerShell — bottom navigation shell for the Consumer role.
/// 5 tabs: Home, Browse, Orders, Impact, Profile
class ConsumerShell extends StatelessWidget {
  final Widget child;

  const ConsumerShell({super.key, required this.child});

  static const _tabs = [
    _TabItem(label: 'Home', icon: Icons.home_outlined, activeIcon: Icons.home_rounded, path: '/home'),
    _TabItem(label: 'Browse', icon: Icons.search_outlined, activeIcon: Icons.search_rounded, path: '/home'), // browse within home
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
    return Scaffold(
      extendBody: true,
      body: Stack(
        children: [
          Positioned.fill(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 80),
              child: child,
            ),
          ),
          Positioned(
            left: 20,
            right: 20,
            bottom: MediaQuery.of(context).padding.bottom + 16,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(100),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 24, offset: const Offset(0, 8)),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(100),
                child: BackdropFilter(
                  filter: _blurFilter(),
                  child: Container(
                    height: 64,
                    decoration: BoxDecoration(
                      color: AppColors.surface.withValues(alpha: 0.85),
                      borderRadius: BorderRadius.circular(100),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: Row(
                      children: List.generate(_tabs.length, (i) {
                        final tab = _tabs[i];
                        final isActive = i == current;
                        return Expanded(
                          child: GestureDetector(
                            onTap: () => context.go(tab.path),
                            behavior: HitTestBehavior.opaque,
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 250),
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: isActive ? AppColors.primary.withValues(alpha: 0.1) : Colors.transparent,
                                borderRadius: BorderRadius.circular(100),
                              ),
                              margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  AnimatedSwitcher(
                                    duration: const Duration(milliseconds: 200),
                                    child: Icon(
                                      isActive ? tab.activeIcon : tab.icon,
                                      key: ValueKey(isActive),
                                      color: isActive ? AppColors.primary : AppColors.textSecondary,
                                      size: 22,
                                    ),
                                  ),
                                ],
                              ),
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

  // Workaround for backdrop filter
  static dynamic _blurFilter() {
    return ImageFilter.blur(sigmaX: 16.0, sigmaY: 16.0);
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

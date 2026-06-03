import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../../core/providers/cart_provider.dart';
import '../../../core/theme/app_colors.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// ConsumerShell — glassmorphic floating bottom navigation with cart badge.
class ConsumerShell extends ConsumerWidget {
  final Widget child;
  const ConsumerShell({super.key, required this.child});

  static const _tabs = [
    _TabItem(
        label: 'Home',
        icon: Icons.home_outlined,
        activeIcon: Icons.home_rounded,
        path: '/home'),
    _TabItem(
        label: 'Browse',
        icon: Icons.search_outlined,
        activeIcon: Icons.search_rounded,
        path: '/browse'),
    _TabItem(
        label: 'Cart',
        icon: Icons.shopping_cart_outlined,
        activeIcon: Icons.shopping_cart_rounded,
        path: '/cart'),
    _TabItem(
        label: 'Orders',
        icon: Icons.receipt_long_outlined,
        activeIcon: Icons.receipt_long_rounded,
        path: '/orders'),
    _TabItem(
        label: 'Profile',
        icon: Icons.person_outline_rounded,
        activeIcon: Icons.person_rounded,
        path: '/profile'),
  ];

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).uri.path;
    if (location.startsWith('/browse')) return 1;
    if (location.startsWith('/cart')) return 2;
    if (location.startsWith('/orders')) return 3;
    if (location.startsWith('/profile')) return 4;
    return 0;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final current = _currentIndex(context);
    final cartCount = ref.watch(cartCountProvider);

    return Scaffold(
      extendBody: true,
      body: Stack(
        children: [
          Positioned.fill(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 90),
              child: child,
            ),
          ),

          // Floating nav bar
          Positioned(
            left: 16,
            right: 16,
            bottom: MediaQuery.of(context).padding.bottom + 12,
            child: Container(
              height: 68,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(34),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.12),
                    blurRadius: 24,
                    spreadRadius: 0,
                    offset: const Offset(0, 8),
                  ),
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(34),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                  child: Container(
                    decoration: BoxDecoration(
                      color: AppColors.surface.withValues(alpha: 0.92),
                      borderRadius: BorderRadius.circular(34),
                      border: Border.all(
                          color: AppColors.border.withValues(alpha: 0.8),
                          width: 1),
                    ),
                    padding: const EdgeInsets.symmetric(horizontal: 6),
                    child: Row(
                      children: List.generate(_tabs.length, (i) {
                        final tab = _tabs[i];
                        final isActive = i == current;
                        return Expanded(
                          child: Semantics(
                            label: tab.label,
                            selected: isActive,
                            button: true,
                            child: GestureDetector(
                              onTap: () {
                                HapticFeedback.selectionClick();
                                context.go(tab.path);
                              },
                              behavior: HitTestBehavior.opaque,
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 250),
                                curve: Curves.easeInOut,
                                margin: const EdgeInsets.symmetric(
                                    horizontal: 3, vertical: 8),
                                padding:
                                    const EdgeInsets.symmetric(vertical: 6),
                                decoration: BoxDecoration(
                                  color: isActive
                                      ? AppColors.primary
                                      : Colors.transparent,
                                  borderRadius: BorderRadius.circular(26),
                                ),
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Stack(
                                      clipBehavior: Clip.none,
                                      children: [
                                        AnimatedSwitcher(
                                          duration:
                                              const Duration(milliseconds: 200),
                                          transitionBuilder: (child, anim) =>
                                              ScaleTransition(
                                                  scale: anim, child: child),
                                          child: Icon(
                                            isActive
                                                ? tab.activeIcon
                                                : tab.icon,
                                            key: ValueKey(
                                                '${tab.path}_$isActive'),
                                            color: isActive
                                                ? Colors.white
                                                : AppColors.textSecondary,
                                            size: 21,
                                          ),
                                        ),
                                        // Cart badge on browse/cart tab if needed
                                        if (i == 2 && cartCount > 0)
                                          Positioned(
                                            top: -4,
                                            right: -6,
                                            child: Container(
                                              width: 16,
                                              height: 16,
                                              decoration: BoxDecoration(
                                                color: AppColors.accent,
                                                shape: BoxShape.circle,
                                                border: Border.all(
                                                    color: AppColors.surface,
                                                    width: 1.5),
                                              ),
                                              child: Center(
                                                child: Text(
                                                  cartCount > 9
                                                      ? '9+'
                                                      : '$cartCount',
                                                  style: const TextStyle(
                                                      fontSize: 8,
                                                      fontWeight:
                                                          FontWeight.w800,
                                                      color: Colors.white),
                                                ),
                                              ),
                                            ),
                                          ),
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    AnimatedDefaultTextStyle(
                                      duration:
                                          const Duration(milliseconds: 200),
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: isActive
                                            ? FontWeight.w700
                                            : FontWeight.w500,
                                        color: isActive
                                            ? Colors.white
                                            : AppColors.textSecondary,
                                      ),
                                      child: Text(tab.label),
                                    ),
                                  ],
                                ),
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
}

class _TabItem {
  final String label;
  final IconData icon;
  final IconData activeIcon;
  final String path;
  const _TabItem(
      {required this.label,
      required this.icon,
      required this.activeIcon,
      required this.path});
}

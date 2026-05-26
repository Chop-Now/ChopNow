import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';

/// BusinessShell — bottom navigation shell for the Business Owner role.
class BusinessShell extends StatelessWidget {
  final Widget child;
  const BusinessShell({super.key, required this.child});

  static const _tabs = [
    _BizTab(label: 'Dashboard', icon: Icons.dashboard_outlined, activeIcon: Icons.dashboard_rounded, path: '/business/dashboard'),
    _BizTab(label: 'Listings', icon: Icons.store_outlined, activeIcon: Icons.store_rounded, path: '/business/listings'),
    _BizTab(label: 'Orders', icon: Icons.receipt_long_outlined, activeIcon: Icons.receipt_long_rounded, path: '/business/orders'),
    _BizTab(label: 'Analytics', icon: Icons.bar_chart_outlined, activeIcon: Icons.bar_chart_rounded, path: '/business/analytics'),
  ];

  int _current(BuildContext context) {
    final path = GoRouterState.of(context).uri.path;
    if (path.startsWith('/business/listings')) return 1;
    if (path.startsWith('/business/orders')) return 2;
    if (path.startsWith('/business/analytics')) return 3;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final current = _current(context);
    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          border: const Border(top: BorderSide(color: AppColors.border, width: 0.5)),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 16, offset: const Offset(0, -4))],
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 64,
            child: Row(
              children: List.generate(_tabs.length, (i) {
                final tab = _tabs[i];
                final active = i == current;
                return Expanded(
                  child: Semantics(
                    label: tab.label,
                    selected: active,
                    button: true,
                    child: InkWell(
                      onTap: () => context.go(tab.path),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(active ? tab.activeIcon : tab.icon, color: active ? AppColors.primary : AppColors.textSecondary, size: 22),
                          const SizedBox(height: 3),
                          Text(tab.label, style: TextStyle(fontSize: 10, fontWeight: active ? FontWeight.w700 : FontWeight.w400, color: active ? AppColors.primary : AppColors.textSecondary)),
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
    );
  }
}

class _BizTab {
  final String label, path;
  final IconData icon, activeIcon;
  const _BizTab({required this.label, required this.icon, required this.activeIcon, required this.path});
}

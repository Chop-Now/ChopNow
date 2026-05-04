import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/animations/scale_tap.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final user = auth is AuthAuthenticated ? auth.user : null;
    final name = '${user?.firstName ?? ''} ${user?.lastName ?? ''}'.trim();
    final email = user?.email ?? '';
    final phone = user?.phone ?? '';
    final avatarUrl = user?.avatar;
    final role = auth is AuthAuthenticated ? auth.user.activeRole : 'consumer';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Profile', style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        backgroundColor: AppColors.surface,
        elevation: 0,
        automaticallyImplyLeading: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined, color: AppColors.primary),
            onPressed: () => context.push('/profile/edit'),
          ),
        ],
      ),
      body: ListView(
        children: [
          // Header card
          Container(
            color: AppColors.surface,
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                _Avatar(url: avatarUrl, name: name, size: 60),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(name.isEmpty ? 'ChopNow User' : name,
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                      if (email.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(email, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                      ],
                      if (phone.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(phone, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                      ],
                      const SizedBox(height: 6),
                      _RoleBadge(role: role),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // Navigation tiles
          _Section(title: 'Account', tiles: [
            _Tile(icon: Icons.person_outline_rounded, label: 'Edit Profile',
                onTap: () => context.push('/profile/edit')),
            _Tile(icon: Icons.location_on_outlined, label: 'My Addresses',
                onTap: () => context.push('/profile/addresses')),
            _Tile(icon: Icons.receipt_long_outlined, label: 'Order History',
                onTap: () => context.go('/orders')),
            _Tile(icon: Icons.favorite_border_rounded, label: 'Favorites',
                onTap: () {}),
          ]),
          const SizedBox(height: 8),

          _Section(title: 'ChopNow', tiles: [
            _Tile(icon: Icons.eco_outlined, label: 'My Impact',
                subtitle: 'View your environmental stats',
                onTap: () => context.go('/impact')),
            // Role Switcher
            if (user != null && user.roles.length > 1)
              _Tile(
                icon: Icons.swap_horiz_rounded,
                label: 'Switch Role',
                subtitle: 'Current: ${_roleLabel(role)}',
                onTap: () => _showRoleSwitcher(context, ref, user, role),
              ),
          ]),
          const SizedBox(height: 8),

          _Section(title: 'Support', tiles: [
            _Tile(icon: Icons.help_outline_rounded, label: 'Help & FAQ', onTap: () {}),
            _Tile(icon: Icons.info_outline_rounded, label: 'About ChopNow', onTap: () {}),
            _Tile(icon: Icons.privacy_tip_outlined, label: 'Privacy Policy', onTap: () {}),
          ]),
          const SizedBox(height: 8),

          // Sign out
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: ScaleTap(
              onTap: () {
                HapticFeedback.mediumImpact();
                showDialog(
                  context: context,
                  builder: (_) => AlertDialog(
                    title: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.w700)),
                    content: const Text('Are you sure you want to sign out?'),
                    actions: [
                      TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                      TextButton(
                        onPressed: () {
                          ref.read(authProvider.notifier).logout();
                          Navigator.pop(context);
                        },
                        child: const Text('Sign Out', style: TextStyle(color: AppColors.error)),
                      ),
                    ],
                  ),
                );
              },
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  color: AppColors.errorSurface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.logout_rounded, color: AppColors.error, size: 20),
                    SizedBox(width: 8),
                    Text('Sign Out', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w700, fontSize: 15)),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // App version
          const Center(
            child: Text('ChopNow v1.0.0 · Rescue food. Save money. Sustain tomorrow.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 11, color: AppColors.textTertiary)),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  String _roleLabel(String role) => switch (role) {
    'business_owner' => 'Business Owner',
    'rider' => 'Rider',
    _ => 'Consumer',
  };

  void _showRoleSwitcher(BuildContext context, WidgetRef ref, appUser, String current) {
    final roles = (appUser?.roles as List<String>?) ?? ['consumer'];
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Switch Role', style: TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
            const SizedBox(height: 16),
            ...roles.map((r) => ListTile(
              leading: Icon(r == current ? Icons.radio_button_checked : Icons.radio_button_off, color: AppColors.primary),
              title: Text(_roleLabel(r)),
              onTap: () {
                ref.read(authProvider.notifier).switchRole(r);
                Navigator.pop(context);
              },
            )),
          ],
        ),
      ),
    );
  }
}

class _Avatar extends StatelessWidget {
  final String? url;
  final String name;
  final double size;
  const _Avatar({this.url, required this.name, required this.size});

  @override
  Widget build(BuildContext context) {
    final initials = name.isNotEmpty
        ? name.split(' ').take(2).map((w) => w.isEmpty ? '' : w[0].toUpperCase()).join()
        : '?';
    return CircleAvatar(
      radius: size / 2,
      backgroundColor: AppColors.primarySurface,
      backgroundImage: url != null && url!.isNotEmpty ? NetworkImage(url!) : null,
      child: url == null || url!.isEmpty
          ? Text(initials, style: TextStyle(fontSize: size * 0.35, fontWeight: FontWeight.w700, color: AppColors.primary))
          : null,
    );
  }
}

class _RoleBadge extends StatelessWidget {
  final String role;
  const _RoleBadge({required this.role});

  @override
  Widget build(BuildContext context) {
    final label = switch (role) {
      'business_owner' => '🏪 Business Owner',
      'rider' => '🚴 Rider',
      _ => '🛍 Consumer',
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.primarySurface,
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
      ),
      child: Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primary)),
    );
  }
}

class _Section extends StatelessWidget {
  final String title;
  final List<Widget> tiles;
  const _Section({required this.title, required this.tiles});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.surface,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textSecondary, letterSpacing: 0.5)),
          ),
          ...tiles.map((t) => t),
          const Divider(height: 1, color: AppColors.border, indent: 0),
        ],
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? subtitle;
  final VoidCallback onTap;
  const _Tile({required this.icon, required this.label, required this.onTap, this.subtitle});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(color: AppColors.primarySurface, borderRadius: BorderRadius.circular(10)),
        child: Icon(icon, color: AppColors.primary, size: 19),
      ),
      title: Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
      subtitle: subtitle != null ? Text(subtitle!, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)) : null,
      trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textSecondary, size: 20),
      onTap: onTap,
    );
  }
}

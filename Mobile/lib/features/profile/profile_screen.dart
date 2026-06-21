import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/models/user_model.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/providers/impact_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/animations/scale_tap.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final asyncImpact = ref.watch(userImpactProvider);
    final mealsRescued = asyncImpact.value?['mealsRescued'] ??
        asyncImpact.value?['totalMeals'] ??
        0;
    final co2SavedRaw =
        asyncImpact.value?['co2Saved'] ?? asyncImpact.value?['totalCo2'] ?? 0.0;
    final co2Saved = co2SavedRaw is num ? co2SavedRaw.toDouble() : 0.0;
    final co2String = co2Saved >= 1.0
        ? '${co2Saved.toStringAsFixed(1)} kg'
        : '${(co2Saved * 1000).toStringAsFixed(0)}g';
    final moneySavedRaw = asyncImpact.value?['moneySaved'] ??
        asyncImpact.value?['totalSavings'] ??
        0;
    final moneySaved = moneySavedRaw is num ? moneySavedRaw.toDouble() : 0.0;
    final user = auth is AuthAuthenticated ? auth.user : null;
    final name = '${user?.firstName ?? ''} ${user?.lastName ?? ''}'.trim();
    final email = user?.email ?? '';
    final phone = user?.phone ?? '';
    final avatarUrl = user?.avatar;
    final role = auth is AuthAuthenticated ? auth.user.activeRole : 'consumer';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
        slivers: [
          // ── Premium Gradient Hero Header ──
          SliverToBoxAdapter(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppColors.primary,
                    AppColors.primaryDark,
                    Color(0xFF1A3A2A),
                  ],
                ),
              ),
              child: SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
                  child: Column(
                    children: [
                      // Top bar
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'My Profile',
                            style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w900,
                                color: Colors.white,
                                letterSpacing: -0.3),
                          ),
                          ScaleTap(
                            onTap: () => context.push('/profile/edit'),
                            child: Container(
                              padding: const EdgeInsets.all(9),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.18),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                    color:
                                        Colors.white.withValues(alpha: 0.25)),
                              ),
                              child: const Icon(Icons.edit_rounded,
                                  size: 18, color: Colors.white),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Avatar + info
                      Row(
                        children: [
                          // Avatar with glow
                          Container(
                            padding: const EdgeInsets.all(3),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                  color: Colors.white.withValues(alpha: 0.5),
                                  width: 2),
                              boxShadow: [
                                BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.25),
                                    blurRadius: 16,
                                    offset: const Offset(0, 4)),
                              ],
                            ),
                            child:
                                _Avatar(url: avatarUrl, name: name, size: 72),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  name.isEmpty ? 'ChopNow User' : name,
                                  style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.w800,
                                      color: Colors.white),
                                ),
                                if (email.isNotEmpty) ...[
                                  const SizedBox(height: 3),
                                  Text(email,
                                      style: TextStyle(
                                          fontSize: 13,
                                          color: Colors.white
                                              .withValues(alpha: 0.75))),
                                ],
                                if (phone.isNotEmpty) ...[
                                  const SizedBox(height: 2),
                                  Text(phone,
                                      style: TextStyle(
                                          fontSize: 13,
                                          color: Colors.white
                                              .withValues(alpha: 0.75))),
                                ],
                                const SizedBox(height: 8),
                                _RoleBadge(role: role),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Stats row
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                              color: Colors.white.withValues(alpha: 0.2)),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                                child: _StatItem(
                                    value: '$mealsRescued', label: 'Rescues')),
                            const _Divider(),
                            Expanded(
                                child: _StatItem(
                                    value: co2String, label: 'CO₂ Saved')),
                            const _Divider(),
                            Expanded(
                                child: _StatItem(
                                    value: moneySaved >= 1000
                                        ? 'RWF ${(moneySaved / 1000).toStringAsFixed(0)}K'
                                        : 'RWF ${moneySaved.toStringAsFixed(0)}',
                                    label: 'Saved')),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // ── Navigation Sections ──
          SliverToBoxAdapter(
            child: Column(
              children: [
                const SizedBox(height: 20),

                _Section(title: 'Account', tiles: [
                  _Tile(
                      icon: Icons.person_outline_rounded,
                      label: 'Edit Profile',
                      subtitle: 'Update your personal info',
                      onTap: () => context.push('/profile/edit')),
                  _Tile(
                      icon: Icons.location_on_outlined,
                      label: 'My Addresses',
                      subtitle: 'Manage saved locations',
                      onTap: () => context.push('/profile/addresses')),
                  _Tile(
                      icon: Icons.receipt_long_outlined,
                      label: 'Order History',
                      subtitle: 'View past & active orders',
                      onTap: () => context.go('/orders')),
                  _Tile(
                      icon: Icons.favorite_border_rounded,
                      label: 'Favorites',
                      subtitle: 'Saved restaurants & deals',
                      onTap: () => context.push('/profile/favorites')),
                ]),
                const SizedBox(height: 12),

                _Section(title: 'ChopNow', tiles: [
                  _Tile(
                      icon: Icons.eco_outlined,
                      label: 'My Impact',
                      subtitle: 'View your environmental footprint',
                      iconColor: AppColors.success,
                      onTap: () => context.go('/impact')),
                  if (user != null && user.roles.length > 1)
                    _Tile(
                      icon: Icons.swap_horiz_rounded,
                      label: 'Switch Role',
                      subtitle: 'Current: ${_roleLabel(role)}',
                      onTap: () => _showRoleSwitcher(context, ref, user, role),
                    ),
                  // COMMENTED OUT: Business registration should go through the dedicated
                  // business registration route, not from buyer profile.
                  // if (user != null && !user.isBusinessOwner)
                  //   _Tile(
                  //     icon: Icons.storefront_rounded,
                  //     label: 'Sell on ChopNow',
                  //     subtitle: 'Register your food business',
                  //     iconColor: AppColors.primary,
                  //     onTap: () => context.push('/business/create'),
                  //   ),
                  if (user != null && !user.isRider)
                    _Tile(
                      icon: Icons.directions_bike_rounded,
                      label: 'Earn with ChopNow',
                      subtitle: 'Register as a delivery partner',
                      iconColor: AppColors.accent,
                      onTap: () => context.push('/become-rider'),
                    ),
                  _Tile(
                      icon: Icons.settings_outlined,
                      label: 'Settings',
                      subtitle: 'Notifications, privacy & more',
                      onTap: () => context.push('/profile/settings')),
                ]),
                const SizedBox(height: 12),

                _Section(title: 'Support', tiles: [
                  _Tile(
                      icon: Icons.help_outline_rounded,
                      label: 'Help & FAQ',
                      onTap: () => _showHelpFAQ(context)),
                  _Tile(
                      icon: Icons.info_outline_rounded,
                      label: 'About ChopNow',
                      onTap: () => _showAboutDialog(context)),
                  _Tile(
                      icon: Icons.privacy_tip_outlined,
                      label: 'Privacy Policy',
                      onTap: () => _showPrivacyPolicy(context)),
                ]),
                const SizedBox(height: 20),

                // Sign out button
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: ScaleTap(
                    onTap: () async {
                      HapticFeedback.mediumImpact();
                      final confirm = await showDialog<bool>(
                        context: context,
                        builder: (ctx) => AlertDialog(
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20)),
                          title: const Text('Sign Out',
                              style: TextStyle(fontWeight: FontWeight.w800)),
                          content:
                              const Text('Are you sure you want to sign out?'),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(ctx, false),
                              child: const Text('Cancel'),
                            ),
                            TextButton(
                              onPressed: () => Navigator.pop(ctx, true),
                              child: const Text('Sign Out',
                                  style: TextStyle(color: AppColors.error)),
                            ),
                          ],
                        ),
                      );
                      if (confirm == true && context.mounted) {
                        ref.read(authProvider.notifier).logout();
                      }
                    },
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 15),
                      decoration: BoxDecoration(
                        color: AppColors.errorSurface,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                            color: AppColors.error.withValues(alpha: 0.3)),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.logout_rounded,
                              color: AppColors.error, size: 20),
                          SizedBox(width: 8),
                          Text('Sign Out',
                              style: TextStyle(
                                  color: AppColors.error,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 15)),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                const Center(
                  child: Text(
                      'ChopNow v1.0.0 · Rescue food. Save money.\nSustain tomorrow.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          fontSize: 11,
                          color: AppColors.textTertiary,
                          height: 1.6)),
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showHelpFAQ(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Help & FAQ',
            style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        content: const Text(
          'Frequently Asked Questions:\n\n'
          'Q: What is ChopNow?\n'
          'A: ChopNow helps you rescue surplus food from local restaurants and cafés at a discount, saving money and reducing waste.\n\n'
          'Q: How do I collect my order?\n'
          'A: Show the 6-digit pickup code on your tracking screen to the vendor at the counter.',
          style: TextStyle(color: AppColors.textSecondary, height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
          )
        ],
      ),
    );
  }

  void _showAboutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('About ChopNow',
            style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        content: const Text(
          'ChopNow is dedicated to eliminating food waste while making premium food affordable for everyone. Join us in sustaining tomorrow, one meal at a time.',
          style: TextStyle(color: AppColors.textSecondary, height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cool!', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
          )
        ],
      ),
    );
  }

  void _showPrivacyPolicy(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Privacy Policy',
            style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        content: const Text(
          'We value your privacy. ChopNow secure-stores only data needed to complete your orders, match delivery partners, and ensure safety. Your private info is never sold.',
          style: TextStyle(color: AppColors.textSecondary, height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
          )
        ],
      ),
    );
  }

  static String _roleLabel(String role) => switch (role) {
        'business_owner' => 'Business Owner',
        'rider' => 'Rider',
        _ => 'Consumer',
      };

  void _showRoleSwitcher(
      BuildContext context, WidgetRef ref, AppUser? appUser, String current) {
    final List<String> roles =
        (appUser?.roles ?? const ['consumer']).map((e) => e.toString()).toList();
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 20),
            const Text('Switch Role',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
            const SizedBox(height: 16),
            ...roles.map((r) => ListTile(
                  leading: Icon(
                      r == current
                          ? Icons.radio_button_checked
                          : Icons.radio_button_off,
                      color: AppColors.primary),
                  title: Text(_roleLabel(r),
                      style: const TextStyle(fontWeight: FontWeight.w600)),
                  onTap: () async {
                    await ref.read(authProvider.notifier).switchRole(r);
                    if (context.mounted) {
                      Navigator.pop(context);
                      final target = switch (r) {
                        'business_owner' => '/business/dashboard',
                        'rider' => '/rider/dashboard',
                        _ => '/home',
                      };
                      context.go(target);
                    }
                  },
                )),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String value;
  final String label;
  const _StatItem({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(value,
            style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w900,
                color: Colors.white)),
        const SizedBox(height: 2),
        Text(label,
            style: TextStyle(
                fontSize: 11,
                color: Colors.white.withValues(alpha: 0.7),
                fontWeight: FontWeight.w500)),
      ],
    );
  }
}

class _Divider extends StatelessWidget {
  const _Divider();
  @override
  Widget build(BuildContext context) => Container(
      width: 1, height: 36, color: Colors.white.withValues(alpha: 0.2));
}

class _Avatar extends StatelessWidget {
  final String? url;
  final String name;
  final double size;
  const _Avatar({this.url, required this.name, required this.size});

  @override
  Widget build(BuildContext context) {
    final initials = name.isNotEmpty
        ? name
            .split(' ')
            .take(2)
            .map((w) => w.isEmpty ? '' : w[0].toUpperCase())
            .join()
        : '?';
    return CircleAvatar(
      radius: size / 2,
      backgroundColor: Colors.white.withValues(alpha: 0.2),
      backgroundImage: url != null &&
              url!.isNotEmpty &&
              (url!.startsWith('http://') || url!.startsWith('https://'))
          ? NetworkImage(url!)
          : null,
      child: url == null ||
              url!.isEmpty ||
              !(url!.startsWith('http://') || url!.startsWith('https://'))
          ? Text(initials,
              style: TextStyle(
                  fontSize: size * 0.35,
                  fontWeight: FontWeight.w800,
                  color: Colors.white))
          : null,
    );
  }
}

class _RoleBadge extends StatelessWidget {
  final String role;
  const _RoleBadge({required this.role});

  @override
  Widget build(BuildContext context) {
    final (icon, label) = switch (role) {
      'business_owner' => (Icons.storefront_rounded, 'Business Owner'),
      'rider' => (Icons.delivery_dining_rounded, 'Rider'),
      _ => (Icons.shopping_bag_outlined, 'Consumer'),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: Colors.white.withValues(alpha: 0.35)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: Colors.white),
          const SizedBox(width: 4),
          Text(label,
              style: const TextStyle(
                  fontSize: 11, fontWeight: FontWeight.w700, color: Colors.white)),
        ],
      ),
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
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 4),
            child: Text(title.toUpperCase(),
                style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textSecondary,
                    letterSpacing: 0.8)),
          ),
          ...tiles,
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
  final Color? iconColor;
  const _Tile(
      {required this.icon,
      required this.label,
      required this.onTap,
      this.subtitle,
      this.iconColor});

  @override
  Widget build(BuildContext context) {
    final color = iconColor ?? AppColors.primary;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(11),
                ),
                child: Icon(icon, color: color, size: 19),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(label,
                        style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary)),
                    if (subtitle != null) ...[
                      const SizedBox(height: 1),
                      Text(subtitle!,
                          style: const TextStyle(
                              fontSize: 12, color: AppColors.textSecondary)),
                    ],
                  ],
                ),
              ),
              const Icon(Icons.chevron_right_rounded,
                  color: AppColors.textSecondary, size: 20),
            ],
          ),
        ),
      ),
    );
  }
}

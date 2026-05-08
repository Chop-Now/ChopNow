import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:animate_do/animate_do.dart';
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
    final avatarUrl = user?.avatar;
    final role = auth is AuthAuthenticated ? auth.user.activeRole : 'consumer';

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          // ── Premium Profile Header ──
          SliverAppBar(
            expandedHeight: 280,
            pinned: true,
            stretch: true,
            backgroundColor: AppColors.primary,
            elevation: 0,
            flexibleSpace: FlexibleSpaceBar(
              stretchModes: const [StretchMode.zoomBackground, StretchMode.blurBackground],
              background: Stack(
                fit: StackFit.expand,
                children: [
                  // Gradient Background
                  Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topRight,
                        end: Alignment.bottomLeft,
                        colors: [AppColors.primary, Color(0xFF005936)],
                      ),
                    ),
                  ),
                  // Background Pattern (Optional blobs)
                  Positioned(
                    top: -40,
                    left: -40,
                    child: Container(
                      width: 200,
                      height: 200,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white.withOpacity(0.05),
                      ),
                    ),
                  ),
                  // Content
                  Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: 40),
                      FadeInDown(
                        child: _Avatar(url: avatarUrl, name: name, size: 90),
                      ),
                      const SizedBox(height: 16),
                      FadeInUp(
                        child: Text(
                          name.isEmpty ? 'ChopNow User' : name,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                            letterSpacing: -0.5,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      FadeInUp(
                        delay: const Duration(milliseconds: 200),
                        child: Text(
                          email,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.white.withOpacity(0.7),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      FadeInUp(
                        delay: const Duration(milliseconds: 400),
                        child: _RoleBadge(role: role, isDark: true),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.settings_outlined, color: Colors.white),
                onPressed: () => context.push('/profile/edit'),
              ),
            ],
          ),

          // ── Profile Content ──
          SliverToBoxAdapter(
            child: Column(
              children: [
                // ── Impact Stats Card ──
                Transform.translate(
                  offset: const Offset(0, -30),
                  child: FadeInUp(
                    delay: const Duration(milliseconds: 600),
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 20),
                      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 10),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.06),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          _StatItem(label: 'Rescued', value: '12', unit: 'meals', icon: '🥘', color: AppColors.primary),
                          _StatItem(label: 'Saved', value: '8.4', unit: 'kg CO₂', icon: '🌍', color: AppColors.info),
                          _StatItem(label: 'Earned', value: '450', unit: 'points', icon: '💎', color: AppColors.accent),
                        ],
                      ),
                    ),
                  ),
                ),

                // ── Settings Sections ──
                _Section(
                  title: 'Account Management',
                  tiles: [
                    _Tile(
                      icon: Icons.person_outline_rounded,
                      label: 'Personal Information',
                      onTap: () => context.push('/profile/edit'),
                    ),
                    _Tile(
                      icon: Icons.location_on_outlined,
                      label: 'Delivery Addresses',
                      onTap: () => context.push('/profile/addresses'),
                    ),
                    _Tile(
                      icon: Icons.payment_rounded,
                      label: 'Payment Methods',
                      onTap: () {},
                    ),
                  ],
                ),

                _Section(
                  title: 'Orders & Activity',
                  tiles: [
                    _Tile(
                      icon: Icons.receipt_long_outlined,
                      label: 'My Orders',
                      onTap: () => context.go('/orders'),
                    ),
                    _Tile(
                      icon: Icons.favorite_border_rounded,
                      label: 'Favorite Restaurants',
                      onTap: () {},
                    ),
                    _Tile(
                      icon: Icons.star_outline_rounded,
                      label: 'Reviews & Feedback',
                      onTap: () {},
                    ),
                  ],
                ),

                _Section(
                  title: 'Help & Support',
                  tiles: [
                    _Tile(
                      icon: Icons.help_outline_rounded,
                      label: 'Help Center',
                      onTap: () {},
                    ),
                    _Tile(
                      icon: Icons.info_outline_rounded,
                      label: 'About ChopNow',
                      onTap: () {},
                    ),
                    _Tile(
                      icon: Icons.privacy_tip_outlined,
                      label: 'Privacy & Security',
                      onTap: () {},
                    ),
                  ],
                ),

                const SizedBox(height: 32),

                // ── Logout Button ──
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: FadeInUp(
                    delay: const Duration(milliseconds: 1000),
                    child: ScaleTap(
                      onTap: () => _handleLogout(context, ref),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        decoration: BoxDecoration(
                          color: AppColors.error.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.error.withOpacity(0.2)),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.logout_rounded, color: AppColors.error, size: 20),
                            const SizedBox(width: 12),
                            Text(
                              'Sign Out Account',
                              style: TextStyle(
                                color: AppColors.error,
                                fontWeight: FontWeight.w800,
                                fontSize: 15,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 40),
                const Center(
                  child: Text(
                    'ChopNow v1.0.0 (Stable)\nSustainability starts with you.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12, color: AppColors.textTertiary, height: 1.5),
                  ),
                ),
                const SizedBox(height: 60),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _handleLogout(BuildContext context, WidgetRef ref) {
    HapticFeedback.mediumImpact();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text('Sign Out', style: TextStyle(fontWeight: FontWeight.w900)),
        content: const Text('Are you sure you want to end your session?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Stay Logged In', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w700)),
          ),
          TextButton(
            onPressed: () {
              ref.read(authProvider.notifier).logout();
              Navigator.pop(context);
            },
            child: const Text('Sign Out', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w900)),
          ),
        ],
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
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 3),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: CircleAvatar(
        backgroundColor: Colors.white.withOpacity(0.2),
        backgroundImage: url != null && url!.isNotEmpty ? NetworkImage(url!) : null,
        child: url == null || url!.isEmpty
            ? Text(initials, style: TextStyle(fontSize: size * 0.35, fontWeight: FontWeight.w900, color: Colors.white))
            : null,
      ),
    );
  }
}

class _RoleBadge extends StatelessWidget {
  final String role;
  final bool isDark;
  const _RoleBadge({required this.role, this.isDark = false});

  @override
  Widget build(BuildContext context) {
    final label = switch (role) {
      'business_owner' => '🏪 Business Owner',
      'rider' => '🚴 Rider',
      _ => '🛍 Consumer Member',
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: isDark ? Colors.white.withOpacity(0.15) : AppColors.primarySurface,
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: isDark ? Colors.white.withOpacity(0.3) : AppColors.primary.withOpacity(0.2)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w800,
          color: isDark ? Colors.white : AppColors.primary,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  final String unit;
  final String icon;
  final Color color;

  const _StatItem({required this.label, required this.value, required this.unit, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Text(icon, style: const TextStyle(fontSize: 20)),
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.textPrimary),
        ),
        Text(
          unit,
          style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.textSecondary.withOpacity(0.6), letterSpacing: 0.2),
        ),
      ],
    );
  }
}

class _Section extends StatelessWidget {
  final String title;
  final List<Widget> tiles;
  const _Section({required this.title, required this.tiles});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 12),
          child: Text(
            title.toUpperCase(),
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.textTertiary, letterSpacing: 1.2),
          ),
        ),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.border.withOpacity(0.5)),
          ),
          child: Column(
            children: tiles,
          ),
        ),
      ],
    );
  }
}

class _Tile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _Tile({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: AppColors.textPrimary, size: 20),
      ),
      title: Text(
        label,
        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
      ),
      trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: AppColors.textTertiary),
      onTap: onTap,
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:animate_do/animate_do.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';


class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final user = auth is AuthAuthenticated ? auth.user : null;
    final name = '${user?.firstName ?? ''} ${user?.lastName ?? ''}'.trim();
    final avatarUrl = user?.avatar;

    return Scaffold(
      backgroundColor: AppColors.surfaceIvory,
      appBar: AppBar(
        backgroundColor: AppColors.surfaceIvory,
        elevation: 0,
        title: const Text('Impact Profile', style: TextStyle(fontFamily: 'Hanken Grotesk', fontWeight: FontWeight.w700, fontSize: 24, color: AppColors.textPrimary)),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_outlined, color: AppColors.textPrimary),
            onPressed: () => _showSettingsMenu(context, ref),
          ),
        ],
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          children: [
            FadeInUp(child: _ProfileHeader(name: name.isEmpty ? 'ChopNow Hero' : name, avatarUrl: avatarUrl)),
            const SizedBox(height: 16),
            FadeInUp(delay: const Duration(milliseconds: 100), child: const _StatsGrid()),
            const SizedBox(height: 16),
            FadeInUp(delay: const Duration(milliseconds: 200), child: const _BadgesSection()),
            const SizedBox(height: 16),
            FadeInUp(delay: const Duration(milliseconds: 300), child: const _RecentRescuesSection()),
            const SizedBox(height: 16),
            FadeInUp(delay: const Duration(milliseconds: 400), child: const _ReferralCard()),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  void _showSettingsMenu(BuildContext context, WidgetRef ref) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Settings', style: TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(Icons.person_outline, color: AppColors.textPrimary),
                title: const Text('Account Details', style: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w600)),
                onTap: () { Navigator.pop(context); context.push('/profile/edit'); },
              ),
              ListTile(
                leading: const Icon(Icons.location_on_outlined, color: AppColors.textPrimary),
                title: const Text('Delivery Addresses', style: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w600)),
                onTap: () { Navigator.pop(context); context.push('/profile/addresses'); },
              ),
              ListTile(
                leading: const Icon(Icons.receipt_long_outlined, color: AppColors.textPrimary),
                title: const Text('My Orders', style: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w600)),
                onTap: () { Navigator.pop(context); context.go('/orders'); },
              ),
              const Divider(color: AppColors.surfaceVariant),
              ListTile(
                leading: const Icon(Icons.logout, color: AppColors.error),
                title: const Text('Sign Out', style: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w600, color: AppColors.error)),
                onTap: () {
                  Navigator.pop(context);
                  _handleLogout(context, ref);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _handleLogout(BuildContext context, WidgetRef ref) {
    HapticFeedback.mediumImpact();
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: const Text('Sign Out', style: TextStyle(fontFamily: 'Hanken Grotesk', fontWeight: FontWeight.w700)),
        content: const Text('Are you sure you want to end your session?', style: TextStyle(fontFamily: 'Inter')),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(fontFamily: 'Inter', color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
          ),
          TextButton(
            onPressed: () {
              ref.read(authProvider.notifier).logout();
              Navigator.pop(context);
            },
            child: const Text('Sign Out', style: TextStyle(fontFamily: 'Inter', color: AppColors.error, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  final String name;
  final String? avatarUrl;

  const _ProfileHeader({required this.name, this.avatarUrl});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          Stack(
            clipBehavior: Clip.none,
            alignment: Alignment.bottomRight,
            children: [
              Container(
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.surfaceIvory, width: 4),
                  image: avatarUrl != null
                      ? DecorationImage(image: NetworkImage(avatarUrl!), fit: BoxFit.cover)
                      : null,
                  color: AppColors.surfaceVariant,
                ),
                child: avatarUrl == null
                    ? const Center(child: Icon(Icons.person, size: 40, color: AppColors.textSecondary))
                    : null,
              ),
              Positioned(
                bottom: -4,
                right: -4,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.accent,
                    borderRadius: BorderRadius.circular(100),
                    border: Border.all(color: Colors.white, width: 2),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.local_fire_department, size: 14, color: Colors.white),
                      SizedBox(width: 2),
                      Text('Hero', style: TextStyle(fontFamily: 'Inter', fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(name, style: const TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 4),
          const Text('Impact Level: Green Hero', style: TextStyle(fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.accent)),
          const SizedBox(height: 8),
          const Text(
            "Leading the charge in Kigali's food rescue mission. Every meal saved counts.",
            textAlign: TextAlign.center,
            style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}

class _StatsGrid extends StatelessWidget {
  const _StatsGrid();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: _StatCard(icon: Icons.scale_rounded, value: '45 KG', label: 'Food Saved', iconBg: const Color(0xFFE6F6F0), iconColor: AppColors.accent)),
        const SizedBox(width: 12),
        Expanded(child: _StatCard(icon: Icons.co2_rounded, value: '112 KG', label: 'CO2 Offset', iconBg: const Color(0xFFE6EEFF), iconColor: const Color(0xFF34BDD7))),
        const SizedBox(width: 12),
        Expanded(child: _StatCard(icon: Icons.savings_rounded, value: '125k', label: 'RWF Saved', iconBg: const Color(0xFFFEF3E7), iconColor: AppColors.primary)),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final Color iconBg;
  final Color iconColor;

  const _StatCard({required this.icon, required this.value, required this.label, required this.iconBg, required this.iconColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border.withOpacity(0.5)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(color: iconBg, shape: BoxShape.circle),
            child: Icon(icon, color: iconColor, size: 24),
          ),
          const SizedBox(height: 12),
          Text(value, style: const TextStyle(fontFamily: 'Inter', fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontFamily: 'Inter', fontSize: 12, color: AppColors.textSecondary), textAlign: TextAlign.center),
        ],
      ),
    );
  }
}

class _BadgesSection extends StatelessWidget {
  const _BadgesSection();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.border.withOpacity(0.3)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('My Badges', style: TextStyle(fontFamily: 'Inter', fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
              TextButton(
                onPressed: () {},
                style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(0, 0), tapTargetSize: MaterialTapTargetSize.shrinkWrap),
                child: const Text('View All', style: TextStyle(fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.primary)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _Badge(icon: Icons.verified_rounded, label: 'First Rescue', bg: const Color(0xFFF2994A), color: Colors.white),
              _Badge(icon: Icons.recycling_rounded, label: 'Zero Waste', bg: const Color(0xFF75F8B3), color: const Color(0xFF005232)),
              _Badge(icon: Icons.location_city_rounded, label: 'Kigali Local', bg: const Color(0xFF34BDD7), color: const Color(0xFF004854)),
              _Badge(icon: Icons.workspace_premium_rounded, label: '100 Rescues', bg: AppColors.surfaceVariant, color: AppColors.textSecondary, isLocked: true),
            ],
          ),
        ],
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color bg;
  final Color color;
  final bool isLocked;

  const _Badge({required this.icon, required this.label, required this.bg, required this.color, this.isLocked = false});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 64,
          height: 64,
          decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
          child: Icon(icon, color: color, size: 32),
        ),
        const SizedBox(height: 8),
        SizedBox(
          width: 70,
          child: Text(
            label,
            textAlign: TextAlign.center,
            maxLines: 2,
            style: TextStyle(fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w500, color: isLocked ? AppColors.textSecondary : AppColors.textPrimary),
          ),
        ),
      ],
    );
  }
}

class _RecentRescuesSection extends StatelessWidget {
  const _RecentRescuesSection();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.border.withOpacity(0.3)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Recent Rescues', style: TextStyle(fontFamily: 'Inter', fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
          const SizedBox(height: 24),
          _TimelineItem(
            title: 'Kigali Bakery - Mix Box',
            subtitle: 'Saved 1.5kg • Yesterday',
            impact: '+3.5kg CO2',
            isLast: false,
            color: AppColors.accent,
          ),
          _TimelineItem(
            title: 'Nyarutarama Market',
            subtitle: 'Saved 3.0kg • Oct 12',
            impact: '+7.2kg CO2',
            isLast: true,
            color: AppColors.surfaceVariant,
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 12),
                side: BorderSide(color: AppColors.border.withOpacity(0.5)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text('Load More History', style: TextStyle(fontFamily: 'Inter', fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
            ),
          ),
        ],
      ),
    );
  }
}

class _TimelineItem extends StatelessWidget {
  final String title;
  final String subtitle;
  final String impact;
  final bool isLast;
  final Color color;

  const _TimelineItem({required this.title, required this.subtitle, required this.impact, required this.isLast, required this.color});

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 32,
            child: Column(
              children: [
                Container(
                  width: 16,
                  height: 16,
                  decoration: BoxDecoration(color: color, shape: BoxShape.circle, border: Border.all(color: AppColors.surfaceIvory, width: 4)),
                ),
                if (!isLast) Expanded(child: Container(width: 2, color: AppColors.surfaceVariant)),
              ],
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 24),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.surfaceIvory,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(color: AppColors.surfaceVariant, borderRadius: BorderRadius.circular(12)),
                      child: const Icon(Icons.fastfood_rounded, color: AppColors.textSecondary),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(title, style: const TextStyle(fontFamily: 'Inter', fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                          const SizedBox(height: 4),
                          Text(subtitle, style: const TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.textSecondary)),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(color: const Color(0xFFE6F6F0), borderRadius: BorderRadius.circular(100)),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.eco_rounded, size: 14, color: AppColors.accent),
                                const SizedBox(width: 4),
                                Text(impact, style: const TextStyle(fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.accent)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReferralCard extends StatelessWidget {
  const _ReferralCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 8))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Grow the Movement', style: TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 24, fontWeight: FontWeight.w700, color: Colors.white)),
                    const SizedBox(height: 8),
                    Text('Invite friends to ChopNow and earn a free rescue meal.', style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: Colors.white.withOpacity(0.8))),
                  ],
                ),
              ),
              const Icon(Icons.diversity_3_rounded, size: 64, color: Color(0xFFF2994A)),
            ],
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withOpacity(0.2)),
            ),
            child: Row(
              children: [
                const Expanded(
                  child: Padding(
                    padding: EdgeInsets.symmetric(horizontal: 12),
                    child: Text('CHOP-AMINA-24', style: TextStyle(fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white, letterSpacing: 1.5)),
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    HapticFeedback.lightImpact();
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Copied to clipboard!')));
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppColors.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
                  ),
                  child: const Text('Copy', style: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w700)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

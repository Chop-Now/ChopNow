import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/animations/scale_tap.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});
  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  bool _pushNotifications = true;
  bool _emailNotifications = true;
  bool _orderUpdates = true;
  bool _promoAlerts = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Settings', style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      body: ListView(
        children: [
          // Notifications Section
          _SectionHeader('Notifications'),
          _SwitchTile(
            icon: Icons.notifications_active_outlined,
            label: 'Push Notifications',
            subtitle: 'Order updates, deals, and reminders',
            value: _pushNotifications,
            onChanged: (v) { setState(() => _pushNotifications = v); HapticFeedback.selectionClick(); },
          ),
          _SwitchTile(
            icon: Icons.email_outlined,
            label: 'Email Notifications',
            subtitle: 'Receipts, newsletters and offers',
            value: _emailNotifications,
            onChanged: (v) { setState(() => _emailNotifications = v); HapticFeedback.selectionClick(); },
          ),
          _SwitchTile(
            icon: Icons.receipt_long_outlined,
            label: 'Order Status Updates',
            subtitle: 'Be notified when your order changes',
            value: _orderUpdates,
            onChanged: (v) { setState(() => _orderUpdates = v); HapticFeedback.selectionClick(); },
          ),
          _SwitchTile(
            icon: Icons.local_offer_outlined,
            label: 'Promotional Alerts',
            subtitle: 'Flash deals and exclusive discounts',
            value: _promoAlerts,
            onChanged: (v) { setState(() => _promoAlerts = v); HapticFeedback.selectionClick(); },
          ),

          const SizedBox(height: 8),
          // Account Section
          _SectionHeader('Account'),
          _NavTile(icon: Icons.person_outline_rounded, label: 'Edit Profile', onTap: () => context.push('/profile/edit')),
          _NavTile(icon: Icons.lock_outline_rounded, label: 'Change Password',
              onTap: () => context.push('/profile/edit')),
          _NavTile(icon: Icons.location_on_outlined, label: 'Saved Addresses', onTap: () => context.push('/profile/addresses')),

          const SizedBox(height: 8),
          // Vendor section (if business owner)
          Consumer(builder: (_, ref, __) {
            final user = ref.watch(currentUserProvider);
            if (user?.isBusinessOwner != true) return const SizedBox.shrink();
            return Column(children: [
              _SectionHeader('Business'),
              _NavTile(icon: Icons.storefront_outlined, label: 'My Businesses', onTap: () => context.go('/business/dashboard')),
              _NavTile(icon: Icons.payments_outlined, label: 'Payouts & Earnings', onTap: () {}),
            ]);
          }),

          const SizedBox(height: 8),
          // App section
          _SectionHeader('App'),
          _NavTile(icon: Icons.info_outline_rounded, label: 'About ChopNow', onTap: () => _showAbout(context)),
          _NavTile(icon: Icons.privacy_tip_outlined, label: 'Privacy Policy', onTap: () {}),
          _NavTile(icon: Icons.assignment_outlined, label: 'Terms of Service', onTap: () {}),
          _NavTile(icon: Icons.bug_report_outlined, label: 'Report a Problem', onTap: () {}),

          const SizedBox(height: 8),
          // Danger zone
          _SectionHeader('Danger Zone'),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(children: [
              ScaleTap(
                onTap: () => _confirmSignOut(context, ref),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(
                    color: AppColors.errorSurface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
                  ),
                  child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(Icons.logout_rounded, color: AppColors.error, size: 20),
                    SizedBox(width: 8),
                    Text('Sign Out', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w700)),
                  ]),
                ),
              ),
              const SizedBox(height: 10),
              ScaleTap(
                onTap: () => _showDeleteAccount(context),
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
                  child: const Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(Icons.delete_forever_rounded, color: AppColors.textSecondary, size: 20),
                    SizedBox(width: 8),
                    Text('Delete Account', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                  ]),
                ),
              ),
            ]),
          ),

          const SizedBox(height: 8),
          const Center(child: Text('ChopNow v1.0.0\nBuilt with ❤️ in Africa',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 11, color: AppColors.textTertiary, height: 1.6))),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  void _showAbout(BuildContext context) {
    showDialog(context: context, builder: (_) => AlertDialog(
      title: const Text('About ChopNow', style: TextStyle(fontWeight: FontWeight.w700)),
      content: const Text('ChopNow helps you rescue surplus food from local restaurants and cafés at up to 70% off, reducing food waste and saving the planet — one meal at a time. 🌿', style: TextStyle(height: 1.5)),
      actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cool!'))],
    ));
  }

  void _confirmSignOut(BuildContext context, WidgetRef ref) {
    showDialog(context: context, builder: (_) => AlertDialog(
      title: const Text('Sign Out?', style: TextStyle(fontWeight: FontWeight.w700)),
      content: const Text('You will need to sign in again to access your account.'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
        TextButton(onPressed: () {
          ref.read(authProvider.notifier).logout();
          Navigator.pop(context);
        }, child: const Text('Sign Out', style: TextStyle(color: AppColors.error))),
      ],
    ));
  }

  void _showDeleteAccount(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Please contact support@chopnow.app to delete your account.')),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader(this.title);
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 16, 16, 6),
    child: Text(title.toUpperCase(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textSecondary, letterSpacing: 0.8)),
  );
}

class _SwitchTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;
  const _SwitchTile({required this.icon, required this.label, this.subtitle, required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) => Container(
    color: AppColors.surface,
    child: SwitchListTile(
      secondary: Container(width: 36, height: 36, decoration: BoxDecoration(color: AppColors.primarySurface, borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: AppColors.primary, size: 19)),
      title: Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
      subtitle: subtitle != null ? Text(subtitle!, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)) : null,
      value: value,
      onChanged: onChanged,
      activeColor: AppColors.primary,
    ),
  );
}

class _NavTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _NavTile({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) => Container(
    color: AppColors.surface,
    child: ListTile(
      leading: Container(width: 36, height: 36, decoration: BoxDecoration(color: AppColors.primarySurface, borderRadius: BorderRadius.circular(10)),
          child: Icon(icon, color: AppColors.primary, size: 19)),
      title: Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
      trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textSecondary, size: 20),
      onTap: onTap,
    ),
  );
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/business_provider.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/models/business_model.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/feedback/cn_states.dart';

class BusinessDashboardScreen extends ConsumerWidget {
  const BusinessDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncBusinesses = ref.watch(myBusinessesProvider);
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Business Hub',
                style: TextStyle(
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                    fontSize: 18)),
            Text('Welcome back, ${user?.firstName ?? 'Owner'}',
                style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w500)),
          ],
        ),
        backgroundColor: AppColors.surface,
        automaticallyImplyLeading: false,
        elevation: 0,
        actions: [
          TextButton.icon(
            icon: const Icon(Icons.shopping_bag_outlined,
                color: AppColors.primary, size: 18),
            label: const Text('Buyer Mode',
                style: TextStyle(
                    color: AppColors.primary,
                    fontSize: 12,
                    fontWeight: FontWeight.bold)),
            onPressed: () async {
              await ref.read(authProvider.notifier).switchRole('consumer');
              if (context.mounted) context.go('/home');
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications_outlined,
                color: AppColors.textPrimary),
            onPressed: () => context.push('/notifications'),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/business/create'),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_business_rounded, color: Colors.white),
        label: const Text('Add Business',
            style: TextStyle(color: AppColors.surface, fontWeight: FontWeight.w700)),
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async => ref.invalidate(myBusinessesProvider),
        child: asyncBusinesses.when(
          loading: () => const Center(
              child: CircularProgressIndicator(color: AppColors.primary)),
          error: (e, _) => CnErrorState(
              message: e.toString(),
              onRetry: () => ref.invalidate(myBusinessesProvider)),
          data: (businesses) {
            if (businesses.isEmpty) {
              return CnEmptyState(
                title: 'No businesses yet',
                subtitle:
                    'Create your first business to start selling rescued food',
                icon: Icons.storefront_outlined,
                actionLabel: 'Create Business',
                onAction: () => context.push('/business/create'),
              );
            }
            final business = businesses.first;
            if (!business.isApproved) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (business.isPending) {
                  context.go('/business/pending-review');
                } else {
                  context.go('/business/verify');
                }
              });
              return const Center(
                  child: CircularProgressIndicator(color: AppColors.primary));
            }
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                ...businesses.map((b) => _BusinessCard(business: b)),
                const SizedBox(height: 80), // FAB space
              ],
            );
          },
        ),
      ),
    );
  }
}

class _BusinessCard extends StatelessWidget {
  final Business business;
  const _BusinessCard({required this.business});

  @override
  Widget build(BuildContext context) {
    if (business.isPending) {
      return Container(
        margin: const EdgeInsets.only(bottom: 14),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.warningSurface,
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Row(children: [
          Icon(Icons.hourglass_top_rounded, size: 24, color: AppColors.warning),
          SizedBox(width: 12),
          Expanded(
              child: Text('Awaiting admin approval (24-48 hrs)',
                  style: TextStyle(fontSize: 14, color: AppColors.warning, fontWeight: FontWeight.w600))),
        ]),
      );
    }

    final totalRevenue = (business.stats?['totalRevenue'] as num?)?.toDouble() ?? 0.0;
    final totalOrders = (business.stats?['totalOrders'] as num?)?.toInt() ?? 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Top Card (Logo, Name, Badge)
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.border),
            boxShadow: [
              BoxShadow(
                  color: AppColors.char.withValues(alpha: 0.04),
                  blurRadius: 10,
                  offset: const Offset(0, 4))
            ],
          ),
          child: Row(
            children: [
              // Logo
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  color: AppColors.primarySurface,
                  image: business.logo != null &&
                          (business.logo!.startsWith('http://') ||
                              business.logo!.startsWith('https://'))
                      ? DecorationImage(
                          image: NetworkImage(business.logo!), fit: BoxFit.cover)
                      : null,
                ),
                child: business.logo == null
                    ? const Icon(Icons.storefront_rounded,
                        color: AppColors.primary, size: 28)
                    : null,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(business.name,
                        style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary)),
                    const SizedBox(height: 4),
                    Text(business.type ?? 'Business',
                        style: const TextStyle(
                            fontSize: 13, color: AppColors.textSecondary)),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              _StatusBadge(status: business.status),
            ],
          ),
        ),
        
        const SizedBox(height: 20),
        
        // Performance Section
        const Text('Performance',
            style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary)),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _MetricCard(
                title: 'Total Revenue',
                value: '\$${totalRevenue.toStringAsFixed(2)}',
                icon: Icons.account_balance_wallet_rounded,
                iconColor: AppColors.primary,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _MetricCard(
                title: 'Orders',
                value: '$totalOrders',
                icon: Icons.shopping_bag_rounded,
                iconColor: Colors.orange,
              ),
            ),
          ],
        ),

        const SizedBox(height: 20),

        // Quick Actions
        const Text('Quick Actions',
            style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary)),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _QuickActionItem(
                icon: Icons.list_alt_rounded,
                label: 'Listings',
                onTap: () => context.push('/business/listings')),
            _QuickActionItem(
                icon: Icons.receipt_long_rounded,
                label: 'Orders',
                onTap: () => context.push('/business/orders')),
            _QuickActionItem(
                icon: Icons.account_balance_wallet_rounded,
                label: 'Payouts',
                onTap: () => context.push('/business/payouts')),
            _QuickActionItem(
                icon: Icons.bar_chart_rounded,
                label: 'Analytics',
                onTap: () => context.push('/business/analytics')),
          ],
        ),
        
        const SizedBox(height: 24),
        
        // Add New Listing Button
        SizedBox(
          width: double.infinity,
          height: 54,
          child: ElevatedButton(
            onPressed: () => context.push('/business/listings/create'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.add_circle_outline_rounded, size: 20),
                SizedBox(width: 8),
                Text('Add New Listing',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
              ],
            ),
          ),
        ),

        const SizedBox(height: 24),
        
        // Recent Activity
        const Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Recent Activity',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary)),
            Text('See All',
                style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary)),
          ],
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(vertical: 24),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: const Column(
            children: [
              Icon(Icons.inbox_rounded, size: 32, color: AppColors.border),
              SizedBox(height: 8),
              Text('No recent activity',
                  style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
            ],
          ),
        ),
      ],
    );
  }
}

class _StatusBadge extends StatelessWidget {
  final String status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    final color = switch (status) {
      'active' || 'approved' => AppColors.success,
      'rejected' => AppColors.error,
      'suspended' => AppColors.warning,
      _ => AppColors.warning,
    };
    final label = switch (status) {
      'active' || 'approved' => 'ACTIVE',
      'rejected' => 'REJECTED',
      'suspended' => 'SUSPENDED',
      _ => 'PENDING',
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(8)),
      child: Text(label,
          style: TextStyle(
              fontSize: 11, fontWeight: FontWeight.w800, color: color)),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color iconColor;
  
  const _MetricCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
              color: AppColors.char.withValues(alpha: 0.03),
              blurRadius: 8,
              offset: const Offset(0, 2))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: iconColor.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(height: 12),
          Text(title,
              style: const TextStyle(
                  fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w500)),
          const SizedBox(height: 4),
          Text(value,
              style: const TextStyle(
                  fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        ],
      ),
    );
  }
}

class _QuickActionItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _QuickActionItem(
      {required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap();
      },
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
              boxShadow: [
                BoxShadow(
                    color: AppColors.char.withValues(alpha: 0.03),
                    blurRadius: 8,
                    offset: const Offset(0, 2))
              ],
            ),
            child: Icon(icon, color: AppColors.textPrimary, size: 24),
          ),
          const SizedBox(height: 8),
          Text(label,
              style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary)),
        ],
      ),
    );
  }
}

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
            Text('Hello, ${user?.firstName ?? 'Owner'} 👋',
                style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textSecondary,
                    fontWeight: FontWeight.w400)),
          ],
        ),
        backgroundColor: AppColors.surface,
        automaticallyImplyLeading: false,
        elevation: 0,
        actions: [
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
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
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
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 8,
              offset: const Offset(0, 3))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with logo
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: Container(
              height: 90,
              decoration: BoxDecoration(
                gradient: AppColors.heroGradient,
                image: business.coverImage != null &&
                        (business.coverImage!.startsWith('http://') ||
                            business.coverImage!.startsWith('https://'))
                    ? DecorationImage(
                        image: NetworkImage(business.coverImage!),
                        fit: BoxFit.cover,
                        opacity: 0.3)
                    : null,
              ),
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  // Logo
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      width: 52,
                      height: 52,
                      color: Colors.white.withValues(alpha: 0.2),
                      child: business.logo != null &&
                              (business.logo!.startsWith('http://') ||
                                  business.logo!.startsWith('https://'))
                          ? Image.network(business.logo!, fit: BoxFit.cover)
                          : const Center(
                              child:
                                  Text('🏪', style: TextStyle(fontSize: 24))),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(business.name,
                            style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: Colors.white)),
                        Text(business.type ?? '',
                            style: const TextStyle(
                                fontSize: 12, color: Colors.white70)),
                      ],
                    ),
                  ),
                  _StatusChip(status: business.status),
                ],
              ),
            ),
          ),
          // Actions
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (business.isPending)
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                        color: AppColors.warningSurface,
                        borderRadius: BorderRadius.circular(10)),
                    child: const Row(children: [
                      Icon(Icons.hourglass_top_rounded,
                          size: 16, color: AppColors.warning),
                      SizedBox(width: 6),
                      Expanded(
                          child: Text('Awaiting admin approval (24-48 hrs)',
                              style: TextStyle(
                                  fontSize: 12, color: AppColors.warning))),
                    ]),
                  )
                else if (business.isApproved) ...[
                  Row(children: [
                    Expanded(
                        child: _ActionBtn(
                            icon: Icons.list_alt_rounded,
                            label: 'Listings',
                            onTap: () => context.push('/business/listings'))),
                    const SizedBox(width: 8),
                    Expanded(
                        child: _ActionBtn(
                            icon: Icons.receipt_long_rounded,
                            label: 'Orders',
                            onTap: () => context.push('/business/orders'))),
                    const SizedBox(width: 8),
                    Expanded(
                        child: _ActionBtn(
                            icon: Icons.payments_outlined,
                            label: 'Payouts',
                            onTap: () => context.push('/business/payouts'))),
                  ]),
                  const SizedBox(height: 10),
                  Row(children: [
                    Expanded(
                        child: _ActionBtn(
                            icon: Icons.analytics_outlined,
                            label: 'Analytics',
                            onTap: () => context.push('/business/analytics'))),
                    const SizedBox(width: 8),
                    Expanded(
                        child: _ActionBtn(
                            icon: Icons.add_circle_outline_rounded,
                            label: 'Add Listing',
                            onTap: () =>
                                context.push('/business/listings/create'))),
                  ]),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String status;
  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    final color = switch (status) {
      'approved' => AppColors.success,
      'rejected' => AppColors.error,
      'suspended' => AppColors.warning,
      _ => AppColors.warning,
    };
    final label = switch (status) {
      'approved' => '✅ Active',
      'rejected' => '❌ Rejected',
      'suspended' => '⚠ Suspended',
      _ => '⏳ Pending',
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(100)),
      child: Text(label,
          style: TextStyle(
              fontSize: 11, fontWeight: FontWeight.w700, color: color)),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _ActionBtn(
      {required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.primarySurface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
        ),
        child: Column(children: [
          Icon(icon, color: AppColors.primary, size: 20),
          const SizedBox(height: 4),
          Text(label,
              style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary)),
        ]),
      ),
    );
  }
}

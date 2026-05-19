import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/business_provider.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/models/business_model.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/feedback/cn_states.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';
import '../../shared/animations/scale_tap.dart';

class BusinessDashboardScreen extends ConsumerWidget {
  const BusinessDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncBusinesses = ref.watch(myBusinessesProvider);
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      backgroundColor: AppColors.surfaceIvory,
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async => ref.invalidate(myBusinessesProvider),
        child: asyncBusinesses.when(
          loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
          error: (e, _) => CnErrorState(message: e.toString(), onRetry: () => ref.invalidate(myBusinessesProvider)),
          data: (businesses) {
            if (businesses.isEmpty) {
              return Center(
                child: CnEmptyState(
                  title: 'No businesses yet',
                  subtitle: 'Create your first business to start selling rescued food',
                  icon: Icons.storefront_outlined,
                  actionLabel: 'Create Business',
                  onAction: () => context.push('/business/create'),
                ),
              );
            }

            final business = businesses.first;

            return CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
              slivers: [
                SliverAppBar(
                  pinned: true,
                  backgroundColor: AppColors.surfaceIvory,
                  elevation: 0,
                  scrolledUnderElevation: 0,
                  title: Row(
                    children: [
                      const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 24),
                      const SizedBox(width: 8),
                      const Text('ChopNow', style: TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.primary)),
                    ],
                  ),
                  actions: [
                    if (business.name.isNotEmpty)
                      Center(child: Text(business.name, style: const TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.textSecondary))),
                    const SizedBox(width: 12),
                    Padding(
                      padding: const EdgeInsets.only(right: 16),
                      child: Container(
                        width: 32, height: 32,
                        decoration: BoxDecoration(
                          color: AppColors.surfaceVariant,
                          shape: BoxShape.circle,
                          image: business.logo != null ? DecorationImage(image: NetworkImage(business.logo!), fit: BoxFit.cover) : null,
                        ),
                        child: business.logo == null ? const Center(child: Text('🏪')) : null,
                      ),
                    ),
                  ],
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Header & Quick Action
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Dashboard', style: TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Container(width: 8, height: 8, decoration: const BoxDecoration(color: AppColors.accent, shape: BoxShape.circle)),
                                    const SizedBox(width: 8),
                                    const Text('Store Active • Receiving Orders', style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.textSecondary)),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        ScaleTap(
                          onTap: () {},
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.3), blurRadius: 8, offset: const Offset(0, 2))]),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: const [
                                Icon(Icons.add_circle_rounded, color: Colors.white, size: 20),
                                SizedBox(width: 8),
                                Text('Quick Upload Surplus', style: TextStyle(fontFamily: 'Inter', fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Metrics Bento Grid
                        LayoutBuilder(
                          builder: (context, constraints) {
                            final w = (constraints.maxWidth - 16) / 2;
                            return Wrap(
                              spacing: 16, runSpacing: 16,
                              children: [
                                _MetricCard(width: w, label: "Today's Revenue", value: 'RWF 45k', subtext: '12% vs yesterday', subIcon: Icons.arrow_upward_rounded, icon: Icons.payments_rounded, iconColor: AppColors.primary),
                                _MetricCard(width: w, label: 'Meals Saved', value: '18', subtext: 'Today', icon: Icons.eco_rounded, iconColor: AppColors.accent),
                                _MetricCard(width: w, label: 'Active Orders', value: '5', subtext: 'Awaiting pickup', icon: Icons.receipt_long_rounded, iconColor: const Color(0xFF34bdd7)), // tertiary
                                _ImpactScoreCard(width: w),
                              ],
                            );
                          }
                        ),
                        const SizedBox(height: 32),

                        // Active Inventory
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Active Inventory', style: TextStyle(fontFamily: 'Inter', fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                            TextButton(onPressed: () => context.go('/business/listings'), child: const Text('View All', style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.primary))),
                          ],
                        ),
                        const SizedBox(height: 16),
                        _InventoryItemCard(
                          title: 'Surplus Jollof Bowl',
                          originalPrice: 'RWF 5,000',
                          price: 'RWF 2,500',
                          qty: '12 left',
                          timeLabel: 'Exp. in 2h',
                          imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBw4E2HQlRa-bhxo1YFUNnhwFPvziyWPAftFUtYHoI1wqxzPMh8Zc8UOk-NIYyEmO08RVaIIw8h4K59UNiCYDKzYncJyxLkuyTcXP7RfVp5Eb6MvzANqiCLsJP-frIXVn9TlyIw9eJ2kNSptgvaWgDrTaGnhOWHIHeVgQ1PfFto-YkxNPb59BuS4MajOYVPMVtgmgWPkqqaf42gXzY9VJ1FBtlGYI9gRhfKncujaPMXdYizI7dnN-MhaxW56pAgubu8QyRUWu1L7QVl',
                          isActive: true,
                        ),
                        const SizedBox(height: 16),
                        _InventoryItemCard(
                          title: 'End-of-day Burger Pack',
                          price: 'RWF 3,000',
                          qty: 'SOLD OUT',
                          imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCrL8jvrjfmTv7X3whHkE2_CHJlkJV9o_ZspR_HVIavSy5Y9dCP3r5_jK2juwmzcKxN3SYyNprA7Oo7ywPqWlxjJuUbZ43AIpg8REPT-JxRl8fEFs5-sxqOgVwIUjQX_PdNedH3oLbb8rCp71IVIfvMnlFdLxgxzPiSb7DnIlvMJI6AQVGnTtxAgQKLJNaYSynKXSFf1ekXQKpJCID_ytfhxYhMsJnZ6sepV5xM58vrPBBwAPDWuUiujCA1e4bpVODMtZ4uCfLLl1m',
                          isActive: false,
                        ),
                        const SizedBox(height: 32),

                        // Recent Orders
                        const Text('Recent Orders', style: TextStyle(fontFamily: 'Inter', fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 4))],
                          ),
                          child: Column(
                            children: [
                              _OrderListItem(id: '#8821', items: '2x Surplus Jollof Bowl', initial: 'AJ', amount: 'RWF 5,000', time: 'Pickup: 14:30', isCompleted: false),
                              const Divider(height: 24, color: AppColors.surfaceVariant),
                              _OrderListItem(id: '#8820', items: '1x Veggie Wrap', initial: 'MK', amount: 'RWF 1,500', time: 'Completed', isCompleted: true),
                              const SizedBox(height: 16),
                              TextButton(onPressed: () => context.go('/business/orders'), child: const Text('View All Orders', style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.primary))),
                            ],
                          ),
                        ),
                        
                        const SizedBox(height: 40),
                      ],
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final double width;
  final String label, value, subtext;
  final IconData icon;
  final Color iconColor;
  final IconData? subIcon;

  const _MetricCard({required this.width, required this.label, required this.value, required this.subtext, required this.icon, required this.iconColor, this.subIcon});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.textSecondary)),
              Icon(icon, color: iconColor, size: 20),
            ],
          ),
          const SizedBox(height: 12),
          Text(value, style: const TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 4),
          Row(
            children: [
              if (subIcon != null) ...[Icon(subIcon, color: AppColors.accent, size: 14), const SizedBox(width: 4)],
              Text(subtext, style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: subIcon != null ? AppColors.accent : AppColors.textSecondary)),
            ],
          ),
        ],
      ),
    );
  }
}

class _ImpactScoreCard extends StatelessWidget {
  final double width;
  const _ImpactScoreCard({required this.width});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFF2994A), // primary-container
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 4))],
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(
            right: -20, top: -20,
            child: Icon(Icons.military_tech_rounded, size: 100, color: Colors.black.withOpacity(0.1)),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Impact Score', style: TextStyle(fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF663500))), // on-primary-container
              const SizedBox(height: 12),
              const Text('Gold Saver', style: TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 24, fontWeight: FontWeight.w700, color: Color(0xFF2f1500))), // on-primary-fixed
              const SizedBox(height: 4),
              Row(
                children: const [
                  Icon(Icons.trending_up_rounded, color: Color(0xFF663500), size: 14),
                  SizedBox(width: 4),
                  Text('Top 5% this month', style: TextStyle(fontFamily: 'Inter', fontSize: 12, color: Color(0xFF663500))),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _InventoryItemCard extends StatelessWidget {
  final String title, price, qty, imageUrl;
  final String? originalPrice, timeLabel;
  final bool isActive;

  const _InventoryItemCard({required this.title, required this.price, required this.qty, required this.imageUrl, this.originalPrice, this.timeLabel, required this.isActive});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 4))],
      ),
      child: Opacity(
        opacity: isActive ? 1.0 : 0.6,
        child: Row(
          children: [
            Container(
              width: 80, height: 80,
              decoration: BoxDecoration(color: AppColors.surfaceVariant, borderRadius: BorderRadius.circular(12)),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: ColorFiltered(
                  colorFilter: isActive ? const ColorFilter.mode(Colors.transparent, BlendMode.multiply) : const ColorFilter.matrix(<double>[
                    0.2126, 0.7152, 0.0722, 0, 0,
                    0.2126, 0.7152, 0.0722, 0, 0,
                    0.2126, 0.7152, 0.0722, 0, 0,
                    0, 0, 0, 1, 0,
                  ]),
                  child: Image.network(imageUrl, fit: BoxFit.cover),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(child: Text(title, style: const TextStyle(fontFamily: 'Inter', fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textPrimary), maxLines: 1, overflow: TextOverflow.ellipsis)),
                      Switch(value: isActive, onChanged: (v) {}, activeColor: AppColors.accent, materialTapTargetSize: MaterialTapTargetSize.shrinkWrap),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      if (originalPrice != null) ...[
                        Text(originalPrice!, style: const TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.textSecondary, decoration: TextDecoration.lineThrough)),
                        const SizedBox(width: 8),
                      ],
                      Text(price, style: const TextStyle(fontFamily: 'Inter', fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.primary)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (isActive)
                    Row(
                      children: [
                        const Icon(Icons.inventory_2_rounded, size: 16, color: AppColors.textSecondary),
                        const SizedBox(width: 4),
                        Text(qty, style: const TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.textSecondary)),
                        const SizedBox(width: 16),
                        const Icon(Icons.schedule_rounded, size: 16, color: AppColors.error),
                        const SizedBox(width: 4),
                        Text(timeLabel ?? '', style: const TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.error)),
                      ],
                    )
                  else
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: AppColors.surfaceVariant, borderRadius: BorderRadius.circular(100)),
                      child: const Text('SOLD OUT', style: TextStyle(fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textSecondary, letterSpacing: 0.5)),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OrderListItem extends StatelessWidget {
  final String id, items, initial, amount, time;
  final bool isCompleted;

  const _OrderListItem({required this.id, required this.items, required this.initial, required this.amount, required this.time, required this.isCompleted});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 40, height: 40,
          decoration: BoxDecoration(color: isCompleted ? AppColors.surfaceVariant : const Color(0xFF75f8b3), shape: BoxShape.circle),
          child: Center(child: Text(initial, style: TextStyle(fontFamily: 'Inter', fontSize: 18, fontWeight: FontWeight.w600, color: isCompleted ? AppColors.textPrimary : const Color(0xFF007147)))),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Order $id', style: const TextStyle(fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
              Text(items, style: const TextStyle(fontFamily: 'Inter', fontSize: 12, color: AppColors.textSecondary)),
            ],
          ),
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(amount, style: const TextStyle(fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
            Text(time, style: TextStyle(fontFamily: 'Inter', fontSize: 12, color: isCompleted ? AppColors.accent : const Color(0xFF006878))),
          ],
        ),
      ],
    );
  }
}

import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import '../../core/theme/app_colors.dart';

class AnalyticsScreen extends StatelessWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surfaceIvory,
      appBar: AppBar(
        title: const Text('Analytics', style: TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
        backgroundColor: AppColors.surfaceIvory,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Revenue Overview ──
            FadeInUp(
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: AppColors.heroGradient,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 8))],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Total Revenue', style: TextStyle(fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w500, color: Colors.white.withOpacity(0.8))),
                    const SizedBox(height: 4),
                    const Text('RWF 1,245,000', style: TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 32, fontWeight: FontWeight.w700, color: Colors.white)),
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(100)),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.trending_up_rounded, size: 14, color: Colors.white),
                          SizedBox(width: 4),
                          Text('+23% vs last month', style: TextStyle(fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w600, color: Colors.white)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // ── Key Metrics Row ──
            FadeInUp(
              delay: const Duration(milliseconds: 100),
              child: Row(
                children: [
                  Expanded(child: _MiniMetric(label: 'Orders', value: '342', icon: Icons.receipt_long_rounded, color: AppColors.primary)),
                  const SizedBox(width: 12),
                  Expanded(child: _MiniMetric(label: 'Avg Ticket', value: 'RWF 3.6k', icon: Icons.payments_rounded, color: const Color(0xFF34BDD7))),
                  const SizedBox(width: 12),
                  Expanded(child: _MiniMetric(label: 'Repeat Rate', value: '68%', icon: Icons.loop_rounded, color: AppColors.accent)),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Weekly Trend (visual placeholder) ──
            FadeInUp(
              delay: const Duration(milliseconds: 200),
              child: Container(
                width: double.infinity,
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
                    const Text('Weekly Revenue', style: TextStyle(fontFamily: 'Inter', fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                    const SizedBox(height: 4),
                    const Text('Last 7 days performance', style: TextStyle(fontFamily: 'Inter', fontSize: 13, color: AppColors.textSecondary)),
                    const SizedBox(height: 20),
                    // Simplified bar chart
                    SizedBox(
                      height: 120,
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          _Bar(label: 'Mon', height: 0.6),
                          _Bar(label: 'Tue', height: 0.8),
                          _Bar(label: 'Wed', height: 0.45),
                          _Bar(label: 'Thu', height: 0.9),
                          _Bar(label: 'Fri', height: 1.0),
                          _Bar(label: 'Sat', height: 0.75),
                          _Bar(label: 'Sun', height: 0.55),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // ── Top Products ──
            FadeInUp(
              delay: const Duration(milliseconds: 300),
              child: Container(
                width: double.infinity,
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
                    const Text('Top Performers', style: TextStyle(fontFamily: 'Inter', fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                    const SizedBox(height: 16),
                    _TopItem(rank: 1, name: 'Mixed Pastry Box', sold: 89, revenue: 'RWF 267k'),
                    const Divider(color: AppColors.surfaceVariant, height: 20),
                    _TopItem(rank: 2, name: 'Veggie Surplus Pack', sold: 67, revenue: 'RWF 134k'),
                    const Divider(color: AppColors.surfaceVariant, height: 20),
                    _TopItem(rank: 3, name: 'Fresh Juice Bundle', sold: 45, revenue: 'RWF 90k'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // ── Impact Metrics ──
            FadeInUp(
              delay: const Duration(milliseconds: 400),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: AppColors.impactGradient,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [BoxShadow(color: AppColors.accent.withOpacity(0.25), blurRadius: 20, offset: const Offset(0, 8))],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Environmental Impact', style: TextStyle(fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w500, color: Colors.white.withOpacity(0.8))),
                    const SizedBox(height: 12),
                    const Row(
                      children: [
                        Expanded(child: _ImpactStat(value: '320 kg', label: 'Food Rescued', icon: Icons.eco_rounded)),
                        SizedBox(width: 16),
                        Expanded(child: _ImpactStat(value: '780 kg', label: 'CO₂ Prevented', icon: Icons.cloud_outlined)),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}

class _MiniMetric extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  const _MiniMetric({required this.label, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border.withOpacity(0.3)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontFamily: 'Inter', fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontFamily: 'Inter', fontSize: 12, color: AppColors.textSecondary)),
        ],
      ),
    );
  }
}

class _Bar extends StatelessWidget {
  final String label;
  final double height;
  const _Bar({required this.label, required this.height});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 3),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 600),
              curve: Curves.easeOut,
              height: 90 * height,
              decoration: BoxDecoration(
                gradient: height >= 0.9 ? AppColors.primaryGradient : null,
                color: height < 0.9 ? AppColors.primary.withOpacity(0.15 + height * 0.3) : null,
                borderRadius: BorderRadius.circular(6),
              ),
            ),
            const SizedBox(height: 6),
            Text(label, style: const TextStyle(fontFamily: 'Inter', fontSize: 10, color: AppColors.textSecondary, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}

class _TopItem extends StatelessWidget {
  final int rank;
  final String name;
  final int sold;
  final String revenue;
  const _TopItem({required this.rank, required this.name, required this.sold, required this.revenue});

  @override
  Widget build(BuildContext context) {
    final rankColors = [AppColors.primary, AppColors.accent, const Color(0xFF34BDD7)];
    return Row(
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: rankColors[rank - 1].withOpacity(0.15),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Center(child: Text('#$rank', style: TextStyle(fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w700, color: rankColors[rank - 1]))),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name, style: const TextStyle(fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
              Text('$sold sold', style: const TextStyle(fontFamily: 'Inter', fontSize: 12, color: AppColors.textSecondary)),
            ],
          ),
        ),
        Text(revenue, style: const TextStyle(fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary)),
      ],
    );
  }
}

class _ImpactStat extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;
  const _ImpactStat({required this.value, required this.label, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: Colors.white, size: 20),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: const TextStyle(fontFamily: 'Inter', fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white)),
              Text(label, style: TextStyle(fontFamily: 'Inter', fontSize: 12, color: Colors.white.withOpacity(0.75))),
            ],
          ),
        ),
      ],
    );
  }
}

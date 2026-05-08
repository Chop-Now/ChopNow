import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/feedback/cn_states.dart';

// Provider for user impact stats
final userImpactProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final response = await ApiClient.instance.get(AppEndpoints.userImpact);
  final data = response.data;
  return data is Map<String, dynamic>
      ? (data['data'] ?? data['impact'] ?? data)
      : {};
});

class ImpactDashboardScreen extends ConsumerWidget {
  const ImpactDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final asyncImpact = ref.watch(userImpactProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Impact', style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        backgroundColor: AppColors.surface,
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async => ref.invalidate(userImpactProvider),
        child: asyncImpact.when(
          loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
          error: (e, _) => CnErrorState(
            message: 'Could not load your impact data',
            onRetry: () => ref.invalidate(userImpactProvider),
          ),
          data: (impact) => _ImpactContent(impact: impact),
        ),
      ),
    );
  }
}

class _ImpactContent extends StatelessWidget {
  final Map<String, dynamic> impact;
  const _ImpactContent({required this.impact});

  @override
  Widget build(BuildContext context) {
    final mealsRescued = impact['mealsRescued'] ?? impact['totalMeals'] ?? 0;
    final co2Saved = impact['co2Saved'] ?? impact['totalCo2'] ?? 0;
    final moneySaved = impact['moneySaved'] ?? impact['totalSavings'] ?? 0;
    final streak = impact['currentStreak'] ?? 0;
    final totalOrders = impact['totalOrders'] ?? 0;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Hero impact card
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: AppColors.impactGradient,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF00897B).withOpacity(0.35),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('🌍 Your Planet Impact', style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600)),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _ImpactStat(emoji: '🍱', value: '$mealsRescued', label: 'Meals\nRescued'),
                  Container(width: 1, height: 50, color: Colors.white24),
                  _ImpactStat(emoji: '🌿', value: '${co2Saved}g', label: 'CO₂\nSaved'),
                  Container(width: 1, height: 50, color: Colors.white24),
                  _ImpactStat(emoji: '💰', value: 'RWF\n${_formatNum(moneySaved as num)}', label: 'Money\nSaved'),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Streak & Orders Row
        Row(
          children: [
            Expanded(
              child: _StatCard(
                emoji: '🔥',
                value: '$streak',
                label: 'Day Streak',
                color: const Color(0xFFFF7043),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _StatCard(
                emoji: '📦',
                value: '$totalOrders',
                label: 'Total Orders',
                color: AppColors.primary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Badges section
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('🏆 Badges', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const SizedBox(height: 12),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: _badgesForCount(mealsRescued as int)
                    .map((b) => _BadgePill(label: b['label'] as String, earned: b['earned'] as bool))
                    .toList(),
              ),
              const SizedBox(height: 12),
              const Text(
                'Keep rescuing meals to unlock more badges!',
                style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Environmental context
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.primarySurface,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Did you know?', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary)),
              const SizedBox(height: 8),
              Text(
                _contextMessage(co2Saved as num),
                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.5),
              ),
            ],
          ),
        ),
      ],
    );
  }

  String _formatNum(num n) {
    if (n >= 1000) return '${(n / 1000).toStringAsFixed(1)}K';
    return n.toStringAsFixed(0);
  }

  String _contextMessage(num co2) {
    if (co2 <= 0) return 'Every meal you rescue keeps food out of landfill and CO₂ out of the atmosphere. Start ordering to see your impact!';
    if (co2 < 500) return 'You\'ve saved ${co2}g of CO₂ — that\'s like not driving a car for ${(co2 / 120).toStringAsFixed(1)} km!';
    return 'Amazing! You\'ve saved ${(co2 / 1000).toStringAsFixed(2)}kg of CO₂ — equivalent to planting ${(co2 / 600).round()} trees!';
  }

  List<Map<String, dynamic>> _badgesForCount(int count) => [
    {'label': '🌱 First Rescue', 'earned': count >= 1},
    {'label': '🥗 5 Meals', 'earned': count >= 5},
    {'label': '🌍 Food Hero', 'earned': count >= 10},
    {'label': '🏆 Champion', 'earned': count >= 25},
    {'label': '⭐ Legend', 'earned': count >= 50},
  ];
}

class _ImpactStat extends StatelessWidget {
  final String emoji;
  final String value;
  final String label;
  const _ImpactStat({required this.emoji, required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(emoji, style: const TextStyle(fontSize: 28)),
        const SizedBox(height: 6),
        Text(value, textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800, height: 1.2)),
        Text(label, textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white70, fontSize: 10, height: 1.3)),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String emoji;
  final String value;
  final String label;
  final Color color;
  const _StatCard({required this.emoji, required this.value, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 24)),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: color)),
              Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            ],
          ),
        ],
      ),
    );
  }
}

class _BadgePill extends StatelessWidget {
  final String label;
  final bool earned;
  const _BadgePill({required this.label, required this.earned});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        color: earned ? AppColors.primarySurface : AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: earned ? AppColors.primary : AppColors.border),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: earned ? AppColors.primary : AppColors.textTertiary,
        ),
      ),
    );
  }
}

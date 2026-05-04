import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';

class AnalyticsScreen extends StatelessWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Analytics'), backgroundColor: AppColors.surface, foregroundColor: AppColors.textPrimary, elevation: 0),
      body: const Center(child: Text('Sales charts, revenue breakdown, top listings', style: TextStyle(color: AppColors.textSecondary))),
    );
  }
}

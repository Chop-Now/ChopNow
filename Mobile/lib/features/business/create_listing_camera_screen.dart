import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:animate_do/animate_do.dart';
import '../../core/theme/app_colors.dart';

/// Camera enforcement screen — backend requires LIVE photos for listings.
/// User must take a fresh photo (no gallery pick allowed).
class CreateListingCameraScreen extends StatelessWidget {
  const CreateListingCameraScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white,
        elevation: 0,
        title: const Text('Take Live Photo', style: TextStyle(fontFamily: 'Hanken Grotesk', fontWeight: FontWeight.w700)),
        actions: [
          TextButton(
            onPressed: () => context.pop(),
            child: const Text('Cancel', style: TextStyle(fontFamily: 'Inter', color: Colors.white54, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
      body: Center(
        child: FadeInUp(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 220,
                height: 220,
                decoration: BoxDecoration(
                  border: Border.all(color: AppColors.primary.withOpacity(0.6), width: 3),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.15), blurRadius: 40, spreadRadius: 8)],
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.camera_alt_rounded, color: Colors.white.withOpacity(0.4), size: 64),
                    const SizedBox(height: 8),
                    Text('Live Preview', style: TextStyle(fontFamily: 'Inter', fontSize: 13, color: Colors.white.withOpacity(0.3))),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              const Text(
                'Take a LIVE photo of your food',
                textAlign: TextAlign.center,
                style: TextStyle(fontFamily: 'Hanken Grotesk', color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 8),
              Text(
                'Gallery uploads not allowed for food safety',
                textAlign: TextAlign.center,
                style: TextStyle(fontFamily: 'Inter', color: Colors.white.withOpacity(0.5), fontSize: 14),
              ),
              const SizedBox(height: 40),
              GestureDetector(
                onTap: () => context.push('/business/listings/create'),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                  decoration: BoxDecoration(
                    gradient: AppColors.heroGradient,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.4), blurRadius: 20, offset: const Offset(0, 8))],
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.camera_alt_rounded, color: Colors.white, size: 20),
                      SizedBox(width: 10),
                      Text('Capture Photo', style: TextStyle(fontFamily: 'Inter', color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/theme/app_colors.dart';

/// Camera enforcement screen — backend requires LIVE photos for listings.
/// User must take a fresh photo (no gallery pick allowed).
class CreateListingCameraScreen extends StatelessWidget {
  const CreateListingCameraScreen({super.key});

  Future<void> _capturePhoto(BuildContext context) async {
    try {
      final picker = ImagePicker();
      final image = await picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 80,
      );
      if (image != null) {
        if (context.mounted) {
          context.push(
              '/business/listings/create?imagePath=${Uri.encodeComponent(image.path)}');
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not open camera: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        title: const Text('Take Live Photo'),
        actions: [
          TextButton(
            onPressed: () => context.pop(),
            child:
                const Text('Cancel', style: TextStyle(color: Colors.white70)),
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.primary, width: 2),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(Icons.camera_alt_rounded,
                  color: Colors.white54, size: 64),
            ),
            const SizedBox(height: 20),
            const Text(
              'Take a LIVE photo of your food\nNo gallery uploads allowed',
              textAlign: TextAlign.center,
              style:
                  TextStyle(color: Colors.white70, fontSize: 13, height: 1.6),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: () => _capturePhoto(context),
              icon: const Icon(Icons.camera_alt_rounded),
              label: const Text('Capture Photo'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding:
                    const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

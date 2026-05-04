import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../shared/widgets/inputs/cn_text_field.dart';
import '../../../shared/widgets/buttons/cn_buttons.dart';

class CreateListingDetailsScreen extends StatelessWidget {
  const CreateListingDetailsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Listing Details'), backgroundColor: AppColors.surface, foregroundColor: AppColors.textPrimary, elevation: 0),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(children: [
          CnTextField(label: 'Food name / title'),
          const SizedBox(height: 16),
          CnTextField(label: 'Original price (RWF)', keyboardType: TextInputType.number),
          const SizedBox(height: 16),
          CnTextField(label: 'Discounted price (RWF)', keyboardType: TextInputType.number),
          const SizedBox(height: 16),
          CnTextField(label: 'Quantity available', keyboardType: TextInputType.number),
          const SizedBox(height: 16),
          CnTextField(label: 'Description (allergens, freshness)', maxLines: 3),
          const SizedBox(height: 24),
          CnPrimaryButton(label: 'Publish Listing', onTap: () => Navigator.of(context).pop()),
        ]),
      ),
    );
  }
}

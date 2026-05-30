import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/animations/scale_tap.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';
import '../../shared/widgets/inputs/cn_text_field.dart';

class BecomeRiderScreen extends ConsumerStatefulWidget {
  const BecomeRiderScreen({super.key});

  @override
  ConsumerState<BecomeRiderScreen> createState() => _BecomeRiderScreenState();
}

class _BecomeRiderScreenState extends ConsumerState<BecomeRiderScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneCtrl = TextEditingController();
  final _idCtrl = TextEditingController();
  final _plateCtrl = TextEditingController();

  String _selectedVehicle = 'bicycle';
  bool _agreedToTerms = false;
  bool _isLoading = false;
  String? _error;

  final List<Map<String, dynamic>> _vehicles = [
    {'key': 'bicycle', 'label': 'Bicycle', 'icon': Icons.directions_bike_rounded},
    {'key': 'motorcycle', 'label': 'Motorcycle', 'icon': Icons.motorcycle_rounded},
    {'key': 'car', 'label': 'Car', 'icon': Icons.directions_car_rounded},
    {'key': 'walking', 'label': 'Walking', 'icon': Icons.directions_walk_rounded},
  ];

  @override
  void initState() {
    super.initState();
    // Pre-populate phone if available
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = ref.read(currentUserProvider);
      if (user?.phone != null && user!.phone!.isNotEmpty) {
        _phoneCtrl.text = user.phone!;
      }
    });
  }

  @override
  void dispose() {
    _phoneCtrl.dispose();
    _idCtrl.dispose();
    _plateCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_agreedToTerms) {
      setState(() => _error = 'You must agree to the terms and conditions');
      return;
    }

    HapticFeedback.mediumImpact();
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // If user is editing their profile to add phone, we update it
      final user = ref.read(currentUserProvider);
      if (user?.phone == null || user?.phone != _phoneCtrl.text.trim()) {
        await ref.read(authProvider.notifier).updateProfile(
          firstName: user?.firstName ?? '',
          lastName: user?.lastName ?? '',
          phone: _phoneCtrl.text.trim(),
        );
      }

      // Add Rider Role
      await ref.read(authProvider.notifier).addRiderRole();
      
      HapticFeedback.heavyImpact();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Rider profile activated! Welcome aboard! 🚴🎉'),
            backgroundColor: AppColors.primary,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        // GoRouter will automatically redirect based on role-redirection, 
        // but just in case, we route to the dashboard.
        context.go('/rider/dashboard');
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final showPlate = _selectedVehicle == 'motorcycle' || _selectedVehicle == 'car';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Earn with ChopNow', style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero banner card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: AppColors.heroGradient,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(color: AppColors.primary.withOpacity(0.2), blurRadius: 10, offset: const Offset(0, 4)),
                  ],
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Deliver Food & Fuel Change 🌍',
                      style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'Earn money on your own schedule. Rescue surplus meals and deliver them to eager buyers nearby.',
                      style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Vehicle selection
              const Text('Select Your Vehicle', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const SizedBox(height: 12),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.4,
                ),
                itemCount: _vehicles.length,
                itemBuilder: (context, index) {
                  final v = _vehicles[index];
                  final selected = _selectedVehicle == v['key'];
                  return ScaleTap(
                    onTap: () {
                      HapticFeedback.selectionClick();
                      setState(() => _selectedVehicle = v['key']);
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      decoration: BoxDecoration(
                        color: selected ? AppColors.primarySurface : AppColors.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: selected ? AppColors.primary : AppColors.border, width: 2),
                        boxShadow: selected
                            ? [BoxShadow(color: AppColors.primary.withOpacity(0.08), blurRadius: 8, offset: const Offset(0, 2))]
                            : null,
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(v['icon'] as IconData, size: 28, color: selected ? AppColors.primary : AppColors.textSecondary),
                          const SizedBox(height: 8),
                          Text(
                            v['label'] as String,
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: selected ? AppColors.primary : AppColors.textPrimary),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 24),

              // Inputs
              CnTextField(
                label: 'Phone Number *',
                controller: _phoneCtrl,
                hint: '+250 7XX XXX XXX',
                keyboardType: TextInputType.phone,
                validator: (v) => v == null || v.trim().length < 9 ? 'Please enter a valid phone number' : null,
              ),
              const SizedBox(height: 16),
              CnTextField(
                label: 'National ID or License Number *',
                controller: _idCtrl,
                hint: 'Enter your government ID or license no.',
                validator: (v) => v == null || v.trim().isEmpty ? 'Required for verification' : null,
              ),
              if (showPlate) ...[
                const SizedBox(height: 16),
                CnTextField(
                  label: 'Vehicle License Plate *',
                  controller: _plateCtrl,
                  hint: 'e.g. RA 123 A',
                  validator: (v) => v == null || v.trim().isEmpty ? 'Required for motor vehicles' : null,
                ),
              ],
              const SizedBox(height: 20),

              // Terms agreement
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    height: 24,
                    width: 24,
                    child: Checkbox(
                      value: _agreedToTerms,
                      activeColor: AppColors.primary,
                      onChanged: (v) => setState(() => _agreedToTerms = v ?? false),
                    ),
                  ),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Text(
                      'I agree to the ChopNow Rider Terms of Service and Code of Conduct. I verify that I have the required vehicle insurance and authorization to operate.',
                      style: TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4),
                    ),
                  ),
                ],
              ),

              if (_error != null) ...[
                const SizedBox(height: 16),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: AppColors.errorSurface, borderRadius: BorderRadius.circular(12)),
                  child: Text(_error!, style: const TextStyle(color: AppColors.error, fontSize: 13, fontWeight: FontWeight.w500)),
                ),
              ],

              const SizedBox(height: 32),

              CnPrimaryButton(
                label: 'Activate Rider Account',
                isLoading: _isLoading,
                onTap: _isLoading ? null : _submit,
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

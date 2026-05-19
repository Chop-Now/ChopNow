import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:animate_do/animate_do.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';
import '../../shared/widgets/inputs/cn_text_field.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Form fields
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  String _selectedRole = 'consumer';
  bool _obscurePassword = true;
  bool _agreedToTerms = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _tabController.dispose();
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isLoading = authState is AuthLoading;
    final error = authState is AuthError ? authState.message : null;

    ref.listen(authProvider, (_, next) {
      if (next is AuthAuthenticated) {
        HapticFeedback.heavyImpact();
        final role = next.activeRole;
        if (role == 'business_owner') {
          context.go('/business/dashboard');
        } else {
          context.go('/home');
        }
      }
    });

    return Scaffold(
      backgroundColor: AppColors.surfaceIvory,
      appBar: AppBar(
        backgroundColor: AppColors.surfaceIvory,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: AppColors.textPrimary),
          onPressed: () => context.pop(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),
              
              FadeInDown(
                delay: const Duration(milliseconds: 200),
                child: Hero(
                  tag: 'app_logo',
                  child: Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: AppColors.primaryContainer,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.15),
                          blurRadius: 15,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: const Center(
                      child: Icon(Icons.eco_outlined, color: AppColors.onPrimaryContainer, size: 28),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              FadeInUp(
                delay: const Duration(milliseconds: 300),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Create Account',
                      style: TextStyle(
                        fontFamily: 'Hanken Grotesk',
                        fontSize: 32,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                        letterSpacing: -1,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Join ChopNow and rescue food today 🌿',
                      style: TextStyle(
                        fontFamily: 'Inter',
                        fontSize: 16,
                        color: AppColors.textSecondary.withOpacity(0.8),
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Role picker
              FadeInUp(
                delay: const Duration(milliseconds: 400),
                child: Row(
                  children: [
                    Expanded(child: _RolePill(
                      label: '🛍 Consumer',
                      subtitle: 'Buy food',
                      selected: _selectedRole == 'consumer',
                      onTap: () => setState(() => _selectedRole = 'consumer'),
                    )),
                    const SizedBox(width: 12),
                    Expanded(child: _RolePill(
                      label: '🏪 Business',
                      subtitle: 'Sell food',
                      selected: _selectedRole == 'business_owner',
                      onTap: () => setState(() => _selectedRole = 'business_owner'),
                    )),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Form
              FadeInUp(
                delay: const Duration(milliseconds: 500),
                child: Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Expanded(child: CnTextField(
                            label: 'First Name',
                            controller: _firstNameCtrl,
                            hint: 'Jane',
                            validator: (v) => v == null || v.trim().length < 2 ? 'Required' : null,
                          )),
                          const SizedBox(width: 16),
                          Expanded(child: CnTextField(
                            label: 'Last Name',
                            controller: _lastNameCtrl,
                            hint: 'Doe',
                            validator: (v) => v == null || v.trim().length < 2 ? 'Required' : null,
                          )),
                        ],
                      ),
                      const SizedBox(height: 16),
                      CnTextField(
                        label: 'Email Address',
                        controller: _emailCtrl,
                        hint: 'jane@example.com',
                        keyboardType: TextInputType.emailAddress,
                        prefixIcon: Icons.alternate_email_rounded,
                        validator: (v) {
                          if (v == null || v.isEmpty) return 'Required';
                          if (!v.contains('@')) return 'Invalid email';
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      CnTextField(
                        label: 'Phone (optional)',
                        controller: _phoneCtrl,
                        hint: '+250 7XX XXX XXX',
                        keyboardType: TextInputType.phone,
                        prefixIcon: Icons.phone_android_rounded,
                      ),
                      const SizedBox(height: 16),
                      CnTextField(
                        label: 'Password',
                        controller: _passwordCtrl,
                        hint: 'Min 8 characters',
                        obscureText: _obscurePassword,
                        prefixIcon: Icons.lock_outline_rounded,
                        suffix: IconButton(
                          icon: Icon(_obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                              size: 20, color: AppColors.textSecondary),
                          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                        ),
                        validator: (v) {
                          if (v == null || v.length < 8) return 'Min 8 characters';
                          return null;
                        },
                      ),
                      const SizedBox(height: 24),

                      // Terms checkbox
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          SizedBox(
                            width: 24,
                            height: 24,
                            child: Checkbox(
                              value: _agreedToTerms,
                              onChanged: (v) => setState(() => _agreedToTerms = v ?? false),
                              activeColor: AppColors.primary,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                              side: BorderSide(color: AppColors.border.withOpacity(0.5), width: 1.5),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: RichText(
                              text: TextSpan(
                                style: const TextStyle(fontFamily: 'Inter', fontSize: 13, color: AppColors.textSecondary, height: 1.4),
                                children: [
                                  const TextSpan(text: 'I agree to the '),
                                  TextSpan(
                                    text: 'Terms of Service',
                                    style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600),
                                  ),
                                  const TextSpan(text: ' and '),
                                  TextSpan(
                                    text: 'Privacy Policy',
                                    style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              if (error != null) ...[
                const SizedBox(height: 16),
                ShakeX(
                  duration: const Duration(milliseconds: 500),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.error.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.error.withOpacity(0.2)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: AppColors.error, size: 20),
                        const SizedBox(width: 10),
                        Expanded(child: Text(error, style: const TextStyle(fontFamily: 'Inter', color: AppColors.error, fontSize: 14, fontWeight: FontWeight.w500))),
                      ],
                    ),
                  ),
                ),
              ],

              const SizedBox(height: 32),
              
              FadeInUp(
                delay: const Duration(milliseconds: 600),
                child: CnPrimaryButton(
                  label: _selectedRole == 'business_owner' ? 'Create Business Account' : 'Create Account',
                  isLoading: isLoading,
                  onTap: (!_agreedToTerms || isLoading) ? null : _submit,
                ),
              ),
              
              const SizedBox(height: 24),

              // Already have an account
              FadeInUp(
                delay: const Duration(milliseconds: 700),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Already have an account? ', style: TextStyle(fontFamily: 'Inter', fontSize: 15, color: AppColors.textSecondary)),
                    GestureDetector(
                      onTap: () {
                        HapticFeedback.selectionClick();
                        context.go('/auth/login');
                      },
                      child: const Text('Sign In', style: TextStyle(fontFamily: 'Inter', fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.primary)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    HapticFeedback.mediumImpact();
    if (_selectedRole == 'business_owner') {
      await ref.read(authProvider.notifier).registerAsBusinessOwner(
        firstName: _firstNameCtrl.text.trim(),
        lastName: _lastNameCtrl.text.trim(),
        email: _emailCtrl.text.trim(),
        password: _passwordCtrl.text,
        phone: _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim(),
      );
    } else {
      await ref.read(authProvider.notifier).register(
        firstName: _firstNameCtrl.text.trim(),
        lastName: _lastNameCtrl.text.trim(),
        email: _emailCtrl.text.trim(),
        password: _passwordCtrl.text,
        phone: _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim(),
      );
    }
  }
}

class _RolePill extends StatelessWidget {
  final String label;
  final String subtitle;
  final bool selected;
  final VoidCallback onTap;
  const _RolePill({required this.label, required this.subtitle, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap();
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        decoration: BoxDecoration(
          color: selected ? AppColors.primaryContainer.withOpacity(0.15) : AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: selected ? AppColors.primary : AppColors.border.withOpacity(0.5), width: 1.5),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: selected ? AppColors.primary : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 12,
                color: selected ? AppColors.primary.withOpacity(0.8) : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:animate_do/animate_do.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';
import '../../shared/widgets/inputs/cn_text_field.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscurePassword = true;

  final _phoneCtrl = TextEditingController();
  final _otpCtrl = TextEditingController();
  bool _otpSent = false;
  bool _sendingOtp = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _tabController.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _phoneCtrl.dispose();
    _otpCtrl.dispose();
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
        } else if (role == 'rider') {
          context.go('/rider/dashboard');
        } else {
          context.go('/home');
        }
      }
    });

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Background Decorative Elements
          Positioned(
            top: -100,
            right: -100,
            child: FadeInDown(
              duration: const Duration(seconds: 2),
              child: Container(
                width: 300,
                height: 300,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.primary.withOpacity(0.08),
                ),
              ),
            ),
          ),
          Positioned(
            bottom: -50,
            left: -50,
            child: FadeInUp(
              duration: const Duration(seconds: 2),
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.accent.withOpacity(0.08),
                ),
              ),
            ),
          ),

          SafeArea(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 20),
                  FadeInLeft(
                    child: GestureDetector(
                      onTap: () => context.pop(),
                      child: Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.surface.withOpacity(0.8),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border.withOpacity(0.5)),
                        ),
                        child: const Icon(Icons.arrow_back_rounded, size: 20, color: AppColors.textPrimary),
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                  
                  FadeInDown(
                    delay: const Duration(milliseconds: 200),
                    child: Hero(
                      tag: 'app_logo',
                      child: Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          gradient: AppColors.primaryGradient,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.3),
                              blurRadius: 15,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: const Center(child: Text('🥗', style: TextStyle(fontSize: 36))),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  FadeInUp(
                    delay: const Duration(milliseconds: 400),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Welcome back!',
                          style: Theme.of(context).textTheme.displaySmall?.copyWith(
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                            letterSpacing: -1,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Sign in to rescue food and save the planet 🌍',
                          style: TextStyle(
                            fontSize: 16,
                            color: AppColors.textSecondary.withOpacity(0.8),
                            height: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Modern Glassmorphic Tab Bar
                  FadeInUp(
                    delay: const Duration(milliseconds: 600),
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceVariant.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border.withOpacity(0.3)),
                      ),
                      child: TabBar(
                        controller: _tabController,
                        indicator: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.08),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        dividerColor: Colors.transparent,
                        labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                        labelColor: AppColors.primary,
                        unselectedLabelColor: AppColors.textSecondary,
                        tabs: const [
                          Tab(text: '📧 Email'),
                          Tab(text: '📱 Phone'),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Content Area
                  FadeInUp(
                    delay: const Duration(milliseconds: 800),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppColors.surface.withOpacity(0.8),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: AppColors.border.withOpacity(0.5)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.03),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          SizedBox(
                            height: 170,
                            child: TabBarView(
                              controller: _tabController,
                              children: [
                                _EmailForm(
                                  emailCtrl: _emailCtrl,
                                  passwordCtrl: _passwordCtrl,
                                  obscurePassword: _obscurePassword,
                                  onToggleObscure: () => setState(() => _obscurePassword = !_obscurePassword),
                                ),
                                _OtpForm(
                                  phoneCtrl: _phoneCtrl,
                                  otpCtrl: _otpCtrl,
                                  otpSent: _otpSent,
                                  sendingOtp: _sendingOtp,
                                  onSendOtp: _sendOtp,
                                ),
                              ],
                            ),
                          ),
                          if (_tabController.index == 0)
                            Align(
                              alignment: Alignment.centerRight,
                              child: TextButton(
                                onPressed: () => context.push('/auth/forgot-password'),
                                style: TextButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(horizontal: 0),
                                  visualDensity: VisualDensity.compact,
                                ),
                                child: const Text(
                                  'Forgot password?',
                                  style: TextStyle(
                                    color: AppColors.primary,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                          if (error != null) ...[
                            const SizedBox(height: 12),
                            ShakeX(
                              duration: const Duration(milliseconds: 500),
                              child: Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: AppColors.error.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: AppColors.error.withOpacity(0.2)),
                                ),
                                child: Row(children: [
                                  const Icon(Icons.error_outline, color: AppColors.error, size: 20),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Text(
                                      error,
                                      style: const TextStyle(
                                        color: AppColors.error,
                                        fontSize: 14,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                ]),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),
                  
                  FadeInUp(
                    delay: const Duration(milliseconds: 1000),
                    child: CnPrimaryButton(
                      label: isLoading ? 'Signing in...' : 'Sign In',
                      isLoading: isLoading,
                      onTap: isLoading ? null : _submit,
                    ),
                  ),
                  
                  const SizedBox(height: 24),

                  FadeInUp(
                    delay: const Duration(milliseconds: 1100),
                    child: Row(children: [
                      const Expanded(child: Divider(color: AppColors.border, thickness: 1)),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Text(
                          'OR CONTINUE WITH',
                          style: TextStyle(
                            color: AppColors.textTertiary,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ),
                      const Expanded(child: Divider(color: AppColors.border, thickness: 1)),
                    ]),
                  ),
                  
                  const SizedBox(height: 24),

                  FadeInUp(
                    delay: const Duration(milliseconds: 1200),
                    child: CnSecondaryButton(
                      label: 'Google Account',
                      icon: null, // You can add a Google SVG icon here if available
                      onTap: () {
                        HapticFeedback.lightImpact();
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: const Text('Google Sign-In is coming soon!'),
                            behavior: SnackBarBehavior.floating,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            backgroundColor: AppColors.textPrimary,
                          ),
                        );
                      },
                    ),
                  ),
                  
                  const SizedBox(height: 40),

                  FadeInUp(
                    delay: const Duration(milliseconds: 1300),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text(
                          'Don\'t have an account? ',
                          style: TextStyle(fontSize: 15, color: AppColors.textSecondary),
                        ),
                        GestureDetector(
                          onTap: () {
                            HapticFeedback.selectionClick();
                            context.go('/auth/register');
                          },
                          child: const Text(
                            'Create one',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _sendOtp() async {
    if (_phoneCtrl.text.trim().isEmpty) return;
    HapticFeedback.lightImpact();
    setState(() => _sendingOtp = true);
    try {
      await ApiClient.instance.post(AppEndpoints.sendOtp, data: {'phone': _phoneCtrl.text.trim()});
      setState(() { _otpSent = true; _sendingOtp = false; });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('OTP sent successfully! 📱'),
            backgroundColor: AppColors.primary,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
      }
    } catch (_) {
      setState(() => _sendingOtp = false);
    }
  }

  void _submit() {
    HapticFeedback.mediumImpact();
    if (_tabController.index == 0) {
      final email = _emailCtrl.text.trim();
      final pass = _passwordCtrl.text;
      if (email.isEmpty || pass.isEmpty) return;
      ref.read(authProvider.notifier).login(email: email, password: pass);
    } else {
      if (!_otpSent) { _sendOtp(); return; }
      final phone = _phoneCtrl.text.trim();
      final otp = _otpCtrl.text.trim();
      if (phone.isEmpty || otp.length < 6) return;
      ref.read(authProvider.notifier).loginWithOtp(phone: phone, otp: otp);
    }
  }
}

class _EmailForm extends StatelessWidget {
  final TextEditingController emailCtrl;
  final TextEditingController passwordCtrl;
  final bool obscurePassword;
  final VoidCallback onToggleObscure;
  const _EmailForm({required this.emailCtrl, required this.passwordCtrl, required this.obscurePassword, required this.onToggleObscure});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        CnTextField(
          label: 'Email Address',
          controller: emailCtrl,
          hint: 'you@example.com',
          keyboardType: TextInputType.emailAddress,
          prefixIcon: Icons.alternate_email_rounded,
        ),
        const SizedBox(height: 20),
        CnTextField(
          label: 'Password',
          controller: passwordCtrl,
          hint: '••••••••',
          obscureText: obscurePassword,
          prefixIcon: Icons.lock_outline_rounded,
          suffix: IconButton(
            icon: Icon(
              obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
              size: 20,
              color: AppColors.textSecondary.withOpacity(0.6),
            ),
            onPressed: onToggleObscure,
          ),
        ),
      ],
    );
  }
}

class _OtpForm extends StatelessWidget {
  final TextEditingController phoneCtrl;
  final TextEditingController otpCtrl;
  final bool otpSent;
  final bool sendingOtp;
  final VoidCallback onSendOtp;
  const _OtpForm({required this.phoneCtrl, required this.otpCtrl, required this.otpSent, required this.sendingOtp, required this.onSendOtp});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        CnTextField(
          label: 'Phone Number',
          controller: phoneCtrl,
          hint: '+250 7XX XXX XXX',
          keyboardType: TextInputType.phone,
          prefixIcon: Icons.phone_android_rounded,
        ),
        const SizedBox(height: 20),
        if (otpSent)
          FadeInUp(
            child: CnTextField(
              label: 'OTP Code',
              controller: otpCtrl,
              hint: '• • • • • •',
              keyboardType: TextInputType.number,
              prefixIcon: Icons.verified_user_outlined,
            ),
          )
        else
          SizedBox(
            width: double.infinity,
            child: CnSecondaryButton(
              label: sendingOtp ? 'Sending...' : 'Send OTP Code',
              isLoading: sendingOtp,
              onTap: onSendOtp,
            ),
          ),
      ],
    );
  }
}

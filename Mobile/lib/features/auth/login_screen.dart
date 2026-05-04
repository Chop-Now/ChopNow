import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
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

  // Email/password
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscurePassword = true;

  // OTP
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
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 24),
              GestureDetector(
                onTap: () => context.pop(),
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(border: Border.all(color: AppColors.border), borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.arrow_back_rounded, size: 20, color: AppColors.textPrimary),
                ),
              ),
              const SizedBox(height: 28),
              // ChopNow logo emoji
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(gradient: AppColors.primaryGradient, borderRadius: BorderRadius.circular(16)),
                child: const Center(child: Text('🥗', style: TextStyle(fontSize: 28))),
              ),
              const SizedBox(height: 16),
              const Text('Welcome back!', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
              const Text('Sign in to rescue food and save planet 🌍', style: TextStyle(fontSize: 14, color: AppColors.textSecondary)),
              const SizedBox(height: 24),

              // Tab bar
              Container(
                decoration: BoxDecoration(color: AppColors.surfaceVariant, borderRadius: BorderRadius.circular(12)),
                child: TabBar(
                  controller: _tabController,
                  indicator: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(10),
                    boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 4)]),
                  dividerColor: Colors.transparent,
                  labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                  labelColor: AppColors.primary,
                  unselectedLabelColor: AppColors.textSecondary,
                  tabs: const [Tab(text: '📧 Email'), Tab(text: '📱 Phone OTP')],
                ),
              ),
              const SizedBox(height: 20),

              // Tab content
              SizedBox(
                height: 200,
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

              // Forgot password (email tab only)
              if (_tabController.index == 0)
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () => context.push('/auth/forgot-password'),
                    child: const Text('Forgot password?', style: TextStyle(color: AppColors.primary, fontSize: 13, fontWeight: FontWeight.w600)),
                  ),
                ),

              if (error != null) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: AppColors.errorSurface, borderRadius: BorderRadius.circular(10)),
                  child: Row(children: [
                    const Icon(Icons.error_outline, color: AppColors.error, size: 18),
                    const SizedBox(width: 8),
                    Expanded(child: Text(error, style: const TextStyle(color: AppColors.error, fontSize: 13))),
                  ]),
                ),
              ],

              const SizedBox(height: 16),
              CnPrimaryButton(
                label: isLoading ? 'Signing in…' : 'Sign In',
                isLoading: isLoading,
                onTap: isLoading ? null : _submit,
              ),
              const SizedBox(height: 16),

              // Divider
              Row(children: [
                const Expanded(child: Divider(color: AppColors.border)),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Text('or', style: TextStyle(color: AppColors.textTertiary, fontSize: 13)),
                ),
                const Expanded(child: Divider(color: AppColors.border)),
              ]),
              const SizedBox(height: 16),

              // Google sign-in button
              CnSecondaryButton(
                label: '  Continue with Google',
                icon: null,
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Google Sign-In coming soon!')),
                  );
                },
              ),
              const SizedBox(height: 20),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('Don\'t have an account? ', style: TextStyle(fontSize: 14, color: AppColors.textSecondary)),
                  GestureDetector(
                    onTap: () => context.go('/auth/register'),
                    child: const Text('Create one', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary)),
                  ),
                ],
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _sendOtp() async {
    if (_phoneCtrl.text.trim().isEmpty) return;
    setState(() => _sendingOtp = true);
    try {
      await ApiClient.instance.post(AppEndpoints.sendOtp, data: {'phone': _phoneCtrl.text.trim()});
      setState(() { _otpSent = true; _sendingOtp = false; });
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('OTP sent! Check your phone.'), backgroundColor: AppColors.primary),
      );
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
        CnTextField(label: 'Email', controller: emailCtrl, hint: 'you@example.com', keyboardType: TextInputType.emailAddress),
        const SizedBox(height: 14),
        CnTextField(label: 'Password',
          controller: passwordCtrl,
          hint: 'Your password',
          obscureText: obscurePassword,
          suffix: IconButton(
            icon: Icon(obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 20, color: AppColors.textSecondary),
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
        CnTextField(label: 'Phone Number', controller: phoneCtrl, hint: '+250 7XX XXX XXX', keyboardType: TextInputType.phone),
        const SizedBox(height: 14),
        if (otpSent)
          CnTextField(label: 'OTP Code', controller: otpCtrl, hint: '• • • • • •', keyboardType: TextInputType.number)
        else
          SizedBox(
            width: double.infinity,
            child: CnSecondaryButton(
              label: sendingOtp ? 'Sending…' : 'Send OTP',
              isLoading: sendingOtp,
              onTap: onSendOtp,
            ),
          ),
      ],
    );
  }
}

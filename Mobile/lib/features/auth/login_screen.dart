import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/services/biometric_service.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';
import '../../shared/widgets/inputs/cn_text_field.dart';

// ── Role selection constants ──────────────────────────────────────────────────
enum _LoginRole { none, customer, business }

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Which role the user chose in step 1
  _LoginRole _selectedRole = _LoginRole.none;

  // Email/password
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _obscurePassword = true;

  // OTP
  final _phoneCtrl = TextEditingController();
  final _otpCtrl = TextEditingController();
  bool _otpSent = false;
  bool _sendingOtp = false;

  // Local validation error (shown instead of / alongside auth error)
  String? _localError;

  bool _biometricAvailable = false;
  bool _biometricEnabled = false;
  IconData _biometricIcon = Icons.vpn_key_rounded;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() => setState(() {}));

    // Clear errors whenever user types
    _emailCtrl.addListener(_clearErrors);
    _passwordCtrl.addListener(_clearErrors);
    _phoneCtrl.addListener(_clearErrors);
    _otpCtrl.addListener(_clearErrors);

    _checkBiometricStatus();
  }

  Future<void> _checkBiometricStatus() async {
    final available = await BiometricService.isAvailable;
    final enabled = await BiometricService.isEnabled;
    final icon = await BiometricService.biometricIcon;
    if (mounted) {
      setState(() {
        _biometricAvailable = available;
        _biometricEnabled = enabled;
        _biometricIcon = icon;
      });
    }
  }

  Future<void> _loginWithBiometrics() async {
    HapticFeedback.mediumImpact();
    
    // Clear any previous error
    _clearErrors();

    final authenticated = await BiometricService.authenticate(
        reason: 'Authenticate to sign in to ChopNow');
    if (!authenticated) return;

    final credentials = await BiometricService.getCredentials();
    if (credentials == null) {
      setState(() => _localError = 'No saved biometric credentials. Please sign in with password first.');
      return;
    }

    final email = credentials['email']!;
    final password = credentials['password']!;

    // Auto-fill fields for visual feedback
    _emailCtrl.text = email;
    _passwordCtrl.text = password;

    // Map role choice to preferred backend role
    final preferredRole =
        _selectedRole == _LoginRole.business ? 'business_owner' : 'consumer';

    ref
        .read(authProvider.notifier)
        .login(email: email, password: password, preferredRole: preferredRole);
  }

  void _clearErrors() {
    if (_localError != null) {
      setState(() => _localError = null);
    }
    final authState = ref.read(authProvider);
    if (authState is AuthError) {
      ref.read(authProvider.notifier).clearError();
    }
  }

  @override
  void dispose() {
    _emailCtrl.removeListener(_clearErrors);
    _passwordCtrl.removeListener(_clearErrors);
    _phoneCtrl.removeListener(_clearErrors);
    _otpCtrl.removeListener(_clearErrors);
    _tabController.dispose();
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _phoneCtrl.dispose();
    _otpCtrl.dispose();
    super.dispose();
  }

  bool _isValidEmail(String email) {
    return RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        .hasMatch(email);
  }

  // ── Back navigation ─────────────────────────────────────────────────────────
  void _handleBack() {
    if (_selectedRole != _LoginRole.none) {
      // Step 2 → go back to role selection (step 1)
      setState(() {
        _selectedRole = _LoginRole.none;
        _localError = null;
        _emailCtrl.clear();
        _passwordCtrl.clear();
        _phoneCtrl.clear();
        _otpCtrl.clear();
        _otpSent = false;
      });
      ref.read(authProvider.notifier).clearError();
    } else {
      // Step 1 → go to onboarding (safe, no pop needed)
      context.go('/onboarding');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final isLoading = authState is AuthLoading;
    final authError = authState is AuthError ? authState.message : null;
    final error = _localError ?? authError;

    ref.listen(authProvider, (_, next) async {
      if (next is AuthAuthenticated) {
        HapticFeedback.heavyImpact();
        final user = next.user;
        final role = user.activeRole;

        // If user chose 'business' but their active role is not business_owner yet,
        // we need to switch roles if they have the role
        if (_selectedRole == _LoginRole.business &&
            role != 'business_owner' &&
            user.roles.contains('business_owner')) {
          await ref.read(authProvider.notifier).switchRole('business_owner');
          return; // switchRole will update state → listener fires again
        }

        // Route based on final active role
        if (!mounted) return;
        if (role == 'business_owner') {
          context.go('/business/dashboard');
        } else if (role == 'rider') {
          context.go('/rider/dashboard');
        } else {
          context.go('/home');
        }
      }
    });

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _handleBack();
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 320),
            transitionBuilder: (child, animation) => FadeTransition(
              opacity: animation,
              child: SlideTransition(
                position: Tween<Offset>(
                  begin: const Offset(0.04, 0),
                  end: Offset.zero,
                ).animate(animation),
                child: child,
              ),
            ),
            child: _selectedRole == _LoginRole.none
                ? _RoleSelectionStep(
                    key: const ValueKey('role_step'),
                    onBack: _handleBack,
                    onSelectCustomer: () =>
                        setState(() => _selectedRole = _LoginRole.customer),
                    onSelectBusiness: () =>
                        setState(() => _selectedRole = _LoginRole.business),
                  )
                : _LoginFormStep(
                    key: const ValueKey('form_step'),
                    selectedRole: _selectedRole,
                    tabController: _tabController,
                    emailCtrl: _emailCtrl,
                    passwordCtrl: _passwordCtrl,
                    phoneCtrl: _phoneCtrl,
                    otpCtrl: _otpCtrl,
                    obscurePassword: _obscurePassword,
                    onToggleObscure: () =>
                        setState(() => _obscurePassword = !_obscurePassword),
                    otpSent: _otpSent,
                    sendingOtp: _sendingOtp,
                    onSendOtp: _sendOtp,
                    isLoading: isLoading,
                    error: error,
                    onBack: _handleBack,
                    onSubmit: isLoading ? null : _submit,
                    biometricAvailable: _biometricAvailable,
                    biometricEnabled: _biometricEnabled,
                    biometricIcon: _biometricIcon,
                    onBiometricTap: _loginWithBiometrics,
                  ),
          ),
        ),
      ),
    );
  }

  Future<void> _sendOtp() async {
    if (_phoneCtrl.text.trim().isEmpty) {
      setState(() => _localError = 'Please enter your phone number.');
      return;
    }
    setState(() => _sendingOtp = true);
    try {
      await ApiClient.instance
          .post(AppEndpoints.sendOtp, data: {'phone': _phoneCtrl.text.trim()});
      if (!mounted) return;
      setState(() {
        _otpSent = true;
        _sendingOtp = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('OTP sent! Check your phone.'),
            backgroundColor: AppColors.primary),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _localError = e.toString().replaceAll('Exception: ', '');
        _sendingOtp = false;
      });
    }
  }

  void _submit() {
    if (kDebugMode) debugPrint('[Login] _submit called. selectedRole=$_selectedRole, tabIndex=${_tabController.index}');
    HapticFeedback.mediumImpact();

    // Map role choice to preferred backend role
    final preferredRole =
        _selectedRole == _LoginRole.business ? 'business_owner' : 'consumer';

    if (_tabController.index == 0) {
      final email = _emailCtrl.text.trim();
      final pass = _passwordCtrl.text;
      if (kDebugMode) debugPrint('[Login] Submit tapped');

      if (email.isEmpty) {
        if (kDebugMode) debugPrint('[Login] Email is empty');
        setState(() => _localError = 'Please enter your email address.');
        return;
      }
      if (!_isValidEmail(email)) {
        if (kDebugMode) debugPrint('[Login] Email is invalid');
        setState(() =>
            _localError = 'Please enter a valid email (e.g. you@example.com).');
        return;
      }
      if (pass.isEmpty) {
        if (kDebugMode) debugPrint('[Login] Password is empty');
        setState(() => _localError = 'Please enter your password.');
        return;
      }

      if (kDebugMode) debugPrint('[Login] Calling authProvider.notifier.login...');
      ref
          .read(authProvider.notifier)
          .login(email: email, password: pass, preferredRole: preferredRole);
    } else {
      if (!_otpSent) {
        _sendOtp();
        return;
      }
      final phone = _phoneCtrl.text.trim();
      final otp = _otpCtrl.text.trim();
      if (phone.isEmpty) {
        setState(() => _localError = 'Please enter your phone number.');
        return;
      }
      if (otp.length < 6) {
        setState(
            () => _localError = 'Please enter the full 6-digit OTP code.');
        return;
      }
      ref.read(authProvider.notifier).loginWithOtp(phone: phone, otp: otp);
    }
  }
}

// ── Step 1: Role selection ────────────────────────────────────────────────────
class _RoleSelectionStep extends StatelessWidget {
  final VoidCallback onBack;
  final VoidCallback onSelectCustomer;
  final VoidCallback onSelectBusiness;

  const _RoleSelectionStep({
    super.key,
    required this.onBack,
    required this.onSelectCustomer,
    required this.onSelectBusiness,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 24),
          // Back button
          GestureDetector(
            onTap: onBack,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.arrow_back_rounded,
                  size: 20, color: AppColors.textPrimary),
            ),
          ),
          const SizedBox(height: 28),
          // Logo
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
                gradient: AppColors.primaryGradient,
                borderRadius: BorderRadius.circular(16)),
            child: const Center(
                child: Icon(Icons.eco_rounded, size: 28, color: Colors.white)),
          ),
          const SizedBox(height: 16),
          const Text(
            'Sign in',
            style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary),
          ),
          const SizedBox(height: 4),
          const Text(
            'Choose how you want to sign in',
            style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 32),

          // ── Sign in as Customer ──
          _RoleCard(
            icon: Icons.person_outline_rounded,
            title: 'Sign in as Customer',
            subtitle: 'Browse deals & order food',
            gradient: const LinearGradient(
              colors: [Color(0xFF4CAF50), Color(0xFF2E7D32)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            onTap: onSelectCustomer,
          ),
          const SizedBox(height: 16),

          // ── Sign in as Business Owner ──
          _RoleCard(
            icon: Icons.storefront_outlined,
            title: 'Sign in as Business',
            subtitle: 'Manage your store & listings',
            gradient: const LinearGradient(
              colors: [Color(0xFF1976D2), Color(0xFF0D47A1)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            onTap: onSelectBusiness,
          ),
          const SizedBox(height: 32),

          // Sign up link
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text("Don't have an account? ",
                  style: TextStyle(
                      fontSize: 14, color: AppColors.textSecondary)),
              GestureDetector(
                onTap: () => context.go('/auth/register'),
                child: const Text('Create one',
                    style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary)),
              ),
            ],
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

// ── Role card widget ──────────────────────────────────────────────────────────
class _RoleCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Gradient gradient;
  final VoidCallback onTap;

  const _RoleCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.gradient,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.border),
          borderRadius: BorderRadius.circular(16),
          color: AppColors.surface,
        ),
        child: Row(
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                gradient: gradient,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: Colors.white, size: 26),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary)),
                  const SizedBox(height: 2),
                  Text(subtitle,
                      style: const TextStyle(
                          fontSize: 13, color: AppColors.textSecondary)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios_rounded,
                size: 16, color: AppColors.textSecondary),
          ],
        ),
      ),
    );
  }
}

// ── Step 2: Login form ────────────────────────────────────────────────────────
class _LoginFormStep extends StatelessWidget {
  final _LoginRole selectedRole;
  final TabController tabController;
  final TextEditingController emailCtrl;
  final TextEditingController passwordCtrl;
  final TextEditingController phoneCtrl;
  final TextEditingController otpCtrl;
  final bool obscurePassword;
  final VoidCallback onToggleObscure;
  final bool otpSent;
  final bool sendingOtp;
  final VoidCallback onSendOtp;
  final bool isLoading;
  final String? error;
  final VoidCallback onBack;
  final VoidCallback? onSubmit;
  final bool biometricAvailable;
  final bool biometricEnabled;
  final IconData biometricIcon;
  final VoidCallback onBiometricTap;

  const _LoginFormStep({
    super.key,
    required this.selectedRole,
    required this.tabController,
    required this.emailCtrl,
    required this.passwordCtrl,
    required this.phoneCtrl,
    required this.otpCtrl,
    required this.obscurePassword,
    required this.onToggleObscure,
    required this.otpSent,
    required this.sendingOtp,
    required this.onSendOtp,
    required this.isLoading,
    required this.error,
    required this.onBack,
    required this.onSubmit,
    required this.biometricAvailable,
    required this.biometricEnabled,
    required this.biometricIcon,
    required this.onBiometricTap,
  });

  @override
  Widget build(BuildContext context) {
    final isBusinessRole = selectedRole == _LoginRole.business;
    final roleLabel = isBusinessRole ? 'Business' : 'Customer';
    final roleIconData = isBusinessRole ? Icons.storefront_rounded : Icons.shopping_bag_rounded;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 24),
          // Back button
          GestureDetector(
            onTap: onBack,
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                  border: Border.all(color: AppColors.border),
                  borderRadius: BorderRadius.circular(10)),
              child: const Icon(Icons.arrow_back_rounded,
                  size: 20, color: AppColors.textPrimary),
            ),
          ),
          const SizedBox(height: 28),
          // Logo
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
                gradient: AppColors.primaryGradient,
                borderRadius: BorderRadius.circular(16)),
            child: Center(
                child: Icon(roleIconData, size: 28, color: Colors.white)),
          ),
          const SizedBox(height: 16),
          Text(
            'Sign in as $roleLabel',
            style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary),
          ),
          const Text('Welcome back! Please sign in to continue',
              style:
                  TextStyle(fontSize: 14, color: AppColors.textSecondary)),
          const SizedBox(height: 24),

          // Tab bar
          Container(
            decoration: BoxDecoration(
                color: AppColors.surfaceVariant,
                borderRadius: BorderRadius.circular(12)),
            child: TabBar(
              controller: tabController,
              indicator: BoxDecoration(
                  color: AppColors.surface,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                        color: Colors.black.withValues(alpha: 0.06),
                        blurRadius: 4)
                  ]),
              dividerColor: Colors.transparent,
              labelStyle:
                  const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
              labelColor: AppColors.primary,
              unselectedLabelColor: AppColors.textSecondary,
              tabs: const [
                Tab(text: '📧 Email'),
                Tab(text: '📱 Phone OTP'),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Tab content
          SizedBox(
            height: 200,
            child: TabBarView(
              controller: tabController,
              children: [
                _EmailForm(
                  emailCtrl: emailCtrl,
                  passwordCtrl: passwordCtrl,
                  obscurePassword: obscurePassword,
                  onToggleObscure: onToggleObscure,
                ),
                _OtpForm(
                  phoneCtrl: phoneCtrl,
                  otpCtrl: otpCtrl,
                  otpSent: otpSent,
                  sendingOtp: sendingOtp,
                  onSendOtp: onSendOtp,
                ),
              ],
            ),
          ),

          // Forgot password (email tab only)
          if (tabController.index == 0)
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () => context.push('/auth/forgot-password'),
                child: const Text('Forgot password?',
                    style: TextStyle(
                        color: AppColors.primary,
                        fontSize: 13,
                        fontWeight: FontWeight.w600)),
              ),
            ),

          if (error != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                  color: AppColors.errorSurface,
                  borderRadius: BorderRadius.circular(10)),
              child: Row(children: [
                const Icon(Icons.error_outline,
                    color: AppColors.error, size: 18),
                const SizedBox(width: 8),
                Expanded(
                    child: Text(error!,
                        style: const TextStyle(
                            color: AppColors.error, fontSize: 13))),
              ]),
            ),
          ],

          const SizedBox(height: 16),
          if (tabController.index == 0 && biometricAvailable && biometricEnabled)
            Row(
              children: [
                Expanded(
                  child: CnPrimaryButton(
                    label: isLoading ? 'Signing in…' : 'Sign In',
                    isLoading: isLoading,
                    onTap: onSubmit,
                  ),
                ),
                const SizedBox(width: 12),
                InkWell(
                  onTap: isLoading ? null : onBiometricTap,
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    height: 50,
                    width: 50,
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.primary, width: 1.5),
                      borderRadius: BorderRadius.circular(12),
                      color: AppColors.surface,
                    ),
                    child: Center(
                      child: Icon(
                        biometricIcon,
                        size: 24,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ),
              ],
            )
          else
            CnPrimaryButton(
              label: isLoading ? 'Signing in…' : 'Sign In',
              isLoading: isLoading,
              onTap: onSubmit,
            ),
          const SizedBox(height: 20),

          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text("Don't have an account? ",
                  style: TextStyle(
                      fontSize: 14, color: AppColors.textSecondary)),
              GestureDetector(
                onTap: () => context.go('/auth/register'),
                child: const Text('Create one',
                    style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primary)),
              ),
            ],
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

// ── Email form sub-widget ─────────────────────────────────────────────────────
class _EmailForm extends StatelessWidget {
  final TextEditingController emailCtrl;
  final TextEditingController passwordCtrl;
  final bool obscurePassword;
  final VoidCallback onToggleObscure;

  const _EmailForm({
    required this.emailCtrl,
    required this.passwordCtrl,
    required this.obscurePassword,
    required this.onToggleObscure,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        CnTextField(
            label: 'Email',
            controller: emailCtrl,
            hint: 'you@example.com',
            keyboardType: TextInputType.emailAddress),
        const SizedBox(height: 14),
        CnTextField(
          label: 'Password',
          controller: passwordCtrl,
          hint: 'Your password',
          obscureText: obscurePassword,
          suffix: IconButton(
            icon: Icon(
                obscurePassword
                    ? Icons.visibility_off_outlined
                    : Icons.visibility_outlined,
                size: 20,
                color: AppColors.textSecondary),
            onPressed: onToggleObscure,
          ),
        ),
      ],
    );
  }
}

// ── OTP form sub-widget ───────────────────────────────────────────────────────
class _OtpForm extends StatelessWidget {
  final TextEditingController phoneCtrl;
  final TextEditingController otpCtrl;
  final bool otpSent;
  final bool sendingOtp;
  final VoidCallback onSendOtp;

  const _OtpForm({
    required this.phoneCtrl,
    required this.otpCtrl,
    required this.otpSent,
    required this.sendingOtp,
    required this.onSendOtp,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        CnTextField(
            label: 'Phone Number',
            controller: phoneCtrl,
            hint: '+250 7XX XXX XXX',
            keyboardType: TextInputType.phone),
        const SizedBox(height: 14),
        if (otpSent)
          CnTextField(
              label: 'OTP Code',
              controller: otpCtrl,
              hint: '• • • • • •',
              keyboardType: TextInputType.number)
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
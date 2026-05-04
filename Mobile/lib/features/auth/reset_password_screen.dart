import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';
import '../../shared/widgets/inputs/cn_text_field.dart';
import '../../shared/animations/scale_tap.dart';

class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});
  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _form = GlobalKey<FormState>();
  final _tokenCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _loading = false;
  bool _done = false;
  bool _showPass = false;
  String? _error;

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    if (_passCtrl.text != _confirmCtrl.text) {
      setState(() => _error = 'Passwords do not match');
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      await ApiClient.instance.post(AppEndpoints.resetPassword,
          data: {'token': _tokenCtrl.text.trim(), 'password': _passCtrl.text});
      if (mounted) setState(() { _done = true; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = 'Invalid or expired reset token.'; _loading = false; });
    }
  }

  @override
  void dispose() {
    _tokenCtrl.dispose(); _passCtrl.dispose(); _confirmCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background, elevation: 0,
        leading: ScaleTap(onTap: () => context.pop(), child: const Icon(Icons.arrow_back_rounded, color: AppColors.textPrimary)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: _done ? _successView(context) : _formView(),
        ),
      ),
    );
  }

  Widget _formView() {
    return Form(
      key: _form,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const SizedBox(height: 16),
        const Text('New Password 🔑',
            style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: AppColors.textPrimary, letterSpacing: -0.3)),
        const SizedBox(height: 6),
        const Text('Enter the reset token from your email and set a new password.',
            style: TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.4)),
        const SizedBox(height: 28),
        CnTextField(label: 'Reset Token', controller: _tokenCtrl, hint: 'Paste token from email',
            validator: (v) => v == null || v.isEmpty ? 'Required' : null),
        const SizedBox(height: 14),
        CnTextField(
          label: 'New Password', controller: _passCtrl, hint: 'Min 8 characters',
          obscureText: !_showPass,
          suffix: IconButton(icon: Icon(_showPass ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 20, color: AppColors.textSecondary),
              onPressed: () => setState(() => _showPass = !_showPass)),
          validator: (v) => v == null || v.length < 8 ? 'Min 8 characters' : null,
        ),
        const SizedBox(height: 14),
        CnTextField(
          label: 'Confirm Password', controller: _confirmCtrl, hint: 'Repeat password',
          obscureText: !_showPass,
          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
        ),
        if (_error != null) ...[
          const SizedBox(height: 12),
          Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: AppColors.errorSurface, borderRadius: BorderRadius.circular(10)),
              child: Text(_error!, style: const TextStyle(color: AppColors.error, fontSize: 13))),
        ],
        const SizedBox(height: 24),
        CnPrimaryButton(label: 'Set New Password', isLoading: _loading, onTap: _loading ? null : _submit),
      ]),
    );
  }

  Widget _successView(BuildContext context) {
    return Column(children: [
      const SizedBox(height: 80),
      Container(width: 80, height: 80, decoration: const BoxDecoration(color: AppColors.primarySurface, shape: BoxShape.circle),
          child: const Icon(Icons.lock_open_rounded, size: 36, color: AppColors.primary)),
      const SizedBox(height: 24),
      const Text('Password Updated! 🎉', textAlign: TextAlign.center,
          style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
      const SizedBox(height: 10),
      const Text('Your password has been reset. Sign in with your new password.', textAlign: TextAlign.center,
          style: TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.5)),
      const SizedBox(height: 32),
      CnPrimaryButton(label: 'Sign In Now', onTap: () => context.go('/auth/login')),
    ]);
  }
}

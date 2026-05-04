import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/animations/scale_tap.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';
import '../../shared/widgets/inputs/cn_text_field.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});
  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _form = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  bool _loading = false;
  bool _sent = false;
  String? _error;

  Future<void> _send() async {
    if (!_form.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });
    try {
      await ApiClient.instance.post(AppEndpoints.forgotPassword, data: {'email': _emailCtrl.text.trim()});
      if (mounted) setState(() { _sent = true; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = 'Email not found. Please check and retry.'; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: ScaleTap(onTap: () => context.pop(), child: const Icon(Icons.arrow_back_rounded, color: AppColors.textPrimary)),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: _sent ? _successView() : _formView(),
        ),
      ),
    );
  }

  Widget _formView() {
    return Form(
      key: _form,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          const Text('Reset Password 🔐',
            style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: AppColors.textPrimary, letterSpacing: -0.3)),
          const SizedBox(height: 6),
          const Text("Enter your email and we'll send you a link", style: TextStyle(fontSize: 14, color: AppColors.textSecondary)),
          const SizedBox(height: 32),
          CnTextField(
            label: 'Email address',
            controller: _emailCtrl,
            keyboardType: TextInputType.emailAddress,
            prefixIcon: Icons.email_outlined,
            textInputAction: TextInputAction.done,
            onSubmitted: (_) => _send(),
            validator: (v) {
              if (v == null || v.isEmpty) return 'Email is required';
              if (!v.contains('@')) return 'Invalid email';
              return null;
            },
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: const TextStyle(fontSize: 13, color: AppColors.error)),
          ],
          const SizedBox(height: 24),
          CnPrimaryButton(label: 'Send reset link', onTap: _loading ? null : _send, isLoading: _loading),
        ],
      ),
    );
  }

  Widget _successView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        const SizedBox(height: 60),
        Container(
          width: 80, height: 80,
          decoration: BoxDecoration(color: AppColors.primarySurface, shape: BoxShape.circle),
          child: const Icon(Icons.mark_email_read_outlined, size: 36, color: AppColors.primary),
        ),
        const SizedBox(height: 24),
        const Text('Check your inbox! 📬',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        const SizedBox(height: 10),
        const Text('We sent a password reset link to your email.', textAlign: TextAlign.center, style: TextStyle(fontSize: 14, color: AppColors.textSecondary, height: 1.5)),
        const SizedBox(height: 32),
        CnPrimaryButton(label: 'Back to Sign In', onTap: () => context.go('/auth/login')),
      ],
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'dart:async';
import '../../core/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/constants.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';
import '../../shared/animations/scale_tap.dart';

class OtpScreen extends ConsumerStatefulWidget {
  final String phone;
  const OtpScreen({super.key, required this.phone});

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final _focusNodes = List.generate(6, (_) => FocusNode());
  final _controllers = List.generate(6, (_) => TextEditingController());
  int _secondsLeft = AppConstants.otpResendSeconds;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
    Future.microtask(() => _focusNodes[0].requestFocus());
  }

  void _startTimer() {
    _timer?.cancel();
    setState(() => _secondsLeft = AppConstants.otpResendSeconds);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_secondsLeft == 0) {
        t.cancel();
      } else {
        setState(() => _secondsLeft--);
      }
    });
  }

  String get _otp => _controllers.map((c) => c.text).join();

  Future<void> _verify() async {
    if (_otp.length < 6) return;
    await ref.read(authProvider.notifier).loginWithOtp(
          phone: widget.phone,
          otp: _otp,
        );
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (final f in _focusNodes) {
      f.dispose();
    }
    for (final c in _controllers) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final isLoading = auth is AuthLoading;

    ref.listen(authProvider, (_, next) {
      if (next is AuthAuthenticated && mounted) context.go('/home');
    });

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value:
          const SystemUiOverlayStyle(statusBarIconBrightness: Brightness.dark),
      child: Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          backgroundColor: AppColors.background,
          elevation: 0,
          leading: ScaleTap(
            onTap: () => context.canPop() ? context.pop() : context.go('/auth/login'),
            child: const Icon(Icons.arrow_back_rounded,
                color: AppColors.textPrimary),
          ),
        ),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 16),
                const Text('Verify your phone 📲',
                    style: TextStyle(
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                        letterSpacing: -0.3)),
                const SizedBox(height: 6),
                Text.rich(TextSpan(
                  style: const TextStyle(
                      fontSize: 14, color: AppColors.textSecondary),
                  children: [
                    const TextSpan(text: 'Enter the 6-digit code sent to '),
                    TextSpan(
                        text: widget.phone,
                        style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary)),
                  ],
                )),
                const SizedBox(height: 40),

                // OTP Boxes
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: List.generate(
                      6,
                      (i) => _OtpBox(
                            controller: _controllers[i],
                            focusNode: _focusNodes[i],
                            onChanged: (v) {
                              if (v.length == 1 && i < 5) {
                                _focusNodes[i + 1].requestFocus();
                              } else if (v.isEmpty && i > 0) {
                                _focusNodes[i - 1].requestFocus();
                              }
                              if (_otp.length == 6) {
                                HapticFeedback.lightImpact();
                              }
                              setState(() {});
                            },
                          )),
                ),

                const SizedBox(height: 32),

                // Verify button
                CnPrimaryButton(
                  label: 'Verify & Sign In',
                  onTap: _otp.length == 6 && !isLoading ? _verify : null,
                  isLoading: isLoading,
                ),

                const SizedBox(height: 24),

                // Resend
                Center(
                  child: _secondsLeft > 0
                      ? Text(
                          'Resend in ${_secondsLeft}s',
                          style: const TextStyle(
                              fontSize: 13, color: AppColors.textSecondary),
                        )
                      : ScaleTap(
                          onTap: () {
                            for (final c in _controllers) {
                              c.clear();
                            }
                            _focusNodes[0].requestFocus();
                            _startTimer();
                          },
                          child: const Text(
                            'Resend code',
                            style: TextStyle(
                                fontSize: 13,
                                color: AppColors.primary,
                                fontWeight: FontWeight.w600),
                          ),
                        ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _OtpBox extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final ValueChanged<String> onChanged;

  const _OtpBox(
      {required this.controller,
      required this.focusNode,
      required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 46,
      height: 56,
      child: TextField(
        controller: controller,
        focusNode: focusNode,
        textAlign: TextAlign.center,
        keyboardType: TextInputType.number,
        inputFormatters: [
          LengthLimitingTextInputFormatter(1),
          FilteringTextInputFormatter.digitsOnly
        ],
        onChanged: onChanged,
        style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary),
        decoration: InputDecoration(
          filled: true,
          fillColor: AppColors.surface,
          counterText: '',
          border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.border)),
          enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.border)),
          focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.primary, width: 2)),
          contentPadding: EdgeInsets.zero,
        ),
      ),
    );
  }
}

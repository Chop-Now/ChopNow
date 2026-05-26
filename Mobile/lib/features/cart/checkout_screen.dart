import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/cart_provider.dart';
import '../../core/providers/orders_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';
import '../../shared/animations/scale_tap.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  String _paymentMethod = 'momo';
  String _deliveryType = 'pickup';
  bool _isLoading = false;
  String? _error;

  static const _methods = [
    {'key': 'momo', 'label': 'MTN Mobile Money', 'emoji': '📱', 'color': 0xFFFFCC00},
    {'key': 'airtel', 'label': 'Airtel Money', 'emoji': '📲', 'color': 0xFFFF0000},
    {'key': 'card', 'label': 'Visa / Mastercard', 'emoji': '💳', 'color': 0xFF1A56DB},
    {'key': 'cash', 'label': 'Cash on Pickup', 'emoji': '💵', 'color': 0xFF22C55E},
  ];

  @override
  Widget build(BuildContext context) {
    final cartItems = ref.watch(cartProvider);
    final total = ref.watch(cartTotalProvider);
    final deliveryTotal = _deliveryType == 'delivery' ? total + 500 : total;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Checkout', style: TextStyle(fontWeight: FontWeight.w900, color: AppColors.textPrimary, fontSize: 20)),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1, color: AppColors.border),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Order Summary ──
            _SectionCard(
              title: 'Order Summary',
              icon: Icons.shopping_bag_outlined,
              child: Column(
                children: [
                  ...cartItems.map((item) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 7),
                    child: Row(
                      children: [
                        Container(
                          width: 6, height: 6,
                          decoration: BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text('${item.listing.title} × ${item.quantity}',
                              style: const TextStyle(fontSize: 13, color: AppColors.textPrimary, fontWeight: FontWeight.w500)),
                        ),
                        Text('RWF ${item.subtotal.toStringAsFixed(0)}',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                      ],
                    ),
                  )),
                  const Divider(color: AppColors.border, height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                        decoration: BoxDecoration(gradient: AppColors.primaryGradient, borderRadius: BorderRadius.circular(100)),
                        child: Text('RWF ${deliveryTotal.toStringAsFixed(0)}',
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: Colors.white)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // ── Delivery Type ──
            _SectionCard(
              title: 'Delivery Type',
              icon: Icons.local_shipping_outlined,
              child: Column(
                children: [
                  _DeliveryOption(
                    icon: '🛍',
                    label: 'Self-Pickup',
                    subtitle: 'Pick up from the restaurant — Free!',
                    value: 'pickup',
                    groupValue: _deliveryType,
                    onChanged: (v) { setState(() => _deliveryType = v!); HapticFeedback.selectionClick(); },
                  ),
                  const SizedBox(height: 8),
                  _DeliveryOption(
                    icon: '🚴',
                    label: 'Delivery',
                    subtitle: 'Delivered to your door — +RWF 500',
                    value: 'delivery',
                    groupValue: _deliveryType,
                    onChanged: (v) { setState(() => _deliveryType = v!); HapticFeedback.selectionClick(); },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            // ── Payment Method ──
            _SectionCard(
              title: 'Payment Method',
              icon: Icons.payment_outlined,
              child: Column(
                children: _methods.asMap().entries.map((e) {
                  final i = e.key;
                  final m = e.value;
                  return Column(
                    children: [
                      _PaymentTile(
                        emoji: m['emoji'] as String,
                        label: m['label'] as String,
                        accentColor: Color(m['color'] as int),
                        value: m['key'] as String,
                        groupValue: _paymentMethod,
                        onChanged: (v) { setState(() => _paymentMethod = v!); HapticFeedback.selectionClick(); },
                      ),
                      if (i < _methods.length - 1) const Divider(height: 12, color: AppColors.border),
                    ],
                  );
                }).toList(),
              ),
            ),

            if (_error != null) ...[
              const SizedBox(height: 14),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.errorSurface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 18),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_error!, style: const TextStyle(color: AppColors.error, fontSize: 13))),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 24),

            // CTA
            CnPrimaryButton(
              label: _isLoading
                  ? 'Placing Order...'
                  : 'Place Order · RWF ${deliveryTotal.toStringAsFixed(0)}',
              isLoading: _isLoading,
              onTap: _isLoading ? null : _placeOrder,
            ),

            const SizedBox(height: 12),

            // Trust indicator
            const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.lock_outline_rounded, size: 14, color: AppColors.textTertiary),
                SizedBox(width: 5),
                Text('Secure checkout · Your data is protected',
                    style: TextStyle(fontSize: 11, color: AppColors.textTertiary)),
              ],
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Future<void> _placeOrder() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final cartItems = ref.read(cartProvider);
      final order = await placeOrder(
        items: cartItems.map((i) => {
          'listing': i.listing.id,
          'quantity': i.quantity,
          'price': i.listing.offerPrice,
        }).toList(),
        paymentMethod: _paymentMethod,
        deliveryType: _deliveryType,
      );
      HapticFeedback.heavyImpact();
      ref.read(cartProvider.notifier).clear();
      if (mounted) context.pushReplacement('/orders/${order.id}/confirmation');
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Widget child;
  const _SectionCard({required this.title, required this.icon, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(7),
                decoration: BoxDecoration(color: AppColors.primarySurface, borderRadius: BorderRadius.circular(10)),
                child: Icon(icon, size: 16, color: AppColors.primary),
              ),
              const SizedBox(width: 10),
              Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
            ],
          ),
          const SizedBox(height: 14),
          const Divider(color: AppColors.border, height: 1),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}

class _DeliveryOption extends StatelessWidget {
  final String icon;
  final String label;
  final String subtitle;
  final String value;
  final String groupValue;
  final void Function(String?) onChanged;
  const _DeliveryOption({
    required this.icon, required this.label, required this.subtitle,
    required this.value, required this.groupValue, required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final selected = value == groupValue;
    return ScaleTap(
      onTap: () => onChanged(value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: selected ? AppColors.primarySurface : AppColors.background,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: selected ? AppColors.primary : AppColors.border, width: selected ? 1.5 : 1),
        ),
        child: Row(
          children: [
            Text(icon, style: const TextStyle(fontSize: 22)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: selected ? AppColors.primary : AppColors.textPrimary)),
                  Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                ],
              ),
            ),
            Container(
              width: 20, height: 20,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: selected ? AppColors.primary : AppColors.border, width: 2),
                color: selected ? AppColors.primary : Colors.transparent,
              ),
              child: selected ? const Icon(Icons.check, size: 12, color: Colors.white) : null,
            ),
          ],
        ),
      ),
    );
  }
}

class _PaymentTile extends StatelessWidget {
  final String emoji;
  final String label;
  final Color accentColor;
  final String value;
  final String groupValue;
  final void Function(String?) onChanged;
  const _PaymentTile({
    required this.emoji, required this.label, required this.accentColor,
    required this.value, required this.groupValue, required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final selected = value == groupValue;
    return InkWell(
      onTap: () => onChanged(value),
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
        child: Row(
          children: [
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: accentColor.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(child: Text(emoji, style: const TextStyle(fontSize: 20))),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(label,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                    color: selected ? AppColors.textPrimary : AppColors.textSecondary,
                  )),
            ),
            Container(
              width: 20, height: 20,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: selected ? AppColors.primary : AppColors.border, width: 2),
                color: selected ? AppColors.primary : Colors.transparent,
              ),
              child: selected ? const Icon(Icons.check, size: 12, color: Colors.white) : null,
            ),
          ],
        ),
      ),
    );
  }
}

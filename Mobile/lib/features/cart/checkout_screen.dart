import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/cart_provider.dart';
import '../../core/providers/orders_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';

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
    {'key': 'momo', 'label': 'MTN Mobile Money', 'icon': Icons.phone_android_rounded},
    {'key': 'airtel', 'label': 'Airtel Money', 'icon': Icons.phone_android_rounded},
    {'key': 'card', 'label': 'Visa / Mastercard', 'icon': Icons.credit_card_rounded},
    {'key': 'cash', 'label': 'Cash on Pickup', 'icon': Icons.money_rounded},
  ];

  @override
  Widget build(BuildContext context) {
    final cartItems = ref.watch(cartProvider);
    final total = ref.watch(cartTotalProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Checkout', style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order items summary
            _SectionCard(
              title: 'Order Summary',
              child: Column(
                children: [
                  ...cartItems.map((item) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Row(
                      children: [
                        Expanded(child: Text('${item.listing.title} × ${item.quantity}',
                            style: const TextStyle(fontSize: 13, color: AppColors.textPrimary))),
                        Text('RWF ${item.subtotal.toStringAsFixed(0)}',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                      ],
                    ),
                  )),
                  const Divider(color: AppColors.border),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                      Text('RWF ${total.toStringAsFixed(0)}',
                          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800, color: AppColors.primary)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Delivery type
            _SectionCard(
              title: 'Delivery Type',
              child: Column(
                children: [
                  _RadioTile(
                    label: '🛍 Self-Pickup (Free)',
                    value: 'pickup',
                    groupValue: _deliveryType,
                    onChanged: (v) => setState(() => _deliveryType = v!),
                  ),
                  _RadioTile(
                    label: '🚴 Delivery (+RWF 500)',
                    value: 'delivery',
                    groupValue: _deliveryType,
                    onChanged: (v) => setState(() => _deliveryType = v!),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Payment method
            _SectionCard(
              title: 'Payment Method',
              child: Column(
                children: _methods.map((m) => _RadioTile(
                  icon: m['icon'] as IconData,
                  label: m['label'] as String,
                  value: m['key'] as String,
                  groupValue: _paymentMethod,
                  onChanged: (v) => setState(() => _paymentMethod = v!),
                )).toList(),
              ),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppColors.errorSurface, borderRadius: BorderRadius.circular(10)),
                child: Text(_error!, style: const TextStyle(color: AppColors.error, fontSize: 13)),
              ),
            ],
            const SizedBox(height: 24),
            CnPrimaryButton(
              label: _isLoading ? 'Placing Order...' : 'Place Order · RWF ${total.toStringAsFixed(0)}',
              isLoading: _isLoading,
              onTap: _isLoading ? null : _placeOrder,
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Future<void> _placeOrder() async {
    setState(() { _isLoading = true; _error = null; });
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
      setState(() { _error = e.toString().replaceAll('Exception: ', ''); });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final Widget child;
  const _SectionCard({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

class _RadioTile extends StatelessWidget {
  final String label;
  final String value;
  final String groupValue;
  final void Function(String?) onChanged;
  final IconData? icon;
  const _RadioTile({required this.label, required this.value, required this.groupValue, required this.onChanged, this.icon});

  @override
  Widget build(BuildContext context) {
    final selected = value == groupValue;
    return InkWell(
      onTap: () => onChanged(value),
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            Radio<String>(value: value, groupValue: groupValue, onChanged: onChanged,
                activeColor: AppColors.primary),
            if (icon != null) ...[Icon(icon, size: 18, color: selected ? AppColors.primary : AppColors.textSecondary), const SizedBox(width: 8)],
            Text(label, style: TextStyle(fontSize: 14, color: selected ? AppColors.primary : AppColors.textPrimary, fontWeight: selected ? FontWeight.w600 : FontWeight.w400)),
          ],
        ),
      ),
    );
  }
}

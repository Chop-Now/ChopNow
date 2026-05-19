import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:animate_do/animate_do.dart';
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
    {'key': 'momo', 'label': 'Mobile Money', 'icon': Icons.smartphone_rounded},
    {'key': 'card', 'label': 'Credit / Debit Card', 'icon': Icons.credit_card_rounded},
    {'key': 'applepay', 'label': 'Apple Pay', 'icon': Icons.account_balance_wallet_rounded},
  ];

  @override
  Widget build(BuildContext context) {
    final cartItems = ref.watch(cartProvider);
    final total = ref.watch(cartTotalProvider);
    
    // Derived values for the UI prototype
    final subtotal = total;
    final tax = subtotal * 0.18;
    final impactFee = 150.0;
    final grandTotal = subtotal + tax + impactFee;

    return Scaffold(
      backgroundColor: AppColors.surfaceIvory,
      appBar: AppBar(
        title: const Text('Checkout', style: TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 24, fontWeight: FontWeight.w800, color: AppColors.primary)),
        backgroundColor: AppColors.surfaceIvory,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Fulfillment
            FadeInUp(
              child: _SectionCard(
                title: 'Fulfillment',
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: _FulfillmentTile(
                            icon: Icons.storefront_rounded,
                            label: 'Pickup',
                            isSelected: _deliveryType == 'pickup',
                            onTap: () {
                              HapticFeedback.lightImpact();
                              setState(() => _deliveryType = 'pickup');
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _FulfillmentTile(
                            icon: Icons.local_shipping_rounded,
                            label: 'Delivery',
                            isSelected: _deliveryType == 'delivery',
                            onTap: () {
                              HapticFeedback.lightImpact();
                              setState(() => _deliveryType = 'delivery');
                            },
                          ),
                        ),
                      ],
                    ),
                    if (_deliveryType == 'pickup') ...[
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border.withOpacity(0.5)),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 20),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Kigali Heights', style: TextStyle(fontFamily: 'Inter', fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                                  const SizedBox(height: 2),
                                  Text('Today, 5:30 PM - 6:00 PM', style: TextStyle(fontFamily: 'Inter', fontSize: 13, color: AppColors.textSecondary.withOpacity(0.9))),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            
            // Payment Method
            FadeInUp(
              delay: const Duration(milliseconds: 100),
              child: _SectionCard(
                title: 'Payment Method',
                child: Column(
                  children: _methods.map((m) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _PaymentTile(
                      icon: m['icon'] as IconData,
                      label: m['label'] as String,
                      value: m['key'] as String,
                      groupValue: _paymentMethod,
                      onChanged: (v) {
                        HapticFeedback.selectionClick();
                        setState(() => _paymentMethod = v!);
                      },
                    ),
                  )).toList(),
                ),
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Order Summary
            FadeInUp(
              delay: const Duration(milliseconds: 200),
              child: _SectionCard(
                title: 'Order Summary',
                child: Column(
                  children: [
                    ...cartItems.map((item) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              '${item.quantity}× ${item.listing.title}',
                              style: const TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.textPrimary, fontWeight: FontWeight.w500),
                            ),
                          ),
                          Text(
                            'RWF ${item.subtotal.toStringAsFixed(0)}',
                            style: const TextStyle(fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                          ),
                        ],
                      ),
                    )),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 4),
                      child: Divider(color: AppColors.border),
                    ),
                    const SizedBox(height: 8),
                    _SummaryRow(label: 'Subtotal', value: 'RWF ${subtotal.toStringAsFixed(0)}'),
                    const SizedBox(height: 8),
                    _SummaryRow(label: 'Tax (18%)', value: 'RWF ${tax.toStringAsFixed(0)}'),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: const [
                            Icon(Icons.volunteer_activism_rounded, size: 16, color: AppColors.accent),
                            SizedBox(width: 4),
                            Text('Impact Fee', style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.accent)),
                          ],
                        ),
                        Text('RWF ${impactFee.toStringAsFixed(0)}', style: const TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.accent)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Divider(color: AppColors.border),
                    const SizedBox(height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total', style: TextStyle(fontFamily: 'Inter', fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                        Text('RWF ${grandTotal.toStringAsFixed(0)}', style: const TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 24, fontWeight: FontWeight.w800, color: AppColors.primary)),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            if (_error != null) ...[
              const SizedBox(height: 16),
              FadeIn(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: AppColors.errorSurface, borderRadius: BorderRadius.circular(12)),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 20),
                      const SizedBox(width: 8),
                      Expanded(child: Text(_error!, style: const TextStyle(fontFamily: 'Inter', color: AppColors.error, fontSize: 13))),
                    ],
                  ),
                ),
              ),
            ],
            
            const SizedBox(height: 32),
            
            FadeInUp(
              delay: const Duration(milliseconds: 300),
              child: CnPrimaryButton(
                label: _isLoading ? 'Rescuing...' : 'Rescue This Meal',
                icon: Icons.redeem_rounded,
                isLoading: _isLoading,
                onTap: _isLoading ? null : () => _placeOrder(grandTotal),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Future<void> _placeOrder(double totalAmount) async {
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
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surfaceIvory,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border.withOpacity(0.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 15,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontFamily: 'Inter', fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }
}

class _FulfillmentTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FulfillmentTile({required this.icon, required this.label, required this.isSelected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ScaleTap(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFFEF3E7) : AppColors.surfaceIvory, // Amber Muted
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border.withOpacity(0.5),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            Icon(icon, color: isSelected ? AppColors.primary : AppColors.textSecondary, size: 28),
            const SizedBox(height: 8),
            Text(label, style: TextStyle(fontFamily: 'Inter', fontSize: 15, fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500, color: isSelected ? AppColors.primary : AppColors.textPrimary)),
          ],
        ),
      ),
    );
  }
}

class _PaymentTile extends StatelessWidget {
  final String label;
  final String value;
  final String groupValue;
  final void Function(String?) onChanged;
  final IconData icon;

  const _PaymentTile({required this.label, required this.value, required this.groupValue, required this.onChanged, required this.icon});

  @override
  Widget build(BuildContext context) {
    final isSelected = value == groupValue;
    return GestureDetector(
      onTap: () => onChanged(value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFFEF3E7) : AppColors.surfaceIvory, // Amber Muted
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border.withOpacity(0.5),
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, size: 24, color: isSelected ? AppColors.primary : AppColors.textSecondary),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                label,
                style: TextStyle(fontFamily: 'Inter', fontSize: 15, color: isSelected ? AppColors.primary : AppColors.textPrimary, fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500),
              ),
            ),
            Radio<String>(
              value: value,
              groupValue: groupValue,
              onChanged: onChanged,
              activeColor: AppColors.primary,
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  const _SummaryRow({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.textSecondary)),
        Text(value, style: const TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.textSecondary)),
      ],
    );
  }
}

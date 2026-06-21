import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/services/socket_service.dart';
import '../../core/models/order_model.dart';
import '../../core/providers/cart_provider.dart';
import '../../core/providers/orders_provider.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';
import '../../shared/widgets/inputs/cn_text_field.dart';
import '../../shared/animations/scale_tap.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  // Platform flat delivery fee in RWF — will be replaced with dynamic distance-based pricing
  static const double kDeliveryFeeRwf = 500;

  String _paymentMethod = 'momo';
  String _deliveryType = 'pickup';
  bool _isLoading = false;
  String? _error;
  String? _selectedAddressId;

  Future<List<double>> _resolveCoordinates(String street, String city) async {
    try {
      final query = '$street, $city';
      final locations = await locationFromAddress(query);
      if (locations.isNotEmpty) {
        return [locations.first.longitude, locations.first.latitude];
      }
    } catch (e) {
      if (kDebugMode) debugPrint('Geocoding failed for $street, $city: $e');
    }
    return [30.0619, -1.9441]; // Default to Kigali coordinates
  }

  Future<void> _fillWithCurrentLocation(
    TextEditingController streetCtrl,
    TextEditingController cityCtrl,
    void Function(void Function()) ss,
  ) async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception('Location services are disabled.');
    }

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception('Location permission denied.');
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw Exception('Location permissions are permanently denied.');
    }

    final position = await Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
    );

    final placemarks =
        await placemarkFromCoordinates(position.latitude, position.longitude);
    if (placemarks.isNotEmpty) {
      final pm = placemarks.first;
      final street = [pm.street, pm.subLocality, pm.locality]
          .where((s) => s != null && s.isNotEmpty)
          .join(', ');
      final city = pm.subAdministrativeArea ??
          pm.administrativeArea ??
          pm.locality ??
          'Kigali';
      ss(() {
        streetCtrl.text = street.isEmpty ? 'Unnamed Street' : street;
        cityCtrl.text = city.isEmpty ? 'Kigali' : city;
      });
    } else {
      ss(() {
        streetCtrl.text =
            'Location near Lat: ${position.latitude.toStringAsFixed(4)}';
        cityCtrl.text = 'Kigali';
      });
    }
  }

  void _showAddAddressBottomSheet(BuildContext context) {
    final labelCtrl = TextEditingController();
    final streetCtrl = TextEditingController();
    final cityCtrl = TextEditingController();
    bool isAdding = false;
    String? addError;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => StatefulBuilder(
          builder: (ctx, ss) => Padding(
                padding: EdgeInsets.fromLTRB(
                    20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 20),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Add Address',
                            style: TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary)),
                        TextButton.icon(
                          onPressed: isAdding
                              ? null
                              : () async {
                                  ss(() {
                                    isAdding = true;
                                    addError = null;
                                  });
                                  try {
                                    await _fillWithCurrentLocation(
                                        streetCtrl, cityCtrl, ss);
                                    HapticFeedback.selectionClick();
                                  } catch (e) {
                                    ss(() {
                                      final str = e.toString().toLowerCase();
                                      if (str.contains('permissiondenied') || str.contains('permission denied')) {
                                        addError = 'Location permission denied. Please allow location access to autofill.';
                                      } else if (str.contains('permanently denied')) {
                                        addError = 'Location permissions are permanently denied. Please enable them in app settings.';
                                      } else if (str.contains('disabled') || str.contains('services are disabled')) {
                                        addError = 'Location services (GPS) are disabled. Please enable them in settings.';
                                      } else if (str.contains('timeout')) {
                                        addError = 'Location request timed out. Please try again.';
                                      } else {
                                        addError = e.toString().replaceAll('Exception: ', '');
                                      }
                                    });
                                  } finally {
                                    ss(() {
                                      isAdding = false;
                                    });
                                  }
                                },
                          icon: const Icon(Icons.my_location,
                              size: 16, color: AppColors.primary),
                          label: const Text('Autofill GPS',
                              style: TextStyle(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    CnTextField(
                        label: 'Label',
                        controller: labelCtrl,
                        hint: 'Home, Work, Other…'),
                    const SizedBox(height: 12),
                    CnTextField(
                        label: 'Street Address',
                        controller: streetCtrl,
                        hint: 'KN 5 Rd, Nyarugenge'),
                    const SizedBox(height: 12),
                    CnTextField(
                        label: 'City', controller: cityCtrl, hint: 'Kigali'),
                    if (addError != null) ...[
                      const SizedBox(height: 8),
                      Text(addError!,
                          style: const TextStyle(
                              color: AppColors.error, fontSize: 13)),
                    ],
                    const SizedBox(height: 20),
                    CnPrimaryButton(
                      label: 'Add Address',
                      isLoading: isAdding,
                      onTap: isAdding
                          ? null
                          : () async {
                              if (streetCtrl.text.trim().isEmpty) {
                                ss(() {
                                  addError = 'Street address is required';
                                });
                                return;
                              }
                              ss(() {
                                isAdding = true;
                                addError = null;
                              });
                              try {
                                final streetVal = streetCtrl.text.trim();
                                final cityVal = cityCtrl.text.trim().isEmpty
                                    ? 'Kigali'
                                    : cityCtrl.text.trim();
                                final coords = await _resolveCoordinates(
                                    streetVal, cityVal);
                                final data = {
                                  'label': labelCtrl.text.trim().isEmpty
                                      ? 'Home'
                                      : labelCtrl.text.trim(),
                                  'street': streetVal,
                                  'city': cityVal,
                                  'coordinates': coords,
                                };
                                await ref
                                    .read(authProvider.notifier)
                                    .addAddress(data);
                                HapticFeedback.heavyImpact();

                                // Auto-select the newly added address
                                final updatedUser =
                                    ref.read(currentUserProvider);
                                final newAddr = updatedUser?.addresses.last;
                                if (newAddr != null) {
                                  setState(() {
                                    _selectedAddressId = newAddr.id;
                                  });
                                }

                                if (ctx.mounted) Navigator.pop(ctx);
                              } catch (e) {
                                ss(() {
                                  addError = e
                                      .toString()
                                      .replaceAll('Exception: ', '');
                                  isAdding = false;
                                });
                              }
                            },
                    ),
                  ],
                ),
              )),
    );
  }

  static const _methods = [
    {
      'key': 'momo',
      'label': 'MTN Mobile Money',
      'icon': Icons.phone_android_rounded,
      'color': 0xFFFFCC00
    },
    {
      'key': 'airtel',
      'label': 'Airtel Money',
      'icon': Icons.phonelink_ring_rounded,
      'color': 0xFFFF0000
    },
    // {
    //   'key': 'card',
    //   'label': 'Visa / Mastercard',
    //   'icon': Icons.credit_card_rounded,
    //   'color': 0xFF1A56DB
    // },
    {
      'key': 'cash',
      'label': 'Cash on Pickup',
      'icon': Icons.payments_rounded,
      'color': 0xFF22C55E
    },
  ];

  @override
  Widget build(BuildContext context) {
    final cartItems = ref.watch(cartProvider);
    final total = ref.watch(cartTotalProvider);
    final deliveryTotal =
        _deliveryType == 'delivery' ? total + kDeliveryFeeRwf : total;

    final user = ref.watch(currentUserProvider);
    final addresses = user?.addresses ?? [];
    if (_selectedAddressId == null && addresses.isNotEmpty) {
      final defAddr = addresses.firstWhere((a) => a.isDefault,
          orElse: () => addresses.first);
      _selectedAddressId = defAddr.id;
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Checkout',
            style: TextStyle(
                fontWeight: FontWeight.w900,
                color: AppColors.textPrimary,
                fontSize: 20)),
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
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                  color: AppColors.primary,
                                  shape: BoxShape.circle),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                  '${item.listing.title} × ${item.quantity}',
                                  style: const TextStyle(
                                      fontSize: 13,
                                      color: AppColors.textPrimary,
                                      fontWeight: FontWeight.w500)),
                            ),
                            Text('RWF ${item.subtotal.toStringAsFixed(0)}',
                                style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.textPrimary)),
                          ],
                        ),
                      )),
                  const Divider(color: AppColors.border, height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total',
                          style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textPrimary)),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 5),
                        decoration: BoxDecoration(
                            gradient: AppColors.primaryGradient,
                            borderRadius: BorderRadius.circular(100)),
                        child: Text('RWF ${deliveryTotal.toStringAsFixed(0)}',
                            style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w900,
                                color: Colors.white)),
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
                    icon: Icons.shopping_bag_outlined,
                    label: 'Self-Pickup',
                    subtitle: 'Pick up from the restaurant — Free!',
                    value: 'pickup',
                    groupValue: _deliveryType,
                    onChanged: (v) {
                      setState(() => _deliveryType = v!);
                      HapticFeedback.selectionClick();
                    },
                  ),
                  const SizedBox(height: 8),
                  _DeliveryOption(
                    icon: Icons.delivery_dining_rounded,
                    label: 'Delivery',
                    subtitle:
                        'Delivered to your door — +RWF ${kDeliveryFeeRwf.toStringAsFixed(0)}',
                    value: 'delivery',
                    groupValue: _deliveryType,
                    onChanged: (v) {
                      setState(() => _deliveryType = v!);
                      HapticFeedback.selectionClick();
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),

            if (_deliveryType == 'delivery') ...[
              _SectionCard(
                title: 'Delivery Address',
                icon: Icons.pin_drop_outlined,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (addresses.isEmpty) ...[
                      const Text(
                        'No addresses saved yet. Please add a delivery address.',
                        style: TextStyle(
                            fontSize: 13, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 12),
                      CnPrimaryButton(
                        label: 'Add Address',
                        onTap: () => _showAddAddressBottomSheet(context),
                      ),
                    ] else ...[
                      ...addresses.map((addr) {
                        final isSel = _selectedAddressId == addr.id;
                        return GestureDetector(
                          onTap: () {
                            setState(() {
                              _selectedAddressId = addr.id;
                            });
                            HapticFeedback.selectionClick();
                          },
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: isSel
                                  ? AppColors.primarySurface
                                  : AppColors.background,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: isSel
                                    ? AppColors.primary
                                    : AppColors.border,
                                width: isSel ? 1.5 : 1,
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(
                                  Icons.location_on_rounded,
                                  color: isSel
                                      ? AppColors.primary
                                      : AppColors.textSecondary,
                                  size: 20,
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        addr.label,
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.bold,
                                          color: isSel
                                              ? AppColors.primary
                                              : AppColors.textPrimary,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        addr.street +
                                            (addr.city != null
                                                ? ', ${addr.city}'
                                                : ''),
                                        style: const TextStyle(
                                            fontSize: 12,
                                            color: AppColors.textSecondary),
                                      ),
                                    ],
                                  ),
                                ),
                                if (isSel)
                                  const Icon(Icons.check_circle,
                                      color: AppColors.primary, size: 20)
                                else
                                  const Icon(Icons.circle_outlined,
                                      color: AppColors.border, size: 20),
                              ],
                            ),
                          ),
                        );
                      }),
                      const SizedBox(height: 8),
                      TextButton.icon(
                        onPressed: () => _showAddAddressBottomSheet(context),
                        icon: const Icon(Icons.add,
                            size: 16, color: AppColors.primary),
                        label: const Text('Add Another Address',
                            style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary)),
                      ),
                    ]
                  ],
                ),
              ),
              const SizedBox(height: 14),
            ],

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
                        icon: m['icon'] as IconData,
                        label: m['label'] as String,
                        accentColor: Color(m['color'] as int),
                        value: m['key'] as String,
                        groupValue: _paymentMethod,
                        onChanged: (v) {
                          setState(() => _paymentMethod = v!);
                          HapticFeedback.selectionClick();
                        },
                      ),
                      if (i < _methods.length - 1)
                        const Divider(height: 12, color: AppColors.border),
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
                  border:
                      Border.all(color: AppColors.error.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline_rounded,
                        color: AppColors.error, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                        child: Text(_error!,
                            style: const TextStyle(
                                color: AppColors.error, fontSize: 13))),
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
                Icon(Icons.lock_outline_rounded,
                    size: 14, color: AppColors.textTertiary),
                SizedBox(width: 5),
                Text('Secure checkout · Your data is protected',
                    style:
                        TextStyle(fontSize: 11, color: AppColors.textTertiary)),
              ],
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Future<void> _placeOrder() async {
    final cartItems = ref.read(cartProvider);
    if (cartItems.isEmpty) return;

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final primaryItem = cartItems.first;
      final apiPaymentMethod = switch (_paymentMethod) {
        'momo' || 'airtel' => 'mobile_money',
        'card' => 'card',
        'cash' => 'cash',
        _ => 'cash',
      };

      final paymentData = {
        'paymentMethod': apiPaymentMethod,
        'paymentStatus': 'pending',
      };

      Map<String, dynamic>? deliveryDetails;
      if (_deliveryType == 'delivery') {
        final user = ref.read(currentUserProvider);
        // Use where+firstOrNull to avoid StateError if selection is stale
        final addr = user?.addresses
            .where((a) => a.id == _selectedAddressId)
            .firstOrNull;
        if (addr == null) {
          throw Exception('Please add or select a delivery address.');
        }
        deliveryDetails = {
          'address': '${addr.street}, ${addr.city ?? 'Kigali'}',
          'location': {
            'lat': addr.coordinates != null && addr.coordinates!.length > 1
                ? addr.coordinates![1]
                : throw Exception(
                    'Your saved address has no GPS coordinates. Please re-add it using the GPS button.'),
            'lng': addr.coordinates != null && addr.coordinates!.isNotEmpty
                ? addr.coordinates![0]
                : 30.0619,
          }
        };
      }

      final order = await placeOrder(
        listingId: primaryItem.listing.id,
        items: cartItems
            .map((i) => {
                  'listing': i.listing.id,
                  'quantity': i.quantity,
                  'unitPrice': i.listing.offerPrice,
                  'name': i.listing.title,
                  'title': i.listing.title,
                  'productId': i.listing.id,
                  'subtotal': i.quantity * i.listing.offerPrice,
                })
            .toList(),
        fulfillmentType: _deliveryType,
        deliveryDetails: deliveryDetails,
        payment: paymentData,
      );

      HapticFeedback.heavyImpact();
      // Cart is cleared after payment is confirmed (in payment sheet or COD)
      if (mounted) {
        if (_paymentMethod == 'momo' || _paymentMethod == 'airtel') {
          _showMobileMoneyPaymentBottomSheet(context, order);
        } else {
          ref.read(cartProvider.notifier).clear();
          context.pushReplacement('/orders/${order.id}/confirmation');
        }
      }
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showMobileMoneyPaymentBottomSheet(BuildContext context, Order order) {
    final phoneCtrl =
        TextEditingController(text: ref.read(currentUserProvider)?.phone ?? '');
    String statusText = 'Confirm your number below to pay.';
    String? bottomSheetError;
    bool isPaymentLoading = false;

    StreamSubscription? socketSub;
    Timer? pollTimer;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      isDismissible: false,
      enableDrag: false,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            final isMomo = _paymentMethod == 'momo';
            final themeColor =
                isMomo ? const Color(0xFFFFCC00) : const Color(0xFFFF0000);
            final providerName = isMomo ? 'MTN MoMo' : 'Airtel Money';

            Future<void> initiateMoMoPayment() async {
              final phoneInput =
                  phoneCtrl.text.trim().replaceAll(RegExp(r'[\s+]'), '');
              String formattedPhone = phoneInput;
              if (formattedPhone.startsWith('0')) {
                formattedPhone = '250${formattedPhone.substring(1)}';
              }
              if (!formattedPhone.startsWith('250') ||
                  formattedPhone.length != 12) {
                setSheetState(() {
                  bottomSheetError =
                      'Enter a valid Rwandan number (e.g. 078xxxxxxx)';
                });
                return;
              }

              setSheetState(() {
                isPaymentLoading = true;
                bottomSheetError = null;
                statusText = 'Initiating payment...';
              });

              try {
                final response = await ApiClient.instance
                    .post(AppEndpoints.paymentDeposit, data: {
                  'orderId': order.id,
                  'phoneNumber': formattedPhone,
                  'correspondent': isMomo ? 'MTN_MOMO_RWA' : 'AIRTEL_RWA',
                });

                if (response.data != null && response.data['success'] == true) {
                  setSheetState(() {
                    statusText = 'Prompt sent! Enter PIN on your phone...';
                  });

                  // Listen to live socket events for payment success
                  bool verified = false;
                  socketSub = SocketService().orderStatusStream.listen((data) {
                    if (data['_id'] == order.id &&
                        (data['status'] == 'paid' ||
                            data['status'] == 'confirmed')) {
                      verified = true;
                      pollTimer?.cancel();
                      socketSub?.cancel();
                      setSheetState(() {
                        statusText = 'Payment successful! Redirecting...';
                      });
                      Future.delayed(const Duration(seconds: 2), () {
                        if (ctx.mounted) {
                          Navigator.pop(ctx);
                          ref.read(cartProvider.notifier).clear();
                          context.pushReplacement(
                              '/orders/${order.id}/confirmation');
                        }
                      });
                    }
                  });

                  // Setup fallback status polling
                  int pollCount = 0;
                  const int maxPolls = 20; // 60 seconds total
                  pollTimer =
                      Timer.periodic(const Duration(seconds: 3), (timer) async {
                    if (verified) {
                      timer.cancel();
                      return;
                    }
                    pollCount++;

                    try {
                      final statusRes = await ApiClient.instance
                          .get(AppEndpoints.paymentStatus(order.id));
                      if (statusRes.data != null &&
                          statusRes.data['status'] == 'completed') {
                        timer.cancel();
                        verified = true;
                        socketSub?.cancel();
                        setSheetState(() {
                          statusText = 'Payment successful! Redirecting...';
                        });
                        Future.delayed(const Duration(seconds: 2), () {
                          if (ctx.mounted) {
                            Navigator.pop(ctx);
                            ref.read(cartProvider.notifier).clear();
                            context.pushReplacement(
                                '/orders/${order.id}/confirmation');
                          }
                        });
                      } else if (statusRes.data != null &&
                          statusRes.data['status'] == 'failed') {
                        timer.cancel();
                        verified = true;
                        socketSub?.cancel();
                        final description = statusRes.data['failureReason']
                                ?['description'] ??
                            'Transaction failed';
                        setSheetState(() {
                          isPaymentLoading = false;
                          bottomSheetError = 'Payment failed: $description';
                        });
                      }
                    } catch (_) {}

                    if (pollCount >= maxPolls && !verified) {
                      timer.cancel();
                      socketSub?.cancel();
                      setSheetState(() {
                        isPaymentLoading = false;
                        bottomSheetError =
                            'Payment confirmation timed out. You can retry paying from order history.';
                      });
                    }
                  });
                } else {
                  setSheetState(() {
                    isPaymentLoading = false;
                    bottomSheetError =
                        'Payment initiation rejected by provider.';
                  });
                }
              } catch (e) {
                setSheetState(() {
                  isPaymentLoading = false;
                  bottomSheetError = e.toString().replaceAll('Exception: ', '');
                });
              }
            }

            return PopScope(
              canPop: !isPaymentLoading,
              child: Padding(
                padding: EdgeInsets.fromLTRB(
                    20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('$providerName Checkout',
                            style: const TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.w800,
                                color: AppColors.textPrimary)),
                        if (!isPaymentLoading)
                          IconButton(
                            onPressed: () {
                              Navigator.pop(ctx);
                              context.pushReplacement('/orders');
                            },
                            icon: const Icon(Icons.close,
                                size: 20, color: AppColors.textSecondary),
                          ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: themeColor,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Center(
                        child: Text(isMomo ? 'MoMo' : 'Airtel',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w900,
                              color: isMomo
                                  ? const Color(0xFF1A56DB)
                                  : Colors.white,
                            )),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Pay RWF ${order.total.toStringAsFixed(0)}',
                      style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: AppColors.textPrimary),
                    ),
                    const SizedBox(height: 8),
                    if (isPaymentLoading) ...[
                      const SizedBox(height: 16),
                      const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                            strokeWidth: 2.5, color: AppColors.primary),
                      ),
                      const SizedBox(height: 16),
                      Text(statusText,
                          style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textSecondary)),
                      const SizedBox(height: 4),
                      const Text(
                        'Please verify transaction prompt on your screen to complete the rescue payment.',
                        style: TextStyle(
                            fontSize: 11, color: AppColors.textTertiary),
                        textAlign: TextAlign.center,
                      ),
                    ] else ...[
                      const SizedBox(height: 16),
                      CnTextField(
                        label: 'Phone Number',
                        controller: phoneCtrl,
                        hint: '078xxxxxxx',
                        keyboardType: TextInputType.phone,
                      ),
                      if (bottomSheetError != null) ...[
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            const Icon(Icons.error_outline,
                                color: AppColors.error, size: 16),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(bottomSheetError!,
                                  style: const TextStyle(
                                      color: AppColors.error,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600)),
                            ),
                          ],
                        ),
                      ],
                      const SizedBox(height: 20),
                      CnPrimaryButton(
                        label: 'Confirm & Pay',
                        onTap: initiateMoMoPayment,
                      ),
                      const SizedBox(height: 10),
                      TextButton(
                        onPressed: () {
                          Navigator.pop(ctx);
                          context.pushReplacement('/orders');
                        },
                        child: const Text('Pay Later from History',
                            style: TextStyle(
                                color: AppColors.textSecondary,
                                fontWeight: FontWeight.bold,
                                fontSize: 13)),
                      ),
                    ],
                    const SizedBox(height: 12),
                  ],
                ),
              ),
            );
          },
        );
      },
    ).then((_) {
      pollTimer?.cancel();
      socketSub?.cancel();
    });
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Widget child;
  const _SectionCard(
      {required this.title, required this.icon, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withValues(alpha: 0.04),
              blurRadius: 8,
              offset: const Offset(0, 2))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(7),
                decoration: BoxDecoration(
                    color: AppColors.primarySurface,
                    borderRadius: BorderRadius.circular(10)),
                child: Icon(icon, size: 16, color: AppColors.primary),
              ),
              const SizedBox(width: 10),
              Text(title,
                  style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary)),
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
  final IconData icon;
  final String label;
  final String subtitle;
  final String value;
  final String groupValue;
  final void Function(String?) onChanged;
  const _DeliveryOption({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.value,
    required this.groupValue,
    required this.onChanged,
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
          border: Border.all(
              color: selected ? AppColors.primary : AppColors.border,
              width: selected ? 1.5 : 1),
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 22,
              color: selected ? AppColors.primary : AppColors.textSecondary,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label,
                      style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: selected
                              ? AppColors.primary
                              : AppColors.textPrimary)),
                  Text(subtitle,
                      style: const TextStyle(
                          fontSize: 12, color: AppColors.textSecondary)),
                ],
              ),
            ),
            Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                    color: selected ? AppColors.primary : AppColors.border,
                    width: 2),
                color: selected ? AppColors.primary : Colors.transparent,
              ),
              child: selected
                  ? const Icon(Icons.check, size: 12, color: Colors.white)
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}

class _PaymentTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color accentColor;
  final String value;
  final String groupValue;
  final void Function(String?) onChanged;
  const _PaymentTile({
    required this.icon,
    required this.label,
    required this.accentColor,
    required this.value,
    required this.groupValue,
    required this.onChanged,
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
              child: Center(
                  child: Icon(
                icon,
                color: accentColor,
                size: 20,
              )),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(label,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                    color: selected
                        ? AppColors.textPrimary
                        : AppColors.textSecondary,
                  )),
            ),
            Container(
              width: 20,
              height: 20,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                    color: selected ? AppColors.primary : AppColors.border,
                    width: 2),
                color: selected ? AppColors.primary : Colors.transparent,
              ),
              child: selected
                  ? const Icon(Icons.check, size: 12, color: Colors.white)
                  : null,
            ),
          ],
        ),
      ),
    );
  }
}
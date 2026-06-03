import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'dart:async';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../core/services/socket_service.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/feedback/cn_states.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';
import '../../shared/animations/scale_tap.dart';

final _trackingOrderProvider =
    FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  final res = await ApiClient.instance.get(AppEndpoints.orderById(id));
  final data = res.data;
  if (data is Map<String, dynamic>)
    return (data['order'] ?? data['data'] ?? data) as Map<String, dynamic>;
  return {} as Map<String, dynamic>;
});

class OrderTrackingScreen extends ConsumerStatefulWidget {
  final String orderId;
  const OrderTrackingScreen({super.key, required this.orderId});
  @override
  ConsumerState<OrderTrackingScreen> createState() =>
      _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends ConsumerState<OrderTrackingScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseCtrl;
  StreamSubscription<Map<String, dynamic>>? _locationSubscription;
  LatLng? _riderPosition;
  bool _socketInitialized = false;

  static const _steps = [
    _Step('Order Placed', 'pending', Icons.shopping_bag_outlined, '🛍'),
    _Step('Confirmed', 'confirmed', Icons.check_circle_outline, '✅'),
    _Step('Preparing', 'preparing', Icons.restaurant_outlined, '👨‍🍳'),
    _Step('Ready', 'ready_for_pickup', Icons.inventory_2_outlined, '🎉'),
    _Step('Completed', 'completed', Icons.celebration_outlined, '🏆'),
  ];

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 1200))
      ..repeat(reverse: true);
  }

  @override
  void dispose() {
    _locationSubscription?.cancel();
    _pulseCtrl.dispose();
    super.dispose();
  }

  void _setupSocketTracking() {
    if (_socketInitialized) return;
    final auth = ref.read(authProvider);
    if (auth is AuthAuthenticated) {
      _socketInitialized = true;
      final socketService = SocketService();
      socketService.connect(auth.token);
      socketService.trackOrder(widget.orderId);

      _locationSubscription = socketService.locationStream.listen((data) {
        if (!mounted) return;
        debugPrint(
            "Live tracking coordinate received in consumer screen: $data");
        if (data['orderId'] == widget.orderId || data['riderId'] != null) {
          setState(() {
            _riderPosition = LatLng(
              (data['lat'] as num).toDouble(),
              (data['lng'] as num).toDouble(),
            );
          });
        }
      });
    }
  }

  LatLng? _parseCoords(dynamic locationData) {
    if (locationData == null) return null;
    if (locationData is Map && locationData['location'] is Map) {
      // Sometimes it is nested inside location object
      return _parseCoords(locationData['location']);
    }
    if (locationData is Map && locationData['coordinates'] is List) {
      final list = locationData['coordinates'] as List;
      if (list.length >= 2) {
        return LatLng(
          (list[1] as num).toDouble(),
          (list[0] as num).toDouble(),
        );
      }
    }
    return null;
  }

  Widget _buildMapCard(
      Map<String, dynamic> order, Map<String, dynamic> delivery) {
    final pickup = delivery['pickupLocation'] as Map<String, dynamic>?;
    final dropoff = delivery['dropoffLocation'] as Map<String, dynamic>?;

    final pickupCoords = _parseCoords(pickup);
    final dropoffCoords = _parseCoords(dropoff);
    final currentCoords = _riderPosition ?? _parseCoords(delivery);

    final markers = <Marker>[];

    if (pickupCoords != null) {
      markers.add(Marker(
        point: pickupCoords,
        width: 40,
        height: 40,
        child: Container(
          decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 4)]),
          child:
              const Center(child: Text('🏪', style: TextStyle(fontSize: 16))),
        ),
      ));
    }

    if (dropoffCoords != null) {
      markers.add(Marker(
        point: dropoffCoords,
        width: 40,
        height: 40,
        child: Container(
          decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 4)]),
          child:
              const Center(child: Text('🏠', style: TextStyle(fontSize: 16))),
        ),
      ));
    }

    if (currentCoords != null) {
      markers.add(Marker(
        point: currentCoords,
        width: 40,
        height: 40,
        child: Container(
          decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [BoxShadow(color: Colors.black38, blurRadius: 6)]),
          child:
              const Center(child: Text('🏍️', style: TextStyle(fontSize: 18))),
        ),
      ));
    }

    if (pickupCoords == null && dropoffCoords == null) {
      return const SizedBox.shrink();
    }

    final initialCenter = currentCoords ?? pickupCoords ?? dropoffCoords!;

    return Container(
      height: 220,
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.border),
      ),
      clipBehavior: Clip.antiAlias,
      child: FlutterMap(
        options: MapOptions(
          initialCenter: initialCenter,
          initialZoom: 14.0,
          interactionOptions: const InteractionOptions(
            flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
          ),
        ),
        children: [
          TileLayer(
            urlTemplate:
                'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
            subdomains: const ['a', 'b', 'c', 'd'],
            userAgentPackageName: 'com.chopnow.app',
          ),
          MarkerLayer(markers: markers),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final asyncOrder = ref.watch(_trackingOrderProvider(widget.orderId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Track Order',
            style: TextStyle(
                fontWeight: FontWeight.w900,
                color: AppColors.textPrimary,
                fontSize: 18)),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        actions: [
          ScaleTap(
            onTap: () {
              HapticFeedback.lightImpact();
              ref.invalidate(_trackingOrderProvider(widget.orderId));
            },
            child: Container(
              margin: const EdgeInsets.only(right: 12),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primarySurface,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.refresh_rounded,
                  color: AppColors.primary, size: 20),
            ),
          ),
        ],
      ),
      body: asyncOrder.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.primary)),
        error: (e, _) => CnErrorState(
            message: e.toString(),
            onRetry: () =>
                ref.invalidate(_trackingOrderProvider(widget.orderId))),
        data: (order) {
          final status = order['status']?.toString() ?? 'pending';
          final currentStep = _steps.indexWhere((s) => s.key == status);
          final isActive = status != 'completed' && status != 'cancelled';
          final isDelivery =
              order['fulfillmentType']?.toString().toLowerCase() == 'delivery';
          final delivery = order['delivery'] as Map<String, dynamic>?;

          // Enable live location socket tracking for active delivery statuses
          if (isDelivery &&
              delivery != null &&
              (status == 'out_for_delivery' ||
                  status == 'delivering' ||
                  status == 'picked_up' ||
                  status == 'in_transit')) {
            _setupSocketTracking();
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Status Hero Card ──
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: status == 'cancelled'
                        ? LinearGradient(colors: [
                            AppColors.error,
                            AppColors.error.withValues(alpha: 0.8)
                          ])
                        : AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: (status == 'cancelled'
                                ? AppColors.error
                                : AppColors.primary)
                            .withValues(alpha: 0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      )
                    ],
                  ),
                  child: Column(
                    children: [
                      // Pulsing status emoji for active orders
                      AnimatedBuilder(
                        animation: _pulseCtrl,
                        builder: (_, child) => Transform.scale(
                          scale:
                              isActive ? (1.0 + _pulseCtrl.value * 0.08) : 1.0,
                          child: child,
                        ),
                        child: Text(
                          _statusEmoji(status),
                          style: const TextStyle(fontSize: 52),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        _statusLabel(status),
                        style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: Colors.white),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 5),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(100),
                        ),
                        child: Text(
                          'Order #${order['_id']?.toString().substring(0, 8).toUpperCase() ?? '...'}',
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 1),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // ── Live Rider Map Tracking ──
                if (isDelivery &&
                    delivery != null &&
                    (status == 'out_for_delivery' ||
                        status == 'delivering' ||
                        status == 'picked_up' ||
                        status == 'in_transit'))
                  _buildMapCard(order, delivery),
                const SizedBox(height: 20),

                // ── Pickup Code ──
                if (status == 'ready_for_pickup' && order['pickupCode'] != null)
                  Column(
                    children: [
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppColors.successSurface,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                              color: AppColors.success.withValues(alpha: 0.4),
                              width: 1.5),
                        ),
                        child: Column(
                          children: [
                            const Text('🎫 Your Pickup Code',
                                style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.success)),
                            const SizedBox(height: 10),
                            Text(
                              '${order['pickupCode']}',
                              style: const TextStyle(
                                fontSize: 40,
                                fontWeight: FontWeight.w900,
                                color: AppColors.success,
                                letterSpacing: 10,
                              ),
                            ),
                            const SizedBox(height: 6),
                            const Text('Show this code at the counter',
                                style: TextStyle(
                                    fontSize: 12, color: AppColors.success)),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),

                // ── Order Progress Timeline ──
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(20),
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
                      const Text('Order Progress',
                          style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textPrimary)),
                      const SizedBox(height: 16),
                      ..._steps.asMap().entries.map((entry) {
                        final i = entry.key;
                        final step = entry.value;
                        final isDone = i <= currentStep;
                        final isCurrent = i == currentStep;
                        return _TimelineStep(
                          step: step,
                          isDone: isDone,
                          isCurrent: isCurrent,
                          isLast: i == _steps.length - 1,
                          pulseAnim: isCurrent ? _pulseCtrl : null,
                        );
                      }),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // ── Order Items ──
                if (order['items'] != null &&
                    (order['items'] as List).isNotEmpty)
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Order Items',
                            style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w800,
                                color: AppColors.textPrimary)),
                        const SizedBox(height: 12),
                        ...((order['items'] as List)
                            .map((item) => _OrderItem(item: item))),
                        const SizedBox(height: 10),
                        // Total
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 12),
                          decoration: BoxDecoration(
                            color: AppColors.primarySurface,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Total Paid',
                                  style: TextStyle(
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.primary)),
                              Text(
                                  'RWF ${order['total'] ?? order['totalAmount'] ?? 0}',
                                  style: const TextStyle(
                                      fontWeight: FontWeight.w900,
                                      fontSize: 18,
                                      color: AppColors.primary)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                if (status == 'completed') ...[
                  const SizedBox(height: 16),
                  CnPrimaryButton(
                    label: 'Write a Review ⭐',
                    onTap: () =>
                        context.push('/orders/${widget.orderId}/review'),
                  ),
                ],
                const SizedBox(height: 24),
              ],
            ),
          );
        },
      ),
    );
  }

  String _statusEmoji(String s) => switch (s) {
        'confirmed' => '✅',
        'preparing' => '👨‍🍳',
        'ready_for_pickup' => '🎉',
        'completed' => '🏆',
        'cancelled' => '❌',
        _ => '⏳',
      };

  String _statusLabel(String s) => switch (s) {
        'confirmed' => 'Order Confirmed!',
        'preparing' => 'Being Prepared',
        'ready_for_pickup' => 'Ready for Pickup! 🎉',
        'completed' => 'Order Completed!',
        'cancelled' => 'Order Cancelled',
        _ => 'Order Placed',
      };
}

class _Step {
  final String label;
  final String key;
  final IconData icon;
  final String emoji;
  const _Step(this.label, this.key, this.icon, this.emoji);
}

class _TimelineStep extends StatelessWidget {
  final _Step step;
  final bool isDone;
  final bool isCurrent;
  final bool isLast;
  final Animation<double>? pulseAnim;
  const _TimelineStep({
    required this.step,
    required this.isDone,
    required this.isCurrent,
    required this.isLast,
    this.pulseAnim,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            // Icon node
            AnimatedBuilder(
              animation: pulseAnim ?? const AlwaysStoppedAnimation(0),
              builder: (_, child) => Transform.scale(
                scale: isCurrent && pulseAnim != null
                    ? (1.0 + pulseAnim!.value * 0.12)
                    : 1.0,
                child: child,
              ),
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  gradient: isDone ? AppColors.primaryGradient : null,
                  color: isDone ? null : AppColors.surfaceVariant,
                  shape: BoxShape.circle,
                  border: isCurrent
                      ? Border.all(color: AppColors.primary, width: 2.5)
                      : null,
                  boxShadow: isCurrent
                      ? [
                          BoxShadow(
                              color: AppColors.primary.withValues(alpha: 0.3),
                              blurRadius: 10,
                              spreadRadius: 2)
                        ]
                      : null,
                ),
                child: Center(
                  child: isDone
                      ? Text(step.emoji, style: const TextStyle(fontSize: 18))
                      : Icon(step.icon,
                          size: 18, color: AppColors.textSecondary),
                ),
              ),
            ),
            // Connector line
            if (!isLast)
              Container(
                width: 2,
                height: 36,
                decoration: BoxDecoration(
                  gradient: isDone
                      ? LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                              AppColors.primary,
                              AppColors.primary.withValues(alpha: 0.3)
                            ])
                      : null,
                  color: isDone ? null : AppColors.border,
                  borderRadius: BorderRadius.circular(1),
                ),
              ),
          ],
        ),
        const SizedBox(width: 14),
        Padding(
          padding: const EdgeInsets.only(top: 9),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(step.label,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: isCurrent ? FontWeight.w800 : FontWeight.w500,
                    color: isDone
                        ? AppColors.textPrimary
                        : AppColors.textSecondary,
                  )),
              if (isCurrent)
                const Text('In progress...',
                    style: TextStyle(
                        fontSize: 11,
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ],
    );
  }
}

class _OrderItem extends StatelessWidget {
  final dynamic item;
  const _OrderItem({required this.item});

  @override
  Widget build(BuildContext context) {
    final listing = item['listing'] ?? {};
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: Container(
              width: 56,
              height: 56,
              color: AppColors.surfaceVariant,
              child: listing['photos'] != null &&
                      (listing['photos'] as List).isNotEmpty &&
                      (listing['photos'][0].toString().startsWith('http://') ||
                          listing['photos'][0]
                              .toString()
                              .startsWith('https://'))
                  ? Image.network(listing['photos'][0].toString(),
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const Icon(
                          Icons.fastfood_outlined,
                          color: AppColors.textSecondary))
                  : const Icon(Icons.fastfood_outlined,
                      color: AppColors.textSecondary),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(listing['title'] ?? item['name'] ?? 'Item',
                    style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                        color: AppColors.textPrimary)),
                const SizedBox(height: 2),
                Text('× ${item['quantity']}',
                    style: const TextStyle(
                        fontSize: 12, color: AppColors.textSecondary)),
              ],
            ),
          ),
          Text('RWF ${item['price'] ?? 0}',
              style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                  color: AppColors.primary)),
        ],
      ),
    );
  }
}

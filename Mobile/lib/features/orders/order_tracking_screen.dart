import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:animate_do/animate_do.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/feedback/cn_states.dart';
import '../../shared/animations/scale_tap.dart';

final _trackingOrderProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, id) async {
  final res = await ApiClient.instance.get(AppEndpoints.orderById(id));
  final data = res.data;
  if (data is Map<String, dynamic>) return (data['order'] ?? data['data'] ?? data) as Map<String, dynamic>;
  return {} as Map<String, dynamic>;
});

class OrderTrackingScreen extends ConsumerStatefulWidget {
  final String orderId;
  const OrderTrackingScreen({super.key, required this.orderId});
  @override
  ConsumerState<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends ConsumerState<OrderTrackingScreen> {
  static const _statusSteps = [
    {'status': 'confirmed', 'label': 'Confirmed', 'icon': Icons.check_rounded},
    {'status': 'preparing', 'label': 'Prep', 'icon': Icons.soup_kitchen_rounded},
    {'status': 'ready_for_pickup', 'label': 'Ready', 'icon': Icons.shopping_bag_rounded},
  ];

  @override
  Widget build(BuildContext context) {
    final asyncOrder = ref.watch(_trackingOrderProvider(widget.orderId));

    return Scaffold(
      backgroundColor: AppColors.surfaceIvory,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text('Tracking Your Rescue', style: TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
        backgroundColor: AppColors.surfaceIvory,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.primary),
            onPressed: () => ref.invalidate(_trackingOrderProvider(widget.orderId)),
          ),
        ],
      ),
      body: asyncOrder.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (e, _) => CnErrorState(message: e.toString(), onRetry: () => ref.invalidate(_trackingOrderProvider(widget.orderId))),
        data: (order) {
          final status = order['status']?.toString() ?? 'preparing';
          
          return SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Map Area
                Stack(
                  alignment: Alignment.bottomCenter,
                  children: [
                    Container(
                      width: double.infinity,
                      height: 320,
                      decoration: const BoxDecoration(
                        color: AppColors.surfaceVariant,
                        borderRadius: BorderRadius.only(
                          bottomLeft: Radius.circular(32),
                          bottomRight: Radius.circular(32),
                        ),
                      ),
                      child: ClipRRect(
                        borderRadius: const BorderRadius.only(
                          bottomLeft: Radius.circular(32),
                          bottomRight: Radius.circular(32),
                        ),
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            Image.network(
                              'https://lh3.googleusercontent.com/aida-public/AB6AXuDZ3AKLVRKAhP-4h568c09yak-4y9e7up0BUgdudhduuy2OYETEJbFMxHPJdg7pohORZYB8Y18uWm81YWsPTOqOgwQa6geMmn_cZyVM3AXWZr-NjUE0y1HOJryfAZ9Hd4CPkrVphro9InxH8WZtlHRlGgT-eE9cfeQPDMooZleCFy5bZi5o66IrseRFCN5kK7EUKmTPN38zKOPXO-IViKr2mEFix0taFRVoht3q3ZfZHFhsp_m8e1YDQ2CcmyKE62tkowCsVF0GBo-U',
                              fit: BoxFit.cover,
                              color: Colors.black.withOpacity(0.2),
                              colorBlendMode: BlendMode.multiply,
                            ),
                            Container(
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  begin: Alignment.bottomCenter,
                                  end: Alignment.topCenter,
                                  colors: [
                                    AppColors.surfaceIvory,
                                    AppColors.surfaceIvory.withOpacity(0.2),
                                    Colors.transparent,
                                  ],
                                ),
                              ),
                            ),
                            // Simulated Path / Markers
                            Positioned(
                              top: 140,
                              left: MediaQuery.of(context).size.width * 0.3 - 24,
                              child: _MapMarker(icon: Icons.storefront_rounded, color: AppColors.primary),
                            ),
                            Positioned(
                              top: 200,
                              right: MediaQuery.of(context).size.width * 0.3 - 20,
                              child: _MapMarker(icon: Icons.person_rounded, color: AppColors.accent, size: 40),
                            ),
                          ],
                        ),
                      ),
                    ),
                    
                    // Progress Tracker (Bento Card)
                    Transform.translate(
                      offset: const Offset(0, 32),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: _ProgressTracker(status: status),
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 56),

                // Bento Grid Layout Details
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    children: [
                      // Vendor Info
                      _VendorCard(order: order),
                      const SizedBox(height: 16),
                      // Pickup Instructions
                      _InstructionsCard(),
                      const SizedBox(height: 16),
                      // QR Code Section
                      if (status == 'ready_for_pickup')
                        _QRCodeSection(orderId: order['_id']?.toString() ?? 'CN-8924'),
                    ],
                  ),
                ),
                
                const SizedBox(height: 40),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _MapMarker extends StatelessWidget {
  final IconData icon;
  final Color color;
  final double size;
  const _MapMarker({required this.icon, required this.color, this.size = 48});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.surfaceIvory, width: 4),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Icon(icon, color: Colors.white, size: size * 0.5),
    );
  }
}

class _ProgressTracker extends StatelessWidget {
  final String status;
  const _ProgressTracker({required this.status});

  @override
  Widget build(BuildContext context) {
    final statusList = ['confirmed', 'preparing', 'ready_for_pickup'];
    int currentIndex = statusList.indexOf(status);
    if (currentIndex == -1) currentIndex = 0; // Default or cancelled etc.

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border.withOpacity(0.5)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Preparing your rescue', style: TextStyle(fontFamily: 'Inter', fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                  const SizedBox(height: 4),
                  Text('Estimated ready time: 14:30', style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.textSecondary)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFF2994A).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(100),
                ),
                child: const Text('Live', style: TextStyle(fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF904D00))), // primary
              ),
            ],
          ),
          const SizedBox(height: 24),
          
          // Horizontal Steps
          Stack(
            alignment: Alignment.center,
            children: [
              // Background line
              Positioned(
                left: 30, right: 30,
                child: Container(height: 4, decoration: BoxDecoration(color: AppColors.surfaceVariant, borderRadius: BorderRadius.circular(2))),
              ),
              // Active line
              Positioned(
                left: 30, 
                right: currentIndex == 0 ? MediaQuery.of(context).size.width - 110 : (currentIndex == 1 ? (MediaQuery.of(context).size.width - 70) / 2 : 30),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  height: 4, 
                  decoration: BoxDecoration(color: AppColors.accent, borderRadius: BorderRadius.circular(2))
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _StepItem(label: 'Confirmed', icon: Icons.check_rounded, isActive: currentIndex >= 0, isCurrent: currentIndex == 0),
                  _StepItem(label: 'Prep', icon: Icons.soup_kitchen_rounded, isActive: currentIndex >= 1, isCurrent: currentIndex == 1),
                  _StepItem(label: 'Ready', icon: Icons.shopping_bag_rounded, isActive: currentIndex >= 2, isCurrent: currentIndex == 2),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StepItem extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isActive;
  final bool isCurrent;
  
  const _StepItem({required this.label, required this.icon, required this.isActive, required this.isCurrent});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: isCurrent ? Colors.white : (isActive ? AppColors.accent : AppColors.surfaceIvory),
            shape: BoxShape.circle,
            border: Border.all(
              color: isCurrent ? AppColors.accent : (isActive ? AppColors.accent : AppColors.border.withOpacity(0.5)),
              width: isCurrent ? 4 : 1,
            ),
            boxShadow: isActive ? [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 4, offset: const Offset(0, 2))] : null,
          ),
          child: Icon(icon, color: isCurrent ? AppColors.accent : (isActive ? Colors.white : AppColors.border), size: 24),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: TextStyle(
            fontFamily: 'Inter',
            fontSize: 12,
            fontWeight: isCurrent ? FontWeight.w700 : FontWeight.w600,
            color: isActive ? AppColors.textPrimary : AppColors.border,
            letterSpacing: 0.5,
          ),
        ),
      ],
    );
  }
}

class _VendorCard extends StatelessWidget {
  final Map<String, dynamic> order;
  const _VendorCard({required this.order});

  @override
  Widget build(BuildContext context) {
    // Using dummy vendor data if not fully populated
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border.withOpacity(0.5)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 64, height: 64,
            decoration: BoxDecoration(color: AppColors.surfaceVariant, borderRadius: BorderRadius.circular(12)),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(
                'https://lh3.googleusercontent.com/aida-public/AB6AXuC1Tysa9hVQn2pWE8xPLFG-pXqgSzk2pAqhlg6GoltBiy_TfgCzYhN5XEmqkosuLJ7UzuU06OD1pYUiUioWxj79gKu7W91vtxCg33MkWNnBiI1Sbh9hG-PPhfLYM1Iix_veB3g_7tVecO-hTMWdjDJcRM0NAxsktAki3ZMJdXTrzDaRTlCaU3QXstKpAe0fQweilJjC1DGmquhzMc15Y6eS3NsG0K_fUeL194AIHFySnfL8Gxm1IDSZxkvV6EmtdNFvGH-vAPiiCf06',
                fit: BoxFit.cover,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Simba Bakery', style: TextStyle(fontFamily: 'Inter', fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                const SizedBox(height: 4),
                Row(
                  children: const [
                    Icon(Icons.eco_rounded, color: AppColors.accent, size: 16),
                    SizedBox(width: 4),
                    Text('Eco-Partner', style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.textSecondary)),
                  ],
                ),
              ],
            ),
          ),
          ScaleTap(
            onTap: () {},
            child: Container(
              width: 48, height: 48,
              decoration: BoxDecoration(
                color: AppColors.surface,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.chat_bubble_outline_rounded, color: AppColors.textPrimary),
            ),
          ),
        ],
      ),
    );
  }
}

class _InstructionsCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF3E7), // amber-muted
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 32, height: 32,
            decoration: const BoxDecoration(
              color: Color(0xFFFFDCC3), // primary-fixed
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.directions_walk_rounded, color: Color(0xFF6E3900), size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text('Pickup Instructions', style: TextStyle(fontFamily: 'Inter', fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF6E3900))),
                SizedBox(height: 4),
                Text('Pickup at Gate 2, Kigali Heights. Show your QR code to the staff at the dedicated ChopNow counter.', style: TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.textSecondary)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _QRCodeSection extends StatelessWidget {
  final String orderId;
  const _QRCodeSection({required this.orderId});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border.withOpacity(0.5)),
      ),
      child: Column(
        children: [
          const Text('Scan at pickup', style: TextStyle(fontFamily: 'Inter', fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 4),
          Text('Order #${orderId.substring(0, 8)}', style: const TextStyle(fontFamily: 'Inter', fontSize: 14, color: AppColors.textSecondary)),
          const SizedBox(height: 24),
          Container(
            width: 192, height: 192,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border.withOpacity(0.5)),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(
                'https://lh3.googleusercontent.com/aida-public/AB6AXuBpToQnCrsbBPHT0-CUDx4m68YGxp3ug69kdBMLBcD7_KN0qaiV01noO2haIe4BlI2ZB5Cu78JTr1iggTPYjDJIwPr9lip1maWi0_IDMgK8-_2x1MUkjsId7x4nrtiCwSJmUPqPXiASZE1ig_KoakYA1XhhdeaB4zqhOnxWcR3kgL_VaH_cX9sIkExK5TH-URviH87YvFbe30Un6byOYM78Oo-vmvjAMw1lBF-vacLMKypibNiX_G388M0mzQVf1Yla4ZZn01b9cGRY',
                fit: BoxFit.cover,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

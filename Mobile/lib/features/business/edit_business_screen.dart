import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/providers/business_provider.dart';
import '../../core/models/business_model.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';
import '../../shared/widgets/inputs/cn_text_field.dart';

class EditBusinessScreen extends ConsumerStatefulWidget {
  final String businessId;
  const EditBusinessScreen({super.key, required this.businessId});

  @override
  ConsumerState<EditBusinessScreen> createState() => _EditBusinessScreenState();
}

class _EditBusinessScreenState extends ConsumerState<EditBusinessScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _websiteCtrl = TextEditingController();
  final _whatsappCtrl = TextEditingController();

  String _selectedType = 'restaurant';
  bool _isLoading = false;
  bool _initialized = false;
  String? _error;

  static const _types = [
    {'key': 'farmer', 'label': '🌾 Farmer'},
    {'key': 'restaurant', 'label': '🍽 Restaurant'},
    {'key': 'bakery', 'label': '🥐 Bakery'},
    {'key': 'cafe', 'label': '☕ Café'},
    {'key': 'supermarket', 'label': '🛒 Supermarket'},
    {'key': 'other', 'label': '📦 Other'},
  ];

  void _initFromBusiness(Business biz) {
    if (_initialized) return;
    _initialized = true;
    _nameCtrl.text = biz.name;
    _descCtrl.text = biz.description ?? '';
    _addressCtrl.text = biz.address ?? '';
    _phoneCtrl.text = biz.phone ?? '';
    _emailCtrl.text = biz.email ?? '';
    _websiteCtrl.text = biz.website ?? '';
    _whatsappCtrl.text = biz.whatsapp ?? '';
    _selectedType = biz.type ?? 'restaurant';
  }

  @override
  void dispose() {
    _nameCtrl.dispose(); _descCtrl.dispose();
    _addressCtrl.dispose(); _phoneCtrl.dispose();
    _emailCtrl.dispose(); _websiteCtrl.dispose();
    _whatsappCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final asyncBiz = ref.watch(businessDetailProvider(widget.businessId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Edit Business', style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        actions: [
          // Share store link
          IconButton(
            icon: const Icon(Icons.share_outlined, color: AppColors.primary),
            onPressed: () {
              HapticFeedback.selectionClick();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Store link: chopnow.app/store/${widget.businessId}'), backgroundColor: AppColors.primary),
              );
            },
          ),
        ],
      ),
      body: asyncBiz.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (business) {
          _initFromBusiness(business);
          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Cover + logo section
                  _MediaSection(business: business, businessId: widget.businessId),
                  const SizedBox(height: 20),

                  // Store link
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.primarySurface,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.primary.withOpacity(0.2)),
                    ),
                    child: Row(children: [
                      const Icon(Icons.link, color: AppColors.primary, size: 18),
                      const SizedBox(width: 8),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        const Text('Your Store Link', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                        Text('chopnow.app/store/${widget.businessId}',
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary)),
                      ])),
                      IconButton(
                        icon: const Icon(Icons.copy, size: 16, color: AppColors.primary),
                        onPressed: () {
                          Clipboard.setData(ClipboardData(text: 'chopnow.app/store/${widget.businessId}'));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Link copied!'), duration: Duration(seconds: 1)),
                          );
                        },
                      ),
                    ]),
                  ),
                  const SizedBox(height: 16),

                  // Verification status
                  _VerificationBadge(business: business, onUploadKyc: () => context.push('/business/${widget.businessId}/kyc')),
                  const SizedBox(height: 20),

                  // Business type
                  const Text('Business Type', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 40,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: _types.map((t) {
                        final selected = _selectedType == t['key'];
                        return GestureDetector(
                          onTap: () => setState(() => _selectedType = t['key']!),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 150),
                            margin: const EdgeInsets.only(right: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            decoration: BoxDecoration(
                              color: selected ? AppColors.primarySurface : AppColors.surface,
                              borderRadius: BorderRadius.circular(100),
                              border: Border.all(color: selected ? AppColors.primary : AppColors.border),
                            ),
                            child: Text(t['label']!, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600,
                                color: selected ? AppColors.primary : AppColors.textPrimary)),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 16),

                  CnTextField(label: 'Business Name *', controller: _nameCtrl, hint: 'e.g. Mama Cooks Kitchen',
                      validator: (v) => v == null || v.trim().length < 2 ? 'Required' : null),
                  const SizedBox(height: 12),
                  CnTextField(label: 'Description *', controller: _descCtrl, hint: 'Tell customers about your food…', maxLines: 4,
                      validator: (v) => v == null || v.trim().length < 10 ? 'Too short' : null),
                  const SizedBox(height: 12),
                  CnTextField(label: 'Address *', controller: _addressCtrl, hint: 'KN 5 Rd, Kigali',
                      validator: (v) => v == null || v.trim().isEmpty ? 'Required' : null),
                  const SizedBox(height: 16),

                  const Text('Contact Info', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                  const SizedBox(height: 10),
                  CnTextField(label: 'Phone', controller: _phoneCtrl, hint: '+250 7XX XXX XXX',
                      keyboardType: TextInputType.phone, prefixIcon: Icons.phone_outlined),
                  const SizedBox(height: 12),
                  CnTextField(label: 'Email', controller: _emailCtrl, hint: 'info@yourbiz.com',
                      keyboardType: TextInputType.emailAddress, prefixIcon: Icons.email_outlined),
                  const SizedBox(height: 12),
                  CnTextField(label: 'Website', controller: _websiteCtrl, hint: 'https://yourbiz.com',
                      keyboardType: TextInputType.url, prefixIcon: Icons.language),
                  const SizedBox(height: 12),
                  CnTextField(label: 'WhatsApp', controller: _whatsappCtrl, hint: '+250 7XX XXX XXX',
                      keyboardType: TextInputType.phone, prefixIcon: Icons.chat_outlined),

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
                    label: 'Save Changes',
                    isLoading: _isLoading,
                    onTap: _isLoading ? null : _save,
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    HapticFeedback.mediumImpact();
    setState(() { _isLoading = true; _error = null; });
    try {
      await ref.read(businessNotifierProvider.notifier).updateBusiness(widget.businessId, {
        'name': _nameCtrl.text.trim(),
        'type': _selectedType,
        'description': _descCtrl.text.trim(),
        'address': _addressCtrl.text.trim(),
        'contact': {
          if (_phoneCtrl.text.isNotEmpty) 'phone': _phoneCtrl.text.trim(),
          if (_emailCtrl.text.isNotEmpty) 'email': _emailCtrl.text.trim(),
          if (_whatsappCtrl.text.isNotEmpty) 'whatsapp': _whatsappCtrl.text.trim(),
        },
        if (_websiteCtrl.text.isNotEmpty) 'website': _websiteCtrl.text.trim(),
      });
      ref.invalidate(businessDetailProvider(widget.businessId));
      ref.invalidate(myBusinessesProvider);
      HapticFeedback.heavyImpact();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Business updated! ✅'), backgroundColor: AppColors.primary),
        );
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}

class _MediaSection extends ConsumerWidget {
  final Business business;
  final String businessId;
  const _MediaSection({required this.business, required this.businessId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(children: [
      // Cover image
      GestureDetector(
        onTap: () => _uploadCover(context, ref),
        child: Container(
          height: 140,
          width: double.infinity,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            gradient: AppColors.heroGradient,
            image: business.coverImage != null
                ? DecorationImage(image: NetworkImage(business.coverImage!), fit: BoxFit.cover)
                : null,
          ),
          child: Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(color: Colors.black.withOpacity(0.4), borderRadius: BorderRadius.circular(100)),
              child: const Row(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.camera_alt_outlined, color: Colors.white, size: 16),
                SizedBox(width: 6),
                Text('Change Cover', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
              ]),
            ),
          ),
        ),
      ),
      const SizedBox(height: 12),
      // Logo
      Row(children: [
        GestureDetector(
          onTap: () => _uploadLogo(context, ref),
          child: Container(
            width: 72, height: 72,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border, width: 2),
              color: AppColors.surfaceVariant,
            ),
            child: business.logo != null
                ? ClipRRect(borderRadius: BorderRadius.circular(12), child: Image.network(business.logo!, fit: BoxFit.cover))
                : const Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Icon(Icons.add_photo_alternate_outlined, size: 24, color: AppColors.textSecondary),
                    SizedBox(height: 2),
                    Text('Logo', style: TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                  ]),
          ),
        ),
        const SizedBox(width: 14),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(business.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
          if (business.type != null) Text(business.type!, style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
          if (business.rating != null)
            Row(children: [
              const Icon(Icons.star_rounded, color: AppColors.accent, size: 14),
              const SizedBox(width: 2),
              Text('${business.rating?.toStringAsFixed(1)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
              Text(' (${business.reviewCount ?? 0} reviews)', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
            ]),
        ])),
      ]),
    ]);
  }

  Future<void> _uploadLogo(BuildContext context, WidgetRef ref) async {
    final picker = ImagePicker();
    final img = await picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
    if (img == null) return;
    try {
      await ref.read(businessNotifierProvider.notifier).uploadLogo(businessId, img.path);
      ref.invalidate(businessDetailProvider(businessId));
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Logo updated! 📸'), backgroundColor: AppColors.primary),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed: $e'), backgroundColor: AppColors.error),
        );
      }
    }
  }

  Future<void> _uploadCover(BuildContext context, WidgetRef ref) async {
    final picker = ImagePicker();
    final img = await picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
    if (img == null) return;
    try {
      await ref.read(businessNotifierProvider.notifier).uploadCover(businessId, img.path);
      ref.invalidate(businessDetailProvider(businessId));
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Cover updated! 🖼'), backgroundColor: AppColors.primary),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed: $e'), backgroundColor: AppColors.error),
        );
      }
    }
  }
}

class _VerificationBadge extends StatelessWidget {
  final Business business;
  final VoidCallback onUploadKyc;
  const _VerificationBadge({required this.business, required this.onUploadKyc});

  @override
  Widget build(BuildContext context) {
    if (business.isApproved) {
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: AppColors.successSurface, borderRadius: BorderRadius.circular(10)),
        child: const Row(children: [
          Icon(Icons.verified_rounded, color: AppColors.success, size: 18),
          SizedBox(width: 8),
          Text('Verified Business ✅', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.success)),
        ]),
      );
    }

    return GestureDetector(
      onTap: onUploadKyc,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: business.isPending ? AppColors.warningSurface : AppColors.errorSurface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: (business.isPending ? AppColors.warning : AppColors.error).withOpacity(0.3)),
        ),
        child: Row(children: [
          Icon(
            business.isPending ? Icons.hourglass_top_rounded : Icons.upload_file_outlined,
            color: business.isPending ? AppColors.warning : AppColors.error,
            size: 18,
          ),
          const SizedBox(width: 8),
          Expanded(child: Text(
            business.isPending
                ? 'Verification in progress (24-48 hrs)'
                : 'Upload KYC documents to get verified →',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600,
                color: business.isPending ? AppColors.warning : AppColors.error),
          )),
          if (!business.isPending) const Icon(Icons.chevron_right, size: 16, color: AppColors.error),
        ]),
      ),
    );
  }
}

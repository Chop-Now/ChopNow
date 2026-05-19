import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../core/providers/business_provider.dart';
import '../../core/models/business_model.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';

class KycUploadScreen extends ConsumerStatefulWidget {
  final String businessId;
  const KycUploadScreen({super.key, required this.businessId});

  @override
  ConsumerState<KycUploadScreen> createState() => _KycUploadScreenState();
}

class _KycUploadScreenState extends ConsumerState<KycUploadScreen> {
  final List<_KycDoc> _documents = [];
  bool _isUploading = false;
  String? _error;

  static const _docTypes = [
    {'key': 'license', 'label': 'Business License', 'icon': Icons.badge_outlined, 'desc': 'Your business registration or trade license'},
    {'key': 'health_cert', 'label': 'Health Certificate', 'icon': Icons.health_and_safety_outlined, 'desc': 'Food handling or health inspection certificate'},
    {'key': 'id_card', 'label': 'ID Card / Passport', 'icon': Icons.credit_card_outlined, 'desc': 'Government-issued identification'},
  ];

  @override
  Widget build(BuildContext context) {
    final asyncBiz = ref.watch(businessDetailProvider(widget.businessId));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('KYC Verification', style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      body: asyncBiz.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (e, _) => Center(child: Text('Error: $e')),
        data: (business) => SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Status banner
              _StatusBanner(verification: business.verification),
              const SizedBox(height: 20),

              // Previously uploaded docs
              if (business.verification.documents.isNotEmpty) ...[
                const Text('Uploaded Documents', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                const SizedBox(height: 10),
                ...business.verification.documents.map((doc) => _UploadedDocTile(doc: doc)),
                const SizedBox(height: 20),
                const Divider(),
                const SizedBox(height: 12),
              ],

              // Upload new docs section (only if not yet approved)
              if (!business.isApproved) ...[
                const Text('Upload Documents', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                const SizedBox(height: 6),
                const Text(
                  'Upload clear photos or scans of the following documents. All documents are securely stored and reviewed within 24-48 hours.',
                  style: TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.5),
                ),
                const SizedBox(height: 16),

                // Document type cards
                ..._docTypes.map((dt) => _DocTypeCard(
                  docType: dt,
                  selectedFile: _documents.where((d) => d.type == dt['key']).firstOrNull?.path,
                  onPick: () => _pickDocument(dt['key'] as String),
                  onRemove: () => setState(() => _documents.removeWhere((d) => d.type == dt['key'])),
                )),

                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: AppColors.errorSurface, borderRadius: BorderRadius.circular(10)),
                    child: Row(children: [
                      const Icon(Icons.error_outline, color: AppColors.error, size: 16),
                      const SizedBox(width: 8),
                      Expanded(child: Text(_error!, style: const TextStyle(color: AppColors.error, fontSize: 13))),
                    ]),
                  ),
                ],

                const SizedBox(height: 20),
                CnPrimaryButton(
                  label: 'Submit for Verification',
                  isLoading: _isUploading,
                  onTap: _documents.isEmpty || _isUploading ? null : _submit,
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: AppColors.primarySurface, borderRadius: BorderRadius.circular(10)),
                  child: const Row(children: [
                    Icon(Icons.lock_outline, color: AppColors.primary, size: 16),
                    SizedBox(width: 8),
                    Expanded(child: Text(
                      'Your documents are encrypted and only reviewed by our verification team.',
                      style: TextStyle(fontSize: 12, color: AppColors.primary),
                    )),
                  ]),
                ),
              ] else ...[
                // Approved state
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.successSurface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.success.withOpacity(0.3)),
                  ),
                  child: const Row(children: [
                    Icon(Icons.verified_rounded, color: AppColors.success, size: 24),
                    SizedBox(width: 10),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('Verified ✅', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.success)),
                      SizedBox(height: 2),
                      Text('Your business is verified and active.', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                    ])),
                  ]),
                ),
              ],

              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _pickDocument(String type) async {
    final picker = ImagePicker();
    final img = await picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (img == null) return;
    setState(() {
      _documents.removeWhere((d) => d.type == type);
      _documents.add(_KycDoc(type: type, path: img.path));
    });
  }

  Future<void> _submit() async {
    if (_documents.isEmpty) return;
    setState(() { _isUploading = true; _error = null; });
    try {
      final filePaths = _documents.map((d) => d.path).toList();
      await ref.read(businessNotifierProvider.notifier).uploadKycDocuments(widget.businessId, filePaths);
      ref.invalidate(businessDetailProvider(widget.businessId));
      ref.invalidate(myBusinessesProvider);
      HapticFeedback.heavyImpact();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Documents submitted for verification! 🎉'), backgroundColor: AppColors.primary),
        );
        context.pop();
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isUploading = false);
    }
  }
}

class _KycDoc {
  final String type;
  final String path;
  const _KycDoc({required this.type, required this.path});
}

class _StatusBanner extends StatelessWidget {
  final BusinessVerification verification;
  const _StatusBanner({required this.verification});

  @override
  Widget build(BuildContext context) {
    final (color, bg, icon, title, subtitle) = switch (verification.status) {
      'pending' => (
        AppColors.warning,
        AppColors.warningSurface,
        Icons.hourglass_top_rounded,
        'Under Review',
        'Your documents are being reviewed. This usually takes 24-48 hours.'
      ),
      'approved' || 'verified' => (
        AppColors.success,
        AppColors.successSurface,
        Icons.verified_rounded,
        'Verified',
        'Your business is verified and active.'
      ),
      'rejected' => (
        AppColors.error,
        AppColors.errorSurface,
        Icons.cancel_outlined,
        'Rejected',
        verification.notes ?? 'Your verification was rejected. Please re-submit with valid documents.'
      ),
      'info_requested' => (
        AppColors.info,
        const Color(0xFFE8EEF8),
        Icons.info_outline,
        'More Info Needed',
        verification.notes ?? 'Additional documents or information was requested.'
      ),
      _ => (
        AppColors.textSecondary,
        AppColors.surfaceVariant,
        Icons.upload_file_outlined,
        'Unverified',
        'Upload your business documents to get verified and start selling.'
      ),
    };

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12), border: Border.all(color: color.withOpacity(0.3))),
      child: Row(children: [
        Icon(icon, color: color, size: 22),
        const SizedBox(width: 10),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(title, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: color)),
          const SizedBox(height: 2),
          Text(subtitle, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4)),
        ])),
      ]),
    );
  }
}

class _UploadedDocTile extends StatelessWidget {
  final BusinessDocument doc;
  const _UploadedDocTile({required this.doc});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(children: [
        Container(
          width: 36, height: 36,
          decoration: BoxDecoration(color: AppColors.primarySurface, borderRadius: BorderRadius.circular(8)),
          child: const Icon(Icons.description_outlined, color: AppColors.primary, size: 18),
        ),
        const SizedBox(width: 10),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(doc.typeLabel, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
          Text('Uploaded ${_formatDate(doc.uploadedAt)}', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
        ])),
        const Icon(Icons.check_circle, color: AppColors.success, size: 18),
      ]),
    );
  }

  String _formatDate(DateTime dt) {
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}

class _DocTypeCard extends StatelessWidget {
  final Map<String, dynamic> docType;
  final String? selectedFile;
  final VoidCallback onPick;
  final VoidCallback onRemove;
  const _DocTypeCard({required this.docType, this.selectedFile, required this.onPick, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    final hasFile = selectedFile != null;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: hasFile ? AppColors.primarySurface : AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: hasFile ? AppColors.primary.withOpacity(0.3) : AppColors.border),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        leading: Container(
          width: 40, height: 40,
          decoration: BoxDecoration(
            color: hasFile ? AppColors.primary.withOpacity(0.15) : AppColors.surfaceVariant,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(
            hasFile ? Icons.check_circle : docType['icon'] as IconData,
            color: hasFile ? AppColors.primary : AppColors.textSecondary,
            size: 20,
          ),
        ),
        title: Text(docType['label'] as String, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
        subtitle: Text(
          hasFile ? 'Document selected ✓' : docType['desc'] as String,
          style: TextStyle(fontSize: 12, color: hasFile ? AppColors.primary : AppColors.textSecondary),
        ),
        trailing: hasFile
            ? IconButton(icon: const Icon(Icons.close, size: 18, color: AppColors.error), onPressed: onRemove)
            : const Icon(Icons.add_photo_alternate_outlined, color: AppColors.primary, size: 20),
        onTap: hasFile ? null : onPick,
      ),
    );
  }
}

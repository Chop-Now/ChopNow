import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:animate_do/animate_do.dart';
import 'dart:io';
import '../../core/providers/business_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';
import '../../shared/widgets/inputs/cn_text_field.dart';

class CreateListingDetailsScreen extends ConsumerStatefulWidget {
  const CreateListingDetailsScreen({super.key});

  @override
  ConsumerState<CreateListingDetailsScreen> createState() => _CreateListingDetailsScreenState();
}

class _CreateListingDetailsScreenState extends ConsumerState<CreateListingDetailsScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  final _originalPriceCtrl = TextEditingController();
  final _quantityCtrl = TextEditingController(text: '5');
  final _allergensCtrl = TextEditingController();

  String _category = 'meals';
  String _fulfillment = 'pickup';
  String? _selectedBusinessId;
  DateTime _availableFrom = DateTime.now();
  DateTime _availableUntil = DateTime.now().add(const Duration(hours: 6));
  final List<String> _photoPaths = [];
  bool _isLoading = false;
  String? _error;

  static const _categories = [
    {'key': 'meals', 'label': '🍲 Meals', 'icon': Icons.restaurant},
    {'key': 'baked-goods', 'label': '🥐 Bakery', 'icon': Icons.bakery_dining},
    {'key': 'fruit-veg', 'label': '🥬 Produce', 'icon': Icons.eco},
    {'key': 'dairy', 'label': '🧀 Dairy', 'icon': Icons.egg},
    {'key': 'beverages', 'label': '🥤 Drinks', 'icon': Icons.local_cafe},
    {'key': 'pantry', 'label': '🫙 Pantry', 'icon': Icons.kitchen},
    {'key': 'other', 'label': '📦 Other', 'icon': Icons.category},
  ];

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _priceCtrl.dispose();
    _originalPriceCtrl.dispose();
    _quantityCtrl.dispose();
    _allergensCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final asyncBusinesses = ref.watch(myBusinessesProvider);

    return Scaffold(
      backgroundColor: AppColors.surfaceIvory,
      appBar: AppBar(
        backgroundColor: AppColors.surfaceIvory,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        centerTitle: true,
        title: const Text('Upload Surplus', style: TextStyle(fontFamily: 'Hanken Grotesk', fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.primary)),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Photo Upload Area ──
              FadeInUp(child: _buildPhotoArea()),
              const SizedBox(height: 20),

              // ── Business Selector ──
              FadeInUp(
                delay: const Duration(milliseconds: 50),
                child: _buildSection(
                  title: 'Select Business',
                  child: asyncBusinesses.when(
                    loading: () => const LinearProgressIndicator(color: AppColors.primary),
                    error: (e, _) => Text('Error: $e', style: const TextStyle(color: AppColors.error, fontSize: 13)),
                    data: (businesses) {
                      final approved = businesses.where((b) => b.isApproved).toList();
                      if (approved.isEmpty) {
                        return Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(color: AppColors.warningSurface, borderRadius: BorderRadius.circular(12)),
                          child: const Row(children: [
                            Icon(Icons.warning_amber_rounded, color: AppColors.warning),
                            SizedBox(width: 10),
                            Expanded(child: Text('No verified business. Create and verify one first.', style: TextStyle(fontFamily: 'Inter', fontSize: 13, color: AppColors.warning))),
                          ]),
                        );
                      }
                      _selectedBusinessId ??= approved.first.id;
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceIvory,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.border.withOpacity(0.5)),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            isExpanded: true,
                            value: _selectedBusinessId,
                            items: approved.map((b) => DropdownMenuItem(
                              value: b.id,
                              child: Row(children: [
                                Container(
                                  width: 28, height: 28,
                                  decoration: BoxDecoration(color: AppColors.primarySurface, borderRadius: BorderRadius.circular(8)),
                                  child: b.logo != null
                                      ? ClipRRect(borderRadius: BorderRadius.circular(8), child: Image.network(b.logo!, fit: BoxFit.cover))
                                      : const Center(child: Text('🏪', style: TextStyle(fontSize: 14))),
                                ),
                                const SizedBox(width: 10),
                                Text(b.name, style: const TextStyle(fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w600)),
                              ]),
                            )).toList(),
                            onChanged: (v) => setState(() => _selectedBusinessId = v),
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // ── Meal Details Section ──
              FadeInUp(
                delay: const Duration(milliseconds: 100),
                child: _buildSection(
                  title: 'Meal Details',
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      CnTextField(label: 'Meal Name', controller: _titleCtrl, hint: 'e.g., Surplus Jollof Bowl', validator: (v) => v == null || v.trim().length < 2 ? 'Required' : null),
                      const SizedBox(height: 14),
                      CnTextField(label: 'Description', controller: _descCtrl, hint: 'Briefly describe the meal...', maxLines: 3, validator: (v) => v == null || v.trim().length < 10 ? 'Min 10 chars' : null),
                      const SizedBox(height: 14),
                      const Text('CATEGORY', style: TextStyle(fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textSecondary, letterSpacing: 0.5)),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8, runSpacing: 8,
                        children: _categories.map((c) {
                          final selected = _category == c['key'];
                          return GestureDetector(
                            onTap: () { HapticFeedback.selectionClick(); setState(() => _category = c['key'] as String); },
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                              decoration: BoxDecoration(
                                color: selected ? AppColors.primarySurface : AppColors.surfaceIvory,
                                borderRadius: BorderRadius.circular(100),
                                border: Border.all(color: selected ? AppColors.primary : AppColors.border.withOpacity(0.5)),
                              ),
                              child: Text(c['label'] as String, style: TextStyle(fontFamily: 'Inter', fontSize: 13, fontWeight: FontWeight.w600, color: selected ? AppColors.primary : AppColors.textPrimary)),
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // ── Pricing Section ──
              FadeInUp(
                delay: const Duration(milliseconds: 150),
                child: _buildSection(
                  title: 'Pricing',
                  titleIcon: Icons.local_offer_rounded,
                  titleIconColor: AppColors.accent,
                  child: Column(
                    children: [
                      Row(children: [
                        Expanded(child: CnTextField(label: 'Original Price (RWF)', controller: _originalPriceCtrl, hint: '5,000', keyboardType: TextInputType.number)),
                        const SizedBox(width: 12),
                        Expanded(child: CnTextField(label: 'Rescue Price (RWF)', controller: _priceCtrl, hint: '2,500', keyboardType: TextInputType.number, validator: (v) => v == null || v.isEmpty ? 'Required' : null)),
                      ]),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(color: AppColors.accentSurface, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.accentLight.withOpacity(0.3))),
                        child: const Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Icon(Icons.eco_rounded, color: AppColors.accent, size: 18),
                          SizedBox(width: 10),
                          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text('Smart Discount Tip', style: TextStyle(fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.accentDark)),
                            SizedBox(height: 2),
                            Text('Offering 50% off increases sell-through by 3x before closing.', style: TextStyle(fontFamily: 'Inter', fontSize: 13, color: AppColors.textSecondary)),
                          ])),
                        ]),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // ── Inventory & Availability ──
              FadeInUp(
                delay: const Duration(milliseconds: 200),
                child: _buildSection(
                  title: 'Inventory & Availability',
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('QUANTITY AVAILABLE', style: TextStyle(fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textSecondary, letterSpacing: 0.5)),
                      const SizedBox(height: 8),
                      Row(children: [
                        _QuantityButton(icon: Icons.remove, onTap: () {
                          final q = int.tryParse(_quantityCtrl.text) ?? 1;
                          if (q > 1) setState(() => _quantityCtrl.text = '${q - 1}');
                        }),
                        const SizedBox(width: 12),
                        SizedBox(
                          width: 64,
                          child: TextField(
                            controller: _quantityCtrl,
                            textAlign: TextAlign.center,
                            keyboardType: TextInputType.number,
                            style: const TextStyle(fontFamily: 'Inter', fontSize: 18, fontWeight: FontWeight.w600),
                            decoration: InputDecoration(
                              filled: true, fillColor: AppColors.surfaceIvory,
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.border.withOpacity(0.5))),
                              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: AppColors.border.withOpacity(0.5))),
                              contentPadding: const EdgeInsets.symmetric(vertical: 10),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        _QuantityButton(icon: Icons.add, onTap: () {
                          final q = int.tryParse(_quantityCtrl.text) ?? 0;
                          setState(() => _quantityCtrl.text = '${q + 1}');
                        }),
                      ]),
                      const SizedBox(height: 16),
                      const Text('PICKUP WINDOW', style: TextStyle(fontFamily: 'Inter', fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textSecondary, letterSpacing: 0.5)),
                      const SizedBox(height: 8),
                      Row(children: [
                        Expanded(child: _TimePicker(label: 'From', dateTime: _availableFrom, onPick: () => _pickDateTime(isFrom: true))),
                        const SizedBox(width: 12),
                        Expanded(child: _TimePicker(label: 'Until', dateTime: _availableUntil, onPick: () => _pickDateTime(isFrom: false))),
                      ]),
                      const SizedBox(height: 14),
                      // Fulfillment
                      Row(children: [
                        Expanded(child: _FulfillmentChip(label: '📦 Pickup', selected: _fulfillment == 'pickup', onTap: () => setState(() => _fulfillment = 'pickup'))),
                        const SizedBox(width: 8),
                        Expanded(child: _FulfillmentChip(label: '🚴 Delivery', selected: _fulfillment == 'delivery', onTap: () => setState(() => _fulfillment = 'delivery'))),
                      ]),
                      const SizedBox(height: 14),
                      CnTextField(label: 'Allergens (optional)', controller: _allergensCtrl, hint: 'e.g. nuts, dairy, gluten'),
                    ],
                  ),
                ),
              ),

              if (_error != null) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: AppColors.errorSurface, borderRadius: BorderRadius.circular(12)),
                  child: Row(children: [
                    const Icon(Icons.error_outline, color: AppColors.error, size: 16),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_error!, style: const TextStyle(fontFamily: 'Inter', color: AppColors.error, fontSize: 13))),
                  ]),
                ),
              ],
              const SizedBox(height: 24),

              // ── Publish CTA ──
              FadeInUp(
                delay: const Duration(milliseconds: 300),
                child: CnPrimaryButton(
                  label: 'Publish Deal',
                  isLoading: _isLoading,
                  onTap: _isLoading ? null : _submit,
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPhotoArea() {
    return GestureDetector(
      onTap: _pickPhoto,
      child: Container(
        width: double.infinity,
        height: 180,
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.border.withOpacity(0.3), width: 2, strokeAlign: BorderSide.strokeAlignInside),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 4))],
        ),
        child: _photoPaths.isEmpty
            ? Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                Icon(Icons.add_a_photo_rounded, size: 40, color: AppColors.primary.withOpacity(0.7)),
                const SizedBox(height: 8),
                const Text('Tap to add photo', style: TextStyle(fontFamily: 'Inter', fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
                const SizedBox(height: 4),
                const Text('Showcase your delicious surplus meal', style: TextStyle(fontFamily: 'Inter', fontSize: 13, color: AppColors.textTertiary)),
              ])
            : ClipRRect(
                borderRadius: BorderRadius.circular(18),
                child: Stack(children: [
                  Image.file(File(_photoPaths.first), fit: BoxFit.cover, width: double.infinity, height: 180),
                  Positioned(
                    top: 8, right: 8,
                    child: GestureDetector(
                      onTap: () => setState(() => _photoPaths.clear()),
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: const BoxDecoration(color: AppColors.error, shape: BoxShape.circle),
                        child: const Icon(Icons.close, size: 16, color: Colors.white),
                      ),
                    ),
                  ),
                  if (_photoPaths.length < 5)
                    Positioned(
                      bottom: 8, right: 8,
                      child: GestureDetector(
                        onTap: _pickPhoto,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(100)),
                          child: Row(mainAxisSize: MainAxisSize.min, children: [
                            const Icon(Icons.add_photo_alternate, size: 16, color: Colors.white),
                            const SizedBox(width: 4),
                            Text('${_photoPaths.length}/5', style: const TextStyle(fontFamily: 'Inter', fontSize: 12, color: Colors.white, fontWeight: FontWeight.w600)),
                          ]),
                        ),
                      ),
                    ),
                ]),
              ),
      ),
    );
  }

  Widget _buildSection({required String title, required Widget child, IconData? titleIcon, Color? titleIconColor}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: const Offset(0, 4))],
        border: Border.all(color: AppColors.border.withOpacity(0.2)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          if (titleIcon != null) ...[Icon(titleIcon, size: 20, color: titleIconColor ?? AppColors.primary), const SizedBox(width: 8)],
          Text(title, style: const TextStyle(fontFamily: 'Inter', fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
        ]),
        const SizedBox(height: 14),
        child,
      ]),
    );
  }

  Future<void> _pickPhoto() async {
    final picker = ImagePicker();
    final img = await picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
    if (img != null) setState(() => _photoPaths.add(img.path));
  }

  Future<void> _pickDateTime({required bool isFrom}) async {
    final now = DateTime.now();
    final date = await showDatePicker(context: context, firstDate: now, lastDate: now.add(const Duration(days: 7)), initialDate: isFrom ? _availableFrom : _availableUntil);
    if (date == null || !mounted) return;
    final time = await showTimePicker(context: context, initialTime: TimeOfDay.fromDateTime(isFrom ? _availableFrom : _availableUntil));
    if (time == null) return;
    final combined = DateTime(date.year, date.month, date.day, time.hour, time.minute);
    setState(() { if (isFrom) { _availableFrom = combined; } else { _availableUntil = combined; } });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedBusinessId == null) { setState(() => _error = 'Please select a business'); return; }
    HapticFeedback.mediumImpact();
    setState(() { _isLoading = true; _error = null; });

    try {
      final listingData = {
        'business': _selectedBusinessId,
        'title': _titleCtrl.text.trim(),
        'description': _descCtrl.text.trim(),
        'category': _category,
        'pricing': {
          'price': double.tryParse(_priceCtrl.text) ?? 0,
          if (_originalPriceCtrl.text.isNotEmpty) 'originalPrice': double.tryParse(_originalPriceCtrl.text),
        },
        'inventory': {'quantity': int.tryParse(_quantityCtrl.text) ?? 1},
        'timeWindow': {'availableFrom': _availableFrom.toIso8601String(), 'availableUntil': _availableUntil.toIso8601String()},
        'fulfillment': _fulfillment,
        if (_allergensCtrl.text.isNotEmpty) 'nutritionalInfo': {'allergens': _allergensCtrl.text.split(',').map((a) => a.trim()).where((a) => a.isNotEmpty).toList()},
      };

      final result = await ref.read(listingNotifierProvider.notifier).createListing(listingData);
      if (_photoPaths.isNotEmpty) {
        final listingId = result['_id'] ?? result['id'];
        if (listingId != null) { try { await ref.read(listingNotifierProvider.notifier).uploadListingPhotos(listingId, _photoPaths); } catch (_) {} }
      }
      ref.invalidate(myBusinessesProvider);
      HapticFeedback.heavyImpact();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Deal published! 🎉'), backgroundColor: AppColors.primary));
        context.pop();
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}

class _QuantityButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _QuantityButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () { HapticFeedback.selectionClick(); onTap(); },
      child: Container(
        width: 44, height: 44,
        decoration: BoxDecoration(color: AppColors.surfaceVariant, shape: BoxShape.circle, border: Border.all(color: AppColors.border.withOpacity(0.5))),
        child: Icon(icon, color: AppColors.textPrimary, size: 22),
      ),
    );
  }
}

class _FulfillmentChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _FulfillmentChip({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () { HapticFeedback.selectionClick(); onTap(); },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: selected ? AppColors.primarySurface : AppColors.surfaceIvory,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: selected ? AppColors.primary : AppColors.border.withOpacity(0.5)),
        ),
        child: Center(child: Text(label, style: TextStyle(fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w600, color: selected ? AppColors.primary : AppColors.textPrimary))),
      ),
    );
  }
}

class _TimePicker extends StatelessWidget {
  final String label;
  final DateTime dateTime;
  final VoidCallback onPick;
  const _TimePicker({required this.label, required this.dateTime, required this.onPick});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPick,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.surfaceIvory,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border.withOpacity(0.5)),
        ),
        child: Row(children: [
          const Icon(Icons.schedule_rounded, size: 18, color: AppColors.textSecondary),
          const SizedBox(width: 8),
          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(label, style: const TextStyle(fontFamily: 'Inter', fontSize: 11, color: AppColors.textSecondary)),
            const SizedBox(height: 2),
            Text(
              '${dateTime.day}/${dateTime.month} ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}',
              style: const TextStyle(fontFamily: 'Inter', fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
            ),
          ]),
        ]),
      ),
    );
  }
}

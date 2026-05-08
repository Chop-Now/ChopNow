import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
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
  final _quantityCtrl = TextEditingController(text: '1');
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
    {'key': 'meals', 'label': '🍲 Prepared Meals'},
    {'key': 'baked-goods', 'label': '🥐 Baked Goods'},
    {'key': 'fruit-veg', 'label': '🥬 Fruits & Veg'},
    {'key': 'dairy', 'label': '🧀 Dairy & Eggs'},
    {'key': 'meat', 'label': '🥩 Meat & Seafood'},
    {'key': 'beverages', 'label': '🥤 Beverages'},
    {'key': 'pantry', 'label': '🫙 Pantry'},
    {'key': 'other', 'label': '📦 Other'},
  ];

  @override
  void dispose() {
    _titleCtrl.dispose(); _descCtrl.dispose();
    _priceCtrl.dispose(); _originalPriceCtrl.dispose();
    _quantityCtrl.dispose(); _allergensCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final asyncBusinesses = ref.watch(myBusinessesProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Create Listing', style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Select business
              const Text('Select Business', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
              const SizedBox(height: 8),
              asyncBusinesses.when(
                loading: () => const LinearProgressIndicator(color: AppColors.primary),
                error: (e, _) => Text('Error loading businesses: $e', style: const TextStyle(color: AppColors.error)),
                data: (businesses) {
                  final approved = businesses.where((b) => b.isApproved).toList();
                  if (approved.isEmpty) {
                    return Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(color: AppColors.warningSurface, borderRadius: BorderRadius.circular(10)),
                      child: const Column(children: [
                        Icon(Icons.warning_amber_rounded, color: AppColors.warning, size: 28),
                        SizedBox(height: 8),
                        Text('No verified business found. Please create and verify a business first.',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 13, color: AppColors.warning)),
                      ]),
                    );
                  }
                  _selectedBusinessId ??= approved.first.id;
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.border),
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
                              decoration: BoxDecoration(color: AppColors.primarySurface, borderRadius: BorderRadius.circular(6)),
                              child: b.logo != null
                                  ? ClipRRect(borderRadius: BorderRadius.circular(6), child: Image.network(b.logo!, fit: BoxFit.cover))
                                  : const Center(child: Text('🏪', style: TextStyle(fontSize: 14))),
                            ),
                            const SizedBox(width: 8),
                            Text(b.name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                          ]),
                        )).toList(),
                        onChanged: (v) => setState(() => _selectedBusinessId = v),
                      ),
                    ),
                  );
                },
              ),
              const SizedBox(height: 20),

              // Photo picker
              const Text('Photos', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
              const SizedBox(height: 8),
              SizedBox(
                height: 90,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    ..._photoPaths.asMap().entries.map((e) => _PhotoTile(
                      path: e.value,
                      onRemove: () => setState(() => _photoPaths.removeAt(e.key)),
                    )),
                    if (_photoPaths.length < 5)
                      GestureDetector(
                        onTap: _pickPhoto,
                        child: Container(
                          width: 80, height: 80,
                          margin: const EdgeInsets.only(right: 8),
                          decoration: BoxDecoration(
                            color: AppColors.surfaceVariant,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: AppColors.border, style: BorderStyle.solid),
                          ),
                          child: const Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                            Icon(Icons.add_photo_alternate_outlined, color: AppColors.primary, size: 24),
                            SizedBox(height: 2),
                            Text('Add', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                          ]),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Category
              const Text('Category', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: _categories.map((c) {
                  final selected = _category == c['key'];
                  return GestureDetector(
                    onTap: () => setState(() => _category = c['key']!),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: selected ? AppColors.primarySurface : AppColors.surface,
                        borderRadius: BorderRadius.circular(100),
                        border: Border.all(color: selected ? AppColors.primary : AppColors.border),
                      ),
                      child: Text(c['label']!, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600,
                          color: selected ? AppColors.primary : AppColors.textPrimary)),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),

              CnTextField(
                label: 'Food Title *',
                controller: _titleCtrl,
                hint: 'e.g. Freshly baked croissants',
                validator: (v) => v == null || v.trim().length < 2 ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              CnTextField(
                label: 'Description *',
                controller: _descCtrl,
                hint: 'Describe the food, freshness, ingredients…',
                maxLines: 3,
                validator: (v) => v == null || v.trim().length < 10 ? 'Min 10 characters' : null,
              ),
              const SizedBox(height: 16),

              // Pricing row
              Row(children: [
                Expanded(child: CnTextField(
                  label: 'Original Price (RWF)',
                  controller: _originalPriceCtrl,
                  hint: '5000',
                  keyboardType: TextInputType.number,
                )),
                const SizedBox(width: 12),
                Expanded(child: CnTextField(
                  label: 'Rescue Price (RWF) *',
                  controller: _priceCtrl,
                  hint: '2500',
                  keyboardType: TextInputType.number,
                  validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                )),
              ]),
              const SizedBox(height: 12),

              // Quantity
              CnTextField(
                label: 'Quantity Available *',
                controller: _quantityCtrl,
                hint: '10',
                keyboardType: TextInputType.number,
                validator: (v) => v == null || v.isEmpty || int.tryParse(v) == null ? 'Enter a number' : null,
              ),
              const SizedBox(height: 16),

              // Fulfillment type
              const Text('Fulfillment', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
              const SizedBox(height: 8),
              Row(children: [
                Expanded(child: _FulfillmentChip(
                  label: '📦 Pickup', value: 'pickup',
                  selected: _fulfillment == 'pickup',
                  onTap: () => setState(() => _fulfillment = 'pickup'),
                )),
                const SizedBox(width: 8),
                Expanded(child: _FulfillmentChip(
                  label: '🚴 Delivery', value: 'delivery',
                  selected: _fulfillment == 'delivery',
                  onTap: () => setState(() => _fulfillment = 'delivery'),
                )),
              ]),
              const SizedBox(height: 16),

              // Time window
              const Text('Available Window', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
              const SizedBox(height: 8),
              Row(children: [
                Expanded(child: _TimePicker(
                  label: 'From',
                  dateTime: _availableFrom,
                  onPick: () => _pickDateTime(isFrom: true),
                )),
                const SizedBox(width: 12),
                Expanded(child: _TimePicker(
                  label: 'Until',
                  dateTime: _availableUntil,
                  onPick: () => _pickDateTime(isFrom: false),
                )),
              ]),
              const SizedBox(height: 16),

              // Allergens
              CnTextField(
                label: 'Allergens (comma separated)',
                controller: _allergensCtrl,
                hint: 'e.g. nuts, dairy, gluten',
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
              // Discount preview
              if (_priceCtrl.text.isNotEmpty && _originalPriceCtrl.text.isNotEmpty) ...[
                Builder(builder: (_) {
                  final orig = double.tryParse(_originalPriceCtrl.text) ?? 0;
                  final rescue = double.tryParse(_priceCtrl.text) ?? 0;
                  final discount = orig > 0 ? ((orig - rescue) / orig * 100).round() : 0;
                  return Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: AppColors.successSurface, borderRadius: BorderRadius.circular(10)),
                    child: Row(children: [
                      const Icon(Icons.local_offer_rounded, color: AppColors.success, size: 18),
                      const SizedBox(width: 8),
                      Text('Customers save $discount% — great deal! 🎉',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.success)),
                    ]),
                  );
                }),
                const SizedBox(height: 16),
              ],

              CnPrimaryButton(
                label: 'Publish Listing 🚀',
                isLoading: _isLoading,
                onTap: _isLoading ? null : _submit,
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _pickPhoto() async {
    final picker = ImagePicker();
    final img = await picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
    if (img != null) setState(() => _photoPaths.add(img.path));
  }

  Future<void> _pickDateTime({required bool isFrom}) async {
    final now = DateTime.now();
    final date = await showDatePicker(context: context, firstDate: now, lastDate: now.add(const Duration(days: 7)),
        initialDate: isFrom ? _availableFrom : _availableUntil);
    if (date == null || !mounted) return;
    final time = await showTimePicker(context: context, initialTime: TimeOfDay.fromDateTime(isFrom ? _availableFrom : _availableUntil));
    if (time == null) return;
    final combined = DateTime(date.year, date.month, date.day, time.hour, time.minute);
    setState(() {
      if (isFrom) {
        _availableFrom = combined;
      } else {
        _availableUntil = combined;
      }
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedBusinessId == null) {
      setState(() => _error = 'Please select a business');
      return;
    }
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
        'inventory': {
          'quantity': int.tryParse(_quantityCtrl.text) ?? 1,
        },
        'timeWindow': {
          'availableFrom': _availableFrom.toIso8601String(),
          'availableUntil': _availableUntil.toIso8601String(),
        },
        'fulfillment': _fulfillment,
        if (_allergensCtrl.text.isNotEmpty)
          'nutritionalInfo': {
            'allergens': _allergensCtrl.text.split(',').map((a) => a.trim()).where((a) => a.isNotEmpty).toList(),
          },
      };

      final result = await ref.read(listingNotifierProvider.notifier).createListing(listingData);

      // Upload photos if any
      if (_photoPaths.isNotEmpty) {
        final listingId = result['_id'] ?? result['id'];
        if (listingId != null) {
          try {
            await ref.read(listingNotifierProvider.notifier).uploadListingPhotos(listingId, _photoPaths);
          } catch (_) {} // Non-critical
        }
      }

      ref.invalidate(myBusinessesProvider);
      HapticFeedback.heavyImpact();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Listing published! 🎉'), backgroundColor: AppColors.primary),
        );
        context.pop();
      }
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }
}

class _PhotoTile extends StatelessWidget {
  final String path;
  final VoidCallback onRemove;
  const _PhotoTile({required this.path, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          width: 80, height: 80,
          margin: const EdgeInsets.only(right: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.border),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(9),
            child: Image.file(File(path), fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => const Icon(Icons.broken_image, color: AppColors.textSecondary)),
          ),
        ),
        Positioned(
          top: 2, right: 10,
          child: GestureDetector(
            onTap: onRemove,
            child: Container(
              width: 20, height: 20,
              decoration: const BoxDecoration(color: AppColors.error, shape: BoxShape.circle),
              child: const Icon(Icons.close, size: 12, color: Colors.white),
            ),
          ),
        ),
      ],
    );
  }
}

class _FulfillmentChip extends StatelessWidget {
  final String label;
  final String value;
  final bool selected;
  final VoidCallback onTap;
  const _FulfillmentChip({required this.label, required this.value, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: selected ? AppColors.primarySurface : AppColors.surface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: selected ? AppColors.primary : AppColors.border),
        ),
        child: Center(child: Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600,
            color: selected ? AppColors.primary : AppColors.textPrimary))),
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
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
          const SizedBox(height: 4),
          Text(
            '${dateTime.day}/${dateTime.month} ${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}',
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
          ),
        ]),
      ),
    );
  }
}

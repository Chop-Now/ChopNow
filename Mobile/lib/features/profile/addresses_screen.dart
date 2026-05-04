import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/models/user_model.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/buttons/cn_buttons.dart';
import '../../shared/widgets/inputs/cn_text_field.dart';
import '../../shared/widgets/feedback/cn_states.dart';

class AddressesScreen extends ConsumerStatefulWidget {
  const AddressesScreen({super.key});

  @override
  ConsumerState<AddressesScreen> createState() => _AddressesScreenState();
}

class _AddressesScreenState extends ConsumerState<AddressesScreen> {
  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final addresses = user?.addresses ?? [];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Addresses', style: TextStyle(fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddressSheet(context),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_location_alt_rounded, color: Colors.white),
        label: const Text('Add Address', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
      ),
      body: addresses.isEmpty
          ? const CnEmptyState(
              title: 'No addresses yet',
              subtitle: 'Add a delivery address to make checkout faster',
              icon: Icons.location_on_outlined,
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: addresses.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (_, i) => _AddressCard(
                address: addresses[i],
                onEdit: () => _showAddressSheet(context, existing: addresses[i]),
                onDelete: () => _deleteAddress(addresses[i].id!),
              ),
            ),
    );
  }

  void _showAddressSheet(BuildContext context, {UserAddress? existing}) {
    final labelCtrl = TextEditingController(text: existing?.label ?? '');
    final streetCtrl = TextEditingController(text: existing?.street ?? '');
    final cityCtrl = TextEditingController(text: existing?.city ?? '');
    bool isLoading = false;
    String? error;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => StatefulBuilder(builder: (ctx, ss) => Padding(
        padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(existing == null ? 'Add Address' : 'Edit Address',
                style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            const SizedBox(height: 16),
            CnTextField(label: 'Label', controller: labelCtrl, hint: 'Home, Work, Other…'),
            const SizedBox(height: 12),
            CnTextField(label: 'Street Address', controller: streetCtrl, hint: 'KN 5 Rd, Nyarugenge'),
            const SizedBox(height: 12),
            CnTextField(label: 'City', controller: cityCtrl, hint: 'Kigali'),
            if (error != null) ...[
              const SizedBox(height: 8),
              Text(error!, style: const TextStyle(color: AppColors.error, fontSize: 13)),
            ],
            const SizedBox(height: 20),
            CnPrimaryButton(
              label: existing == null ? 'Add Address' : 'Save Changes',
              isLoading: isLoading,
              onTap: isLoading ? null : () async {
                ss(() { isLoading = true; error = null; });
                try {
                  final data = {
                    'label': labelCtrl.text.trim().isEmpty ? 'Home' : labelCtrl.text.trim(),
                    'street': streetCtrl.text.trim(),
                    if (cityCtrl.text.trim().isNotEmpty) 'city': cityCtrl.text.trim(),
                  };
                  if (existing == null) {
                    await ref.read(authProvider.notifier).addAddress(data);
                  } else {
                    await ref.read(authProvider.notifier).updateAddress(existing.id!, data);
                  }
                  HapticFeedback.heavyImpact();
                  if (ctx.mounted) Navigator.pop(ctx);
                } catch (e) {
                  ss(() { error = e.toString(); isLoading = false; });
                }
              },
            ),
          ],
        ),
      )),
    );
  }

  Future<void> _deleteAddress(String id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Delete Address'),
        content: const Text('Remove this address?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          TextButton(onPressed: () => Navigator.pop(context, true),
              child: const Text('Delete', style: TextStyle(color: AppColors.error))),
        ],
      ),
    );
    if (confirmed == true) {
      try {
        await ref.read(authProvider.notifier).deleteAddress(id);
        HapticFeedback.lightImpact();
      } catch (_) {}
    }
  }
}

class _AddressCard extends StatelessWidget {
  final UserAddress address;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  const _AddressCard({required this.address, required this.onEdit, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: address.isDefault ? AppColors.primary : AppColors.border, width: address.isDefault ? 1.5 : 1),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: AppColors.primarySurface, borderRadius: BorderRadius.circular(8)),
            child: const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(children: [
                Text(address.label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                if (address.isDefault) ...[
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(color: AppColors.primarySurface, borderRadius: BorderRadius.circular(100)),
                    child: const Text('Default', style: TextStyle(fontSize: 10, color: AppColors.primary, fontWeight: FontWeight.w700)),
                  ),
                ],
              ]),
              const SizedBox(height: 2),
              Text(address.street + (address.city != null ? ', ${address.city}' : ''),
                  style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
            ],
          )),
          IconButton(icon: const Icon(Icons.edit_outlined, color: AppColors.primary, size: 20), onPressed: onEdit),
          IconButton(icon: const Icon(Icons.delete_outline_rounded, color: AppColors.error, size: 20), onPressed: onDelete),
        ],
      ),
    );
  }
}

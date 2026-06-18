import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_endpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/feedback/cn_states.dart';
import '../../shared/animations/scale_tap.dart';

import '../../core/providers/business_provider.dart';

final myListingsProvider = FutureProvider<List<dynamic>>((ref) async {
  final businesses = await ref.watch(myBusinessesProvider.future);
  if (businesses.isEmpty) return [];
  final businessId = businesses.first.id;
  final res =
      await ApiClient.instance.get(AppEndpoints.listingsByBusiness(businessId));
  final data = res.data;
  if (data is List) return data;
  if (data is Map) return (data['listings'] ?? data['data'] ?? []) as List;
  return [];
});

class MyListingsScreen extends ConsumerStatefulWidget {
  const MyListingsScreen({super.key});
  @override
  ConsumerState<MyListingsScreen> createState() => _MyListingsScreenState();
}

class _MyListingsScreenState extends ConsumerState<MyListingsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabs;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final asyncListings = ref.watch(myListingsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('My Listings',
            style: TextStyle(
                fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
        backgroundColor: AppColors.surface,
        automaticallyImplyLeading: false,
        elevation: 0,
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: ScaleTap(
              onTap: () => context.push('/business/listings/create'),
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius: BorderRadius.circular(100)),
                child: const Text('+ Add Deal',
                    style: TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w600)),
              ),
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabs,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          labelStyle:
              const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
          tabs: const [
            Tab(text: '🟢 Active'),
            Tab(text: '🔴 Expired'),
            Tab(text: '📝 Draft')
          ],
        ),
      ),
      body: asyncListings.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.primary)),
        error: (e, _) => CnErrorState(
            message: e.toString(),
            onRetry: () => ref.invalidate(myListingsProvider)),
        data: (all) {
          final active = all.where((l) => l['status'] == 'active').toList();
          final expired = all
              .where(
                  (l) => l['status'] == 'expired' || l['status'] == 'sold_out')
              .toList();
          final draft = all
              .where((l) => l['status'] == 'draft' || l['status'] == 'inactive')
              .toList();

          return RefreshIndicator(
            color: AppColors.primary,
            onRefresh: () async => ref.invalidate(myListingsProvider),
            child: TabBarView(
              controller: _tabs,
              children: [
                _ListingTabView(
                    listings: active,
                    emptyLabel: 'No active listings',
                    onEdit: _editListing,
                    onDelete: _deleteListing),
                _ListingTabView(
                    listings: expired,
                    emptyLabel: 'No expired listings',
                    onEdit: _editListing,
                    onDelete: _deleteListing),
                _ListingTabView(
                    listings: draft,
                    emptyLabel: 'No draft listings',
                    onEdit: _editListing,
                    onDelete: _deleteListing),
              ],
            ),
          );
        },
      ),
    );
  }

  void _editListing(dynamic listing) =>
      context.push('/business/listings/${listing['_id']}/edit');

  Future<void> _deleteListing(String id) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Delete Listing?',
            style: TextStyle(fontWeight: FontWeight.w700)),
        content: const Text('This action cannot be undone.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel')),
          TextButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Delete',
                  style: TextStyle(color: AppColors.error))),
        ],
      ),
    );
    if (confirmed == true) {
      try {
        await ApiClient.instance.delete(AppEndpoints.listingById(id));
        ref.invalidate(myListingsProvider);
        HapticFeedback.heavyImpact();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('Listing deleted'),
                backgroundColor: AppColors.error),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content: Text('Failed to delete: ${e.toString().replaceAll('Exception: ', '')}'),
                backgroundColor: AppColors.error),
          );
        }
      }
    }
  }
}

class _ListingTabView extends StatelessWidget {
  final List<dynamic> listings;
  final String emptyLabel;
  final void Function(dynamic) onEdit;
  final void Function(String) onDelete;

  const _ListingTabView(
      {required this.listings,
      required this.emptyLabel,
      required this.onEdit,
      required this.onDelete});

  @override
  Widget build(BuildContext context) {
    if (listings.isEmpty) {
      return CnEmptyState(
          title: emptyLabel, icon: Icons.restaurant_menu_outlined);
    }
    return ListView.separated(
      padding: const EdgeInsets.all(12),
      itemCount: listings.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (_, i) => _ListingCard(
          listing: listings[i], onEdit: onEdit, onDelete: onDelete),
    );
  }
}

class _ListingCard extends StatelessWidget {
  final dynamic listing;
  final void Function(dynamic) onEdit;
  final void Function(String) onDelete;
  const _ListingCard(
      {required this.listing, required this.onEdit, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    final photos = listing['photos'] as List? ?? [];
    final status = listing['status']?.toString() ?? 'active';
    final stock = listing['quantity'] ?? listing['stock'] ?? 0;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 6)
        ],
      ),
      child: Row(
        children: [
          // Thumbnail
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: Container(
              width: 64,
              height: 64,
              color: AppColors.surfaceVariant,
              child: photos.isNotEmpty &&
                      (photos[0].toString().startsWith('http://') ||
                          photos[0].toString().startsWith('https://'))
                  ? Image.network(photos[0].toString(), fit: BoxFit.cover)
                  : const Center(
                      child: Icon(Icons.fastfood_outlined,
                          color: AppColors.textSecondary, size: 28)),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child:
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(listing['title'] ?? 'Untitled',
                  style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                      color: AppColors.textPrimary)),
              const SizedBox(height: 2),
              Row(children: [
                Text('RWF ${listing['offerPrice'] ?? listing['price'] ?? 0}',
                    style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        color: AppColors.primary,
                        fontSize: 13)),
                const SizedBox(width: 8),
                Text('$stock left',
                    style: const TextStyle(
                        fontSize: 11, color: AppColors.textSecondary)),
              ]),
              const SizedBox(height: 4),
              _StatusPill(status: status),
            ]),
          ),
          Column(children: [
            IconButton(
              icon: const Icon(Icons.edit_outlined,
                  color: AppColors.primary, size: 20),
              onPressed: () => onEdit(listing),
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline_rounded,
                  color: AppColors.error, size: 20),
              onPressed: () => onDelete(listing['_id']?.toString() ?? ''),
            ),
          ]),
        ],
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  final String status;
  const _StatusPill({required this.status});
  @override
  Widget build(BuildContext context) {
    final (color, bg, label) = switch (status) {
      'active' => (AppColors.success, AppColors.successSurface, '🟢 Active'),
      'expired' => (AppColors.error, AppColors.errorSurface, '🔴 Expired'),
      'sold_out' => (
          AppColors.warning,
          AppColors.warningSurface,
          '🟡 Sold Out'
        ),
      _ => (AppColors.textSecondary, AppColors.surfaceVariant, '📝 Draft'),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration:
          BoxDecoration(color: bg, borderRadius: BorderRadius.circular(100)),
      child: Text(label,
          style: TextStyle(
              fontSize: 10, fontWeight: FontWeight.w700, color: color)),
    );
  }
}

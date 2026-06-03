import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/listing_model.dart';

// ── Cart Item ─────────────────────────────────────────────────────────────────
class CartItem {
  final Listing listing;
  final int quantity;

  const CartItem({required this.listing, required this.quantity});

  CartItem copyWith({int? quantity}) =>
      CartItem(listing: listing, quantity: quantity ?? this.quantity);

  double get subtotal => listing.offerPrice * quantity;
}

// ── Cart State ────────────────────────────────────────────────────────────────
class CartNotifier extends StateNotifier<List<CartItem>> {
  CartNotifier() : super([]);

  void addItem(Listing listing) {
    final idx = state.indexWhere((i) => i.listing.id == listing.id);
    if (idx >= 0) {
      // increment
      final items = [...state];
      final current = items[idx];
      if (current.quantity < listing.quantity) {
        items[idx] = current.copyWith(quantity: current.quantity + 1);
        state = items;
      }
    } else {
      state = [...state, CartItem(listing: listing, quantity: 1)];
    }
  }

  void removeItem(String listingId) {
    state = state.where((i) => i.listing.id != listingId).toList();
  }

  void decrementItem(String listingId) {
    final idx = state.indexWhere((i) => i.listing.id == listingId);
    if (idx < 0) return;
    final items = [...state];
    if (items[idx].quantity <= 1) {
      items.removeAt(idx);
    } else {
      items[idx] = items[idx].copyWith(quantity: items[idx].quantity - 1);
    }
    state = items;
  }

  void clear() => state = [];

  double get total => state.fold(0, (sum, item) => sum + item.subtotal);

  int get itemCount => state.fold(0, (sum, item) => sum + item.quantity);

  int quantityOf(String listingId) => state
      .firstWhere((i) => i.listing.id == listingId,
          orElse: () => const CartItem(listing: _dummyListing, quantity: 0))
      .quantity;
}

// placeholder to satisfy orElse
const _dummyListing = Listing(
  id: '',
  title: '',
  description: '',
  price: 0,
  offerPrice: 0,
  quantity: 0,
  photos: [],
);

final cartProvider = StateNotifierProvider<CartNotifier, List<CartItem>>((ref) {
  return CartNotifier();
});

// Convenience selectors
final cartTotalProvider = Provider<double>((ref) {
  return ref.watch(cartProvider.notifier).total;
});

final cartCountProvider = Provider<int>((ref) {
  return ref.watch(cartProvider.notifier).itemCount;
});

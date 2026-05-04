class Listing {
  final String id;
  final String title;
  final String description;
  final double price;
  final double offerPrice;
  final int quantity;
  final List<String> photos;
  final String? category;
  final String? status;
  final DateTime? expiresAt;
  final Map<String, dynamic>? business;
  final double? distance;
  final double? rating;
  final int? reviewCount;
  final List<String>? allergens;
  final int? co2Saved;

  const Listing({
    required this.id,
    required this.title,
    required this.description,
    required this.price,
    required this.offerPrice,
    required this.quantity,
    required this.photos,
    this.category,
    this.status,
    this.expiresAt,
    this.business,
    this.distance,
    this.rating,
    this.reviewCount,
    this.allergens,
    this.co2Saved,
  });

  factory Listing.fromJson(Map<String, dynamic> json) {
    return Listing(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0,
      offerPrice: (json['offerPrice'] as num?)?.toDouble() ??
          (json['price'] as num?)?.toDouble() ?? 0,
      quantity: (json['quantity'] as num?)?.toInt() ?? 0,
      photos: (json['photos'] as List?)?.map((e) => e.toString()).toList() ?? [],
      category: json['category'],
      status: json['status'],
      expiresAt: json['expiresAt'] != null
          ? DateTime.tryParse(json['expiresAt'].toString())
          : null,
      business: json['business'] as Map<String, dynamic>?,
      distance: (json['distance'] as num?)?.toDouble(),
      rating: (json['rating'] as num?)?.toDouble(),
      reviewCount: (json['reviewCount'] as num?)?.toInt(),
      allergens: (json['allergens'] as List?)?.map((e) => e.toString()).toList(),
      co2Saved: (json['co2Saved'] as num?)?.toInt(),
    );
  }

  int get discountPercent {
    if (price <= 0) return 0;
    return ((price - offerPrice) / price * 100).round();
  }

  bool get isLowStock => quantity > 0 && quantity <= 3;
  bool get isSoldOut => quantity <= 0;

  String get businessName =>
      business?['name'] ?? business?['businessName'] ?? '';
  String get businessId => business?['_id'] ?? business?['id'] ?? '';
  String? get firstPhoto => photos.isNotEmpty ? photos.first : null;
}

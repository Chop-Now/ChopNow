class Order {
  final String id;
  final String status;
  final List<OrderItem> items;
  final double total;
  final String? paymentMethod;
  final String? deliveryType;
  final Map<String, dynamic>? business;
  final DateTime? createdAt;
  final DateTime? readyAt;
  final int? co2Saved;

  const Order({
    required this.id,
    required this.status,
    required this.items,
    required this.total,
    this.paymentMethod,
    this.deliveryType,
    this.business,
    this.createdAt,
    this.readyAt,
    this.co2Saved,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['_id'] ?? json['id'] ?? '',
      status: json['status'] ?? 'pending',
      items: (json['items'] as List?)
              ?.map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      total: (json['total'] as num?)?.toDouble() ??
          (json['pricing']?['total'] as num?)?.toDouble() ??
          (json['totalAmount'] as num?)?.toDouble() ?? 0,
      paymentMethod: json['paymentMethod'],
      deliveryType: json['deliveryType'],
      business: json['business'] as Map<String, dynamic>?,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
      readyAt: json['readyAt'] != null
          ? DateTime.tryParse(json['readyAt'].toString())
          : null,
      co2Saved: (json['co2Saved'] as num?)?.toInt(),
    );
  }

  bool get isActive =>
      ['pending', 'pending_payment', 'paid', 'confirmed', 'ready_for_pickup',
       'out_for_delivery'].contains(status);

  bool get isCompleted => status == 'completed';
  bool get isCancelled => status == 'cancelled';
}

class OrderItem {
  final String id;
  final String listingId;
  final String name;
  final double price;
  final int quantity;
  final String? photo;

  const OrderItem({
    required this.id,
    required this.listingId,
    required this.name,
    required this.price,
    required this.quantity,
    this.photo,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    final listing = json['listing'] as Map<String, dynamic>?;
    return OrderItem(
      id: json['_id'] ?? json['id'] ?? '',
      listingId: listing?['_id'] ?? listing?['id'] ?? json['listingId'] ?? '',
      name: listing?['title'] ?? listing?['name'] ?? json['name'] ?? '',
      price: (json['price'] as num?)?.toDouble() ??
          (json['unitPrice'] as num?)?.toDouble() ?? 0,
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      photo: (listing?['photos'] as List?)?.isNotEmpty == true
          ? listing!['photos'][0].toString()
          : null,
    );
  }
}

class Business {
  final String id;
  final String name;
  final String? type;
  final String? description;
  final String? logo;
  final String? coverImage;
  final List<String> photos;
  final String status; // pending, approved, rejected, suspended
  final String? address;
  final String? phone;
  final String? email;
  final double? rating;
  final int? reviewCount;
  final Map<String, dynamic>? owner;

  const Business({
    required this.id,
    required this.name,
    this.type,
    this.description,
    this.logo,
    this.coverImage,
    required this.photos,
    required this.status,
    this.address,
    this.phone,
    this.email,
    this.rating,
    this.reviewCount,
    this.owner,
  });

  bool get isPending => status == 'pending';
  bool get isApproved => status == 'approved';
  bool get isRejected => status == 'rejected';
  bool get isSuspended => status == 'suspended';

  factory Business.fromJson(Map<String, dynamic> json) {
    return Business(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? json['businessName'] ?? '',
      type: json['type'],
      description: json['description'],
      logo: json['logo'],
      coverImage: json['coverImage'],
      photos: (json['photos'] as List?)?.map((p) => p.toString()).toList() ?? [],
      status: json['status'] ?? 'pending',
      address: json['address'],
      phone: json['phone'],
      email: json['email'],
      rating: (json['rating'] as num?)?.toDouble(),
      reviewCount: (json['reviewCount'] as num?)?.toInt(),
      owner: json['owner'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    if (type != null) 'type': type,
    if (description != null) 'description': description,
    if (address != null) 'address': address,
    if (phone != null) 'phone': phone,
    if (email != null) 'email': email,
  };
}

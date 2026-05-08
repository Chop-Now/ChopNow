class Business {
  final String id;
  final String name;
  final String? type;
  final String? description;
  final String? logo;
  final String? coverImage;
  final List<String> photos;
  final String status; // active, inactive, suspended
  final String? address;
  final String? phone;
  final String? email;
  final String? website;
  final String? whatsapp;
  final double? rating;
  final int? reviewCount;
  final Map<String, dynamic>? owner;
  final BusinessVerification verification;
  final BusinessDeliverySettings deliverySettings;
  final BusinessStats stats;

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
    this.website,
    this.whatsapp,
    this.rating,
    this.reviewCount,
    this.owner,
    this.verification = const BusinessVerification(),
    this.deliverySettings = const BusinessDeliverySettings(),
    this.stats = const BusinessStats(),
  });

  bool get isPending => verification.status == 'pending';
  bool get isApproved => verification.status == 'approved' || verification.status == 'verified';
  bool get isRejected => verification.status == 'rejected';
  bool get isSuspended => status == 'suspended';
  bool get isUnverified => verification.status == 'unverified';
  bool get needsKyc => verification.status == 'unverified' || verification.status == 'rejected' || verification.status == 'info_requested';

  /// Public store link
  String get storeLink => '/business/$id/profile';

  factory Business.fromJson(Map<String, dynamic> json) {
    final media = json['media'] as Map<String, dynamic>? ?? {};
    final contact = json['contact'] as Map<String, dynamic>? ?? {};
    final verif = json['verification'] as Map<String, dynamic>? ?? {};
    final delivery = json['deliverySettings'] as Map<String, dynamic>? ?? {};
    final statsJson = json['stats'] as Map<String, dynamic>? ?? {};
    final ratingJson = json['rating'] as Map<String, dynamic>?;

    return Business(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? json['businessName'] ?? '',
      type: json['type'],
      description: json['description'],
      logo: media['logo'] ?? json['logo'],
      coverImage: media['coverImage'] ?? json['coverImage'],
      photos: (media['photos'] as List?)?.map((p) => p.toString()).toList() ??
          (json['photos'] as List?)?.map((p) => p.toString()).toList() ?? [],
      status: json['status'] ?? 'active',
      address: json['address'] is String ? json['address'] : json['address']?.toString(),
      phone: contact['phone'] ?? json['phone'],
      email: contact['email'] ?? json['email'],
      website: json['website'],
      whatsapp: contact['whatsapp'],
      rating: ratingJson != null
          ? (ratingJson['average'] as num?)?.toDouble()
          : (json['rating'] as num?)?.toDouble(),
      reviewCount: ratingJson != null
          ? (ratingJson['count'] as num?)?.toInt()
          : (json['reviewCount'] as num?)?.toInt(),
      owner: json['owner'] is Map<String, dynamic> ? json['owner'] as Map<String, dynamic> : null,
      verification: BusinessVerification.fromJson(verif),
      deliverySettings: BusinessDeliverySettings.fromJson(delivery),
      stats: BusinessStats.fromJson(statsJson),
    );
  }

  Map<String, dynamic> toJson() => {
    'name': name,
    if (type != null) 'type': type,
    if (description != null) 'description': description,
    if (address != null) 'address': address,
    if (phone != null) 'phone': phone,
    if (email != null) 'email': email,
    if (website != null) 'website': website,
  };
}

class BusinessVerification {
  final String status; // unverified, pending, verified, approved, rejected, info_requested
  final List<BusinessDocument> documents;
  final DateTime? submittedAt;
  final DateTime? verifiedAt;
  final String? notes;

  const BusinessVerification({
    this.status = 'unverified',
    this.documents = const [],
    this.submittedAt,
    this.verifiedAt,
    this.notes,
  });

  factory BusinessVerification.fromJson(Map<String, dynamic> json) {
    return BusinessVerification(
      status: json['status'] ?? 'unverified',
      documents: (json['documents'] as List?)
              ?.map((d) => BusinessDocument.fromJson(d as Map<String, dynamic>))
              .toList() ??
          [],
      submittedAt: json['submittedAt'] != null ? DateTime.tryParse(json['submittedAt'].toString()) : null,
      verifiedAt: json['verifiedAt'] != null ? DateTime.tryParse(json['verifiedAt'].toString()) : null,
      notes: json['notes'],
    );
  }
}

class BusinessDocument {
  final String type; // license, health_cert, id_card, other
  final String url;
  final DateTime uploadedAt;

  const BusinessDocument({
    required this.type,
    required this.url,
    required this.uploadedAt,
  });

  factory BusinessDocument.fromJson(Map<String, dynamic> json) {
    return BusinessDocument(
      type: json['type'] ?? 'other',
      url: json['url'] ?? '',
      uploadedAt: json['uploadedAt'] != null
          ? DateTime.tryParse(json['uploadedAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  String get typeLabel => switch (type) {
    'license' => 'Business License',
    'health_cert' => 'Health Certificate',
    'id_card' => 'ID Card / Passport',
    _ => 'Document',
  };
}

class BusinessDeliverySettings {
  final bool enabled;
  final double fee;
  final double radius;
  final double minOrder;

  const BusinessDeliverySettings({
    this.enabled = false,
    this.fee = 0,
    this.radius = 5,
    this.minOrder = 0,
  });

  factory BusinessDeliverySettings.fromJson(Map<String, dynamic> json) {
    return BusinessDeliverySettings(
      enabled: json['enabled'] ?? false,
      fee: (json['fee'] as num?)?.toDouble() ?? 0,
      radius: (json['radius'] as num?)?.toDouble() ?? 5,
      minOrder: (json['minOrder'] as num?)?.toDouble() ?? 0,
    );
  }
}

class BusinessStats {
  final int totalOrders;
  final int totalListings;
  final double averageRating;
  final int reviewCount;
  final double balance;
  final int mealsRescued;
  final double co2Saved;

  const BusinessStats({
    this.totalOrders = 0,
    this.totalListings = 0,
    this.averageRating = 0,
    this.reviewCount = 0,
    this.balance = 0,
    this.mealsRescued = 0,
    this.co2Saved = 0,
  });

  factory BusinessStats.fromJson(Map<String, dynamic> json) {
    final impact = json['impact'] as Map<String, dynamic>? ?? {};
    return BusinessStats(
      totalOrders: (json['totalOrders'] as num?)?.toInt() ?? 0,
      totalListings: (json['totalListings'] as num?)?.toInt() ?? 0,
      averageRating: (json['averageRating'] as num?)?.toDouble() ?? 0,
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
      balance: (json['balance'] as num?)?.toDouble() ?? 0,
      mealsRescued: (impact['mealsRescued'] as num?)?.toInt() ?? 0,
      co2Saved: (impact['co2Saved'] as num?)?.toDouble() ?? 0,
    );
  }
}

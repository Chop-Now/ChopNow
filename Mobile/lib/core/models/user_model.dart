class UserAddress {
  final String? id;
  final String label;
  final String street;
  final String? city;
  final String? country;
  final bool isDefault;

  const UserAddress({
    this.id,
    required this.label,
    required this.street,
    this.city,
    this.country,
    this.isDefault = false,
  });

  factory UserAddress.fromJson(Map<String, dynamic> json) {
    return UserAddress(
      id: json['_id'] ?? json['id'],
      label: json['label'] ?? 'Home',
      street: json['street'] ?? json['address'] ?? '',
      city: json['city'],
      country: json['country'],
      isDefault: json['isDefault'] == true,
    );
  }

  Map<String, dynamic> toJson() => {
    'label': label,
    'street': street,
    if (city != null) 'city': city,
    if (country != null) 'country': country,
    'isDefault': isDefault,
  };
}

class AppUser {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String? phone;
  final String? avatar;
  final List<String> roles;
  final String activeRole;
  final List<UserAddress> addresses;
  final bool isEmailVerified;
  final bool isActive;

  const AppUser({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.phone,
    this.avatar,
    required this.roles,
    required this.activeRole,
    required this.addresses,
    this.isEmailVerified = false,
    this.isActive = true,
  });

  String get fullName => '$firstName $lastName'.trim();

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['_id'] ?? json['id'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'],
      avatar: json['avatar'],
      roles: (json['roles'] as List?)?.map((r) => r.toString()).toList() ?? ['consumer'],
      activeRole: json['activeRole'] ?? 'consumer',
      addresses: (json['addresses'] as List?)
              ?.map((a) => UserAddress.fromJson(a as Map<String, dynamic>))
              .toList() ??
          [],
      isEmailVerified: json['isEmailVerified'] == true,
      isActive: json['isActive'] != false,
    );
  }

  Map<String, dynamic> toJson() => {
    'firstName': firstName,
    'lastName': lastName,
    'email': email,
    if (phone != null) 'phone': phone,
  };

  bool get isBusinessOwner => roles.contains('business_owner');
  bool get isRider => roles.contains('rider');
  bool get isAdmin => roles.contains('admin');
}

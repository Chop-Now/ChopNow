//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//
// @dart=2.18

// ignore_for_file: unused_element, unused_import
// ignore_for_file: always_put_required_named_parameters_first
// ignore_for_file: constant_identifier_names
// ignore_for_file: lines_longer_than_80_chars

part of openapi.api;

class ListingsPostRequest {
  /// Returns a new [ListingsPostRequest] instance.
  ListingsPostRequest({
    required this.title,
    required this.price,
  });

  String title;

  num price;

  @override
  bool operator ==(Object other) => identical(this, other) || other is ListingsPostRequest &&
    other.title == title &&
    other.price == price;

  @override
  int get hashCode =>
    // ignore: unnecessary_parenthesis
    (title.hashCode) +
    (price.hashCode);

  @override
  String toString() => 'ListingsPostRequest[title=$title, price=$price]';

  Map<String, dynamic> toJson() {
    final json = <String, dynamic>{};
      json[r'title'] = this.title;
      json[r'price'] = this.price;
    return json;
  }

  /// Returns a new [ListingsPostRequest] instance and imports its values from
  /// [value] if it's a [Map], null otherwise.
  // ignore: prefer_constructors_over_static_methods
  static ListingsPostRequest? fromJson(dynamic value) {
    if (value is Map) {
      final json = value.cast<String, dynamic>();

      // Ensure that the map contains the required keys.
      // Note 1: the values aren't checked for validity beyond being non-null.
      // Note 2: this code is stripped in release mode!
      assert(() {
        assert(json.containsKey(r'title'), 'Required key "ListingsPostRequest[title]" is missing from JSON.');
        assert(json[r'title'] != null, 'Required key "ListingsPostRequest[title]" has a null value in JSON.');
        assert(json.containsKey(r'price'), 'Required key "ListingsPostRequest[price]" is missing from JSON.');
        assert(json[r'price'] != null, 'Required key "ListingsPostRequest[price]" has a null value in JSON.');
        return true;
      }());

      return ListingsPostRequest(
        title: mapValueOfType<String>(json, r'title')!,
        price: num.parse('${json[r'price']}'),
      );
    }
    return null;
  }

  static List<ListingsPostRequest> listFromJson(dynamic json, {bool growable = false,}) {
    final result = <ListingsPostRequest>[];
    if (json is List && json.isNotEmpty) {
      for (final row in json) {
        final value = ListingsPostRequest.fromJson(row);
        if (value != null) {
          result.add(value);
        }
      }
    }
    return result.toList(growable: growable);
  }

  static Map<String, ListingsPostRequest> mapFromJson(dynamic json) {
    final map = <String, ListingsPostRequest>{};
    if (json is Map && json.isNotEmpty) {
      json = json.cast<String, dynamic>(); // ignore: parameter_assignments
      for (final entry in json.entries) {
        final value = ListingsPostRequest.fromJson(entry.value);
        if (value != null) {
          map[entry.key] = value;
        }
      }
    }
    return map;
  }

  // maps a json object with a list of ListingsPostRequest-objects as value to a dart map
  static Map<String, List<ListingsPostRequest>> mapListFromJson(dynamic json, {bool growable = false,}) {
    final map = <String, List<ListingsPostRequest>>{};
    if (json is Map && json.isNotEmpty) {
      // ignore: parameter_assignments
      json = json.cast<String, dynamic>();
      for (final entry in json.entries) {
        map[entry.key] = ListingsPostRequest.listFromJson(entry.value, growable: growable,);
      }
    }
    return map;
  }

  /// The list of required keys that must be present in a JSON.
  static const requiredKeys = <String>{
    'title',
    'price',
  };
}


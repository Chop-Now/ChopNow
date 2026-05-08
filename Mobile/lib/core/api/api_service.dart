import 'package:openapi/api.dart';
import 'package:uuid/uuid.dart';

/// Centralized API Service for ChopNow.
/// This wraps the generated OpenAPI client with convenience methods for:
/// - Authentication (JWT)
/// - Idempotency
/// - Base URL configuration
class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;

  late final ApiClient _client;
  
  // Generated API Instances
  late final UsersApi users;
  late final OrdersApi orders;
  late final BusinessesApi businesses;
  late final ListingsApi listings;

  ApiService._internal() {
    // Determine base URL based on environment
    const baseUrl = String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: 'https://api.chopnow.app/api',
    );

    _client = ApiClient(basePath: baseUrl);
    
    // Initialize specific APIs
    users = UsersApi(_client);
    orders = OrdersApi(_client);
    businesses = BusinessesApi(_client);
    listings = ListingsApi(_client);
  }

  /// Updates the global Authorization header for all future requests.
  void setAuthToken(String? token) {
    if (token != null) {
      _client.addDefaultHeader('Authorization', 'Bearer $token');
    } else {
      // Remove header if token is null (logout)
      _client.defaultHeaderMap.remove('Authorization');
    }
  }

  /// Generates and applies a unique Idempotency-Key for the next critical request.
  /// Should be called immediately before critical operations like creating an order.
  String prepareIdempotentRequest() {
    final key = const Uuid().v4();
    _client.addDefaultHeader('Idempotency-Key', key);
    return key;
  }

  /// Clears the idempotency key after use to prevent it from leaking into other requests.
  void clearIdempotencyKey() {
    _client.defaultHeaderMap.remove('Idempotency-Key');
  }
}

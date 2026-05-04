import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../utils/constants.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  io.Socket? _socket;
  final _orderStatusController = StreamController<Map<String, dynamic>>.broadcast();
  final _newOrderController = StreamController<Map<String, dynamic>>.broadcast();

  Stream<Map<String, dynamic>> get orderStatusStream => _orderStatusController.stream;
  Stream<Map<String, dynamic>> get newOrderStream => _newOrderController.stream;

  void connect(String token) {
    if (_socket != null && _socket!.connected) return;

    try {
      // Connect to the base URL without /api/v1
      final baseUrl = AppConstants.apiBaseUrl.replaceAll('/api/v1', '');
      
      _socket = io.io(
        baseUrl,
        io.OptionBuilder()
            .setTransports(['websocket'])
            .disableAutoConnect()
            .setExtraHeaders({'Authorization': 'Bearer $token'})
            .build(),
      );

      _socket!.connect();

      _socket!.onConnect((_) {
        debugPrint('Socket connected: ${_socket!.id}');
      });

      _socket!.onDisconnect((_) {
        debugPrint('Socket disconnected');
      });

      // Listen for order status updates (for Consumers, Vendors, Riders)
      _socket!.on('order_status_updated', (data) {
        debugPrint('Live order update received via Socket!');
        _orderStatusController.add(Map<String, dynamic>.from(data));
      });

      // Listen for new orders (for Vendors)
      _socket!.on('new_order', (data) {
        debugPrint('Live new order received via Socket!');
        _newOrderController.add(Map<String, dynamic>.from(data));
      });

    } catch (e) {
      debugPrint('Socket connection error: $e');
    }
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }
}

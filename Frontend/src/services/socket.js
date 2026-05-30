import { io } from 'socket.io-client';
import { API_URL } from './api';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Socket connection skipped: No authentication token found');
      return null;
    }

    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    try {
      // Connect to the base URL (remove /api/v1 if present)
      const socketUrl = API_URL.replace('/api/v1', '');

      this.socket = io(socketUrl, {
        transports: ['websocket'],
        auth: { token },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Successfully connected to WebSocket server:', this.socket.id);
        // Re-attach listeners on reconnection
        this.listeners.forEach((callbacks, event) => {
          callbacks.forEach((cb) => {
            this.socket.off(event, cb); // prevent duplicates
            this.socket.on(event, cb);
          });
        });
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error.message);
      });

      return this.socket;
    } catch (e) {
      console.error('Error initializing socket connection:', e);
      return null;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('WebSocket connection closed manually');
    }
  }

  // Subscribe to tracking room
  trackOrder(orderId) {
    this.connect();
    if (this.socket) {
      console.log(`Subscribing to tracking room for order: ${orderId}`);
      this.socket.emit('track_order', orderId);
    }
  }

  // Add listener and cache it for auto-reconnection
  on(event, callback) {
    this.connect();
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove listener
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.listeners.delete(event);
      }
    }
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

const socketService = new SocketService();
export default socketService;

import { io, Socket } from 'socket.io-client';
import { OrderStatus, OrderItemStatus } from './order-service';
import { API_BASE_URL } from '@/lib/api';

// WebSocket event interfaces
export interface OrderEvent {
  orderId: string;
  status: OrderStatus;
  tableId?: string;
  venueId?: string;
  organizationId?: string;
  timestamp: Date;
  message: string;
}

export interface OrderItemEvent {
  orderId: string;
  orderItemId: string;
  status: OrderItemStatus;
  timestamp: Date;
  message: string;
}

// WebSocket service
class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // 2 seconds
  private currentToken: string | null = null;
  private connectionCount = 0; // Track how many components are using the connection
  private isConnecting = false; // Prevent multiple simultaneous connections

  // Initialize the socket connection with optional authentication token
  connect(token?: string) {
    // Increment connection count
    this.connectionCount++;
    console.log(`WebSocket connection requested. Count: ${this.connectionCount}`);

    // If we're already connecting, wait for it to complete
    if (this.isConnecting) {
      console.log('WebSocket connection already in progress, waiting...');
      return;
    }

    if (this.socket) {
      // If we already have a socket but the token changed, disconnect and reconnect
      if (token && token !== this.currentToken) {
        console.log('Token changed, reconnecting WebSocket...');
        this.disconnect();
      } else {
        console.log('WebSocket already connected, reusing connection');
        return;
      }
    }

    this.isConnecting = true;
    this.currentToken = token || null;

    console.log('Creating new WebSocket connection...');

    // Prepare connection options
    const connectionOptions: any = {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      forceNew: false, // Reuse existing connection if possible
    };

    // Add authentication if token is provided
    if (this.currentToken) {
      connectionOptions.auth = {
        token: this.currentToken
      };
      // Also add as header for compatibility
      connectionOptions.extraHeaders = {
        'Authorization': `Bearer ${this.currentToken}`
      };
    }

    this.socket = io(`${API_BASE_URL}/orders`, connectionOptions);

    this.setupEventListeners();
  }

  // Update authentication token for existing connection
  updateToken(token: string | null) {
    if (token !== this.currentToken) {
      this.currentToken = token;

      // If we have an active connection, reconnect with new token
      if (this.socket && this.connected) {
        this.disconnect();
        this.connect(token);
      }
    }
  }

  // Setup socket event listeners
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      console.log('WebSocket connected successfully');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      this.isConnecting = false;
      console.warn('WebSocket connection error:', error);

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached, giving up');
        this.socket?.disconnect();
      }
    });

    // Listen for order events
    this.socket.on('orderUpdated', (data: OrderEvent) => {
      this.notifyListeners('orderUpdated', data);
    });

    this.socket.on('orderItemUpdated', (data: OrderItemEvent) => {
      this.notifyListeners('orderItemUpdated', data);
    });

    this.socket.on('newOrder', (data: OrderEvent) => {
      this.notifyListeners('newOrder', data);
    });

    // Setup cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.forceDisconnect();
    });

    // Also cleanup on visibility change (when tab becomes hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Don't disconnect immediately, just reduce activity
        console.log('Page hidden, WebSocket staying connected but reducing activity');
      }
    });
  }

  // Track joined rooms to prevent duplicate joins
  private joinedRooms = new Set<string>();

  // Join a room to receive specific events
  joinRoom(room: string, id: string, token?: string) {
    if (!id) {
      return;
    }

    // Create a unique room identifier
    const roomKey = `${room}:${id}`;

    // Skip if already joined this room
    if (this.joinedRooms.has(roomKey)) {
      return;
    }

    // Connect if not already connected, with token if provided
    if (!this.socket || !this.connected) {
      this.connect(token || this.currentToken);
    }

    // Wait for connection before joining
    const joinRoomWhenConnected = () => {
      if (!this.socket || !this.connected) {
        setTimeout(joinRoomWhenConnected, 100);
        return;
      }

      switch (room) {
        case 'order':
          this.socket.emit('joinOrderRoom', id);
          break;
        case 'venue':
          this.socket.emit('joinVenueRoom', id);
          break;
        case 'table':
          this.socket.emit('joinTableRoom', id);
          break;
        case 'organization':
          this.socket.emit('joinOrganizationRoom', id);
          break;
        default:
          return; // Don't mark as joined if room type is unknown
      }

      // Mark as joined
      this.joinedRooms.add(roomKey);
    };

    joinRoomWhenConnected();
  }

  // Leave a room
  leaveRoom(room: string, id: string) {
    if (!this.socket || !this.connected) return;

    // Create the room key
    const roomKey = `${room}:${id}`;

    // Only emit if we've actually joined this room
    if (this.joinedRooms.has(roomKey)) {
      this.socket.emit('leaveRoom', roomKey);
      this.joinedRooms.delete(roomKey);
    }
  }

  // Add event listener
  addEventListener(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  // Remove event listener
  removeEventListener(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event)?.delete(callback);
  }

  // Alias methods for compatibility
  on(event: string, callback: (data: any) => void) {
    this.addEventListener(event, callback);
  }

  off(event: string, callback: (data: any) => void) {
    this.removeEventListener(event, callback);
  }

  // Notify all listeners of an event
  private notifyListeners(event: string, data: any) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event)?.forEach((callback) => {
      callback(data);
    });
  }

  // Disconnect the socket (with reference counting)
  disconnect() {
    // Decrement connection count
    this.connectionCount = Math.max(0, this.connectionCount - 1);
    console.log(`WebSocket disconnect requested. Count: ${this.connectionCount}`);

    // Only actually disconnect if no components are using it
    if (this.connectionCount > 0) {
      console.log('Other components still using WebSocket, keeping connection alive');
      return;
    }

    console.log('Disconnecting WebSocket...');
    if (!this.socket) return;

    this.socket.disconnect();
    this.socket = null;
    this.connected = false;
    this.isConnecting = false;
    this.listeners.clear();
    this.joinedRooms.clear(); // Clear joined rooms on disconnect
    this.currentToken = null; // Clear the current token
  }

  // Force disconnect (ignore reference counting)
  forceDisconnect() {
    console.log('Force disconnecting WebSocket...');
    this.connectionCount = 0;
    if (!this.socket) return;

    this.socket.disconnect();
    this.socket = null;
    this.connected = false;
    this.isConnecting = false;
    this.listeners.clear();
    this.joinedRooms.clear();
    this.currentToken = null;
  }

  // Get connection status
  isConnected(): boolean {
    return this.connected && this.socket?.connected === true;
  }

  // Get current token
  getCurrentToken(): string | null {
    return this.currentToken;
  }

  // Get connection statistics for debugging
  getConnectionStats() {
    return {
      connected: this.connected,
      connectionCount: this.connectionCount,
      isConnecting: this.isConnecting,
      socketId: this.socket?.id || null,
      joinedRooms: Array.from(this.joinedRooms),
      listenerCount: this.listeners.size,
      currentToken: this.currentToken ? 'present' : 'none'
    };
  }

  // Debug method to log connection status
  logConnectionStatus() {
    console.log('WebSocket Connection Status:', this.getConnectionStats());
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;

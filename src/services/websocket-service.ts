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

  // Initialize the socket connection with optional authentication token
  connect(token?: string) {
    if (this.socket) {
      // If we already have a socket but the token changed, disconnect and reconnect
      if (token && token !== this.currentToken) {
        console.log('Token changed, reconnecting WebSocket...');
        this.disconnect();
      } else {
        return;
      }
    }

    this.currentToken = token || null;

    // Prepare connection options
    const connectionOptions: any = {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
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
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
    });

    this.socket.on('connect_error', () => {
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
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
      this.disconnect();
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

  // Notify all listeners of an event
  private notifyListeners(event: string, data: any) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event)?.forEach((callback) => {
      callback(data);
    });
  }

  // Disconnect the socket
  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
    this.connected = false;
    this.listeners.clear();
    this.joinedRooms.clear(); // Clear joined rooms on disconnect
    this.currentToken = null; // Clear the current token
  }

  // Get connection status
  isConnected(): boolean {
    return this.connected;
  }

  // Get current token
  getCurrentToken(): string | null {
    return this.currentToken;
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;

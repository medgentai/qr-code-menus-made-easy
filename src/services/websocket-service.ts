import { io, Socket } from 'socket.io-client';
import { OrderStatus, OrderItemStatus } from './order-service';

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

  // Initialize the socket connection
  connect() {
    if (this.socket) {
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    this.socket = io(`${API_URL}/orders`, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();
  }

  // Setup socket event listeners
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.connected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`WebSocket disconnected: ${reason}`);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnect attempts reached, giving up');
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
  joinRoom(room: string, id: string) {
    if (!id) {
      console.warn('Attempted to join room with empty ID');
      return;
    }

    // Create a unique room identifier
    const roomKey = `${room}:${id}`;

    // Skip if already joined this room
    if (this.joinedRooms.has(roomKey)) {
      console.log(`Already joined room: ${roomKey}`);
      return;
    }

    // Connect if not already connected
    if (!this.socket || !this.connected) {
      this.connect();
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
          console.error(`Unknown room type: ${room}`);
          return; // Don't mark as joined if room type is unknown
      }

      // Mark as joined
      this.joinedRooms.add(roomKey);
      console.log(`Joined room: ${roomKey}`);
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
      console.log(`Left room: ${roomKey}`);
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
    console.log('WebSocket disconnected and rooms cleared');
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;

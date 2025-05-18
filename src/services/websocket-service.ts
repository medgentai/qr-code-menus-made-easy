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
  }

  // Join a room to receive specific events
  joinRoom(room: string, id: string) {
    if (!this.socket || !this.connected) {
      this.connect();
    }

    switch (room) {
      case 'order':
        this.socket?.emit('joinOrderRoom', id);
        break;
      case 'venue':
        this.socket?.emit('joinVenueRoom', id);
        break;
      case 'table':
        this.socket?.emit('joinTableRoom', id);
        break;
      case 'organization':
        this.socket?.emit('joinOrganizationRoom', id);
        break;
      default:
        console.error(`Unknown room type: ${room}`);
    }
  }

  // Leave a room
  leaveRoom(room: string) {
    if (!this.socket || !this.connected) return;
    this.socket.emit('leaveRoom', room);
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
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;

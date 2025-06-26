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
  private reconnectTimer: number | null = null;
  private heartbeatInterval: number | null = null;
  private lastHeartbeat: number = 0;

  // Initialize the socket connection with optional authentication token
  connect(token?: string) {
    // Increment connection count
    this.connectionCount++;

    // If we're already connecting, wait for it to complete
    if (this.isConnecting) {
      return;
    }

    if (this.socket) {
      // If we already have a socket but the token changed, disconnect and reconnect
      if (token && token !== this.currentToken) {
        this.disconnect();
      } else {
        return;
      }
    }

    this.isConnecting = true;
    this.currentToken = token || null;

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
      this.lastHeartbeat = Date.now();

      // Start heartbeat monitoring
      this.startHeartbeat();

      // Re-join all previously joined rooms
      this.rejoinRooms();
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;

      // Stop heartbeat monitoring
      this.stopHeartbeat();

      // Attempt reconnection for certain disconnect reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.scheduleReconnect();
      }
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
      this.lastHeartbeat = Date.now(); // Update heartbeat on any message
      this.notifyListeners('orderUpdated', data);
    });

    this.socket.on('orderItemUpdated', (data: OrderItemEvent) => {
      this.lastHeartbeat = Date.now(); // Update heartbeat on any message
      this.notifyListeners('orderItemUpdated', data);
    });

    this.socket.on('newOrder', (data: OrderEvent) => {
      this.lastHeartbeat = Date.now(); // Update heartbeat on any message
      this.notifyListeners('newOrder', data);
    });

    // Listen for heartbeat/ping events
    this.socket.on('ping', () => {
      this.lastHeartbeat = Date.now();
    });

    this.socket.on('pong', () => {
      this.lastHeartbeat = Date.now();
    });

    // Setup cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.forceDisconnect();
    });

    // Also cleanup on visibility change (when tab becomes hidden)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Don't disconnect immediately, just reduce activity
      }
    });
  }

  // Track joined rooms to prevent duplicate joins
  private joinedRooms = new Set<string>();

  // Start heartbeat monitoring
  private startHeartbeat() {
    this.stopHeartbeat(); // Clear any existing heartbeat

    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.connected) {
        const now = Date.now();
        // Check if we haven't received a heartbeat in the last 30 seconds
        if (now - this.lastHeartbeat > 30000) {
          this.scheduleReconnect();
        }
      }
    }, 10000); // Check every 10 seconds
  }

  // Stop heartbeat monitoring
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Schedule a reconnection attempt
  private scheduleReconnect() {
    if (this.reconnectTimer || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.connected && this.connectionCount > 0) {
        this.connect(this.currentToken);
      }
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts)); // Exponential backoff
  }

  // Re-join all previously joined rooms after reconnection
  private rejoinRooms() {
    if (!this.socket || !this.connected) return;

    const roomsToRejoin = Array.from(this.joinedRooms);
    this.joinedRooms.clear(); // Clear the set so joinRoom doesn't skip

    // Filter out conflicting rooms - only keep the most specific room
    const filteredRooms = this.filterConflictingRooms(roomsToRejoin);

    filteredRooms.forEach(roomKey => {
      const [room, id] = roomKey.split(':');
      if (room && id) {
        this.joinRoom(room, id);
      }
    });
  }

  // Filter out conflicting rooms to prevent joining both organization and venue rooms
  private filterConflictingRooms(rooms: string[]): string[] {
    const venueRooms = rooms.filter(room => room.startsWith('venue:'));
    const orgRooms = rooms.filter(room => room.startsWith('organization:'));
    const otherRooms = rooms.filter(room => !room.startsWith('venue:') && !room.startsWith('organization:'));

    // If we have venue rooms, prioritize them over organization rooms
    if (venueRooms.length > 0) {
      return [...venueRooms, ...otherRooms];
    }

    // Otherwise, keep organization rooms
    return [...orgRooms, ...otherRooms];
  }

  // Handle conflicts between venue and organization rooms
  private handleVenueOrgRoomConflict(newRoom: string, newId: string) {
    if (newRoom === 'venue') {
      // If joining a venue room, leave all organization rooms
      const orgRoomsToLeave = Array.from(this.joinedRooms).filter(room => room.startsWith('organization:'));
      orgRoomsToLeave.forEach(roomKey => {
        const [room, id] = roomKey.split(':');
        if (room && id) {
          this.leaveRoom(room, id);
        }
      });
    } else if (newRoom === 'organization') {
      // If joining an organization room, leave all venue rooms
      const venueRoomsToLeave = Array.from(this.joinedRooms).filter(room => room.startsWith('venue:'));
      venueRoomsToLeave.forEach(roomKey => {
        const [room, id] = roomKey.split(':');
        if (room && id) {
          this.leaveRoom(room, id);
        }
      });
    }
  }

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

    // Handle venue/organization room conflicts
    if (room === 'venue' || room === 'organization') {
      this.handleVenueOrgRoomConflict(room, id);
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

    // Only actually disconnect if no components are using it
    if (this.connectionCount > 0) {
      return;
    }

    if (!this.socket) return;

    // Clear timers
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

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
    this.connectionCount = 0;
    if (!this.socket) return;

    // Clear timers
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

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

  // Clear all venue and organization rooms (useful for context switches)
  clearVenueOrgRooms() {
    const roomsToLeave = Array.from(this.joinedRooms).filter(room =>
      room.startsWith('venue:') || room.startsWith('organization:')
    );

    roomsToLeave.forEach(roomKey => {
      const [room, id] = roomKey.split(':');
      if (room && id) {
        this.leaveRoom(room, id);
      }
    });
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
    return this.getConnectionStats();
  }
}

// Create a singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;

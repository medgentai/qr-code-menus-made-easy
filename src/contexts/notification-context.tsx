import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useOrganization } from './organization-context';
import { useVenue } from './venue-context';
import { useAuth } from './auth-context';
import webSocketService, { OrderEvent, OrderItemEvent } from '@/services/websocket-service';

// Local storage keys for preferences only
const ENABLE_NOTIFICATIONS_KEY = 'enableNotifications';
const ENABLE_SOUND_ALERTS_KEY = 'enableSoundAlerts';
const NOTIFIED_ORDER_IDS_KEY = 'notifiedOrderIds';

// Notification types (for backward compatibility)
export enum NotificationType {
  NEW_ORDER = 'NEW_ORDER',
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
  ORDER_ITEM_STATUS_CHANGED = 'ORDER_ITEM_STATUS_CHANGED',
  SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION',
  PAYMENT_NOTIFICATION = 'PAYMENT_NOTIFICATION',
}



export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data: any;
}

// Notification context interface
export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  enableNotifications: boolean;
  setEnableNotifications: (enable: boolean) => void;
  enableSoundAlerts: boolean;
  setEnableSoundAlerts: (enable: boolean) => void;
  playSound: (type: NotificationType) => void;
  refreshNotifications: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Create the notification context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Notification provider props
interface NotificationProviderProps {
  children: React.ReactNode;
}

// Helper function to parse stored notified order IDs
const parseStoredNotifiedOrderIds = (storedIds: string | null): Set<string> => {
  if (!storedIds) return new Set();
  try {
    const parsed = JSON.parse(storedIds);
    return new Set(parsed);
  } catch (error) {
    console.error('Error parsing stored notified order IDs:', error);
    return new Set();
  }
};

// Notification provider component
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { currentOrganization } = useOrganization();
  const { currentVenue } = useVenue();
  const { state: { isAuthenticated, accessToken } } = useAuth();

  // State for notifications from API
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Preferences from localStorage
  const [enableNotifications, setEnableNotifications] = useState<boolean>(() => {
    const stored = localStorage.getItem(ENABLE_NOTIFICATIONS_KEY);
    return stored ? stored === 'true' : true;
  });

  const [enableSoundAlerts, setEnableSoundAlerts] = useState<boolean>(() => {
    const stored = localStorage.getItem(ENABLE_SOUND_ALERTS_KEY);
    return stored ? stored === 'true' : true;
  });

  // Track already notified order IDs to prevent duplicates
  const [notifiedOrderIds] = useState<Set<string>>(() =>
    parseStoredNotifiedOrderIds(localStorage.getItem(NOTIFIED_ORDER_IDS_KEY))
  );

  // Audio elements for notification sounds
  const newOrderSound = new Audio('/sounds/new-order.mp3');
  const statusChangeSound = new Audio('/sounds/status-change.mp3');

  // Refresh notifications (now just a placeholder since we're using in-memory notifications)
  const refreshNotifications = useCallback(async () => {
    // No API calls needed anymore
    return Promise.resolve();
  }, []);

  // Play notification sound
  const playSound = useCallback((type: NotificationType) => {
    if (!enableSoundAlerts) return;

    switch (type) {
      case NotificationType.NEW_ORDER:
        newOrderSound.play().catch(err => console.error('Error playing sound:', err));
        break;
      case NotificationType.ORDER_STATUS_CHANGED:
      case NotificationType.ORDER_ITEM_STATUS_CHANGED:
        statusChangeSound.play().catch(err => console.error('Error playing sound:', err));
        break;
    }
  }, [enableSoundAlerts, newOrderSound, statusChangeSound]);

  // Mark a notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    notifiedOrderIds.clear(); // Clear the set of notified order IDs
  }, [notifiedOrderIds]);

  // Handle new order event
  const handleNewOrder = useCallback((event: OrderEvent) => {
    // Check if we've already notified about this order
    if (notifiedOrderIds.has(event.orderId)) {
      return; // Skip duplicate notifications
    }

    // Add to the set of notified order IDs
    notifiedOrderIds.add(event.orderId);

    // Limit the size of the set to prevent memory leaks
    if (notifiedOrderIds.size > 1000) {
      // Remove the oldest entries (first 200)
      const entriesToRemove = Array.from(notifiedOrderIds).slice(0, 200);
      entriesToRemove.forEach(id => notifiedOrderIds.delete(id));
    }

    // Show toast notification
    toast.info(`New order received: ${event.message}`, {
      description: new Date(event.timestamp).toLocaleTimeString(),
    });

    // Play sound
    playSound(NotificationType.NEW_ORDER);

    // Show browser notification if available and page is not visible
    if (document.visibilityState !== 'visible' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('ScanServe', {
          body: `New order received: ${event.message}`,
          icon: '/favicon.ico',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }

    // Add to in-memory notifications
    const newNotification: Notification = {
      id: event.orderId,
      type: NotificationType.NEW_ORDER,
      title: 'New Order',
      message: event.message,
      timestamp: new Date(event.timestamp),
      read: false,
      data: event
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, [notifiedOrderIds, playSound]);

  // Handle order status change event
  const handleOrderStatusChange = useCallback((event: OrderEvent) => {
    // Create a unique key for this status change event
    const statusChangeKey = `${event.orderId}-${event.status}-${event.timestamp}`;

    // Check if we've already notified about this status change
    if (notifiedOrderIds.has(statusChangeKey)) {
      return; // Skip duplicate notifications
    }

    // Add to the set of notified status changes
    notifiedOrderIds.add(statusChangeKey);

    // Show toast notification
    toast.info(event.message, {
      description: new Date(event.timestamp).toLocaleTimeString(),
    });

    // Play sound
    playSound(NotificationType.ORDER_STATUS_CHANGED);

    // Add to in-memory notifications
    const newNotification: Notification = {
      id: statusChangeKey,
      type: NotificationType.ORDER_STATUS_CHANGED,
      title: 'Order Status Updated',
      message: event.message,
      timestamp: new Date(event.timestamp),
      read: false,
      data: event
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, [notifiedOrderIds, playSound]);

  // Handle order item status change event
  const handleOrderItemStatusChange = useCallback((event: OrderItemEvent) => {
    // Create a unique key for this item status change event
    const itemStatusChangeKey = `${event.orderId}-${event.orderItemId}-${event.status}-${event.timestamp}`;

    // Check if we've already notified about this item status change
    if (notifiedOrderIds.has(itemStatusChangeKey)) {
      return; // Skip duplicate notifications
    }

    // Add to the set of notified item status changes
    notifiedOrderIds.add(itemStatusChangeKey);

    // Show toast notification
    toast.info(event.message, {
      description: new Date(event.timestamp).toLocaleTimeString(),
    });

    // Play sound
    playSound(NotificationType.ORDER_ITEM_STATUS_CHANGED);

    // Add to in-memory notifications
    const newNotification: Notification = {
      id: itemStatusChangeKey,
      type: NotificationType.ORDER_ITEM_STATUS_CHANGED,
      title: 'Order Item Updated',
      message: event.message,
      timestamp: new Date(event.timestamp),
      read: false,
      data: event
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, [notifiedOrderIds, playSound]);

  // Connect to WebSocket and join rooms when organization or venue changes
  useEffect(() => {
    if (!isAuthenticated) {
      // Disconnect WebSocket if not authenticated
      webSocketService.disconnect();
      return;
    }

    // Use both auth state token and window token for maximum compatibility
    const currentAccessToken = accessToken || (window as any).accessToken || null;

    // Connect to WebSocket with authentication token
    webSocketService.connect(currentAccessToken);

    // Update token if it changes
    if (currentAccessToken) {
      webSocketService.updateToken(currentAccessToken);
    }

    // Add event listeners
    webSocketService.addEventListener('newOrder', handleNewOrder);
    webSocketService.addEventListener('orderUpdated', handleOrderStatusChange);
    webSocketService.addEventListener('orderItemUpdated', handleOrderItemStatusChange);

    // Cleanup on unmount
    return () => {
      webSocketService.removeEventListener('newOrder', handleNewOrder);
      webSocketService.removeEventListener('orderUpdated', handleOrderStatusChange);
      webSocketService.removeEventListener('orderItemUpdated', handleOrderItemStatusChange);
    };
  }, [
    isAuthenticated,
    accessToken,
    handleNewOrder,
    handleOrderStatusChange,
    handleOrderItemStatusChange
  ]);

  // Track previous organization and venue IDs to prevent unnecessary room joins/leaves
  const [prevOrgId, setPrevOrgId] = useState<string | null>(null);
  const [prevVenueId, setPrevVenueId] = useState<string | null>(null);

  // Separate effect for joining rooms to avoid multiple connections
  useEffect(() => {
    if (!isAuthenticated) return;

    // Use both auth state token and window token for maximum compatibility
    const currentAccessToken = accessToken || (window as any).accessToken || null;

    // Keep track of joined rooms for cleanup
    const currentOrgId = currentOrganization?.id || null;
    const currentVenueId = currentVenue?.id || null;

    // Only join/leave rooms if the IDs have changed
    if (currentOrgId !== prevOrgId) {
      // Leave previous organization room if it exists
      if (prevOrgId) {
        webSocketService.leaveRoom('organization', prevOrgId);
      }

      // Join new organization room if it exists
      if (currentOrgId) {
        webSocketService.joinRoom('organization', currentOrgId, currentAccessToken);
      }

      // Update the state
      setPrevOrgId(currentOrgId);
    }

    // Only join/leave venue rooms if the IDs have changed
    if (currentVenueId !== prevVenueId) {
      // Leave previous venue room if it exists
      if (prevVenueId) {
        webSocketService.leaveRoom('venue', prevVenueId);
      }

      // Join new venue room if it exists
      if (currentVenueId) {
        webSocketService.joinRoom('venue', currentVenueId, currentAccessToken);
      }

      // Update the state
      setPrevVenueId(currentVenueId);
    }

    // Cleanup: leave rooms when component unmounts
    return () => {
      if (currentOrgId) {
        webSocketService.leaveRoom('organization', currentOrgId);
      }
      if (currentVenueId) {
        webSocketService.leaveRoom('venue', currentVenueId);
      }
    };
  }, [isAuthenticated, accessToken, currentOrganization?.id, currentVenue?.id]);

  // Effect to handle token updates when auth state changes
  useEffect(() => {
    if (!isAuthenticated) return;

    const currentAccessToken = accessToken || (window as any).accessToken || null;

    // Update WebSocket token if it has changed
    if (currentAccessToken && webSocketService.getCurrentToken() !== currentAccessToken) {
      webSocketService.updateToken(currentAccessToken);
    }
  }, [isAuthenticated, accessToken]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Reset notifications when not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // Save notification preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem(ENABLE_NOTIFICATIONS_KEY, enableNotifications.toString());
  }, [enableNotifications]);

  useEffect(() => {
    localStorage.setItem(ENABLE_SOUND_ALERTS_KEY, enableSoundAlerts.toString());
  }, [enableSoundAlerts]);

  // Save notified order IDs to localStorage when they change
  useEffect(() => {
    // Convert Set to Array for storage
    const idsArray = Array.from(notifiedOrderIds);
    localStorage.setItem(NOTIFIED_ORDER_IDS_KEY, JSON.stringify(idsArray));
  }, [notifiedOrderIds]);

  // Context value
  const value: NotificationContextType = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    enableNotifications,
    setEnableNotifications,
    enableSoundAlerts,
    setEnableSoundAlerts,
    playSound,
    refreshNotifications,
    loading,
    error,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

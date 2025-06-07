import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import { useVenue } from '@/contexts/venue-context';
import webSocketService, { OrderEvent, OrderItemEvent } from '@/services/websocket-service';
import { Order, OrderStatus } from '@/services/order-service';
import OrderService from '@/services/order-service';
import { toast } from 'sonner';

// Real-time order management hook
export const useRealTimeOrders = (initialOrders: Order[] = []) => {
  const { state: { user, accessToken } } = useAuth();
  const { currentOrganization } = useOrganization();
  const { currentVenue } = useVenue();
  
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Track if we've set up listeners to prevent duplicates
  const listenersSetup = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initialFetchDone = useRef(false);

  // Initialize audio for notifications
  useEffect(() => {
    // Create audio element for order notifications
    audioRef.current = new Audio('/sounds/notification.mp3');
    audioRef.current.volume = 0.5;
    
    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.log('Could not play notification sound:', error);
      });
    }
  }, []);

  // Handle new order events
  const handleNewOrder = useCallback((event: OrderEvent) => {
    // Add the new order to the list (you might want to fetch full order details)
    setOrders(prevOrders => {
      // Check if order already exists
      const existingOrder = prevOrders.find(order => order.id === event.orderId);
      if (existingOrder) {
        return prevOrders;
      }

      // For now, create a minimal order object
      // In a real implementation, you might want to fetch the full order details
      const newOrder: Order = {
        id: event.orderId,
        status: event.status,
        tableId: event.tableId || null,
        customerName: event.tableId ? `Table ${event.tableId}` : 'Online Order',
        totalAmount: '0',
        items: [],
        createdAt: event.timestamp.toString(),
        updatedAt: event.timestamp.toString(),
      };

      return [newOrder, ...prevOrders];
    });

    // Show notification
    toast.success(`New order received: ${event.message}`, {
      duration: 5000,
    });

    // Play notification sound
    playNotificationSound();

    setLastUpdate(new Date());
  }, [playNotificationSound]);

  // Handle order update events
  const handleOrderUpdate = useCallback((event: OrderEvent) => {
    setOrders(prevOrders => {
      return prevOrders.map(order => {
        if (order.id === event.orderId) {
          return {
            ...order,
            status: event.status,
            updatedAt: event.timestamp.toString(),
          };
        }
        return order;
      });
    });

    // Show notification for status changes
    toast.info(event.message, {
      duration: 3000,
    });

    setLastUpdate(new Date());
  }, []);

  // Handle order item update events
  const handleOrderItemUpdate = useCallback((event: OrderItemEvent) => {
    // Update the specific order item status
    setOrders(prevOrders => {
      return prevOrders.map(order => {
        if (order.id === event.orderId) {
          const updatedItems = order.items.map(item => {
            if (item.id === event.orderItemId) {
              return {
                ...item,
                status: event.status,
                updatedAt: event.timestamp.toString(),
              };
            }
            return item;
          });

          return {
            ...order,
            items: updatedItems,
            updatedAt: event.timestamp.toString(),
          };
        }
        return order;
      });
    });

    setLastUpdate(new Date());
  }, []);

  // Setup WebSocket connection and listeners
  useEffect(() => {
    // Check for token in multiple places
    const token = accessToken || (typeof window !== 'undefined' ? window.accessToken : null);

    if (!user || !token || !currentOrganization || listenersSetup.current) {
      return;
    }

    // Connect to WebSocket
    webSocketService.connect(token);

    // Join organization room for real-time updates
    webSocketService.joinRoom('organization', currentOrganization.id, token);

    // Join venue room if we have a current venue
    if (currentVenue) {
      webSocketService.joinRoom('venue', currentVenue.id, token);
    }

    // Set up event listeners
    webSocketService.on('newOrder', handleNewOrder);
    webSocketService.on('orderUpdated', handleOrderUpdate);
    webSocketService.on('orderItemUpdated', handleOrderItemUpdate);

    // Track connection status
    const checkConnection = () => {
      const connected = webSocketService.isConnected();
      setIsConnected(connected);
    };

    const connectionInterval = setInterval(checkConnection, 1000);
    checkConnection(); // Initial check

    listenersSetup.current = true;

    return () => {
      clearInterval(connectionInterval);
      webSocketService.off('newOrder', handleNewOrder);
      webSocketService.off('orderUpdated', handleOrderUpdate);
      webSocketService.off('orderItemUpdated', handleOrderItemUpdate);
      listenersSetup.current = false;
    };
  }, [user, accessToken, currentOrganization, currentVenue, handleNewOrder, handleOrderUpdate, handleOrderItemUpdate, isConnected]);

  // Fetch initial orders when organization/venue changes
  useEffect(() => {
    const fetchInitialOrders = async () => {
      if (!currentOrganization || !user || initialFetchDone.current) {
        return;
      }

      try {
        setIsLoading(true);
        let ordersResponse;

        if (currentVenue) {
          // Fetch orders for specific venue
          ordersResponse = await OrderService.getAllForVenue(currentVenue.id);
        } else {
          // Fetch orders for organization
          ordersResponse = await OrderService.getAllForOrganization(currentOrganization.id);
        }

        // Handle both paginated and array responses
        const ordersData = Array.isArray(ordersResponse) ? ordersResponse : ordersResponse.data;

        setOrders(ordersData);
        initialFetchDone.current = true;
        setLastUpdate(new Date());
      } catch (error) {
        toast.error('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialOrders();
  }, [currentOrganization, currentVenue, user]);

  // Update orders when initial orders change
  useEffect(() => {
    if (initialOrders.length > 0) {
      setOrders(initialOrders);
      initialFetchDone.current = true;
    }
  }, [initialOrders]);

  // Function to manually update order status
  const updateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    try {
      // Optimistically update the UI
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          if (order.id === orderId) {
            return {
              ...order,
              status: newStatus,
              updatedAt: new Date().toISOString(),
            };
          }
          return order;
        });
      });

      // Make the actual API call
      await OrderService.updateStatus(orderId, newStatus);
      console.log(`Successfully updated order ${orderId} to status ${newStatus}`);

    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');

      // Revert optimistic update on error
      setOrders(prevOrders => {
        return prevOrders.map(order => {
          if (order.id === orderId) {
            // You might want to fetch the current status from server here
            return order;
          }
          return order;
        });
      });
    }
  }, []);

  // Function to get orders by status
  const getOrdersByStatus = useCallback((status: OrderStatus) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  // Function to get order statistics
  const getOrderStats = useCallback(() => {
    const stats = {
      total: orders.length,
      pending: orders.filter(order => order.status === OrderStatus.PENDING).length,
      confirmed: orders.filter(order => order.status === OrderStatus.CONFIRMED).length,
      preparing: orders.filter(order => order.status === OrderStatus.PREPARING).length,
      ready: orders.filter(order => order.status === OrderStatus.READY).length,
      completed: orders.filter(order => order.status === OrderStatus.COMPLETED).length,
      cancelled: orders.filter(order => order.status === OrderStatus.CANCELLED).length,
    };

    return stats;
  }, [orders]);

  return {
    orders,
    isConnected,
    lastUpdate,
    isLoading,
    updateOrderStatus,
    getOrdersByStatus,
    getOrderStats,
    // Utility functions
    pendingOrders: getOrdersByStatus(OrderStatus.PENDING),
    preparingOrders: getOrdersByStatus(OrderStatus.PREPARING),
    readyOrders: getOrdersByStatus(OrderStatus.READY),
    completedOrders: getOrdersByStatus(OrderStatus.COMPLETED),
    stats: getOrderStats(),
  };
};

// Hook specifically for kitchen staff
export const useKitchenOrders = (initialOrders: Order[] = []) => {
  const realTimeOrders = useRealTimeOrders(initialOrders);

  // Kitchen-specific order filtering and actions
  // Kitchen staff should see: CONFIRMED, PREPARING, READY orders (NOT PENDING)
  const kitchenOrders = realTimeOrders.orders.filter(order =>
    [OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY].includes(order.status)
  );

  // Kitchen-specific stats (excluding pending orders)
  const kitchenStats = {
    ...realTimeOrders.stats,
    total: kitchenOrders.length,
    pending: 0, // Kitchen staff don't see pending orders
  };

  const startPreparing = useCallback((orderId: string) => {
    return realTimeOrders.updateOrderStatus(orderId, OrderStatus.PREPARING);
  }, [realTimeOrders.updateOrderStatus]);

  const markReady = useCallback((orderId: string) => {
    return realTimeOrders.updateOrderStatus(orderId, OrderStatus.READY);
  }, [realTimeOrders.updateOrderStatus]);

  return {
    ...realTimeOrders,
    orders: kitchenOrders,
    stats: kitchenStats,
    startPreparing,
    markReady,
    // Kitchen-specific order lists (no pending orders)
    confirmedOrders: kitchenOrders.filter(order => order.status === OrderStatus.CONFIRMED),
    preparingOrders: kitchenOrders.filter(order => order.status === OrderStatus.PREPARING),
    readyOrders: kitchenOrders.filter(order => order.status === OrderStatus.READY),
  };
};

// Hook specifically for front of house staff
export const useFrontOfHouseOrders = (initialOrders: Order[] = []) => {
  const realTimeOrders = useRealTimeOrders(initialOrders);
  
  // Front of house specific order filtering and actions
  const serviceOrders = realTimeOrders.orders.filter(order =>
    [OrderStatus.READY, OrderStatus.COMPLETED].includes(order.status) || order.status === OrderStatus.PREPARING
  );

  const markServed = useCallback((orderId: string) => {
    return realTimeOrders.updateOrderStatus(orderId, OrderStatus.COMPLETED);
  }, [realTimeOrders.updateOrderStatus]);
  
  return {
    ...realTimeOrders,
    orders: serviceOrders,
    markServed,
  };
};

export default useRealTimeOrders;

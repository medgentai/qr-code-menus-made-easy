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
        // Silently fail if sound cannot be played
      });
    }
  }, []);

  // Handle new order events with full order fetching
  const handleNewOrder = useCallback(async (event: OrderEvent) => {
    // If we're viewing a specific venue, only show orders for that venue
    if (currentVenue && event.venueId && event.venueId !== currentVenue.id) {
      return;
    }

    // Show immediate notification
    toast.success(`🔔 New order #${event.orderId.substring(0, 8)} received!`, {
      duration: 5000,
      description: event.message || 'A new order has been placed',
    });

    // Play notification sound
    playNotificationSound();

    // Fetch the full order details and add to the list
    try {
      const fullOrder = await OrderService.getById(event.orderId);

      setOrders(prevOrders => {
        // Check if order already exists to prevent duplicates
        const existingOrder = prevOrders.find(order => order.id === event.orderId);
        if (existingOrder) {
          // Update existing order with full details
          return prevOrders.map(order =>
            order.id === event.orderId ? fullOrder : order
          );
        }

        // Add new order to the beginning of the list
        return [fullOrder, ...prevOrders];
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch full order details:', error);

      // Fallback: create minimal order object if fetch fails
      setOrders(prevOrders => {
        const existingOrder = prevOrders.find(order => order.id === event.orderId);
        if (existingOrder) {
          return prevOrders;
        }

        const minimalOrder: Order = {
          id: event.orderId,
          status: event.status,
          tableId: event.tableId || null,
          customerName: event.tableId ? `Table ${event.tableId}` : 'Online Order',
          totalAmount: '0',
          items: [],
          createdAt: event.timestamp.toString(),
          updatedAt: event.timestamp.toString(),
        };

        return [minimalOrder, ...prevOrders];
      });

      toast.error('Failed to load full order details, showing basic info');
      setLastUpdate(new Date());
    }
  }, [playNotificationSound]);

  // Handle order update events
  const handleOrderUpdate = useCallback(async (event: OrderEvent) => {
    // If we're viewing a specific venue, only show orders for that venue
    if (currentVenue && event.venueId && event.venueId !== currentVenue.id) {
      return;
    }

    // Check if this is a payment status update
    const isPaymentUpdate = event.message.includes('marked as PAID') || event.message.includes('marked as UNPAID');

    if (isPaymentUpdate) {
      // For payment updates, fetch the full order to get updated payment details
      try {
        const fullOrder = await OrderService.getById(event.orderId);
        setOrders(prevOrders => {
          return prevOrders.map(order => {
            if (order.id === event.orderId) {
              return fullOrder;
            }
            return order;
          });
        });

        // Show payment status notification
        const isPaid = event.message.includes('marked as PAID');
        toast.info(`💳 Order #${event.orderId.substring(0, 8)} ${isPaid ? 'payment received' : 'marked as unpaid'}`, {
          duration: 3000,
        });
      } catch (error) {
        console.error('Failed to fetch updated order for payment status:', error);
        // Fallback to basic update
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
      }
    } else {
      // Regular status update
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
    }

    setLastUpdate(new Date());
  }, []);

  // Handle order item update events
  const handleOrderItemUpdate = useCallback((event: OrderItemEvent) => {
    // Note: OrderItemEvent doesn't have venueId, so we need to check if the order exists in our current orders
    // This provides implicit venue filtering since we only have orders for the current venue
    const orderExists = orders.some(order => order.id === event.orderId);
    if (!orderExists) {
      return; // Don't process updates for orders not in our current list
    }

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
  }, [orders]);

  // Setup WebSocket connection and listeners
  useEffect(() => {
    // Check for token in multiple places
    const token = accessToken || (typeof window !== 'undefined' ? window.accessToken : null);

    if (!user || !token || !currentOrganization || listenersSetup.current) {
      return;
    }

    // Connect to WebSocket (will reuse existing connection if available)
    webSocketService.connect(token);

    // Join rooms based on current context
    if (currentVenue) {
      // If we're viewing a specific venue, only join that venue's room
      webSocketService.joinRoom('venue', currentVenue.id, token);
    } else {
      // Only join organization room if we're viewing all venues
      // This will receive events from all venues in the organization
      webSocketService.joinRoom('organization', currentOrganization.id, token);
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
      webSocketService.disconnect(); // This will use reference counting
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

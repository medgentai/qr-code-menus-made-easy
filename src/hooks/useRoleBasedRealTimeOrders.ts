import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import { useVenue } from '@/contexts/venue-context';
import { usePermissions } from '@/contexts/permission-context';
import webSocketService, { OrderEvent, OrderItemEvent } from '@/services/websocket-service';
import { Order, OrderStatus, FilterOrdersDto } from '@/services/order-service';
import OrderService from '@/services/order-service';
import { toast } from 'sonner';

interface UseRoleBasedRealTimeOrdersOptions {
  status?: OrderStatus;
  venueId?: string;
  initialFilters?: FilterOrdersDto;
}

interface RoleBasedRealTimeOrdersReturn {
  orders: Order[];
  isLoading: boolean;
  isConnected: boolean;
  lastUpdate: Date | null;
  canCreateOrder: boolean;
  canEditOrder: (status: OrderStatus) => boolean;
  canDeleteOrder: (status: OrderStatus) => boolean;
  canCancelOrder: (status: OrderStatus) => boolean;
  canUpdateOrderStatus: (status: OrderStatus) => boolean;
  availableStatusFilters: OrderStatus[];
  getAvailableStatusTransitions: (order: Order) => OrderStatus[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrderPaymentStatus: (updatedOrder: Order) => void;
  refetch: () => Promise<void>;
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    preparing: number;
    ready: number;
    completed: number;
    cancelled: number;
  };
  newOrderIds: Set<string>;
  clearNewOrderIndicator: (orderId: string) => void;
}

export const useRoleBasedRealTimeOrders = (
  options: UseRoleBasedRealTimeOrdersOptions = {}
): RoleBasedRealTimeOrdersReturn => {
  const { state: { user, accessToken } } = useAuth();
  const { currentOrganization } = useOrganization();
  const { currentVenue } = useVenue();
  const { userRole, userStaffType, userVenueIds } = usePermissions();
  const queryClient = useQueryClient();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());

  // Audio ref for notification sounds
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound with programmatic beep
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Create a simple beep sound using Web Audio API
      const createBeepSound = () => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.value = 800; // 800 Hz frequency
          oscillator.type = 'sine';

          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);

          return { audioContext, oscillator, gainNode };
        } catch (error) {
          return null;
        }
      };

      audioRef.current = { createBeepSound } as any;
    }
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (audioRef.current && (audioRef.current as any).createBeepSound) {
      try {
        (audioRef.current as any).createBeepSound();
      } catch (error) {
        // Silently fail if sound cannot be played
      }
    }
  }, []);

  // Role-based permissions
  const canCreateOrder = useMemo(() => {
    return ['OWNER', 'ADMIN', 'MANAGER', 'STAFF'].includes(userRole || '');
  }, [userRole]);

  const canEditOrder = useCallback((status: OrderStatus) => {
    if (['OWNER', 'ADMIN', 'MANAGER'].includes(userRole || '')) return true;
    if (userRole === 'STAFF') {
      return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(status);
    }
    return false;
  }, [userRole]);

  const canDeleteOrder = useCallback((status: OrderStatus) => {
    // Only managers and above can permanently delete orders
    if (['OWNER', 'ADMIN', 'MANAGER'].includes(userRole || '')) return true;

    // Front of House staff should NOT be able to delete orders - they should cancel instead
    if (userRole === 'STAFF' && userStaffType === 'FRONT_OF_HOUSE') {
      return false; // Never allow delete for Front of House
    }

    // Other staff can only delete PENDING orders
    if (userRole === 'STAFF') {
      return status === OrderStatus.PENDING;
    }

    return false;
  }, [userRole, userStaffType]);

  const canCancelOrder = useCallback((status: OrderStatus) => {
    // Can't cancel if already cancelled or completed
    if ([OrderStatus.CANCELLED, OrderStatus.COMPLETED].includes(status)) {
      return false;
    }

    // Front of House staff can always cancel orders (for emergencies)
    if (userRole === 'STAFF' && userStaffType === 'FRONT_OF_HOUSE') {
      return true;
    }

    // Managers and above can cancel any order
    if (['OWNER', 'ADMIN', 'MANAGER'].includes(userRole || '')) return true;

    // Other staff can cancel PENDING and CONFIRMED orders
    if (userRole === 'STAFF') {
      return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(status);
    }

    return false;
  }, [userRole, userStaffType]);

  const canUpdateOrderStatus = useCallback((status: OrderStatus) => {
    // Can't update status if order is completed or cancelled
    if ([OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(status)) {
      return false;
    }
    return ['OWNER', 'ADMIN', 'MANAGER', 'STAFF'].includes(userRole || '');
  }, [userRole]);

  // Get available status transitions for a specific order
  const getAvailableStatusTransitions = useCallback((order: Order) => {
    const currentStatus = order.status;
    const isPaid = order.paymentStatus === 'PAID';

    const statusFlow: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
      [OrderStatus.READY]: [OrderStatus.SERVED, OrderStatus.CANCELLED],
      [OrderStatus.SERVED]: isPaid ? [OrderStatus.COMPLETED] : [], // Can only complete if paid
      [OrderStatus.COMPLETED]: [], // No transitions from completed
      [OrderStatus.CANCELLED]: [] // No transitions from cancelled
    };

    const availableTransitions = statusFlow[currentStatus] || [];

    // Filter based on user role
    if (userRole === 'STAFF') {
      // Staff can't cancel orders, only managers and admins can
      return availableTransitions.filter(status => status !== OrderStatus.CANCELLED);
    }

    return availableTransitions;
  }, [userRole]);

  // Available status filters based on role (for filtering, not transitions)
  const availableStatusFilters = useMemo(() => {
    const allStatuses: OrderStatus[] = [
      OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.SERVED, OrderStatus.COMPLETED, OrderStatus.CANCELLED
    ];

    if (['ADMIN', 'MANAGER'].includes(userRole || '')) {
      return allStatuses;
    }

    if (userRole === 'STAFF') {
      return [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.SERVED, OrderStatus.COMPLETED];
    }

    return allStatuses;
  }, [userRole]);

  // Filter orders based on user permissions
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by venue access for staff
    if (userRole === 'STAFF' && userVenueIds && userVenueIds.length > 0) {
      filtered = filtered.filter(order => 
        order.venueId && userVenueIds.includes(order.venueId)
      );
    }

    // Apply status filter if provided
    if (options.status) {
      filtered = filtered.filter(order => order.status === options.status);
    }

    // Apply venue filter if provided
    if (options.venueId) {
      filtered = filtered.filter(order => order.venueId === options.venueId);
    }

    return filtered;
  }, [orders, userRole, userVenueIds, options.status, options.venueId]);

  // Handle new order events
  const handleNewOrder = useCallback(async (event: OrderEvent) => {
    // Check if user has access to this order's venue
    if (userRole === 'STAFF' && userVenueIds && userVenueIds.length > 0) {
      if (event.venueId && !userVenueIds.includes(event.venueId)) {
        return;
      }
    }

    // If we're viewing a specific venue, only show orders for that venue
    if (currentVenue && event.venueId && event.venueId !== currentVenue.id) {
      return;
    }

    // If we're filtering by venue in options, only show orders for that venue
    if (options.venueId && event.venueId && event.venueId !== options.venueId) {
      return;
    }

    // Mark order as new for visual indication
    setNewOrderIds(prev => new Set(prev).add(event.orderId));

    // Remove new indicator after 30 seconds
    setTimeout(() => {
      setNewOrderIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(event.orderId);
        return newSet;
      });
    }, 30000);

    // Show enhanced notification with action buttons
    toast.success(`🔔 New order #${event.orderId.substring(0, 8)} received!`, {
      duration: 8000,
      description: event.message || 'A new order has been placed',
      action: {
        label: 'View Order',
        onClick: () => {
          // Navigate to order details - this would need to be passed as a prop or context
        },
      },
    });

    // Play notification sound
    playNotificationSound();

    // Fetch full order details
    try {
      const fullOrder = await OrderService.getById(event.orderId);
      
      setOrders(prevOrders => {
        const existingOrder = prevOrders.find(order => order.id === event.orderId);
        if (existingOrder) {
          return prevOrders.map(order => 
            order.id === event.orderId ? fullOrder : order
          );
        }
        return [fullOrder, ...prevOrders];
      });

      // Update React Query cache
      queryClient.setQueriesData(
        { predicate: (query) => query.queryKey[0] === 'orders' },
        (oldData: any) => {
          if (!oldData) return oldData;
          
          if (Array.isArray(oldData)) {
            const exists = oldData.some((order: Order) => order.id === event.orderId);
            return exists ? oldData : [fullOrder, ...oldData];
          }
          
          if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any, index: number) => {
                if (index === 0 && page.data) {
                  const exists = page.data.some((order: Order) => order.id === event.orderId);
                  return exists ? page : {
                    ...page,
                    data: [fullOrder, ...page.data]
                  };
                }
                return page;
              })
            };
          }
          
          return oldData;
        }
      );

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch full order details:', error);
      toast.error('Failed to load new order details');
    }
  }, [userRole, userVenueIds, queryClient]);

  // Handle order update events
  const handleOrderUpdate = useCallback(async (event: OrderEvent) => {
    // Check venue filtering first
    if (currentVenue && event.venueId && event.venueId !== currentVenue.id) {
      return;
    }

    // If we're filtering by venue in options, only show orders for that venue
    if (options.venueId && event.venueId && event.venueId !== options.venueId) {
      return;
    }

    // Check if user has access to this order's venue (for staff)
    if (userRole === 'STAFF' && userVenueIds && userVenueIds.length > 0) {
      if (event.venueId && !userVenueIds.includes(event.venueId)) {
        return;
      }
    }

    // Check if this is a payment status update by looking at the message
    const isPaymentUpdate = event.message.includes('marked as PAID') || event.message.includes('marked as UNPAID');

    if (isPaymentUpdate) {
      // For payment updates, fetch the full order to get updated payment details
      try {
        const fullOrder = await OrderService.getById(event.orderId);
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === event.orderId ? fullOrder : order
          )
        );

        // Show payment status notification
        const isPaid = event.message.includes('marked as PAID');
        toast.info(`💳 Order #${event.orderId.substring(0, 8)} ${isPaid ? 'payment received' : 'marked as unpaid'}`, {
          duration: 3000,
          description: `Payment status updated at ${new Date().toLocaleTimeString()}`,
        });
      } catch (error) {
        console.error('Failed to fetch updated order for payment status:', error);
        // Fallback to basic update
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === event.orderId
              ? { ...order, status: event.status, updatedAt: new Date().toISOString() }
              : order
          )
        );
      }
    } else {
      // Regular status update
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === event.orderId
            ? { ...order, status: event.status, updatedAt: new Date().toISOString() }
            : order
        )
      );
    }

    // Update React Query cache
    queryClient.setQueriesData(
      { predicate: (query) => query.queryKey[0] === 'orders' },
      (oldData: any) => {
        if (!oldData) return oldData;
        
        const updateOrder = (orders: Order[]) => 
          orders.map(order => 
            order.id === event.orderId 
              ? { ...order, status: event.status, updatedAt: new Date().toISOString() }
              : order
          );
        
        if (Array.isArray(oldData)) {
          return updateOrder(oldData);
        }
        
        if (oldData.pages) {
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data ? updateOrder(page.data) : page.data
            }))
          };
        }
        
        return oldData;
      }
    );

    setLastUpdate(new Date());

    // Show notification for important status changes with enhanced styling
    if ([OrderStatus.READY, OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(event.status)) {
      const statusEmoji = {
        [OrderStatus.READY]: '✅',
        [OrderStatus.COMPLETED]: '🎉',
        [OrderStatus.CANCELLED]: '❌'
      }[event.status] || '📋';

      toast.info(`${statusEmoji} Order #${event.orderId.substring(0, 8)} is now ${event.status.toLowerCase()}`, {
        duration: 4000,
        description: `Status updated at ${new Date().toLocaleTimeString()}`,
      });

      // Play a different sound for ready orders
      if (event.status === OrderStatus.READY) {
        playNotificationSound();
      }
    }
  }, [queryClient]);

  // Handle order item update events
  const handleOrderItemUpdate = useCallback((event: OrderItemEvent) => {
    // Note: OrderItemEvent doesn't have venueId, so we need to check if the order exists in our current orders
    // This provides implicit venue filtering since we only have orders for the current venue/filter
    const orderExists = orders.some(order => order.id === event.orderId);
    if (!orderExists) {
      return; // Don't process updates for orders not in our current list
    }

    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id === event.orderId) {
          return {
            ...order,
            items: order.items.map(item =>
              item.id === event.orderItemId
                ? { ...item, status: event.status, updatedAt: new Date().toISOString() }
                : item
            ),
            updatedAt: new Date().toISOString()
          };
        }
        return order;
      })
    );

    setLastUpdate(new Date());
  }, [orders]);

  // Setup WebSocket connection
  useEffect(() => {
    const token = accessToken || (typeof window !== 'undefined' ? window.accessToken : null);

    if (!user || !token || !currentOrganization) {
      return;
    }

    webSocketService.connect(token);

    // Join rooms based on current context
    if (currentVenue) {
      // If we're viewing a specific venue, only join that venue's room
      webSocketService.joinRoom('venue', currentVenue.id, token);
    } else if (options.venueId) {
      // If we're filtering by a specific venue, only join that venue's room
      webSocketService.joinRoom('venue', options.venueId, token);
    } else {
      // Only join organization room if we're viewing all venues
      // This will receive events from all venues in the organization
      webSocketService.joinRoom('organization', currentOrganization.id, token);
    }

    webSocketService.on('newOrder', handleNewOrder);
    webSocketService.on('orderUpdated', handleOrderUpdate);
    webSocketService.on('orderItemUpdated', handleOrderItemUpdate);

    const checkConnection = () => {
      setIsConnected(webSocketService.isConnected());
    };

    const connectionInterval = setInterval(checkConnection, 1000);
    checkConnection();

    return () => {
      clearInterval(connectionInterval);
      webSocketService.off('newOrder', handleNewOrder);
      webSocketService.off('orderUpdated', handleOrderUpdate);
      webSocketService.off('orderItemUpdated', handleOrderItemUpdate);
      webSocketService.disconnect();
    };
  }, [user, accessToken, currentOrganization, currentVenue, options.venueId, handleNewOrder, handleOrderUpdate, handleOrderItemUpdate]);

  // Fetch initial orders
  const fetchOrders = useCallback(async () => {
    if (!currentOrganization || !user) return;

    setIsLoading(true);
    try {
      let ordersResponse: any;
      
      if (currentVenue) {
        ordersResponse = await OrderService.getAllForVenue(currentVenue.id);
      } else {
        ordersResponse = await OrderService.getAllForOrganization(currentOrganization.id);
      }

      const ordersData = Array.isArray(ordersResponse) ? ordersResponse : ordersResponse.data;
      setOrders(ordersData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization, currentVenue, user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Update order status function
  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    try {
      await OrderService.updateStatus(orderId, status);

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status, updatedAt: new Date().toISOString() }
            : order
        )
      );

      toast.success(`Order status updated to ${status.toLowerCase()}`);
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
      throw error;
    }
  }, []);

  // Update order payment status function
  const updateOrderPaymentStatus = useCallback((updatedOrder: Order) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === updatedOrder.id ? updatedOrder : order
      )
    );
    setLastUpdate(new Date());
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const filtered = filteredOrders;
    return {
      total: filtered.length,
      pending: filtered.filter(order => order.status === OrderStatus.PENDING).length,
      confirmed: filtered.filter(order => order.status === OrderStatus.CONFIRMED).length,
      preparing: filtered.filter(order => order.status === OrderStatus.PREPARING).length,
      ready: filtered.filter(order => order.status === OrderStatus.READY).length,
      completed: filtered.filter(order => order.status === OrderStatus.COMPLETED).length,
      cancelled: filtered.filter(order => order.status === OrderStatus.CANCELLED).length,
    };
  }, [filteredOrders]);

  return {
    orders: filteredOrders,
    isLoading,
    isConnected,
    lastUpdate,
    canCreateOrder,
    canEditOrder,
    canDeleteOrder,
    canCancelOrder,
    canUpdateOrderStatus,
    availableStatusFilters,
    getAvailableStatusTransitions, // Add this new function
    updateOrderStatus,
    updateOrderPaymentStatus, // Add payment status update function
    refetch: fetchOrders,
    stats,
    newOrderIds, // Expose new order IDs for visual indicators
    clearNewOrderIndicator: (orderId: string) => {
      setNewOrderIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    },
  };
};

export default useRoleBasedRealTimeOrders;

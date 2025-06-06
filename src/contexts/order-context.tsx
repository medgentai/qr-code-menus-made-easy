import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useOrganization } from './organization-context';
import { useVenue } from './venue-context';
import OrderService, {
  Order,
  OrderItem,
  OrderStatus,
  OrderItemStatus,
  CreateOrderDto,
  UpdateOrderDto,
  UpdateOrderItemDto,
  FilterOrdersDto
} from '@/services/order-service';

// Pagination info interface
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Order context interface
export interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  fetchOrders: (filters?: FilterOrdersDto) => Promise<Order[]>;
  fetchOrdersForVenue: (venueId: string) => Promise<Order[]>;
  fetchOrdersForOrganization: (organizationId: string) => Promise<Order[]>;
  fetchOrderById: (id: string) => Promise<Order | null>;
  createOrder: (data: CreateOrderDto) => Promise<Order | null>;
  updateOrder: (id: string, data: UpdateOrderDto) => Promise<Order | null>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<Order | null>;
  updateOrderItem: (orderId: string, itemId: string, data: UpdateOrderItemDto) => Promise<OrderItem | null>;
  deleteOrder: (id: string) => Promise<boolean>;
  selectOrder: (order: Order) => void;

  // Pagination related properties
  infiniteOrders?: Order[];
  fetchNextPage?: () => Promise<boolean>;
  fetchPreviousPage?: () => Promise<boolean>;
  paginationInfo?: PaginationInfo;
  isLoadingNextPage?: boolean;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

// Create the order context
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Order provider props
interface OrderProviderProps {
  children: React.ReactNode;
}

// Order provider component
export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const { currentOrganization } = useOrganization();
  const { currentVenue } = useVenue();
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders with optional filters
  const fetchOrders = useCallback(async (filters?: FilterOrdersDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const paginatedResponse = await OrderService.getAll(filters);
      setOrders(paginatedResponse.data);
      return paginatedResponse.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch orders';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch orders for a venue
  const fetchOrdersForVenue = useCallback(async (venueId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await OrderService.getAllForVenue(venueId);

      // Handle both array and paginated response formats
      if (Array.isArray(response)) {
        setOrders(response);
        return response;
      } else {
        setOrders(response.data);
        return response.data;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch orders for venue';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch orders for an organization
  const fetchOrdersForOrganization = useCallback(async (organizationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await OrderService.getAllForOrganization(organizationId);

      // Handle both array and paginated response formats
      if (Array.isArray(response)) {
        setOrders(response);
        return response;
      } else {
        setOrders(response.data);
        return response.data;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch orders for organization';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch order by ID
  const fetchOrderById = useCallback(async (id: string): Promise<Order | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await OrderService.getById(id);
      setCurrentOrder(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch order';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new order
  const createOrder = useCallback(async (data: CreateOrderDto): Promise<Order | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const newOrder = await OrderService.create(data);
      setOrders(prev => [newOrder, ...prev]);
      toast.success('Order created successfully');
      return newOrder;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create order';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update an order
  const updateOrder = useCallback(async (id: string, data: UpdateOrderDto): Promise<Order | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedOrder = await OrderService.update(id, data);
      setOrders(prev => prev.map(order => order.id === id ? updatedOrder : order));
      if (currentOrder?.id === id) {
        setCurrentOrder(updatedOrder);
      }
      toast.success('Order updated successfully');
      return updatedOrder;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update order';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentOrder]);

  // Update order status
  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus): Promise<Order | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedOrder = await OrderService.updateStatus(id, status);
      setOrders(prev => prev.map(order => order.id === id ? updatedOrder : order));
      if (currentOrder?.id === id) {
        setCurrentOrder(updatedOrder);
      }
      toast.success(`Order status updated to ${status}`);
      return updatedOrder;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update order status';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentOrder]);

  // Update an order item
  const updateOrderItem = useCallback(async (
    orderId: string,
    itemId: string,
    data: UpdateOrderItemDto
  ): Promise<OrderItem | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedItem = await OrderService.updateOrderItem(orderId, itemId, data);

      // Refresh the order to get updated totals and items
      if (currentOrder?.id === orderId) {
        const refreshedOrder = await OrderService.getById(orderId);
        setCurrentOrder(refreshedOrder);
      }

      toast.success('Order item updated successfully');
      return updatedItem;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update order item';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentOrder]);

  // Delete an order
  const deleteOrder = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await OrderService.delete(id);
      setOrders(prev => prev.filter(order => order.id !== id));
      if (currentOrder?.id === id) {
        setCurrentOrder(null);
      }
      toast.success('Order deleted successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete order';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentOrder]);

  // Select an order
  const selectOrder = useCallback((order: Order) => {
    setCurrentOrder(order);
  }, []);

  // Load orders when organization or venue changes
  useEffect(() => {
    if (currentVenue) {
      fetchOrdersForVenue(currentVenue.id);
    } else if (currentOrganization) {
      fetchOrdersForOrganization(currentOrganization.id);
    }
  }, [currentOrganization, currentVenue, fetchOrdersForOrganization, fetchOrdersForVenue]);

  // Context value
  const value: OrderContextType = {
    orders,
    currentOrder,
    isLoading,
    error,
    fetchOrders,
    fetchOrdersForVenue,
    fetchOrdersForOrganization,
    fetchOrderById,
    createOrder,
    updateOrder,
    updateOrderStatus,
    updateOrderItem,
    deleteOrder,
    selectOrder,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

// Hook to use the order context
export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

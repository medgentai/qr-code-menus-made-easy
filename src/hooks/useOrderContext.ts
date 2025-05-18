import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { useOrganization } from '@/contexts/organization-context';
import { useVenue } from '@/contexts/venue-context';
import {
  useVenueOrdersQuery,
  useOrganizationOrdersQuery,
  useOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useUpdateOrderStatusMutation,
  useUpdateOrderItemMutation,
  useDeleteOrderMutation,
  useInfiniteVenueOrdersQuery,
  useInfiniteOrganizationOrdersQuery,
  orderKeys
} from './useOrderQuery';
import {
  Order,
  OrderItem,
  OrderStatus,
  CreateOrderDto,
  UpdateOrderDto,
  UpdateOrderItemDto,
  FilterOrdersDto,
  PaginatedOrdersResponse
} from '@/services/order-service';
import OrderService from '@/services/order-service';

// Import the OrderContextType interface to ensure type compatibility
import type { OrderContextType } from '@/contexts/order-context';

/**
 * Custom hook that provides order functionality using React Query
 * This is a direct replacement for the useOrder context hook
 */
export const useOrderContext = (): OrderContextType => {
  const { currentOrganization } = useOrganization();
  const { currentVenue } = useVenue();
  const queryClient = useQueryClient();

  // State for the current order
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  // Get the appropriate query based on the current context
  const venueOrdersQuery = useVenueOrdersQuery(currentVenue?.id || '');
  const organizationOrdersQuery = useOrganizationOrdersQuery(currentOrganization?.id || '');
  const currentOrderQuery = useOrderQuery(currentOrderId || '');

  // Get infinite queries for pagination
  const infiniteVenueOrdersQuery = useInfiniteVenueOrdersQuery(currentVenue?.id || '');
  const infiniteOrganizationOrdersQuery = useInfiniteOrganizationOrdersQuery(currentOrganization?.id || '');

  // Determine which query to use and handle type conversion
  const ordersQuery = currentVenue
    ? venueOrdersQuery
    : currentOrganization
      ? organizationOrdersQuery
      : { data: [] as Order[], isLoading: false, error: null };

  // Extract orders from query data (handles both array and paginated response)
  const getOrdersFromQueryData = (data: any): Order[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data && 'data' in data) return data.data || [];
    return [];
  };

  // Determine which infinite query to use
  const infiniteOrdersQuery = currentVenue && currentVenue.id
    ? infiniteVenueOrdersQuery
    : currentOrganization && currentOrganization.id
      ? infiniteOrganizationOrdersQuery
      : {
          data: { pages: [], pageParams: [] },
          isLoading: false,
          error: null,
          hasNextPage: false,
          hasPreviousPage: false,
          fetchNextPage: async () => ({ success: false }),
          fetchPreviousPage: async () => ({ success: false }),
          isFetchingNextPage: false,
          refetch: async () => ({ data: { pages: [], pageParams: [] } })
        };

  // Mutations
  const createOrderMutation = useCreateOrderMutation();
  const updateOrderMutation = useUpdateOrderMutation();
  const updateOrderStatusMutation = useUpdateOrderStatusMutation();
  const updateOrderItemMutation = useUpdateOrderItemMutation();
  const deleteOrderMutation = useDeleteOrderMutation();

  // Load orders when organization or venue changes
  useEffect(() => {
    if (currentVenue?.id) {
      // Prefetch venue orders
      queryClient.prefetchQuery({
        queryKey: orderKeys.venue(currentVenue.id),
        queryFn: () => venueOrdersQuery.refetch()
      });
    } else if (currentOrganization?.id) {
      // Prefetch organization orders
      queryClient.prefetchQuery({
        queryKey: orderKeys.organization(currentOrganization.id),
        queryFn: () => organizationOrdersQuery.refetch()
      });
    }
  }, [currentOrganization, currentVenue, queryClient, venueOrdersQuery, organizationOrdersQuery]);

  // Fetch orders with optional filters
  const fetchOrders = useCallback(async (filters?: FilterOrdersDto): Promise<Order[]> => {
    try {
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: orderKeys.list(filters || {}) });
      // Fetch fresh data
      const { data } = await queryClient.fetchQuery({
        queryKey: orderKeys.list(filters || {}),
        queryFn: () => OrderService.getAll(filters)
      });
      return data || [];
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch orders';
      toast.error(errorMessage);
      return [];
    }
  }, [queryClient]);

  // Fetch orders for a venue
  const fetchOrdersForVenue = useCallback(async (venueId: string): Promise<Order[]> => {
    try {
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: orderKeys.venue(venueId) });
      // Fetch fresh data
      const result = await queryClient.fetchQuery({
        queryKey: orderKeys.venue(venueId),
        queryFn: () => OrderService.getAllForVenue(venueId)
      });

      // Handle both PaginatedOrdersResponse and Order[] return types
      if (Array.isArray(result)) {
        return result;
      } else if (result && 'data' in result) {
        return result.data || [];
      }
      return [];
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch orders for venue';
      toast.error(errorMessage);
      return [];
    }
  }, [queryClient]);

  // Fetch orders for an organization
  const fetchOrdersForOrganization = useCallback(async (organizationId: string): Promise<Order[]> => {
    try {
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: orderKeys.organization(organizationId) });
      // Fetch fresh data
      const result = await queryClient.fetchQuery({
        queryKey: orderKeys.organization(organizationId),
        queryFn: () => OrderService.getAllForOrganization(organizationId)
      });

      // Handle both PaginatedOrdersResponse and Order[] return types
      if (Array.isArray(result)) {
        return result;
      } else if (result && 'data' in result) {
        return result.data || [];
      }
      return [];
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch orders for organization';
      toast.error(errorMessage);
      return [];
    }
  }, [queryClient]);

  // Fetch order by ID
  const fetchOrderById = useCallback(async (id: string): Promise<Order | null> => {
    try {
      console.log('fetchOrderById called with ID:', id);
      setCurrentOrderId(id);
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
      // Fetch fresh data
      console.log('Fetching order data from API...');
      const result = await OrderService.getById(id);
      console.log('API response for order:', result);
      return result || null;
    } catch (err: any) {
      console.error('Error fetching order by ID:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch order';
      toast.error(errorMessage);
      return null;
    }
  }, [queryClient]);

  // Create a new order
  const createOrder = useCallback(async (data: CreateOrderDto): Promise<Order | null> => {
    try {
      const result = await createOrderMutation.mutateAsync(data);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create order';
      toast.error(errorMessage);
      return null;
    }
  }, [createOrderMutation]);

  // Update an order
  const updateOrder = useCallback(async (id: string, data: UpdateOrderDto): Promise<Order | null> => {
    try {
      console.log('updateOrder called with ID:', id);
      console.log('Update data:', data);

      // Force a refetch of the order before updating to ensure we have the latest data
      await queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });

      console.log('Calling updateOrderMutation.mutateAsync');
      const result = await updateOrderMutation.mutateAsync({ id, data });
      console.log('Update mutation result:', result);

      // Ensure the cache is updated with the latest data
      queryClient.setQueryData(orderKeys.detail(id), result);

      return result;
    } catch (err: any) {
      console.error('Error in updateOrder:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update order';
      toast.error(errorMessage);
      return null;
    }
  }, [updateOrderMutation, queryClient]);

  // Update order status
  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus): Promise<Order | null> => {
    try {
      const result = await updateOrderStatusMutation.mutateAsync({ id, status });
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update order status';
      toast.error(errorMessage);
      return null;
    }
  }, [updateOrderStatusMutation]);

  // Update order item
  const updateOrderItem = useCallback(async (
    orderId: string,
    itemId: string,
    data: UpdateOrderItemDto
  ): Promise<OrderItem | null> => {
    try {
      const result = await updateOrderItemMutation.mutateAsync({ orderId, itemId, data });

      // Refresh the order to get updated totals and items
      if (currentOrderId === orderId) {
        await queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update order item';
      toast.error(errorMessage);
      return null;
    }
  }, [updateOrderItemMutation, queryClient, currentOrderId]);

  // Delete an order
  const deleteOrder = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteOrderMutation.mutateAsync(id);
      if (currentOrderId === id) {
        setCurrentOrderId(null);
      }
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete order';
      toast.error(errorMessage);
      return false;
    }
  }, [deleteOrderMutation, currentOrderId]);

  // Select an order
  const selectOrder = useCallback((order: Order) => {
    setCurrentOrderId(order.id);
  }, []);

  // Extract all orders from infinite query pages
  const extractOrdersFromInfiniteQuery = useCallback((): Order[] => {
    if (!infiniteOrdersQuery.data) return [];

    return infiniteOrdersQuery.data.pages
      .flatMap((page: PaginatedOrdersResponse) => page?.data || [])
      .filter((order: Order) => order && order.id); // Ensure we only include valid orders
  }, [infiniteOrdersQuery.data]);

  // Function to fetch next page
  const fetchNextPage = useCallback(async () => {
    if (infiniteOrdersQuery.hasNextPage) {
      await infiniteOrdersQuery.fetchNextPage();
      return true;
    }
    return false;
  }, [infiniteOrdersQuery]);

  // Function to fetch previous page
  const fetchPreviousPage = useCallback(async () => {
    if (infiniteOrdersQuery.hasPreviousPage) {
      await infiniteOrdersQuery.fetchPreviousPage();
      return true;
    }
    return false;
  }, [infiniteOrdersQuery]);

  // Get pagination info
  const getPaginationInfo = useCallback(() => {
    if (!infiniteOrdersQuery.data || infiniteOrdersQuery.data.pages.length === 0) {
      return {
        currentPage: 0,
        totalPages: 0,
        totalItems: 0,
        hasNextPage: false,
        hasPreviousPage: false
      };
    }

    const lastPage = infiniteOrdersQuery.data.pages[infiniteOrdersQuery.data.pages.length - 1];

    return {
      currentPage: lastPage.page,
      totalPages: lastPage.totalPages,
      totalItems: lastPage.total,
      hasNextPage: lastPage.hasNextPage,
      hasPreviousPage: lastPage.hasPreviousPage
    };
  }, [infiniteOrdersQuery.data]);

  return {
    orders: getOrdersFromQueryData(ordersQuery.data),
    currentOrder: currentOrderQuery.data || null,
    isLoading: ordersQuery.isLoading || currentOrderQuery.isLoading ||
               createOrderMutation.isPending || updateOrderMutation.isPending ||
               updateOrderStatusMutation.isPending || deleteOrderMutation.isPending ||
               updateOrderItemMutation.isPending || deleteOrderMutation.isPending ||
               infiniteOrdersQuery.isLoading,
    error: ordersQuery.error?.message || currentOrderQuery.error?.message ||
           infiniteOrdersQuery.error?.message || null,
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
    // Pagination related functions
    infiniteOrders: extractOrdersFromInfiniteQuery(),
    fetchNextPage,
    fetchPreviousPage,
    paginationInfo: getPaginationInfo(),
    isLoadingNextPage: infiniteOrdersQuery.isFetchingNextPage,
    hasNextPage: infiniteOrdersQuery.hasNextPage,
    hasPreviousPage: !!infiniteOrdersQuery.hasPreviousPage,
  };
};

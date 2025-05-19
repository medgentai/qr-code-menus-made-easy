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

  // Check if we're on an edit page to disable automatic queries
  const isEditPage = typeof window !== 'undefined' && window.location.pathname.includes('/edit');

  // Get the appropriate query based on the current context - only run the query that's needed
  const venueOrdersQuery = useVenueOrdersQuery(
    currentVenue?.id || '',
    undefined,
    {
      enabled: !!currentVenue?.id && !isEditPage, // Only run if we have a venue ID and not on edit page
      staleTime: isEditPage ? Infinity : 2 * 60 * 1000 // Prevent refetching on edit pages
    }
  );

  const organizationOrdersQuery = useOrganizationOrdersQuery(
    currentOrganization?.id || '',
    undefined,
    {
      enabled: !!currentOrganization?.id && !currentVenue?.id && !isEditPage, // Only run if we have an org ID, no venue ID, and not on edit page
      staleTime: isEditPage ? Infinity : 5 * 60 * 1000 // Prevent refetching on edit pages
    }
  );

  const currentOrderQuery = useOrderQuery(currentOrderId || '', {
    enabled: !!currentOrderId, // Always enable this one since we need the current order
    staleTime: isEditPage ? Infinity : 60 * 1000 // Prevent refetching on edit pages
  });

  // Get infinite queries for pagination - only run the query that's needed
  const infiniteVenueOrdersQuery = useInfiniteVenueOrdersQuery(
    currentVenue?.id || '',
    {
      enabled: !!currentVenue?.id && !isEditPage, // Only run if we have a venue ID and not on edit page
      staleTime: isEditPage ? Infinity : 3 * 60 * 1000 // Prevent refetching on edit pages
    }
  );

  const infiniteOrganizationOrdersQuery = useInfiniteOrganizationOrdersQuery(
    currentOrganization?.id || '',
    {
      enabled: !!currentOrganization?.id && !currentVenue?.id && !isEditPage, // Only run if we have an org ID, no venue ID, and not on edit page
      staleTime: isEditPage ? Infinity : 5 * 60 * 1000 // Prevent refetching on edit pages
    }
  );

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

  // Load orders when organization or venue changes - optimized to avoid redundant API calls
  useEffect(() => {
    // Don't prefetch if we don't have an ID
    if (!currentVenue?.id && !currentOrganization?.id) return;

    // Check if we're on an edit page by looking at the URL
    const isEditPage = window.location.pathname.includes('/edit');

    // Skip prefetching on edit pages to avoid unnecessary API calls
    if (isEditPage) {
      console.log('Skipping prefetch on edit page to avoid unnecessary API calls');
      return;
    }

    // Use a timeout to avoid rapid consecutive prefetches during navigation
    const timeoutId = setTimeout(() => {
      if (currentVenue?.id) {
        // Check if we already have venue orders in the cache
        const venueOrdersKey = orderKeys.venue(currentVenue.id);
        const cachedVenueOrders = queryClient.getQueryData(venueOrdersKey);

        if (!cachedVenueOrders) {
          console.log('Prefetching venue orders:', currentVenue.id);
          // Prefetch venue orders directly from service
          queryClient.prefetchQuery({
            queryKey: venueOrdersKey,
            queryFn: () => OrderService.getAllForVenue(currentVenue.id),
            staleTime: 5 * 60 * 1000 // 5 minutes - increased to reduce API calls
          });
        } else {
          console.log('Using cached venue orders');
        }
      } else if (currentOrganization?.id) {
        // Check if we already have organization orders in the cache
        const orgOrdersKey = orderKeys.organization(currentOrganization.id);
        const cachedOrgOrders = queryClient.getQueryData(orgOrdersKey);

        if (!cachedOrgOrders) {
          console.log('Prefetching organization orders:', currentOrganization.id);
          // Prefetch organization orders directly from service
          queryClient.prefetchQuery({
            queryKey: orgOrdersKey,
            queryFn: () => OrderService.getAllForOrganization(currentOrganization.id),
            staleTime: 5 * 60 * 1000 // 5 minutes - increased to reduce API calls
          });
        } else {
          console.log('Using cached organization orders');
        }
      }
    }, 300); // Small delay to avoid rapid consecutive prefetches

    // Clean up timeout on unmount or when dependencies change
    return () => clearTimeout(timeoutId);
  }, [currentOrganization?.id, currentVenue?.id, queryClient]);

  // Fetch orders with optional filters
  const fetchOrders = useCallback(async (filters?: FilterOrdersDto): Promise<Order[]> => {
    try {
      // Use fetchQuery directly without invalidating first
      const { data } = await queryClient.fetchQuery({
        queryKey: orderKeys.list(filters || {}),
        queryFn: () => OrderService.getAll(filters),
        staleTime: 2 * 60 * 1000 // 2 minutes
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
      // Use fetchQuery directly without invalidating first
      const result = await queryClient.fetchQuery({
        queryKey: orderKeys.venue(venueId),
        queryFn: () => OrderService.getAllForVenue(venueId),
        staleTime: 3 * 60 * 1000 // 3 minutes
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
      // Use fetchQuery directly without invalidating first
      const result = await queryClient.fetchQuery({
        queryKey: orderKeys.organization(organizationId),
        queryFn: () => OrderService.getAllForOrganization(organizationId),
        staleTime: 5 * 60 * 1000 // 5 minutes
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

  // Fetch order by ID - optimized to use cache first, only fetch if not available
  const fetchOrderById = useCallback(async (id: string): Promise<Order | null> => {
    try {
      // Set current order ID to trigger the query
      setCurrentOrderId(id);

      // First check if we already have this order in the cache
      const cachedOrder = queryClient.getQueryData<Order>(orderKeys.detail(id));

      if (cachedOrder) {
        // If we have a cached order with complete data, return it
        if (cachedOrder.tableId && cachedOrder.table) {
          return cachedOrder;
        }
      }

      // If not in cache or missing table data, fetch from API
      const order = await queryClient.fetchQuery({
        queryKey: orderKeys.detail(id),
        queryFn: () => OrderService.getById(id),
        staleTime: 60 * 1000 // 60 seconds
      });

      return order;
    } catch (err: any) {
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
      // Let the mutation handle the update - no need to invalidate first
      // The mutation already has optimistic updates and proper error handling
      const result = await updateOrderMutation.mutateAsync({ id, data });

      // The mutation's onSuccess handler will update the cache
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update order';
      toast.error(errorMessage);
      return null;
    }
  }, [updateOrderMutation]);

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
      // Let the mutation handle the update
      const result = await updateOrderItemMutation.mutateAsync({ orderId, itemId, data });

      // The mutation's onSuccess handler will handle cache updates
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update order item';
      toast.error(errorMessage);
      return null;
    }
  }, [updateOrderItemMutation]);

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

  // Select an order and ensure it's in the cache to avoid unnecessary API calls
  const selectOrder = useCallback((order: Order) => {
    console.log('Selecting order and setting in cache:', order.id);

    // Set the current order ID
    setCurrentOrderId(order.id);

    // Also set the order in the cache to avoid unnecessary API calls
    queryClient.setQueryData(orderKeys.detail(order.id), order);

    // If the order has a venue, also set the venue in the cache
    if (order.table?.venue) {
      // Set the venue in the cache
      const venue = order.table.venue;
      console.log('Setting venue in cache:', venue.id);

      // Check if we have tables for this venue
      const tablesQueryKey = ['tables', 'venue', venue.id];
      const cachedTables = queryClient.getQueryData(tablesQueryKey);

      if (!cachedTables) {
        console.log('No tables in cache for venue, will need to fetch them');
      }
    }
  }, [queryClient]);

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

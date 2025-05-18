import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import OrderService, {
  Order,
  OrderItem,
  OrderStatus,
  CreateOrderDto,
  UpdateOrderDto,
  UpdateOrderItemDto,
  FilterOrdersDto,
  PaginatedOrdersResponse
} from '@/services/order-service';
import { ApiError } from '@/lib/api';

// Extended error type for API errors
interface ApiErrorWithResponse extends Error {
  response?: {
    data?: {
      message?: string;
      [key: string]: any;
    };
    status?: number;
    [key: string]: any;
  };
}

// Query keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: any) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  venue: (venueId: string) => [...orderKeys.lists(), { venueId }] as const,
  organization: (organizationId: string) => [...orderKeys.lists(), { organizationId }] as const,
};

// Fetch all orders with optional filters and pagination
export const useOrdersQuery = (filters?: FilterOrdersDto) => {
  return useQuery({
    queryKey: orderKeys.list(filters || {}),
    queryFn: () => OrderService.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: ApiErrorWithResponse) => {
      // Don't retry on 404 or 403 errors
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2; // Retry up to 2 times for other errors
    },
  });
};

// Fetch all orders with infinite scrolling
export const useInfiniteOrdersQuery = (filters?: FilterOrdersDto) => {
  return useInfiniteQuery({
    queryKey: [...orderKeys.list(filters || {}), 'infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await OrderService.getAll({
        ...filters,
        page: pageParam,
        limit: 10, // Default limit
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      return firstPage.hasPreviousPage ? firstPage.page - 1 : undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Fetch orders for a venue
export const useVenueOrdersQuery = (venueId: string) => {
  return useQuery({
    queryKey: orderKeys.venue(venueId),
    queryFn: () => OrderService.getAllForVenue(venueId),
    enabled: !!venueId,
    staleTime: 1 * 60 * 1000, // 1 minute - venue orders need fresher data
    retry: (failureCount, error: ApiErrorWithResponse) => {
      // Don't retry on 404 or 403 errors
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2; // Retry up to 2 times for other errors
    },
  });
};

// Fetch orders for a venue with infinite scrolling
export const useInfiniteVenueOrdersQuery = (venueId: string, options = {}) => {
  return useInfiniteQuery({
    queryKey: [...orderKeys.venue(venueId), 'infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        if (!venueId) {
          return {
            data: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false
          };
        }
        const response = await OrderService.getAllForVenue(venueId, pageParam, 10);

        // Handle case where response is an array instead of paginated response
        if (Array.isArray(response)) {
          return {
            data: response,
            total: response.length,
            page: pageParam,
            limit: 10,
            totalPages: Math.ceil(response.length / 10),
            hasNextPage: response.length === 10, // Assume there's more if we got a full page
            hasPreviousPage: pageParam > 1
          };
        }

        return response;
      } catch (error) {
        return {
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        };
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      return firstPage.hasPreviousPage ? firstPage.page - 1 : undefined;
    },
    enabled: !!venueId,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options
  });
};

// Fetch orders for an organization
export const useOrganizationOrdersQuery = (organizationId: string) => {
  return useQuery({
    queryKey: orderKeys.organization(organizationId),
    queryFn: () => OrderService.getAllForOrganization(organizationId),
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: ApiErrorWithResponse) => {
      // Don't retry on 404 or 403 errors
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2; // Retry up to 2 times for other errors
    },
  });
};

// Fetch orders for an organization with infinite scrolling
export const useInfiniteOrganizationOrdersQuery = (organizationId: string, options = {}) => {
  return useInfiniteQuery({
    queryKey: [...orderKeys.organization(organizationId), 'infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        if (!organizationId) {
          return {
            data: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false
          };
        }
        const response = await OrderService.getAllForOrganization(organizationId, pageParam, 10);

        // Handle case where response is an array instead of paginated response
        if (Array.isArray(response)) {
          return {
            data: response,
            total: response.length,
            page: pageParam,
            limit: 10,
            totalPages: Math.ceil(response.length / 10),
            hasNextPage: response.length === 10, // Assume there's more if we got a full page
            hasPreviousPage: pageParam > 1
          };
        }

        return response;
      } catch (error) {
        return {
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        };
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    getPreviousPageParam: (firstPage) => {
      return firstPage.hasPreviousPage ? firstPage.page - 1 : undefined;
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options
  });
};

// Fetch a single order by ID
export const useOrderQuery = (orderId: string) => {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => OrderService.getById(orderId),
    enabled: !!orderId,
    staleTime: 30 * 1000, // 30 seconds - order details need to be fresh
    retry: (failureCount, error: ApiErrorWithResponse) => {
      // Don't retry on 404 or 403 errors
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2; // Retry up to 2 times for other errors
    },
  });
};

// Create a new order
export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderDto) => OrderService.create(data),
    onSuccess: (newOrder) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

      // If the order has a venueId, also invalidate venue-specific queries
      if (newOrder.table?.venue?.id) {
        queryClient.invalidateQueries({
          queryKey: orderKeys.venue(newOrder.table.venue.id)
        });
      }

      toast.success('Order created successfully');
    },
    onError: (error: ApiErrorWithResponse) => {
      const errorMessage = error.response?.data?.message || 'Failed to create order';
      toast.error(errorMessage);
    },
  });
};

// Update an order
export const useUpdateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrderDto }) => {
      console.log('useUpdateOrderMutation mutationFn called with:', { id, data });
      return OrderService.update(id, data);
    },
    onMutate: async ({ id, data }) => {
      console.log('useUpdateOrderMutation onMutate:', { id, data });
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: orderKeys.detail(id) });

      // Snapshot the previous value
      const previousOrder = queryClient.getQueryData<Order>(orderKeys.detail(id));
      console.log('Previous order data from cache:', previousOrder);

      return { previousOrder };
    },
    onSuccess: (updatedOrder, variables) => {
      console.log('useUpdateOrderMutation onSuccess:', updatedOrder);
      console.log('Update variables:', variables);

      // Update the order in the cache
      queryClient.setQueryData(
        orderKeys.detail(updatedOrder.id),
        updatedOrder
      );

      // Invalidate lists that might include this order
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

      toast.success('Order updated successfully');
    },
    onError: (error: ApiErrorWithResponse, variables, context) => {
      console.error('useUpdateOrderMutation onError:', error);
      console.log('Error variables:', variables);

      // If we have the previous order data, restore it
      if (context?.previousOrder && variables.id) {
        queryClient.setQueryData(
          orderKeys.detail(variables.id),
          context.previousOrder
        );
      }

      const errorMessage = error.response?.data?.message || 'Failed to update order';
      toast.error(errorMessage);
    },
    onSettled: (data, error, variables) => {
      console.log('useUpdateOrderMutation onSettled:', { data, error, variables });

      // Always refetch to ensure cache is in sync with server
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      }
    }
  });
};

// Update order status with optimistic updates
export const useUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      OrderService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: orderKeys.detail(id) });

      // Snapshot the previous value
      const previousOrder = queryClient.getQueryData<Order>(orderKeys.detail(id));

      // Optimistically update to the new value
      if (previousOrder) {
        queryClient.setQueryData(orderKeys.detail(id), {
          ...previousOrder,
          status,
        });
      }

      // Also update the order in any lists
      const updateOrderInList = (orders: any) => {
        // Check if orders is an array
        if (!orders || !Array.isArray(orders)) {
          return orders;
        }

        return orders.map(order =>
          order && order.id === id ? { ...order, status } : order
        );
      };

      // Update in all lists - but be careful with the data structure
      try {
        // Handle paginated responses differently
        queryClient.setQueriesData({ queryKey: orderKeys.lists() }, (data: any) => {
          // If it's a paginated response
          if (data && data.data && Array.isArray(data.data)) {
            return {
              ...data,
              data: updateOrderInList(data.data)
            };
          }

          // If it's a direct array
          if (Array.isArray(data)) {
            return updateOrderInList(data);
          }

          // Return unchanged if we don't know how to handle it
          return data;
        });
      } catch (error) {
        // Silent fail - we'll refetch anyway
      }

      return { previousOrder };
    },
    onSuccess: (updatedOrder) => {
      toast.success(`Order status updated to ${updatedOrder.status}`);

      // Update the order in the cache
      queryClient.setQueryData(
        orderKeys.detail(updatedOrder.id),
        updatedOrder
      );
    },
    onError: (err: ApiErrorWithResponse, { id }, context) => {
      try {
        // If the mutation fails, use the context returned from onMutate to roll back
        if (context?.previousOrder) {
          queryClient.setQueryData(orderKeys.detail(id), context.previousOrder);
        }

        let errorMessage = 'Failed to update order status';

        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }

        toast.error(errorMessage);
      } catch {
        toast.error('An error occurred while updating order status');
      }
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success to make sure our local data is in sync with the server
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};

// Delete an order
export const useDeleteOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => OrderService.delete(id),
    onSuccess: (_, id) => {
      // Remove the order from the cache
      queryClient.removeQueries({ queryKey: orderKeys.detail(id) });

      // Invalidate lists that might include this order
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });

      toast.success('Order deleted successfully');
    },
    onError: (error: ApiErrorWithResponse) => {
      const errorMessage = error.response?.data?.message || 'Failed to delete order';
      toast.error(errorMessage);
    },
  });
};

// Update an order item
export const useUpdateOrderItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, itemId, data }: {
      orderId: string;
      itemId: string;
      data: UpdateOrderItemDto
    }) => OrderService.updateOrderItem(orderId, itemId, data),
    onSuccess: (updatedItem, { orderId }) => {
      // Invalidate the specific order query to refetch with updated item
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });

      toast.success('Order item updated successfully');
    },
    onError: (error: ApiErrorWithResponse) => {
      const errorMessage = error.response?.data?.message || 'Failed to update order item';
      toast.error(errorMessage);
    },
  });
};

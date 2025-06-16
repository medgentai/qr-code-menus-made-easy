import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import OrderService, {
  Order,
  OrderStatus,
  CreateOrderDto,
  UpdateOrderDto,
  UpdateOrderItemDto,
  FilterOrdersDto
} from '@/services/order-service';

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
  filtered: (filters: FilterOrdersDto) => [...orderKeys.lists(), 'filtered', filters] as const,
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



// Fetch orders for a venue
export const useVenueOrdersQuery = (venueId: string, status?: OrderStatus, options = {}) => {
  return useQuery({
    queryKey: orderKeys.venue(venueId + (status ? `-${status}` : '')),
    queryFn: () => OrderService.getAllForVenue(venueId, undefined, undefined, status),
    enabled: !!venueId,
    staleTime: 3 * 60 * 1000, // 3 minutes - increased to reduce API calls
    retry: (failureCount, error: ApiErrorWithResponse) => {
      // Don't retry on 404 or 403 errors
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2; // Retry up to 2 times for other errors
    },
    ...options
  });
};

// Fetch orders for a venue with infinite scrolling
export const useInfiniteVenueOrdersQuery = (venueId: string, options = {}) => {
  // Extract status from options if provided
  const { status, ...restOptions } = options as { status?: OrderStatus } & Record<string, any>;

  return useInfiniteQuery({
    queryKey: [...orderKeys.venue(venueId + (status ? `-${status}` : '')), 'infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        if (!venueId) {
          return {
            data: [],
            total: 0,
            page: 1,
            limit: 100,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false
          };
        }
        const response = await OrderService.getAllForVenue(venueId, pageParam, 100, status);

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
          limit: 100,
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
    staleTime: 3 * 60 * 1000, // 3 minutes - increased to reduce API calls
    ...restOptions
  });
};

// Fetch orders for an organization
export const useOrganizationOrdersQuery = (organizationId: string, status?: OrderStatus, options = {}) => {
  return useQuery({
    queryKey: orderKeys.organization(organizationId + (status ? `-${status}` : '')),
    queryFn: () => OrderService.getAllForOrganization(organizationId, undefined, undefined, status),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes - increased to reduce API calls
    retry: (failureCount, error: ApiErrorWithResponse) => {
      // Don't retry on 404 or 403 errors
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2; // Retry up to 2 times for other errors
    },
    ...options
  });
};

// Fetch orders for an organization with infinite scrolling
export const useInfiniteOrganizationOrdersQuery = (organizationId: string, options = {}) => {
  // Extract status from options if provided
  const { status, ...restOptions } = options as { status?: OrderStatus } & Record<string, any>;

  return useInfiniteQuery({
    queryKey: [...orderKeys.organization(organizationId + (status ? `-${status}` : '')), 'infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        if (!organizationId) {
          return {
            data: [],
            total: 0,
            page: 1,
            limit: 100,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false
          };
        }
        const response = await OrderService.getAllForOrganization(organizationId, pageParam, 100, status);

        // Handle case where response is an array instead of paginated response
        if (Array.isArray(response)) {
          return {
            data: response,
            total: response.length,
            page: pageParam,
            limit: 100,
            totalPages: Math.ceil(response.length / 100),
            hasNextPage: response.length === 100, // Assume there's more if we got a full page
            hasPreviousPage: pageParam > 1
          };
        }

        return response;
      } catch (error) {
        return {
          data: [],
          total: 0,
          page: 1,
          limit: 100,
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
    staleTime: 5 * 60 * 1000, // 5 minutes - increased to reduce API calls
    ...restOptions
  });
};

// Fetch orders with combined filtering (organization, venue, status)
export const useFilteredOrdersQuery = (filters: FilterOrdersDto) => {
  return useQuery({
    queryKey: orderKeys.filtered(filters),
    queryFn: () => OrderService.getFiltered(filters),
    enabled: !!(filters.organizationId || filters.venueId), // Only run if we have at least one main filter
    staleTime: 3 * 60 * 1000, // 3 minutes - increased to reduce API calls
    retry: (failureCount, error: ApiErrorWithResponse) => {
      // Don't retry on 404 or 403 errors
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2; // Retry up to 2 times for other errors
    },
  });
};

// Fetch orders with combined filtering and pagination
export const useInfiniteFilteredOrdersQuery = (filters: FilterOrdersDto) => {
  return useInfiniteQuery({
    queryKey: [...orderKeys.filtered(filters), 'infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        // Skip API call if no main filter is provided
        if (!filters.organizationId && !filters.venueId) {
          return {
            data: [],
            total: 0,
            page: 1,
            limit: 100, // Updated to match new page size
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false
          };
        }

        // Call the filtered API with pagination - increased page size to 100
        const apiResponse = await OrderService.getFiltered({
          ...filters,
          page: pageParam,
          limit: 100, // Increased limit to 100
        });

        // Create a default paginated response
        const defaultResponse = {
          data: [],
          total: 0,
          page: pageParam,
          limit: 100, // Increased limit to 100
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        };

        // Check if we have a valid API response
        if (!apiResponse) {
          return defaultResponse;
        }

        // The backend returns orders directly in the data property
        // The structure is: { data: Order[], statusCode, message, ... }
        const orders = apiResponse.data;

        if (!Array.isArray(orders)) {
          return defaultResponse;
        }

        // Fixed page size - increased to 100
        const pageSize = 100;

        // If we received fewer than pageSize orders, we know we're on the last page
        const isLastPage = orders.length < pageSize;

        // Create the paginated response
        return {
          data: orders,
          total: pageParam * pageSize + (isLastPage ? orders.length - pageSize : 0),
          page: pageParam,
          limit: pageSize,
          totalPages: isLastPage ? pageParam : pageParam + 1,
          hasNextPage: !isLastPage,
          hasPreviousPage: pageParam > 1
        };
      } catch (error) {

        // Return empty response on error
        return {
          data: [],
          total: 0,
          page: 1,
          limit: 100, // Updated to match new page size
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        };
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // Only return the next page if hasNextPage is true and we have data
      if (lastPage && lastPage.hasNextPage && lastPage.data.length > 0) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: !!(filters.organizationId || filters.venueId), // Only run if we have at least one main filter
    staleTime: 3 * 60 * 1000, // 3 minutes - increased to reduce API calls
  });
};

// Fetch a single order by ID
export const useOrderQuery = (orderId: string, options = {}) => {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => OrderService.getById(orderId),
    enabled: !!orderId,
    staleTime: 60 * 1000, // 60 seconds - increased to reduce API calls
    retry: (failureCount, error: ApiErrorWithResponse) => {
      // Don't retry on 404 or 403 errors
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2; // Retry up to 2 times for other errors
    },
    select: (data) => {
      // Return the data as is
      return data;
    },
    ...options
  });
};

// Create a new order
export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderDto) => OrderService.create(data),
    onSuccess: (newOrder) => {
      // Invalidate all order list queries
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });      // Invalidate all filtered queries (including infinite queries)
      queryClient.invalidateQueries({
        queryKey: ['orders', 'list', 'filtered'],
        exact: false // This ensures all filtered queries are invalidated regardless of filter parameters
      });

      // Specifically invalidate infinite filtered queries
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            queryKey[0] === 'orders' &&
            queryKey[1] === 'list' &&
            queryKey[2] === 'filtered' &&
            queryKey[queryKey.length - 1] === 'infinite'
          );
        }
      });      // Force refetch of active filtered queries to immediately show the new order
      queryClient.refetchQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            Array.isArray(queryKey) &&
            queryKey[0] === 'orders' &&
            queryKey[1] === 'list' &&
            queryKey[2] === 'filtered' &&
            queryKey[queryKey.length - 1] === 'infinite' &&
            (query.state.status === 'success' || query.state.status === 'error') // Only refetch previously loaded queries
          );
        }
      });

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
      return OrderService.update(id, data);
    },
    onMutate: async ({ id }) => {
      // Cancel any outgoing requests
      await queryClient.cancelQueries({ queryKey: orderKeys.detail(id) });

      // Snapshot the previous value
      const previousOrder = queryClient.getQueryData<Order>(orderKeys.detail(id));

      return { previousOrder };
    },
    onSuccess: (updatedOrder) => {

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
    onSettled: (_, __, variables) => {

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
      // Cancel any outgoing requests
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

        // Also update in infinite queries for immediate UI feedback
        queryClient.setQueriesData(
          {
            predicate: (query) => {
              const queryKey = query.queryKey;
              return (
                Array.isArray(queryKey) &&
                queryKey[0] === 'orders' &&
                queryKey[1] === 'list' &&
                queryKey[2] === 'filtered' &&
                queryKey[queryKey.length - 1] === 'infinite'
              );
            }
          },
          (oldData: any) => {
            if (!oldData) return oldData;

            // Update the order in all pages
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => {
                if (!page || !page.data) return page;

                return {
                  ...page,
                  data: page.data.map((order: Order) =>
                    order.id === id ? { ...order, status } : order
                  )
                };
              })
            };
          }
        );

        // Also update in venue queries if we have the venue ID
        if (previousOrder?.table?.venue?.id) {
          queryClient.setQueriesData(
            { queryKey: [...orderKeys.venue(previousOrder.table.venue.id), 'infinite'] },
            (oldData: any) => {
              if (!oldData) return oldData;

              return {
                ...oldData,
                pages: oldData.pages.map((page: any) => {
                  if (!page || !page.data) return page;

                  return {
                    ...page,
                    data: page.data.map((order: Order) =>
                      order.id === id ? { ...order, status } : order
                    )
                  };
                })
              };
            }
          );
        }

        // Update in organization queries if we have the organization ID
        if (previousOrder?.table?.venue) {
          queryClient.setQueriesData(
            { queryKey: [...orderKeys.organization(previousOrder.table.venue.id), 'infinite'] },
            (oldData: any) => {
              if (!oldData) return oldData;

              return {
                ...oldData,
                pages: oldData.pages.map((page: any) => {
                  if (!page || !page.data) return page;

                  return {
                    ...page,
                    data: page.data.map((order: Order) =>
                      order.id === id ? { ...order, status } : order
                    )
                  };
                })
              };
            }
          );
        }
      } catch (error) {
        // Silent fail - we'll refetch anyway
        console.log('Error updating cache in onMutate:', error);
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
    onSettled: (updatedOrder, error, { id }) => {
      if (error) {
        // Only invalidate on error to ensure we get fresh data
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
      } else if (updatedOrder) {
        // On success, we've already updated the cache optimistically and confirmed with server data
        // No need to invalidate and cause a refetch - this would trigger a page refresh

        // Update the order in any infinite queries without triggering a refetch
        try {
          // Update the order in infinite queries for organization
          queryClient.setQueriesData(
            {
              predicate: (query) => {
                const queryKey = query.queryKey;
                return (
                  Array.isArray(queryKey) &&
                  queryKey[0] === 'orders' &&
                  queryKey[1] === 'list' &&
                  queryKey[2] === 'filtered' &&
                  queryKey[queryKey.length - 1] === 'infinite'
                );
              }
            },
            (oldData: any) => {
              if (!oldData) return oldData;

              // Update the order in all pages
              return {
                ...oldData,
                pages: oldData.pages.map((page: any) => {
                  if (!page || !page.data) return page;

                  return {
                    ...page,
                    data: page.data.map((order: Order) =>
                      order.id === id ? { ...order, status: updatedOrder.status } : order
                    )
                  };
                })
              };
            }
          );

          // Also update in venue and organization queries
          if (updatedOrder.table?.venue?.id) {
            queryClient.setQueriesData(
              { queryKey: [...orderKeys.venue(updatedOrder.table.venue.id), 'infinite'] },
              (oldData: any) => {
                if (!oldData) return oldData;

                return {
                  ...oldData,
                  pages: oldData.pages.map((page: any) => {
                    if (!page || !page.data) return page;

                    return {
                      ...page,
                      data: page.data.map((order: Order) =>
                        order.id === id ? { ...order, status: updatedOrder.status } : order
                      )
                    };
                  })
                };
              }
            );
          }        // Update in organization queries if we have an organization ID
        if (updatedOrder.table?.venue) {
          queryClient.setQueriesData(
            { queryKey: [...orderKeys.organization(updatedOrder.table.venue.id), 'infinite'] },
              (oldData: any) => {
                if (!oldData) return oldData;

                return {
                  ...oldData,
                  pages: oldData.pages.map((page: any) => {
                    if (!page || !page.data) return page;

                    return {
                      ...page,
                      data: page.data.map((order: Order) =>
                        order.id === id ? { ...order, status: updatedOrder.status } : order
                      )
                    };
                  })
                };
              }
            );
          }
        } catch (err) {
          // Silent fail - this is just an optimization
          console.log('Error updating infinite queries:', err);
        }
      }
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

// Update payment status with optimistic updates
export const useUpdatePaymentStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPaid, data }: {
      id: string;
      isPaid: boolean;
      data: any
    }) => {
      return isPaid
        ? OrderService.markAsPaid(id, data)
        : OrderService.markAsUnpaid(id, data);
    },
    onMutate: async ({ id, isPaid }) => {
      // Cancel any outgoing requests
      await queryClient.cancelQueries({ queryKey: orderKeys.detail(id) });

      // Snapshot the previous value
      const previousOrder = queryClient.getQueryData<Order>(orderKeys.detail(id));

      // Optimistically update to the new value
      if (previousOrder) {
        const newPaymentStatus = isPaid ? 'PAID' : 'UNPAID';
        queryClient.setQueryData(orderKeys.detail(id), {
          ...previousOrder,
          paymentStatus: newPaymentStatus,
        });

        // Also update in infinite queries for immediate UI feedback
        queryClient.setQueriesData(
          {
            predicate: (query) => {
              const queryKey = query.queryKey;
              return (
                Array.isArray(queryKey) &&
                queryKey[0] === 'orders' &&
                queryKey[1] === 'list' &&
                queryKey[2] === 'filtered' &&
                queryKey[queryKey.length - 1] === 'infinite'
              );
            }
          },
          (oldData: any) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => {
                if (!page || !page.data) return page;

                return {
                  ...page,
                  data: page.data.map((order: Order) =>
                    order.id === id ? { ...order, paymentStatus: newPaymentStatus } : order
                  )
                };
              })
            };
          }
        );
      }

      return { previousOrder };
    },
    onSuccess: (updatedOrder) => {
      // Update the order in the cache with the server response
      queryClient.setQueryData(
        orderKeys.detail(updatedOrder.id),
        updatedOrder
      );

      // Update in infinite queries with the complete updated order
      queryClient.setQueriesData(
        {
          predicate: (query) => {
            const queryKey = query.queryKey;
            return (
              Array.isArray(queryKey) &&
              queryKey[0] === 'orders' &&
              queryKey[1] === 'list' &&
              queryKey[2] === 'filtered' &&
              queryKey[queryKey.length - 1] === 'infinite'
            );
          }
        },
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => {
              if (!page || !page.data) return page;

              return {
                ...page,
                data: page.data.map((order: Order) =>
                  order.id === updatedOrder.id ? updatedOrder : order
                )
              };
            })
          };
        }
      );
    },
    onError: (err: ApiErrorWithResponse, { id }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousOrder) {
        queryClient.setQueryData(orderKeys.detail(id), context.previousOrder);

        // Also revert in infinite queries
        queryClient.setQueriesData(
          {
            predicate: (query) => {
              const queryKey = query.queryKey;
              return (
                Array.isArray(queryKey) &&
                queryKey[0] === 'orders' &&
                queryKey[1] === 'list' &&
                queryKey[2] === 'filtered' &&
                queryKey[queryKey.length - 1] === 'infinite'
              );
            }
          },
          (oldData: any) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => {
                if (!page || !page.data) return page;

                return {
                  ...page,
                  data: page.data.map((order: Order) =>
                    order.id === id ? context.previousOrder : order
                  )
                };
              })
            };
          }
        );
      }

      let errorMessage = 'Failed to update payment status';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    },
  });
};

// Update an order item with optimistic updates
export const useUpdateOrderItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, itemId, data }: {
      orderId: string;
      itemId: string;
      data: UpdateOrderItemDto
    }) => OrderService.updateOrderItem(orderId, itemId, data),
    onMutate: async ({ orderId, itemId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: orderKeys.detail(orderId) });

      // Snapshot the previous value
      const previousOrder = queryClient.getQueryData<Order>(orderKeys.detail(orderId));

      // Return a context object with the snapshotted value
      return { previousOrder };
    },
    onSuccess: (updatedItem, { orderId }) => {
      // Instead of invalidating, we'll update the cache with the new data
      // This reduces the number of API calls
      const order = queryClient.getQueryData<Order>(orderKeys.detail(orderId));

      if (order) {
        // Update the item in the order
        const updatedOrder = {
          ...order,
          items: order.items?.map(item =>
            item.id === updatedItem.id ? updatedItem : item
          )
        };

        // Update the cache
        queryClient.setQueryData(orderKeys.detail(orderId), updatedOrder);
      }

      toast.success('Order item updated successfully');
    },
    onError: (error: ApiErrorWithResponse, variables, context) => {
      // If we have the previous order data, restore it
      if (context?.previousOrder) {
        queryClient.setQueryData(
          orderKeys.detail(variables.orderId),
          context.previousOrder
        );
      }

      const errorMessage = error.response?.data?.message || 'Failed to update order item';
      toast.error(errorMessage);
    },
    onSettled: (_, __, { orderId }) => {
      // After success or error, refetch to ensure our cache is in sync
      // But only refetch the specific order, not all lists
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    },
  });
};

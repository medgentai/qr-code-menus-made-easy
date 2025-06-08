import { useQuery } from '@tanstack/react-query';
import OrderService, { OrderStatus } from '@/services/order-service';
import { useOrganization } from '@/contexts/organization-context';
import { useVenue } from '@/contexts/venue-context';

// Query keys for active orders
export const activeOrdersKeys = {
  all: ['activeOrders'] as const,
  byOrg: (organizationId: string, venueId?: string) => 
    [...activeOrdersKeys.all, organizationId, venueId] as const,
};

// Hook for fetching active orders (non-completed orders)
export const useActiveOrders = (
  organizationId?: string,
  venueId?: string
) => {
  const { currentOrganization } = useOrganization();
  const { currentVenue } = useVenue();

  // Use provided organizationId or fall back to current organization
  const orgId = organizationId || currentOrganization?.id;
  
  // Use provided venueId or fall back to current venue
  const venueIdToUse = venueId || currentVenue?.id;

  return useQuery({
    queryKey: activeOrdersKeys.byOrg(orgId || '', venueIdToUse),
    queryFn: async () => {
      if (!orgId) {
        throw new Error('Organization ID is required for active orders');
      }
      
      // Fetch orders that are not completed or cancelled (active orders)
      const response = await OrderService.getFiltered({
        organizationId: orgId,
        venueId: venueIdToUse,
        page: 1,
        limit: 50, // Get more orders to ensure we capture all active ones
      });
      
      // Filter to only active orders (not completed or cancelled)
      const activeStatuses = [
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
        OrderStatus.PREPARING,
        OrderStatus.READY,
        OrderStatus.DELIVERED
      ];
      
      const activeOrders = response.data.filter(order => 
        activeStatuses.includes(order.status)
      );
      
      return activeOrders;
    },
    enabled: !!orgId, // Only run query if we have an organization ID
    staleTime: 1 * 60 * 1000, // 1 minute - active orders change frequently
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes for real-time updates
    retry: (failureCount, error: any) => {
      // Don't retry on 404 or 403 errors
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2; // Retry up to 2 times for other errors
    },
  });
};

// Hook for getting active orders count only (lighter query)
export const useActiveOrdersCount = (
  organizationId?: string,
  venueId?: string
) => {
  const activeOrdersQuery = useActiveOrders(organizationId, venueId);

  return {
    ...activeOrdersQuery,
    data: activeOrdersQuery.data?.length || 0,
  };
};

// Hook for getting recent active orders (last 5)
export const useRecentActiveOrders = (
  organizationId?: string,
  venueId?: string
) => {
  const activeOrdersQuery = useActiveOrders(organizationId, venueId);

  return {
    ...activeOrdersQuery,
    data: activeOrdersQuery.data?.slice(0, 5) || [],
  };
};

import { useMemo } from 'react';
import { usePermissions } from '@/contexts/permission-context';
import { useOrganization } from '@/contexts/organization-context';
import { useVenue } from '@/contexts/venue-context';
import { getAllowedOrderStatuses, canPerformOrderAction } from '@/lib/permissions';
import { useInfiniteFilteredOrdersQuery } from './useOrderQuery';
import { FilterOrdersDto, Order, OrderStatus } from '@/services/order-service';
import { MemberRole } from '@/types/organization';

/**
 * Custom hook that provides role-based order filtering and actions
 * This hook automatically applies the appropriate filters based on user role and staff type
 */
export const useRoleBasedOrders = (additionalFilters?: {
  status?: OrderStatus | '';
  venueId?: string;
}) => {
  const { userRole, userStaffType, userVenueIds } = usePermissions();
  const { currentOrganization } = useOrganization();
  const { currentVenue } = useVenue();

  // Get allowed order statuses for the current user
  const allowedStatuses = useMemo(() => {
    if (!userRole) return null;
    return getAllowedOrderStatuses(userRole, userStaffType || undefined);
  }, [userRole, userStaffType]);

  // Build filters based on user role and context
  const filters = useMemo<FilterOrdersDto>(() => {
    const baseFilters: FilterOrdersDto = {};

    // Add organization filter if available
    if (currentOrganization?.id) {
      baseFilters.organizationId = currentOrganization.id;
    }

    // Add venue filter based on user permissions and additional filters
    const targetVenueId = (additionalFilters?.venueId && additionalFilters.venueId !== '') ? additionalFilters.venueId : currentVenue?.id;
    if (targetVenueId) {
      // If there's a target venue, use it (but only if user has access)
      if (userRole === MemberRole.STAFF) {
        // For staff, check if they have access to this venue
        if (userVenueIds && userVenueIds.includes(targetVenueId)) {
          baseFilters.venueId = targetVenueId;
        }
        // If staff doesn't have access to target venue, don't set venueId
        // Backend will filter based on their assigned venues
      } else {
        // Non-staff roles can access any venue in their organization
        baseFilters.venueId = targetVenueId;
      }
    }
    // For staff members without a current venue, let backend handle venue filtering
    // based on their venueIds assignments

    // Add status filter from additional filters
    if (additionalFilters?.status && additionalFilters.status !== '') {
      baseFilters.status = additionalFilters.status as OrderStatus;
    }

    return baseFilters;
  }, [currentOrganization?.id, currentVenue?.id, userRole, userVenueIds, additionalFilters?.venueId, additionalFilters?.status]);

  // Use the infinite filtered query
  const ordersQuery = useInfiniteFilteredOrdersQuery(filters);

  // Extract orders from query (filtering is now done at query level)
  const filteredOrders = useMemo(() => {
    if (!ordersQuery.data?.pages) return [];

    const allOrders = ordersQuery.data.pages.flatMap(page => page.data || []);

    // Additional client-side filtering for role-based status restrictions
    if (!allowedStatuses) return allOrders;

    // Filter by allowed statuses (role-based restrictions)
    return allOrders.filter(order => allowedStatuses.includes(order.status));
  }, [ordersQuery.data?.pages, allowedStatuses]);

  // Action permission checkers
  const canCreateOrder = useMemo(() => {
    if (!userRole) return false;
    return canPerformOrderAction('create', userRole, userStaffType || undefined);
  }, [userRole, userStaffType]);

  const canEditOrder = useMemo(() => {
    return (orderStatus?: string) => {
      if (!userRole) return false;
      return canPerformOrderAction('edit', userRole, userStaffType || undefined, orderStatus);
    };
  }, [userRole, userStaffType]);

  const canCancelOrder = useMemo(() => {
    return (orderStatus?: string) => {
      if (!userRole) return false;
      return canPerformOrderAction('cancel', userRole, userStaffType || undefined, orderStatus);
    };
  }, [userRole, userStaffType]);

  const canUpdateOrderStatus = useMemo(() => {
    return (orderStatus?: string) => {
      if (!userRole) return false;
      return canPerformOrderAction('updateStatus', userRole, userStaffType || undefined, orderStatus);
    };
  }, [userRole, userStaffType]);

  const canDeleteOrder = useMemo(() => {
    return (orderStatus?: string) => {
      if (!userRole) return false;
      return canPerformOrderAction('delete', userRole, userStaffType || undefined, orderStatus);
    };
  }, [userRole, userStaffType]);

  // Get available status options for filtering
  const availableStatusFilters = useMemo(() => {
    if (!allowedStatuses) {
      // Return all statuses for full access users
      return Object.values(OrderStatus);
    }
    return allowedStatuses as OrderStatus[];
  }, [allowedStatuses]);

  // Get role-specific page title and description
  const pageInfo = useMemo(() => {
    if (!userRole) {
      return {
        title: 'Orders',
        description: 'Manage orders for your business'
      };
    }

    // For staff members, include venue context
    if (userRole === MemberRole.STAFF && userStaffType) {
      const venueContext = currentVenue?.name ? ` at ${currentVenue.name}` :
        (userVenueIds && userVenueIds.length === 1 ? ' for your assigned venue' :
         userVenueIds && userVenueIds.length > 1 ? ' for your assigned venues' : '');

      switch (userStaffType) {
        case 'KITCHEN':
          return {
            title: 'Kitchen Orders',
            description: `Orders that need kitchen attention${venueContext}`
          };
        case 'FRONT_OF_HOUSE':
          return {
            title: 'Service Orders',
            description: `Manage the complete customer service workflow${venueContext}`
          };
        case 'GENERAL':
          return {
            title: 'Orders',
            description: `View order information${venueContext}`
          };
        default:
          return {
            title: 'Orders',
            description: `Staff order access${venueContext}`
          };
      }
    }

    // For non-staff roles
    return {
      title: 'Orders',
      description: 'Manage orders for your business'
    };
  }, [userRole, userStaffType, currentVenue?.name, userVenueIds]);

  return {
    // Data
    orders: filteredOrders,
    isLoading: ordersQuery.isLoading,
    isLoadingNextPage: ordersQuery.isFetchingNextPage,
    error: ordersQuery.error,
    
    // Pagination
    hasNextPage: ordersQuery.hasNextPage,
    hasPreviousPage: false, // Not implemented in infinite query
    fetchNextPage: ordersQuery.fetchNextPage,
    
    // Permissions
    canCreateOrder,
    canEditOrder,
    canCancelOrder,
    canUpdateOrderStatus,
    canDeleteOrder,
    
    // Filtering
    allowedStatuses,
    availableStatusFilters,
    
    // UI Info
    pageInfo,
    
    // Raw query for advanced usage
    rawQuery: ordersQuery,
  };
};

export default useRoleBasedOrders;

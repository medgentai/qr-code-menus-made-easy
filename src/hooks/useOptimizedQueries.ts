/**
 * Optimized data fetching hooks with intelligent caching and prefetching
 */

import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import { organizationKeys, venueKeys, menuKeys, orderKeys, analyticsKeys } from '@/lib/query-keys';
import OrganizationService from '@/services/organization-service';
import VenueService from '@/services/venue-service';
import MenuService from '@/services/menu-service';
import OrderService from '@/services/order-service';
import AnalyticsService from '@/services/analytics-service';

// Optimized organization data fetching
export const useOptimizedOrganizationData = () => {
  const { state: { isAuthenticated, isLoading: authLoading } } = useAuth();
  const { currentOrganization } = useOrganization();

  // Fetch organizations list and current organization details in parallel
  const queries = useQueries({
    queries: [
      {
        queryKey: organizationKeys.list(),
        queryFn: () => OrganizationService.getAll(),
        enabled: isAuthenticated && !authLoading,
        staleTime: 15 * 60 * 1000, // 15 minutes for organizations list
      },
      {
        queryKey: organizationKeys.detail(currentOrganization?.id || ''),
        queryFn: () => OrganizationService.getDetails(currentOrganization!.id),
        enabled: isAuthenticated && !authLoading && !!currentOrganization?.id,
        staleTime: 10 * 60 * 1000, // 10 minutes for organization details
      },
    ],
  });

  const [organizationsQuery, organizationDetailsQuery] = queries;

  return {
    organizations: organizationsQuery.data || [],
    organizationDetails: organizationDetailsQuery.data,
    isLoading: organizationsQuery.isLoading || organizationDetailsQuery.isLoading,
    error: organizationsQuery.error || organizationDetailsQuery.error,
  };
};

// Optimized venue and menu data fetching
export const useOptimizedVenueMenuData = (organizationId?: string) => {
  const { state: { isAuthenticated, isLoading: authLoading } } = useAuth();

  // Fetch venues and menus in parallel for the organization
  const queries = useQueries({
    queries: [
      {
        queryKey: venueKeys.byOrganization(organizationId || ''),
        queryFn: () => VenueService.getAllForOrganization(organizationId!),
        enabled: isAuthenticated && !authLoading && !!organizationId,
        staleTime: 10 * 60 * 1000, // 10 minutes
      },
      {
        queryKey: menuKeys.byOrganization(organizationId || ''),
        queryFn: () => MenuService.getAllForOrganization(organizationId!),
        enabled: isAuthenticated && !authLoading && !!organizationId,
        staleTime: 10 * 60 * 1000, // 10 minutes
      },
    ],
  });

  const [venuesQuery, menusQuery] = queries;

  return {
    venues: venuesQuery.data || [],
    menus: menusQuery.data || [],
    isLoading: venuesQuery.isLoading || menusQuery.isLoading,
    error: venuesQuery.error || menusQuery.error,
  };
};

// Optimized dashboard data fetching
export const useOptimizedDashboardData = (organizationId?: string, venueId?: string) => {
  const { state: { isAuthenticated, isLoading: authLoading } } = useAuth();

  // Fetch all dashboard data in parallel
  const queries = useQueries({
    queries: [
      {
        queryKey: analyticsKeys.dashboardByOrg(organizationId || '', venueId, 1),
        queryFn: () => {
          if (!organizationId) {
            throw new Error('Organization ID is required for dashboard analytics');
          }
          return AnalyticsService.getDashboardAnalyticsForOrganization(
            organizationId,
            venueId,
            1 // Today only
          );
        },
        enabled: isAuthenticated && !authLoading && !!organizationId,
        staleTime: 2 * 60 * 1000, // 2 minutes for analytics
        refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
        retry: (failureCount, error: any) => {
          if (error?.response?.status === 404 || error?.response?.status === 403) {
            return false;
          }
          return failureCount < 2;
        },
        // Provide fallback data when API is not available
        placeholderData: {
          qrAnalytics: {
            weeklyScans: [],
            totalScans: 0,
            uniqueScans: 0,
          },
          recentOrders: [],
          topItems: [],
          customerStats: {
            new: 0,
            returning: 0,
            totalToday: 0,
            averageSpend: 0,
          },
          revenue: {
            today: 0,
            yesterday: 0,
            thisWeek: 0,
            lastWeek: 0,
            growth: 0,
          },
          peakHours: [],
          lastUpdated: new Date().toISOString(),
        },
      },
      {
        queryKey: orderKeys.activeCount(organizationId || ''),
        queryFn: async () => {
          if (!organizationId) {
            throw new Error('Organization ID is required for active orders');
          }

          // Fetch orders that are not completed or cancelled (active orders)
          const response = await OrderService.getFiltered({
            organizationId,
            venueId,
            page: 1,
            limit: 50,
          });

          // Filter to only active orders (not completed or cancelled)
          const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
          const activeOrders = response.data.filter(order =>
            activeStatuses.includes(order.status.toLowerCase())
          );

          return activeOrders.length;
        },
        enabled: isAuthenticated && !authLoading && !!organizationId,
        staleTime: 30 * 1000, // 30 seconds for active orders count
        refetchInterval: 60 * 1000, // Auto-refresh every minute
      },
      {
        queryKey: orderKeys.recentActive(organizationId || ''),
        queryFn: async () => {
          if (!organizationId) {
            throw new Error('Organization ID is required for recent orders');
          }

          // Fetch orders that are not completed or cancelled (active orders)
          const response = await OrderService.getFiltered({
            organizationId,
            venueId,
            page: 1,
            limit: 50,
          });

          // Filter to only active orders (not completed or cancelled)
          const activeStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
          const activeOrders = response.data.filter(order =>
            activeStatuses.includes(order.status.toLowerCase())
          );

          return activeOrders.slice(0, 5);
        },
        enabled: isAuthenticated && !authLoading && !!organizationId,
        staleTime: 30 * 1000, // 30 seconds for recent orders
        refetchInterval: 60 * 1000, // Auto-refresh every minute
      },
    ],
  });

  const [analyticsQuery, activeCountQuery, recentOrdersQuery] = queries;

  return {
    analytics: analyticsQuery.data,
    activeOrdersCount: activeCountQuery.data,
    recentActiveOrders: recentOrdersQuery.data,
    isLoading: analyticsQuery.isLoading || activeCountQuery.isLoading || recentOrdersQuery.isLoading,
    error: analyticsQuery.error || activeCountQuery.error || recentOrdersQuery.error,
    refetchAll: () => {
      analyticsQuery.refetch();
      activeCountQuery.refetch();
      recentOrdersQuery.refetch();
    },
  };
};

// Prefetch related data when user navigates
export const usePrefetchRelatedData = () => {
  const queryClient = useQueryClient();
  const { state: { isAuthenticated } } = useAuth();

  const prefetchOrganizationData = async (organizationId: string) => {
    if (!isAuthenticated) return;

    // Prefetch organization details, venues, and menus
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: organizationKeys.detail(organizationId),
        queryFn: () => OrganizationService.getDetails(organizationId),
        staleTime: 10 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: venueKeys.byOrganization(organizationId),
        queryFn: () => VenueService.getAllForOrganization(organizationId),
        staleTime: 10 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: menuKeys.byOrganization(organizationId),
        queryFn: () => MenuService.getAllForOrganization(organizationId),
        staleTime: 10 * 60 * 1000,
      }),
    ]);
  };

  const prefetchVenueData = async (venueId: string) => {
    if (!isAuthenticated) return;

    // Prefetch venue details and tables
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: venueKeys.detail(venueId),
        queryFn: () => VenueService.getById(venueId),
        staleTime: 10 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: venueKeys.tables(venueId),
        queryFn: () => VenueService.getAllTablesForVenue(venueId),
        staleTime: 10 * 60 * 1000,
      }),
    ]);
  };

  const prefetchMenuData = async (menuId: string) => {
    if (!isAuthenticated) return;

    // Prefetch menu details with categories and items
    await queryClient.prefetchQuery({
      queryKey: menuKeys.detail(menuId),
      queryFn: () => MenuService.getById(menuId),
      staleTime: 10 * 60 * 1000,
    });
  };

  return {
    prefetchOrganizationData,
    prefetchVenueData,
    prefetchMenuData,
  };
};

// Optimized order data with intelligent pagination
export const useOptimizedOrderData = (
  organizationId?: string,
  venueId?: string,
  filters?: Record<string, any>
) => {
  const { state: { isAuthenticated, isLoading: authLoading } } = useAuth();

  const queryKey = venueId 
    ? orderKeys.byVenue(venueId, filters?.status)
    : orderKeys.byOrganization(organizationId || '', filters?.status);

  return useQuery({
    queryKey,
    queryFn: () => {
      if (venueId) {
        return OrderService.getAllForVenue(venueId, undefined, undefined, filters?.status);
      }
      return OrderService.getAllForOrganization(organizationId!, undefined, undefined, filters?.status);
    },
    enabled: isAuthenticated && !authLoading && (!!organizationId || !!venueId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 3 * 60 * 1000, // Auto-refresh every 3 minutes
    select: (data) => {
      // Transform and sort data on the client side
      return data?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];
    },
  });
};

import { useQuery } from '@tanstack/react-query';
import AnalyticsService, { GetAnalyticsQueryDto } from '@/services/analytics-service';
import { useOrganization } from '@/contexts/organization-context';
import { useVenue } from '@/contexts/venue-context';

// Query keys for analytics
export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: () => [...analyticsKeys.all, 'dashboard'] as const,
  dashboardByOrg: (organizationId: string, venueId?: string, days?: number) => 
    [...analyticsKeys.dashboard(), organizationId, venueId, days] as const,
};

// Hook for dashboard analytics with organization context
export const useDashboardAnalytics = (
  organizationId?: string,
  venueId?: string,
  days: number = 1 // Default to 1 day (today only) as per user preference
) => {
  const { currentOrganization } = useOrganization();
  const { currentVenue } = useVenue();

  // Use provided organizationId or fall back to current organization
  const orgId = organizationId || currentOrganization?.id;
  
  // Use provided venueId or fall back to current venue
  const venueIdToUse = venueId || currentVenue?.id;

  return useQuery({
    queryKey: analyticsKeys.dashboardByOrg(orgId || '', venueIdToUse, days),
    queryFn: () => {
      if (!orgId) {
        throw new Error('Organization ID is required for dashboard analytics');
      }
      
      return AnalyticsService.getDashboardAnalyticsForOrganization(
        orgId,
        venueIdToUse,
        days
      );
    },
    enabled: !!orgId, // Only run query if we have an organization ID
    staleTime: 2 * 60 * 1000, // 2 minutes - analytics data can be slightly stale
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes for real-time updates
    retry: (failureCount, error: any) => {
      // Don't retry on 404 or 403 errors
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2; // Retry up to 2 times for other errors
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
  });
};

// Hook for dashboard analytics with custom parameters
export const useDashboardAnalyticsQuery = (params: GetAnalyticsQueryDto) => {
  return useQuery({
    queryKey: analyticsKeys.dashboardByOrg(
      params.organizationId || '', 
      params.venueId, 
      params.days
    ),
    queryFn: () => AnalyticsService.getDashboardAnalytics(params),
    enabled: !!params.organizationId, // Only run query if we have an organization ID
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 404 or 403 errors
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2; // Retry up to 2 times for other errors
    },
  });
};



// Hook for analytics service health
export const useAnalyticsHealth = () => {
  return useQuery({
    queryKey: ['analytics', 'health'],
    queryFn: () => AnalyticsService.getHealthStatus(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000, // Check health every 10 minutes
  });
};

import { api } from '@/lib/api';

// Types for dashboard analytics data
export interface QrAnalytics {
  weeklyScans: number[];
  totalScans: number;
  uniqueScans: number;
}

export interface RecentOrder {
  id: string;
  customer: string;
  items: number;
  total: number;
  time: string;
  status: string;
}

export interface TopMenuItem {
  name: string;
  orders: number;
  revenue: number;
}

export interface CustomerStats {
  new: number;
  returning: number;
  totalToday: number;
  averageSpend: number;
}

export interface RevenueStats {
  today: number;
  yesterday: number;
  thisWeek: number;
  lastWeek: number;
  growth: number;
}

export interface PeakHourData {
  hour: string;
  orders: number;
}

export interface DashboardAnalyticsDto {
  qrAnalytics: QrAnalytics;
  recentOrders: RecentOrder[];
  topItems: TopMenuItem[];
  customerStats: CustomerStats;
  revenue: RevenueStats;
  peakHours: PeakHourData[];
  lastUpdated: string;
}

export interface GetAnalyticsQueryDto {
  organizationId?: string;
  venueId?: string;
  days?: number;
}

const AnalyticsService = {
  // Get dashboard analytics data
  getDashboardAnalytics: async (params: GetAnalyticsQueryDto): Promise<DashboardAnalyticsDto> => {
    const queryParams = new URLSearchParams();
    
    if (params.organizationId) {
      queryParams.append('organizationId', params.organizationId);
    }
    
    if (params.venueId) {
      queryParams.append('venueId', params.venueId);
    }
    
    if (params.days) {
      queryParams.append('days', params.days.toString());
    }

    const url = `/analytics/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get<DashboardAnalyticsDto>(url);
    return response.data;
  },

  // Get dashboard analytics for a specific organization
  getDashboardAnalyticsForOrganization: async (
    organizationId: string,
    venueId?: string,
    days?: number
  ): Promise<DashboardAnalyticsDto> => {
    const queryParams = new URLSearchParams();

    if (venueId) {
      queryParams.append('venueId', venueId);
    }

    if (days) {
      queryParams.append('days', days.toString());
    }

    const url = `/analytics/dashboard/${organizationId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get<DashboardAnalyticsDto>(url);
    return response.data;
  },

  // Get analytics service health status
  getHealthStatus: async (): Promise<{
    status: string;
    service: string;
    timestamp: string;
    features: {
      dashboardAnalytics: string;
      scheduledAggregation: string;
      manualAggregation: string;
    };
  }> => {
    const response = await api.get<{
      status: string;
      service: string;
      timestamp: string;
      features: {
        dashboardAnalytics: string;
        scheduledAggregation: string;
        manualAggregation: string;
      };
    }>('/analytics/health');
    return response.data;
  },
};

export default AnalyticsService;

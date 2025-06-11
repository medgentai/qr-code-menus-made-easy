import { api } from '@/lib/api';
import {
  PlanEntity,
  PlanListResponse,
  PlanStatsEntity,
  PlanUsageEntity,
  PlanOrganizationsResponse,
  CreatePlanDto,
  UpdatePlanDto,
  GetPlansDto,
  GetPlanOrganizationsDto,
} from '@/types/plan-management';

export interface PlatformStats {
  totalUsers: number;
  totalOrganizations: number;
  totalVenues: number;
  totalOrders: number;
  activeUsers: number;
  activeOrganizations: number;
  recentUsers: number;
  recentOrganizations: number;
  lastUpdated: string;
}

export interface PlatformAnalytics {
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalOrganizations: number;
    activeUsers: number;
    activeOrganizations: number;
  };
  dailyStats: Array<{
    date: string;
    newUsers: number;
    newOrganizations: number;
    newOrders: number;
  }>;
  lastUpdated: string;
}

export interface UserManagement {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  phoneNumber?: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  organizationCount: number;
}

export interface OrganizationManagement {
  id: string;
  name: string;
  type: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  memberCount: number;
  venueCount: number;
  orderCount: number;
  owner?: {
    name: string;
    email: string;
  } | null;
}

export interface UserDetails extends UserManagement {
  organizations: {
    id: string;
    name: string;
    type: string;
    role: string;
    joinedAt: string;
  }[];
}

export interface OrganizationVenue {
  id: string;
  name: string;
  type: string;
  address?: string;
  isActive: boolean;
  tableCount: number;
  orderCount: number;
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    status: string;
    lastLoginAt?: string;
    createdAt: string;
  };
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'ADMIN' | 'USER';
}

export interface GetOrganizationsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface OrganizationVenuesResponse {
  organization: {
    id: string;
    name: string;
  };
  venues: OrganizationVenue[];
}

export interface OrganizationMembersResponse {
  organization: {
    id: string;
    name: string;
  };
  members: OrganizationMember[];
}

export interface SystemInfo {
  database: {
    status: string;
    type: string;
    version: string;
    recordCounts: {
      users: number;
      organizations: number;
      venues: number;
      orders: number;
    };
  };
  application: {
    version: string;
    environment: string;
    uptime: string;
    nodeVersion: string;
  };
  performance: {
    memoryUsage: string;
    memoryPercentage: number;
    cpuUsage: string;
  };
  security: {
    twoFactorAuth: string;
    sessionTimeout: string;
    lastBackup: string;
  };
  platform: {
    status: string;
    maintenanceMode: boolean;
  };
  lastUpdated: string;
}

export interface UpdateUserStatusDto {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface UpdateUserRoleDto {
  role: 'ADMIN' | 'USER';
}

class AdminService {
  async getPlatformStats(): Promise<PlatformStats> {
    const response = await api.get('/admin/stats');
    return response.data;
  }

  async getPlatformAnalytics(days: number = 30): Promise<PlatformAnalytics> {
    const response = await api.get(`/admin/analytics/overview?days=${days}`);
    return response.data;
  }

  async getRevenueAnalytics(days: number = 30) {
    const response = await api.get(`/admin/analytics/revenue?days=${days}`);
    return response.data;
  }

  async getGrowthMetrics(days: number = 30) {
    const response = await api.get(`/admin/analytics/growth?days=${days}`);
    return response.data;
  }

  async getTopOrganizations(limit: number = 10) {
    const response = await api.get(`/admin/analytics/top-organizations?limit=${limit}`);
    return response.data;
  }

  async getAllUsers(params: GetUsersParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);
    if (params.role) searchParams.append('role', params.role);

    const response = await api.get(`/admin/users?${searchParams.toString()}`);
    return response.data;
  }

  async getAllOrganizations(params: GetOrganizationsParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.search) searchParams.append('search', params.search);

    const response = await api.get(`/admin/organizations?${searchParams.toString()}`);
    return response.data;
  }

  async updateUserStatus(userId: string, data: UpdateUserStatusDto) {
    const response = await api.patch(`/admin/users/${userId}/status`, data);
    return response.data;
  }

  async updateUserRole(userId: string, data: UpdateUserRoleDto) {
    const response = await api.patch(`/admin/users/${userId}/role`, data);
    return response.data;
  }

  async deleteUser(userId: string) {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  }

  async deleteOrganization(organizationId: string) {
    const response = await api.delete(`/admin/organizations/${organizationId}`);
    return response.data;
  }

  async getUserDetails(id: string): Promise<UserDetails> {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  }

  async getOrganizationVenues(id: string): Promise<OrganizationVenuesResponse> {
    const response = await api.get(`/admin/organizations/${id}/venues`);
    return response.data;
  }

  async getOrganizationMembers(id: string): Promise<OrganizationMembersResponse> {
    const response = await api.get(`/admin/organizations/${id}/members`);
    return response.data;
  }

  async getSystemInfo(): Promise<SystemInfo> {
    const response = await api.get('/admin/system-info');
    return response.data;
  }

  // Subscription Management
  async getAllSubscriptions(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    billingCycle?: string;
    organizationType?: string;
  }) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/admin/subscriptions?${queryParams}`);
    return response.data;
  }

  async getSubscriptionStats() {
    const response = await api.get('/admin/subscriptions/stats');
    return response.data;
  }

  async getSubscriptionById(id: string) {
    const response = await api.get(`/admin/subscriptions/${id}`);
    return response.data;
  }

  async updateSubscriptionStatus(id: string, status: string, reason?: string) {
    const response = await api.patch(`/admin/subscriptions/${id}/status`, {
      status,
      reason,
    });
    return response.data;
  }

  async pauseSubscription(id: string, reason?: string, resumeDate?: string) {
    const response = await api.post(`/admin/subscriptions/${id}/pause`, {
      reason,
      resumeDate,
    });
    return response.data;
  }

  async cancelSubscription(id: string, immediate: boolean = false, reason?: string, offerRefund: boolean = false) {
    const response = await api.post(`/admin/subscriptions/${id}/cancel`, {
      immediate,
      reason,
      offerRefund,
    });
    return response.data;
  }

  async modifySubscription(id: string, modifications: {
    planId?: string;
    billingCycle?: string;
    venuesIncluded?: number;
    immediate?: boolean;
    reason?: string;
  }) {
    const response = await api.patch(`/admin/subscriptions/${id}/modify`, modifications);
    return response.data;
  }

  // Plan Management Methods
  async getPlanStats(): Promise<PlanStatsEntity> {
    const response = await api.get('/admin/plan-management/stats');
    return response.data;
  }

  async getPlans(params: GetPlansDto = {}): Promise<PlanListResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/admin/plan-management?${queryParams}`);
    return response.data;
  }

  async getPlanById(id: string): Promise<PlanEntity> {
    const response = await api.get(`/admin/plan-management/${id}`);
    return response.data;
  }

  async createPlan(data: CreatePlanDto): Promise<PlanEntity> {
    const response = await api.post('/admin/plan-management', data);
    return response.data;
  }

  async updatePlan(id: string, data: UpdatePlanDto): Promise<PlanEntity> {
    const response = await api.patch(`/admin/plan-management/${id}`, data);
    return response.data;
  }

  async deletePlan(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/admin/plan-management/${id}`);
    return response.data;
  }

  async togglePlanStatus(id: string): Promise<PlanEntity> {
    const response = await api.patch(`/admin/plan-management/${id}/toggle-status`, {});
    return response.data;
  }

  async getPlanUsage(id: string): Promise<PlanUsageEntity> {
    const response = await api.get(`/admin/plan-management/${id}/usage`);
    return response.data;
  }

  async getPlanOrganizations(id: string, params: GetPlanOrganizationsDto = {}): Promise<PlanOrganizationsResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await api.get(`/admin/plan-management/${id}/organizations?${queryParams}`);
    return response.data;
  }
}

export const adminService = new AdminService();

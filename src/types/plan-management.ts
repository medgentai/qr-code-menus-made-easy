import { OrganizationType } from './organization';

export interface PlanEntity {
  id: string;
  name: string;
  description?: string;
  organizationType: OrganizationType;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  venuesIncluded: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  organizationCount?: number;
  subscriptionCount?: number;
}

export interface PlanListResponse {
  plans: PlanEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PlanStatsEntity {
  totalPlans: number;
  activePlans: number;
  totalOrganizations: number;
  totalSubscriptions: number;
  monthlyRevenue: number;
  annualRevenue: number;
  plansByType: Record<string, {
    plans: number;
    organizations: number;
    subscriptions: number;
    revenue: {
      monthlyRevenue: number;
      annualRevenue: number;
      totalRevenue: number;
    };
  }>;
}

export interface PlanUsageEntity {
  plan: {
    id: string;
    name: string;
    organizationType: OrganizationType;
  };
  usage: {
    totalOrganizations: number;
    activeOrganizations: number;
    totalSubscriptions: number;
    monthlySubscriptions: number;
    annualSubscriptions: number;
  };
  revenue: {
    monthlyRevenue: number;
    annualRevenue: number;
    totalRevenue: number;
  };
}

export interface PlanOrganizationEntity {
  id: string;
  name: string;
  slug: string;
  type: OrganizationType;
  planStartDate?: string;
  planEndDate?: string;
  isActive: boolean;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  venueCount: number;
  memberCount: number;
}

export interface PlanOrganizationsResponse {
  organizations: PlanOrganizationEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePlanDto {
  name: string;
  description?: string;
  organizationType: OrganizationType;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  venuesIncluded?: number;
  isActive?: boolean;
}

export interface UpdatePlanDto {
  name?: string;
  description?: string;
  organizationType?: OrganizationType;
  monthlyPrice?: number;
  annualPrice?: number;
  features?: string[];
  venuesIncluded?: number;
  isActive?: boolean;
}

export interface GetPlansDto {
  page?: number;
  limit?: number;
  search?: string;
  organizationType?: OrganizationType;
  isActive?: boolean;
}

export interface GetPlanOrganizationsDto {
  page?: number;
  limit?: number;
}

// Form types for UI components
export interface PlanFormData {
  name: string;
  description: string;
  organizationType: OrganizationType;
  monthlyPrice: string;
  annualPrice: string;
  features: string[];
  venuesIncluded: string;
  isActive: boolean;
}

export interface PlanFilters {
  search: string;
  organizationType: OrganizationType | 'ALL';
  isActive: boolean | 'ALL';
  page: number;
  limit: number;
}

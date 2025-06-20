import { api } from '@/lib/api';
import { OrganizationType, MemberRole, StaffType, InvitationStatus } from '@/types/organization';

// Organization interfaces
export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  type: OrganizationType;
  ownerId: string;
  planId?: string;
  planStartDate?: string;
  planEndDate?: string;
  isActive: boolean;
  viewOnlyMode?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: MemberRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserBasicInfo {
  id: string;
  name: string;
  email: string;
  profileImageUrl?: string;
}

export interface OrganizationMemberWithUser {
  id: string;
  role: MemberRole;
  staffType?: StaffType;
  venueIds?: string[];
  createdAt: string;
  updatedAt: string;
  user: UserBasicInfo;
}

export interface SubscriptionInfo {
  planName?: string;
  planId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface OrganizationStats {
  totalMembers: number;
  totalVenues?: number;
  totalMenus?: number;
  totalQrCodes?: number;
}

export interface OrganizationDetails {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  type: OrganizationType;
  isActive: boolean;
  viewOnlyMode?: boolean;
  createdAt: string;
  updatedAt: string;
  owner: UserBasicInfo;
  members: OrganizationMemberWithUser[];
  invitations?: OrganizationInvitation[];
  stats: OrganizationStats;
  subscription?: SubscriptionInfo;
}

// DTOs
export interface CreateOrganizationDto {
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  type: OrganizationType;
}

export interface UpdateOrganizationDto {
  name?: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  type?: OrganizationType;
  isActive?: boolean;
  viewOnlyMode?: boolean;
}

export interface AddMemberDto {
  email: string;
  role?: MemberRole;
  staffType?: StaffType;
  venueIds?: string[];
}

export interface UpdateMemberRoleDto {
  role: MemberRole;
  staffType?: StaffType;
  venueIds?: string[];
}

export interface OrganizationInvitation {
  id: string;
  email: string;
  organizationId: string;
  invitedBy: string;
  role: MemberRole;
  staffType?: StaffType;
  venueIds?: string[];
  status: InvitationStatus;
  token: string;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
  updatedAt: string;
  inviter?: UserBasicInfo;
  organization?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };
}

export interface CreateInvitationDto {
  email: string;
  role?: MemberRole;
  staffType?: StaffType;
  venueIds?: string[];
}

export interface AcceptInvitationDto {
  token: string;
}

// Organization service
const OrganizationService = {
  // Get all organizations for the current user
  getAll: async (): Promise<Organization[]> => {
    const response = await api.get<Organization[]>('/organizations');
    return response.data;
  },

  // Get organization by ID
  getById: async (id: string): Promise<Organization> => {
    const response = await api.get<Organization>(`/organizations/${id}`);
    return response.data;
  },

  // Get organization by slug
  getBySlug: async (slug: string): Promise<Organization> => {
    const response = await api.get<Organization>(`/organizations/slug/${slug}`);
    return response.data;
  },

  // Get detailed organization information
  getDetails: async (id: string): Promise<OrganizationDetails> => {
    const response = await api.get<OrganizationDetails>(`/organizations/${id}/details`);
    return response.data;
  },

  // Create a new organization
  create: async (data: CreateOrganizationDto): Promise<Organization> => {
    const response = await api.post<Organization>('/organizations', data);
    return response.data;
  },

  // Update an organization
  update: async (id: string, data: UpdateOrganizationDto): Promise<Organization> => {
    const response = await api.patch<Organization>(`/organizations/${id}`, data);
    return response.data;
  },

  // Delete an organization
  delete: async (id: string): Promise<Organization> => {
    const response = await api.delete<Organization>(`/organizations/${id}`);
    return response.data;
  },

  // Get organization members
  getMembers: async (id: string): Promise<OrganizationMember[]> => {
    const response = await api.get<OrganizationMember[]>(`/organizations/${id}/members`);
    return response.data;
  },

  // Add a member to an organization
  addMember: async (id: string, data: AddMemberDto): Promise<OrganizationMember> => {
    const response = await api.post<OrganizationMember>(`/organizations/${id}/members`, data);
    return response.data;
  },

  // Update a member's role
  updateMemberRole: async (
    id: string,
    memberId: string,
    data: UpdateMemberRoleDto
  ): Promise<OrganizationMember> => {
    const response = await api.patch<OrganizationMember>(
      `/organizations/${id}/members/${memberId}`,
      data
    );
    return response.data;
  },

  // Remove a member from an organization
  removeMember: async (id: string, memberId: string): Promise<void> => {
    await api.delete(`/organizations/${id}/members/${memberId}`);
  },

  // Leave an organization
  leaveOrganization: async (id: string): Promise<void> => {
    await api.delete(`/organizations/${id}/leave`);
  },

  // Invitation methods
  // Send an invitation
  sendInvitation: async (id: string, data: CreateInvitationDto): Promise<OrganizationInvitation> => {
    const response = await api.post<OrganizationInvitation>(`/organizations/${id}/invitations`, data);
    return response.data;
  },

  // Get all invitations for an organization
  getInvitations: async (id: string): Promise<OrganizationInvitation[]> => {
    const response = await api.get<OrganizationInvitation[]>(`/organizations/${id}/invitations`);
    return response.data;
  },

  // Cancel an invitation
  cancelInvitation: async (id: string, invitationId: string): Promise<void> => {
    await api.delete(`/organizations/${id}/invitations/${invitationId}`);
  },

  // Get invitation by token (public)
  getInvitationByToken: async (token: string): Promise<OrganizationInvitation> => {
    const response = await api.get<OrganizationInvitation>(`/invitations/${token}`);
    return response.data;
  },

  // Accept an invitation
  acceptInvitation: async (token: string): Promise<OrganizationInvitation> => {
    const response = await api.post<OrganizationInvitation>(`/invitations/${token}/accept`, {});
    return response.data;
  },
};

export default OrganizationService;

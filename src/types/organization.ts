// Organization type enum
export enum OrganizationType {
  RESTAURANT = 'RESTAURANT',
  HOTEL = 'HOTEL',
  CAFE = 'CAFE',
  FOOD_TRUCK = 'FOOD_TRUCK',
  BAR = 'BAR',
  OTHER = 'OTHER',
}

// Member role enum
export enum MemberRole {
  OWNER = 'OWNER',
  ADMINISTRATOR = 'ADMINISTRATOR',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
}

// Staff type enum
export enum StaffType {
  KITCHEN = 'KITCHEN',
  FRONT_OF_HOUSE = 'FRONT_OF_HOUSE',
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

// Organization type labels for display
export const OrganizationTypeLabels: Record<OrganizationType, string> = {
  [OrganizationType.RESTAURANT]: 'Restaurant',
  [OrganizationType.HOTEL]: 'Hotel',
  [OrganizationType.CAFE]: 'Cafe',
  [OrganizationType.FOOD_TRUCK]: 'Food Truck',
  [OrganizationType.BAR]: 'Bar',
  [OrganizationType.OTHER]: 'Other',
};

// Member role labels for display
export const MemberRoleLabels: Record<MemberRole, string> = {
  [MemberRole.OWNER]: 'Owner',
  [MemberRole.ADMINISTRATOR]: 'Administrator',
  [MemberRole.MANAGER]: 'Manager',
  [MemberRole.STAFF]: 'Staff',
};

// Staff type labels for display
export const StaffTypeLabels: Record<StaffType, string> = {
  [StaffType.KITCHEN]: 'Kitchen Staff',
  [StaffType.FRONT_OF_HOUSE]: 'Front of House',
};

// Member role descriptions
export const MemberRoleDescriptions: Record<MemberRole, string> = {
  [MemberRole.OWNER]: 'Full control over the organization, including billing and deletion',
  [MemberRole.ADMINISTRATOR]: 'Can manage all aspects except billing and organization deletion',
  [MemberRole.MANAGER]: 'Can manage menus, venues, and orders',
  [MemberRole.STAFF]: 'Can view and update orders and menus',
};

// Member role permissions (for UI display)
export const MemberRolePermissions: Record<MemberRole, string[]> = {
  [MemberRole.OWNER]: [
    'Manage organization settings',
    'Manage billing and subscription',
    'Delete organization',
    'Manage members',
    'Manage venues',
    'Manage menus',
    'Manage QR codes',
    'View analytics',
    'Manage orders',
  ],
  [MemberRole.ADMINISTRATOR]: [
    'Manage organization settings',
    'Manage members',
    'Manage venues',
    'Manage menus',
    'Manage QR codes',
    'View analytics',
    'Manage orders',
  ],
  [MemberRole.MANAGER]: [
    'Manage venues',
    'Manage menus',
    'Manage QR codes',
    'View analytics',
    'Manage orders',
  ],
  [MemberRole.STAFF]: [
    'View venues',
    'View menus',
    'View QR codes',
    'View limited analytics',
    'Manage orders',
  ],
};

// Staff type descriptions
export const StaffTypeDescriptions: Record<StaffType, string> = {
  [StaffType.KITCHEN]: 'Responsible for food and drink preparation',
  [StaffType.FRONT_OF_HOUSE]: 'Handles customer service, orders, and table management',
};

// Invitation status labels
export const InvitationStatusLabels: Record<InvitationStatus, string> = {
  [InvitationStatus.PENDING]: 'Pending',
  [InvitationStatus.ACCEPTED]: 'Accepted',
  [InvitationStatus.EXPIRED]: 'Expired',
  [InvitationStatus.CANCELLED]: 'Cancelled',
};

export const InvitationStatusDescriptions: Record<InvitationStatus, string> = {
  [InvitationStatus.PENDING]: 'Invitation has been sent and is waiting for acceptance',
  [InvitationStatus.ACCEPTED]: 'Invitation has been accepted and user is now a member',
  [InvitationStatus.EXPIRED]: 'Invitation has expired and is no longer valid',
  [InvitationStatus.CANCELLED]: 'Invitation has been cancelled by an administrator',
};

// Organization member interface
export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: MemberRole;
  staffType?: StaffType;
  venueIds?: string[];
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    profileImageUrl?: string;
  };
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
  inviter?: {
    id: string;
    name: string;
    email: string;
  };
  organization?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };
}

export interface UpdateMemberRoleDto {
  role: MemberRole;
  staffType?: StaffType;
  venueIds?: string[];
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

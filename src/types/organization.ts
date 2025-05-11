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
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
  MEMBER = 'MEMBER',
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
  [MemberRole.ADMIN]: 'Administrator',
  [MemberRole.MANAGER]: 'Manager',
  [MemberRole.STAFF]: 'Staff',
  [MemberRole.MEMBER]: 'Member',
};

// Member role descriptions
export const MemberRoleDescriptions: Record<MemberRole, string> = {
  [MemberRole.OWNER]: 'Full control over the organization, including billing and deletion',
  [MemberRole.ADMIN]: 'Can manage all aspects except billing and organization deletion',
  [MemberRole.MANAGER]: 'Can manage menus, venues, and orders',
  [MemberRole.STAFF]: 'Can view and update orders and menus',
  [MemberRole.MEMBER]: 'Basic access with limited permissions',
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
  [MemberRole.ADMIN]: [
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
  [MemberRole.MEMBER]: [
    'View venues',
    'View menus',
    'View QR codes',
    'View orders',
  ],
};

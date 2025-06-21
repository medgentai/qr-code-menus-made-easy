import { MemberRole, StaffType } from '@/types/organization';
import { Permission, PermissionGroups } from '@/types/permissions';

/**
 * Permission utility functions for role-based access control
 */

// Role-based permission mapping
export const RolePermissions: Record<MemberRole, Permission[]> = {
  [MemberRole.OWNER]: [
    ...PermissionGroups.DASHBOARD,
    ...PermissionGroups.ORGANIZATION_ADMIN,
    ...PermissionGroups.MEMBER_MANAGEMENT,
    ...PermissionGroups.VENUE_MANAGEMENT,
    ...PermissionGroups.MENU_MANAGEMENT,
    ...PermissionGroups.ORDER_MANAGEMENT,
    ...PermissionGroups.QR_CODES,
    ...PermissionGroups.SETTINGS,
  ],
  
  [MemberRole.ADMINISTRATOR]: [
    ...PermissionGroups.DASHBOARD,
    ...PermissionGroups.ORGANIZATION_BASIC,
    ...PermissionGroups.MEMBER_MANAGEMENT,
    ...PermissionGroups.VENUE_MANAGEMENT,
    ...PermissionGroups.MENU_MANAGEMENT,
    ...PermissionGroups.ORDER_MANAGEMENT,
    ...PermissionGroups.QR_CODES,
    ...PermissionGroups.SETTINGS,
    // Exclude billing and organization deletion
    Permission.EDIT_ORGANIZATION,
    Permission.MANAGE_ORGANIZATION_SETTINGS,
  ],
  
  [MemberRole.MANAGER]: [
    ...PermissionGroups.DASHBOARD,
    ...PermissionGroups.ORGANIZATION_BASIC,
    ...PermissionGroups.VENUE_MANAGEMENT,
    ...PermissionGroups.MENU_MANAGEMENT,
    ...PermissionGroups.ORDER_MANAGEMENT,
    ...PermissionGroups.QR_CODES,
    ...PermissionGroups.SETTINGS,
    // Limited member management (can't add/remove, only view)
    Permission.VIEW_MEMBERS,
  ],
  
  [MemberRole.STAFF]: [
    // Base staff permissions - extended by staff type
    ...PermissionGroups.SETTINGS,
    Permission.VIEW_DASHBOARD,
  ],
};

// Staff type-specific permission mapping
export const StaffTypePermissions: Record<StaffType, Permission[]> = {
  [StaffType.KITCHEN]: [
    ...PermissionGroups.KITCHEN_STAFF,
    ...PermissionGroups.SETTINGS,
  ],

  [StaffType.FRONT_OF_HOUSE]: [
    ...PermissionGroups.FRONT_OF_HOUSE_STAFF,
    ...PermissionGroups.MENU_BASIC,
    ...PermissionGroups.VENUE_BASIC,
    ...PermissionGroups.QR_CODES,
    ...PermissionGroups.SETTINGS,
  ],
};

/**
 * Check if a user has a specific permission based on their role and staff type
 */
export function hasPermission(
  role: MemberRole,
  permission: Permission,
  staffType?: StaffType,
  venueIds?: string[],
  currentVenueId?: string
): boolean {
  // Get base role permissions
  const rolePermissions = RolePermissions[role] || [];
  
  // For staff roles, combine with staff type permissions
  let allPermissions = [...rolePermissions];
  
  if (role === MemberRole.STAFF && staffType) {
    const staffPermissions = StaffTypePermissions[staffType] || [];
    allPermissions = [...allPermissions, ...staffPermissions];
  }
  
  // Check if user has the permission
  const hasBasePermission = allPermissions.includes(permission);
  
  // If no base permission, return false
  if (!hasBasePermission) {
    return false;
  }
  
  // For staff with venue restrictions, check venue access
  if (role === MemberRole.STAFF && venueIds && venueIds.length > 0 && currentVenueId) {
    return venueIds.includes(currentVenueId);
  }
  
  return true;
}

/**
 * Get all permissions for a user based on their role and staff type
 */
export function getUserPermissions(
  role: MemberRole,
  staffType?: StaffType
): Permission[] {
  const rolePermissions = RolePermissions[role] || [];
  
  if (role === MemberRole.STAFF && staffType) {
    const staffPermissions = StaffTypePermissions[staffType] || [];
    return [...new Set([...rolePermissions, ...staffPermissions])];
  }
  
  return rolePermissions;
}

/**
 * Check if user can access a specific route
 */
export function canAccessRoute(
  route: string,
  role: MemberRole,
  staffType?: StaffType,
  venueIds?: string[],
  currentVenueId?: string
): boolean {
  // Define route permission requirements
  const routePermissions: Record<string, Permission[]> = {
    '/dashboard': [Permission.VIEW_DASHBOARD],
    '/organizations': [Permission.VIEW_ORGANIZATIONS],
    '/venues': [Permission.VIEW_VENUES],
    '/menus': [Permission.VIEW_MENUS],
    '/orders': [Permission.VIEW_ORDERS],
    '/analytics': [Permission.VIEW_ANALYTICS],
    '/settings': [Permission.VIEW_SETTINGS],
    '/kitchen-dashboard': [Permission.VIEW_KITCHEN_ORDERS],
    '/staff-dashboard': [Permission.VIEW_DASHBOARD],
    '/tables': [Permission.MANAGE_TABLES],
  };
  
  const requiredPermissions = routePermissions[route];
  if (!requiredPermissions) {
    return true; // Allow access to routes without specific requirements
  }
  
  // Check if user has any of the required permissions
  return requiredPermissions.some(permission =>
    hasPermission(role, permission, staffType, venueIds, currentVenueId)
  );
}

/**
 * Get the appropriate dashboard route for a user based on their role and staff type
 */
export function getDashboardRoute(role: MemberRole, staffType?: StaffType): string {
  if (role === MemberRole.STAFF && staffType) {
    switch (staffType) {
      case StaffType.KITCHEN:
        return '/kitchen-dashboard';
      case StaffType.FRONT_OF_HOUSE:
        // Front of house staff go to orders page instead of a separate dashboard
        return '/dashboard';
      default:
        return '/dashboard';
    }
  }

  return '/dashboard';
}

/**
 * Filter navigation items based on user permissions
 */
export function filterNavigationItems(
  navigationItems: any[],
  role: MemberRole,
  staffType?: StaffType,
  venueIds?: string[],
  currentVenueId?: string
): any[] {
  return navigationItems.filter(item => {
    if (!item.permissions || item.permissions.length === 0) {
      return true;
    }
    
    return item.permissions.some((permission: Permission) =>
      hasPermission(role, permission, staffType, venueIds, currentVenueId)
    );
  });
}

/**
 * Check if user should see organization-level features
 */
export function canManageOrganization(role: MemberRole): boolean {
  return [MemberRole.OWNER, MemberRole.ADMINISTRATOR].includes(role);
}

/**
 * Check if user should see venue-level features
 */
export function canManageVenues(role: MemberRole): boolean {
  return [MemberRole.OWNER, MemberRole.ADMINISTRATOR, MemberRole.MANAGER].includes(role);
}

/**
 * Check if user should see member management features
 */
export function canManageMembers(role: MemberRole): boolean {
  return [MemberRole.OWNER, MemberRole.ADMINISTRATOR].includes(role);
}

/**
 * Get order statuses that a user should see based on their role and staff type
 */
export function getAllowedOrderStatuses(role: MemberRole, staffType?: StaffType): string[] | null {
  // Return null for full access (no filtering)
  if ([MemberRole.OWNER, MemberRole.ADMINISTRATOR, MemberRole.MANAGER].includes(role)) {
    return null; // Can see all order statuses
  }

  if (role === MemberRole.STAFF && staffType) {
    switch (staffType) {
      case StaffType.KITCHEN:
        // Kitchen staff should see orders they need to work on
        return ['CONFIRMED', 'PREPARING', 'READY'];
      case StaffType.FRONT_OF_HOUSE:
        // Front of house staff should see the full customer service workflow including SERVED
        return ['PENDING', 'CONFIRMED', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'];
      default:
        return ['PENDING', 'CONFIRMED']; // Default limited view
    }
  }

  return null; // Default to no filtering for other roles
}

/**
 * Check if a user can perform specific order actions based on their role and staff type
 */
export function canPerformOrderAction(
  action: 'create' | 'edit' | 'cancel' | 'updateStatus' | 'delete',
  role: MemberRole,
  staffType?: StaffType,
  orderStatus?: string
): boolean {
  // Full access roles
  if ([MemberRole.OWNER, MemberRole.ADMINISTRATOR, MemberRole.MANAGER].includes(role)) {
    return true;
  }

  if (role === MemberRole.STAFF && staffType) {
    switch (staffType) {
      case StaffType.KITCHEN:
        // Kitchen staff can only update status for their workflow
        if (action === 'updateStatus') {
          return ['CONFIRMED', 'PREPARING', 'READY'].includes(orderStatus || '');
        }
        return false;
      case StaffType.FRONT_OF_HOUSE:
        // Front of house can create orders, edit orders, and update status for service workflow
        if (action === 'create') return true;
        if (action === 'edit') return true; // Front of house can edit orders
        if (action === 'updateStatus') {
          return ['PENDING', 'CONFIRMED', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'].includes(orderStatus || '');
        }
        return false;
      default:
        return false;
    }
  }

  return false;
}

/**
 * Get user's access level description
 */
export function getAccessLevelDescription(role: MemberRole, staffType?: StaffType): string {
  if (role === MemberRole.STAFF && staffType) {
    switch (staffType) {
      case StaffType.KITCHEN:
        return 'Kitchen operations and order management';
      case StaffType.FRONT_OF_HOUSE:
        return 'Customer service and table management';
      default:
        return 'Staff-level access';
    }
  }

  switch (role) {
    case MemberRole.OWNER:
      return 'Full system access including billing and organization management';
    case MemberRole.ADMINISTRATOR:
      return 'Administrative access to all features except billing';
    case MemberRole.MANAGER:
      return 'Venue and operations management';
    default:
      return 'Limited access based on role';
  }
}

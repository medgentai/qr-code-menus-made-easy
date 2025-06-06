import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import { useVenue } from '@/contexts/venue-context';
import { MemberRole, StaffType } from '@/types/organization';
import { Permission } from '@/types/permissions';
import {
  hasPermission,
  getUserPermissions,
  canAccessRoute,
  getDashboardRoute,
  filterNavigationItems,
  canManageOrganization,
  canManageVenues,
  canManageMembers,
  getAccessLevelDescription,
} from '@/lib/permissions';

// Permission context interface
export interface PermissionContextType {
  // Current user's role and staff type
  userRole: MemberRole | null;
  userStaffType: StaffType | null;
  userVenueIds: string[];
  
  // Permission checking functions
  hasPermission: (permission: Permission, venueId?: string) => boolean;
  canAccessRoute: (route: string) => boolean;
  getUserPermissions: () => Permission[];
  
  // Navigation and routing
  getDashboardRoute: () => string;
  filterNavigationItems: (items: any[]) => any[];
  
  // Role-based feature access
  canManageOrganization: boolean;
  canManageVenues: boolean;
  canManageMembers: boolean;
  
  // User access description
  accessLevelDescription: string;
  
  // Loading state
  isLoading: boolean;
}

// Create the permission context
const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

// Permission provider props
interface PermissionProviderProps {
  children: React.ReactNode;
}

// Permission provider component
export const PermissionProvider: React.FC<PermissionProviderProps> = ({ children }) => {
  const { state: { user, isLoading: authLoading } } = useAuth();
  const { currentOrganizationDetails, isLoading: orgLoading } = useOrganization();
  const { currentVenue } = useVenue();

  // Get current user's organization membership details
  const currentMember = useMemo(() => {
    if (!user || !currentOrganizationDetails) return null;
    
    return currentOrganizationDetails.members.find(
      member => member.user.id === user.id
    );
  }, [user, currentOrganizationDetails]);

  // Extract user role and staff type
  const userRole = useMemo(() => {
    if (!currentMember) return null;
    return currentMember.role;
  }, [currentMember]);

  const userStaffType = useMemo(() => {
    if (!currentMember || currentMember.role !== MemberRole.STAFF) return null;
    return currentMember.staffType || null;
  }, [currentMember]);

  const userVenueIds = useMemo(() => {
    if (!currentMember || currentMember.role !== MemberRole.STAFF) return [];
    return currentMember.venueIds || [];
  }, [currentMember]);

  // Permission checking function
  const checkPermission = useMemo(() => {
    return (permission: Permission, venueId?: string) => {
      if (!userRole) return false;
      
      const targetVenueId = venueId || currentVenue?.id;
      return hasPermission(userRole, permission, userStaffType || undefined, userVenueIds, targetVenueId);
    };
  }, [userRole, userStaffType, userVenueIds, currentVenue]);

  // Route access checking function
  const checkRouteAccess = useMemo(() => {
    return (route: string) => {
      if (!userRole) return false;
      
      return canAccessRoute(route, userRole, userStaffType || undefined, userVenueIds, currentVenue?.id);
    };
  }, [userRole, userStaffType, userVenueIds, currentVenue]);

  // Get user permissions function
  const getPermissions = useMemo(() => {
    return () => {
      if (!userRole) return [];
      return getUserPermissions(userRole, userStaffType || undefined);
    };
  }, [userRole, userStaffType]);

  // Get dashboard route function
  const getDashboard = useMemo(() => {
    return () => {
      if (!userRole) return '/dashboard';
      return getDashboardRoute(userRole, userStaffType || undefined);
    };
  }, [userRole, userStaffType]);

  // Filter navigation items function
  const filterNavigation = useMemo(() => {
    return (items: any[]) => {
      if (!userRole) return [];
      return filterNavigationItems(items, userRole, userStaffType || undefined, userVenueIds, currentVenue?.id);
    };
  }, [userRole, userStaffType, userVenueIds, currentVenue]);

  // Role-based feature access flags
  const canManageOrg = useMemo(() => {
    if (!userRole) return false;
    return canManageOrganization(userRole);
  }, [userRole]);

  const canManageVen = useMemo(() => {
    if (!userRole) return false;
    return canManageVenues(userRole);
  }, [userRole]);

  const canManageMem = useMemo(() => {
    if (!userRole) return false;
    return canManageMembers(userRole);
  }, [userRole]);

  // Access level description
  const accessDescription = useMemo(() => {
    if (!userRole) return 'No access';
    return getAccessLevelDescription(userRole, userStaffType || undefined);
  }, [userRole, userStaffType]);

  // Loading state
  const isLoading = authLoading || orgLoading;

  // Context value
  const value: PermissionContextType = {
    userRole,
    userStaffType,
    userVenueIds,
    hasPermission: checkPermission,
    canAccessRoute: checkRouteAccess,
    getUserPermissions: getPermissions,
    getDashboardRoute: getDashboard,
    filterNavigationItems: filterNavigation,
    canManageOrganization: canManageOrg,
    canManageVenues: canManageVen,
    canManageMembers: canManageMem,
    accessLevelDescription: accessDescription,
    isLoading,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

// Hook to use the permission context
export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};

// Permission-based component wrapper
interface PermissionGateProps {
  permission: Permission;
  venueId?: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  venueId,
  fallback = null,
  children,
}) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(permission, venueId)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// Role-based component wrapper
interface RoleGateProps {
  allowedRoles: MemberRole[];
  allowedStaffTypes?: StaffType[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({
  allowedRoles,
  allowedStaffTypes,
  fallback = null,
  children,
}) => {
  const { userRole, userStaffType } = usePermissions();
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }
  
  // If staff type restrictions are specified and user is staff
  if (userRole === MemberRole.STAFF && allowedStaffTypes && userStaffType) {
    if (!allowedStaffTypes.includes(userStaffType)) {
      return <>{fallback}</>;
    }
  }
  
  return <>{children}</>;
};

export default PermissionProvider;

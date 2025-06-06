import React, { createContext, useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { usePermissions } from '@/contexts/permission-context';
import { useOrganization } from '@/contexts/organization-context';
import { MemberRole, StaffType } from '@/types/organization';
import { Permission } from '@/types/permissions';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  User,
  MapPin,
  Menu,
  ShoppingCart,
  BarChart3,
  Settings,
  Users,
  ChefHat,
  Table,
  QrCode,
} from 'lucide-react';

// Navigation item interface
export interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
  permissions: Permission[];
  children?: NavigationItem[];
  badge?: string;
  isActive?: boolean;
}

// Navigation context interface
export interface NavigationContextType {
  // Navigation items
  navigationItems: NavigationItem[];
  filteredNavigationItems: NavigationItem[];
  
  // Current navigation state
  currentPath: string;
  isActive: (path: string) => boolean;
  
  // Role-based navigation
  getDefaultRoute: () => string;
  shouldShowNavigation: boolean;
  
  // Navigation helpers
  getNavigationForRole: (role: MemberRole, staffType?: StaffType) => NavigationItem[];
}

// Create the navigation context
const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// Navigation provider props
interface NavigationProviderProps {
  children: React.ReactNode;
}

// Base navigation configuration for management roles
const baseNavigationItems: NavigationItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    permissions: [Permission.VIEW_DASHBOARD],
  },
  {
    path: '/organizations',
    label: 'Organizations',
    icon: Building2,
    permissions: [Permission.VIEW_ORGANIZATIONS],
  },
  {
    path: '/subscriptions',
    label: 'Subscriptions',
    icon: CreditCard,
    permissions: [Permission.MANAGE_BILLING],
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: User,
    permissions: [Permission.MANAGE_PROFILE],
  },
];

// Staff-specific navigation configurations (templates)
const staffNavigationTemplates: Record<StaffType, Omit<NavigationItem, 'path'>[]> = {
  [StaffType.KITCHEN]: [
    {
      label: 'Kitchen Dashboard',
      icon: ChefHat,
      permissions: [Permission.VIEW_KITCHEN_ORDERS],
    },
    {
      label: 'Menus',
      icon: Menu,
      permissions: [Permission.VIEW_MENUS],
    },
    {
      label: 'Settings',
      icon: Settings,
      permissions: [Permission.VIEW_SETTINGS],
    },
  ],

  [StaffType.FRONT_OF_HOUSE]: [
    {
      label: 'Orders',
      icon: ShoppingCart,
      permissions: [Permission.VIEW_ORDERS],
    },
    {
      label: 'Menus',
      icon: Menu,
      permissions: [Permission.VIEW_MENUS],
    },
    {
      label: 'QR Codes',
      icon: QrCode,
      permissions: [Permission.VIEW_QR_CODES],
    },
    {
      label: 'Settings',
      icon: Settings,
      permissions: [Permission.VIEW_SETTINGS],
    },
  ],


};

// Function to generate staff navigation items with organization-specific paths
const generateStaffNavigationItems = (
  staffType: StaffType,
  organizationId: string
): NavigationItem[] => {
  const templates = staffNavigationTemplates[staffType] || [];

  return templates.map(template => {
    let path: string;

    // Generate appropriate paths based on the label
    switch (template.label) {
      case 'Kitchen Dashboard':
        path = '/kitchen-dashboard';
        break;

      case 'Orders':
        path = `/organizations/${organizationId}/orders`;
        break;
      case 'Menus':
        path = `/organizations/${organizationId}/menus`;
        break;
      case 'Venues':
        path = `/organizations/${organizationId}/venues`;
        break;
      case 'Tables':
        path = `/organizations/${organizationId}/venues`; // Tables are under venues
        break;
      case 'QR Codes':
        path = `/organizations/${organizationId}/qrcodes`;
        break;
      case 'Settings':
        path = '/profile'; // Staff settings go to profile
        break;
      default:
        path = '/dashboard';
    }

    return {
      ...template,
      path,
    };
  });
};

// Navigation provider component
export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const location = useLocation();
  const { userRole, userStaffType, hasPermission, getDashboardRoute } = usePermissions();
  const { currentOrganization } = useOrganization();

  // Get navigation items based on user role and staff type
  const navigationItems = useMemo(() => {
    if (!userRole) return [];

    // For staff users, use staff-specific navigation with organization-specific paths
    if (userRole === MemberRole.STAFF && userStaffType && currentOrganization) {
      return generateStaffNavigationItems(userStaffType, currentOrganization.id);
    }

    // For non-staff users, use base navigation
    return baseNavigationItems;
  }, [userRole, userStaffType, currentOrganization]);

  // Check if a path is active
  const isActive = (path: string): boolean => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' ||
             location.pathname === '/kitchen-dashboard' ||
             location.pathname === '/staff-dashboard';
    }

    return location.pathname.startsWith(path);
  };

  // Filter navigation items based on permissions
  const filteredNavigationItems = useMemo(() => {
    return navigationItems.filter(item => {
      if (!item.permissions || item.permissions.length === 0) {
        return true;
      }

      return item.permissions.some(permission => hasPermission(permission));
    }).map(item => ({
      ...item,
      isActive: isActive(item.path),
    }));
  }, [navigationItems, hasPermission, location.pathname]);

  // Get default route for user
  const getDefaultRoute = (): string => {
    return getDashboardRoute();
  };

  // Determine if navigation should be shown
  const shouldShowNavigation = useMemo(() => {
    // Don't show navigation on public routes
    const publicRoutes = ['/', '/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'];
    const isPublicRoute = publicRoutes.some(route => 
      location.pathname === route || location.pathname.startsWith('/auth/')
    );
    
    return !isPublicRoute && !!userRole;
  }, [location.pathname, userRole]);

  // Get navigation for specific role (utility function)
  const getNavigationForRole = (role: MemberRole, staffType?: StaffType): NavigationItem[] => {
    if (role === MemberRole.STAFF && staffType && currentOrganization) {
      return generateStaffNavigationItems(staffType, currentOrganization.id);
    }
    return baseNavigationItems;
  };

  // Context value
  const value: NavigationContextType = {
    navigationItems,
    filteredNavigationItems,
    currentPath: location.pathname,
    isActive,
    getDefaultRoute,
    shouldShowNavigation,
    getNavigationForRole,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

// Hook to use the navigation context
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export default NavigationProvider;

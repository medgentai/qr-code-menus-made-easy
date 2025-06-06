// Permission types for role-based access control
export enum Permission {
  // Dashboard permissions
  VIEW_DASHBOARD = 'VIEW_DASHBOARD',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  
  // Organization permissions
  VIEW_ORGANIZATIONS = 'VIEW_ORGANIZATIONS',
  CREATE_ORGANIZATION = 'CREATE_ORGANIZATION',
  EDIT_ORGANIZATION = 'EDIT_ORGANIZATION',
  DELETE_ORGANIZATION = 'DELETE_ORGANIZATION',
  MANAGE_ORGANIZATION_SETTINGS = 'MANAGE_ORGANIZATION_SETTINGS',
  MANAGE_BILLING = 'MANAGE_BILLING',
  
  // Member management permissions
  VIEW_MEMBERS = 'VIEW_MEMBERS',
  ADD_MEMBERS = 'ADD_MEMBERS',
  EDIT_MEMBER_ROLES = 'EDIT_MEMBER_ROLES',
  REMOVE_MEMBERS = 'REMOVE_MEMBERS',
  
  // Venue permissions
  VIEW_VENUES = 'VIEW_VENUES',
  CREATE_VENUE = 'CREATE_VENUE',
  EDIT_VENUE = 'EDIT_VENUE',
  DELETE_VENUE = 'DELETE_VENUE',
  MANAGE_VENUE_SETTINGS = 'MANAGE_VENUE_SETTINGS',
  
  // Menu permissions
  VIEW_MENUS = 'VIEW_MENUS',
  CREATE_MENU = 'CREATE_MENU',
  EDIT_MENU = 'EDIT_MENU',
  DELETE_MENU = 'DELETE_MENU',
  MANAGE_MENU_ITEMS = 'MANAGE_MENU_ITEMS',
  
  // Order permissions
  VIEW_ORDERS = 'VIEW_ORDERS',
  CREATE_ORDER = 'CREATE_ORDER',
  EDIT_ORDER = 'EDIT_ORDER',
  CANCEL_ORDER = 'CANCEL_ORDER',
  MANAGE_ORDER_STATUS = 'MANAGE_ORDER_STATUS',
  
  // Kitchen-specific permissions
  VIEW_KITCHEN_ORDERS = 'VIEW_KITCHEN_ORDERS',
  MARK_ORDER_READY = 'MARK_ORDER_READY',
  MANAGE_KITCHEN_QUEUE = 'MANAGE_KITCHEN_QUEUE',
  
  // Front of house permissions
  TAKE_ORDERS = 'TAKE_ORDERS',
  MANAGE_TABLES = 'MANAGE_TABLES',
  SERVE_CUSTOMERS = 'SERVE_CUSTOMERS',
  HANDLE_PAYMENTS = 'HANDLE_PAYMENTS',
  
  // QR Code permissions
  VIEW_QR_CODES = 'VIEW_QR_CODES',
  GENERATE_QR_CODES = 'GENERATE_QR_CODES',
  
  // Settings permissions
  VIEW_SETTINGS = 'VIEW_SETTINGS',
  MANAGE_PROFILE = 'MANAGE_PROFILE',
}

// Permission groups for easier management
export const PermissionGroups = {
  DASHBOARD: [Permission.VIEW_DASHBOARD, Permission.VIEW_ANALYTICS],
  
  ORGANIZATION_ADMIN: [
    Permission.VIEW_ORGANIZATIONS,
    Permission.CREATE_ORGANIZATION,
    Permission.EDIT_ORGANIZATION,
    Permission.DELETE_ORGANIZATION,
    Permission.MANAGE_ORGANIZATION_SETTINGS,
    Permission.MANAGE_BILLING,
  ],
  
  ORGANIZATION_BASIC: [
    Permission.VIEW_ORGANIZATIONS,
  ],
  
  MEMBER_MANAGEMENT: [
    Permission.VIEW_MEMBERS,
    Permission.ADD_MEMBERS,
    Permission.EDIT_MEMBER_ROLES,
    Permission.REMOVE_MEMBERS,
  ],
  
  VENUE_MANAGEMENT: [
    Permission.VIEW_VENUES,
    Permission.CREATE_VENUE,
    Permission.EDIT_VENUE,
    Permission.DELETE_VENUE,
    Permission.MANAGE_VENUE_SETTINGS,
  ],
  
  VENUE_BASIC: [
    Permission.VIEW_VENUES,
  ],
  
  MENU_MANAGEMENT: [
    Permission.VIEW_MENUS,
    Permission.CREATE_MENU,
    Permission.EDIT_MENU,
    Permission.DELETE_MENU,
    Permission.MANAGE_MENU_ITEMS,
  ],
  
  MENU_BASIC: [
    Permission.VIEW_MENUS,
  ],
  
  ORDER_MANAGEMENT: [
    Permission.VIEW_ORDERS,
    Permission.CREATE_ORDER,
    Permission.EDIT_ORDER,
    Permission.CANCEL_ORDER,
    Permission.MANAGE_ORDER_STATUS,
  ],
  
  ORDER_BASIC: [
    Permission.VIEW_ORDERS,
  ],
  
  KITCHEN_STAFF: [
    Permission.VIEW_KITCHEN_ORDERS,
    Permission.MARK_ORDER_READY,
    Permission.MANAGE_KITCHEN_QUEUE,
    Permission.VIEW_ORDERS,
    Permission.MANAGE_ORDER_STATUS,
  ],
  
  FRONT_OF_HOUSE_STAFF: [
    Permission.TAKE_ORDERS,
    Permission.SERVE_CUSTOMERS,
    Permission.HANDLE_PAYMENTS,
    Permission.VIEW_ORDERS,
    Permission.CREATE_ORDER,
    Permission.MANAGE_ORDER_STATUS,
  ],
  

  
  QR_CODES: [
    Permission.VIEW_QR_CODES,
    Permission.GENERATE_QR_CODES,
  ],
  
  SETTINGS: [
    Permission.VIEW_SETTINGS,
    Permission.MANAGE_PROFILE,
  ],
};

// Navigation items with their required permissions
export interface NavigationItem {
  path: string;
  label: string;
  icon: string;
  permissions: Permission[];
  children?: NavigationItem[];
}

export const NavigationConfig: NavigationItem[] = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    permissions: [Permission.VIEW_DASHBOARD],
  },
  {
    path: '/organizations',
    label: 'Organizations',
    icon: 'Building2',
    permissions: [Permission.VIEW_ORGANIZATIONS],
  },
  {
    path: '/venues',
    label: 'Venues',
    icon: 'MapPin',
    permissions: [Permission.VIEW_VENUES],
  },
  {
    path: '/menus',
    label: 'Menus',
    icon: 'Menu',
    permissions: [Permission.VIEW_MENUS],
  },
  {
    path: '/orders',
    label: 'Orders',
    icon: 'ShoppingCart',
    permissions: [Permission.VIEW_ORDERS],
  },
  {
    path: '/analytics',
    label: 'Analytics',
    icon: 'BarChart3',
    permissions: [Permission.VIEW_ANALYTICS],
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: 'Settings',
    permissions: [Permission.VIEW_SETTINGS],
  },
];

// Staff-specific navigation configurations
export const StaffNavigationConfig = {
  KITCHEN: [
    {
      path: '/kitchen-dashboard',
      label: 'Kitchen Dashboard',
      icon: 'ChefHat',
      permissions: [Permission.VIEW_KITCHEN_ORDERS],
    },
    {
      path: '/menus',
      label: 'Menus',
      icon: 'Menu',
      permissions: [Permission.VIEW_MENUS],
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: 'Settings',
      permissions: [Permission.VIEW_SETTINGS],
    },
  ],
  
  FRONT_OF_HOUSE: [
    {
      path: '/orders',
      label: 'Orders',
      icon: 'ShoppingCart',
      permissions: [Permission.VIEW_ORDERS],
    },
    {
      path: '/menus',
      label: 'Menus',
      icon: 'Menu',
      permissions: [Permission.VIEW_MENUS],
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: 'Settings',
      permissions: [Permission.VIEW_SETTINGS],
    },
  ],
  

};

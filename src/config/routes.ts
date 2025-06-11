/**
 * Centralized route configuration for the application
 * This file defines which routes are public vs protected
 */

export interface RouteConfig {
  path: string;
  isPublic: boolean;
  exact?: boolean;
}

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES: RouteConfig[] = [
  // Landing pages
  { path: '/', isPublic: true, exact: true },
  { path: '/features', isPublic: true },
  { path: '/how-it-works', isPublic: true },
  { path: '/use-cases', isPublic: true },
  { path: '/use-cases/restaurants', isPublic: true },
  { path: '/use-cases/hotels', isPublic: true },
  { path: '/use-cases/cafes', isPublic: true },
  { path: '/use-cases/food-trucks', isPublic: true },
  { path: '/pricing', isPublic: true },
  { path: '/contact', isPublic: true },
  { path: '/get-started', isPublic: true },
  { path: '/about', isPublic: true },
  { path: '/blog', isPublic: true },

  // Authentication routes
  { path: '/login', isPublic: true },
  { path: '/register', isPublic: true },
  { path: '/verify-otp', isPublic: true },
  { path: '/forgot-password', isPublic: true },
  { path: '/reset-password', isPublic: true },
  { path: '/account-suspended', isPublic: true },

  // Legacy auth routes (backward compatibility)
  { path: '/auth/login', isPublic: true },
  { path: '/auth/register', isPublic: true },
  { path: '/auth/verify-otp', isPublic: true },
  { path: '/auth/forgot-password', isPublic: true },
  { path: '/auth/reset-password', isPublic: true },
];

/**
 * Protected route prefixes that require authentication
 */
export const PROTECTED_ROUTE_PREFIXES = [
  '/dashboard',
  '/profile',
  '/organizations',
  '/venues',
  '/menus',
  '/orders',
  '/analytics',
  '/settings',
  '/admin',
];

/**
 * Check if a given path is a public route
 * @param pathname - The pathname to check
 * @returns true if the route is public, false if protected
 */
export const isPublicRoute = (pathname: string): boolean => {
  // Check exact matches first
  const exactMatch = PUBLIC_ROUTES.find(route => 
    route.exact ? route.path === pathname : route.path === pathname
  );
  
  if (exactMatch) {
    return true;
  }

  // Check if path starts with any protected prefix
  const isProtected = PROTECTED_ROUTE_PREFIXES.some(prefix => 
    pathname.startsWith(prefix)
  );
  
  if (isProtected) {
    return false;
  }

  // For dynamic routes like /:slug (organization public menus)
  // If it's a single segment path and not in protected prefixes, it's likely public
  const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
  
  if (pathSegments.length === 1) {
    // This is likely an organization slug route (public menu)
    return true;
  }

  // Default to protected for unknown multi-segment routes
  return false;
};

/**
 * Check if the current location is a public route
 * @param location - React Router location object
 * @returns true if the current route is public
 */
export const isCurrentRoutePublic = (location: { pathname: string }): boolean => {
  return isPublicRoute(location.pathname);
};

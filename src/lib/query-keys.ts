/**
 * Centralized query key factory for consistent caching and invalidation
 * This ensures all queries use the same key structure and can be invalidated efficiently
 */

// Base query key types
export type QueryKeyBase = readonly unknown[];

// Auth related query keys
export const authKeys = {
  all: ['auth'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  user: () => [...authKeys.all, 'user'] as const,
} as const;

// Organization related query keys
export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: (filters: Record<string, any> = {}) => [...organizationKeys.lists(), filters] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (id: string) => [...organizationKeys.details(), id] as const,
  members: (id: string) => [...organizationKeys.detail(id), 'members'] as const,
  invitations: (id: string) => [...organizationKeys.detail(id), 'invitations'] as const,
} as const;

// Venue related query keys
export const venueKeys = {
  all: ['venues'] as const,
  lists: () => [...venueKeys.all, 'list'] as const,
  list: (filters: Record<string, any> = {}) => [...venueKeys.lists(), filters] as const,
  byOrganization: (orgId: string) => [...venueKeys.lists(), 'organization', orgId] as const,
  details: () => [...venueKeys.all, 'detail'] as const,
  detail: (id: string) => [...venueKeys.details(), id] as const,
  tables: (venueId: string) => [...venueKeys.detail(venueId), 'tables'] as const,
} as const;

// Menu related query keys
export const menuKeys = {
  all: ['menus'] as const,
  lists: () => [...menuKeys.all, 'list'] as const,
  list: (filters: Record<string, any> = {}) => [...menuKeys.lists(), filters] as const,
  byOrganization: (orgId: string) => [...menuKeys.lists(), 'organization', orgId] as const,
  details: () => [...menuKeys.all, 'detail'] as const,
  detail: (id: string) => [...menuKeys.details(), id] as const,
  categories: (menuId: string) => [...menuKeys.detail(menuId), 'categories'] as const,
  items: (categoryId: string) => [...menuKeys.all, 'category', categoryId, 'items'] as const,
} as const;

// Order related query keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: Record<string, any> = {}) => [...orderKeys.lists(), filters] as const,
  infinite: (filters: Record<string, any> = {}) => [...orderKeys.lists(), 'infinite', filters] as const,
  byOrganization: (orgId: string, status?: string) => 
    [...orderKeys.lists(), 'organization', orgId, ...(status ? [status] : [])] as const,
  byVenue: (venueId: string, status?: string) => 
    [...orderKeys.lists(), 'venue', venueId, ...(status ? [status] : [])] as const,
  filtered: (filters: Record<string, any>) => [...orderKeys.lists(), 'filtered', filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  analytics: () => [...orderKeys.all, 'analytics'] as const,
  activeCount: (orgId: string) => [...orderKeys.analytics(), 'activeCount', orgId] as const,
  recentActive: (orgId: string) => [...orderKeys.analytics(), 'recentActive', orgId] as const,
} as const;

// Analytics related query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: () => [...analyticsKeys.all, 'dashboard'] as const,
  dashboardByOrg: (orgId: string, venueId?: string, days?: number) => [
    ...analyticsKeys.dashboard(),
    orgId,
    ...(venueId ? [venueId] : []),
    ...(days ? [days] : [])
  ] as const,
  reports: () => [...analyticsKeys.all, 'reports'] as const,
  report: (type: string, filters: Record<string, any> = {}) => 
    [...analyticsKeys.reports(), type, filters] as const,
} as const;

// Upload related query keys
export const uploadKeys = {
  all: ['uploads'] as const,
  images: () => [...uploadKeys.all, 'images'] as const,
  image: (id: string) => [...uploadKeys.images(), id] as const,
} as const;

// Plans related query keys
export const planKeys = {
  all: ['plans'] as const,
  list: () => [...planKeys.all, 'list'] as const,
  detail: (id: string) => [...planKeys.all, 'detail', id] as const,
} as const;

// Notification related query keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: Record<string, any> = {}) => [...notificationKeys.lists(), filters] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
} as const;

// Helper function to invalidate related queries
export const getRelatedQueryKeys = (entityType: string, entityId: string) => {
  switch (entityType) {
    case 'organization':
      return [
        organizationKeys.detail(entityId),
        venueKeys.byOrganization(entityId),
        menuKeys.byOrganization(entityId),
        orderKeys.byOrganization(entityId),
        analyticsKeys.dashboardByOrg(entityId),
      ];
    case 'venue':
      return [
        venueKeys.detail(entityId),
        venueKeys.tables(entityId),
        orderKeys.byVenue(entityId),
      ];
    case 'menu':
      return [
        menuKeys.detail(entityId),
        menuKeys.categories(entityId),
      ];
    case 'order':
      return [
        orderKeys.detail(entityId),
        orderKeys.lists(),
        analyticsKeys.dashboard(),
      ];
    default:
      return [];
  }
};

// Helper function to get cache tags for efficient invalidation
export const getCacheTags = (queryKey: QueryKeyBase): string[] => {
  const tags: string[] = [];
  
  if (queryKey.includes('organizations')) tags.push('organization');
  if (queryKey.includes('venues')) tags.push('venue');
  if (queryKey.includes('menus')) tags.push('menu');
  if (queryKey.includes('orders')) tags.push('order');
  if (queryKey.includes('analytics')) tags.push('analytics');
  
  return tags;
};

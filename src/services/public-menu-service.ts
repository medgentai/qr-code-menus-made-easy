import { api } from '@/lib/api';
import { Menu } from './menu-service';

// Public menu service interfaces
export interface PublicMenu extends Menu {
  organization?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    viewOnlyMode?: boolean;
  };
  table?: {
    id: string;
    name: string;
    capacity?: number | null;
  };
  venue?: {
    id: string;
    name: string;
    viewOnlyMode?: boolean;
  };
  viewOnlyMode?: boolean;
}

// Public menu service
const PublicMenuService = {
  // Get menus by organization slug
  getMenusByOrganizationSlug: async (slug: string): Promise<PublicMenu[]> => {
    const response = await api.get<PublicMenu[]>(`/public/menus/organization/${slug}`);
    return response.data;
  },

  // Get menu by ID
  getMenuById: async (id: string): Promise<PublicMenu> => {
    const response = await api.get<PublicMenu>(`/public/menus/${id}`);
    return response.data;
  },

  // Get menu by organization slug and optional table or venue
  getMenuByOrganizationAndTable: async (
    slug: string,
    tableId?: string,
    venueId?: string
  ): Promise<PublicMenu> => {
    let url = `/public/organization/${slug}/menu`;
    const params = new URLSearchParams();

    if (tableId) {
      params.append('table', tableId);
    }

    if (venueId) {
      params.append('venue', venueId);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await api.get<PublicMenu>(url);
    return response.data;
  },

  // Record a QR code scan
  recordScan: async (id: string): Promise<void> => {
    await api.post(`/public/qrcodes/${id}/scan`);
  },
};

export default PublicMenuService;

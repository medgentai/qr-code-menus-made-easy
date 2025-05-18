import { api } from '@/lib/api';
import { TableStatus } from '@/types/venue';

// Venue interfaces
export interface Venue {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phoneNumber?: string;
  email?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: string;
  venueId: string;
  name: string;
  capacity?: number;
  status: TableStatus;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

// DTOs
export interface CreateVenueDto {
  organizationId: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phoneNumber?: string;
  email?: string;
  imageUrl?: string;
}

export interface UpdateVenueDto {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phoneNumber?: string;
  email?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface CreateTableDto {
  venueId: string;
  name: string;
  capacity?: number;
  status?: TableStatus;
  location?: string;
}

export interface UpdateTableDto {
  name?: string;
  capacity?: number;
  status?: TableStatus;
  location?: string;
}

// Venue service
const VenueService = {
  // Venue operations
  getAllForOrganization: async (organizationId: string): Promise<Venue[]> => {
    const response = await api.get<Venue[]>(`/venues/organization/${organizationId}`);
    return response.data || [];
  },

  getById: async (id: string): Promise<Venue> => {
    const response = await api.get<Venue>(`/venues/${id}`);
    return response.data;
  },

  create: async (data: CreateVenueDto): Promise<Venue> => {
    const response = await api.post<Venue>('/venues', data);
    return response.data;
  },

  update: async (id: string, data: UpdateVenueDto): Promise<Venue> => {
    const response = await api.patch<Venue>(`/venues/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/venues/${id}`);
  },

  // Table operations
  getAllTablesForVenue: async (venueId: string): Promise<Table[]> => {
    const response = await api.get<Table[]>(`/venues/venue/${venueId}/tables`);
    return response.data || [];
  },

  getTableById: async (id: string): Promise<Table> => {
    const response = await api.get<Table>(`/venues/tables/${id}`);
    return response.data;
  },

  createTable: async (data: CreateTableDto): Promise<Table> => {
    const response = await api.post<Table>('/venues/tables', data);
    return response.data;
  },

  updateTable: async (id: string, data: UpdateTableDto): Promise<Table> => {
    const response = await api.patch<Table>(`/venues/tables/${id}`, data);
    return response.data;
  },

  deleteTable: async (id: string): Promise<void> => {
    await api.delete(`/venues/tables/${id}`);
  }
};

export default VenueService;

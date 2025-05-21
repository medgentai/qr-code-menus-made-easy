import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from './auth-context';
import { useOrganization } from './organization-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import VenueService, {
  Venue,
  Table,
  CreateVenueDto,
  UpdateVenueDto,
  CreateTableDto,
  UpdateTableDto
} from '@/services/venue-service';

// Venue context interface
export interface VenueContextType {
  venues: Venue[];
  currentVenue: Venue | null;
  tables: Table[];
  isLoading: boolean;
  error: string | null;
  fetchVenuesForOrganization: (organizationId: string) => Promise<void>;
  fetchVenueById: (id: string) => Promise<Venue | null>;
  createVenue: (data: CreateVenueDto) => Promise<Venue | null>;
  updateVenue: (id: string, data: UpdateVenueDto) => Promise<Venue | null>;
  deleteVenue: (id: string) => Promise<boolean>;
  selectVenue: (venue: Venue) => void;
  fetchTablesForVenue: (venueId: string) => Promise<void>;
  createTable: (data: CreateTableDto) => Promise<Table | null>;
  updateTable: (id: string, data: UpdateTableDto) => Promise<Table | null>;
  deleteTable: (id: string) => Promise<boolean>;
}

// Create the venue context
const VenueContext = createContext<VenueContextType | undefined>(undefined);

// Venue provider props
interface VenueProviderProps {
  children: React.ReactNode;
}

// Venue provider component
export const VenueProvider: React.FC<VenueProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  const [currentVenue, setCurrentVenue] = useState<Venue | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Use React Query to fetch venues - this handles caching, deduplication, and loading states
  const {
    data: venues = [],
    isLoading,
    refetch: refetchVenues
  } = useQuery({
    queryKey: ['venues', 'organization', currentOrganization?.id],
    queryFn: async () => {
      if (!isAuthenticated || !currentOrganization) return [];
      console.log('Fetching venues for organization:', currentOrganization.id);
      return await VenueService.getAllForOrganization(currentOrganization.id);
    },
    enabled: !!isAuthenticated && !!currentOrganization,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
  });

  // Fetch venues for an organization - now just a wrapper around the React Query refetch
  const fetchVenuesForOrganization = useCallback(async (organizationId: string) => {
    if (!isAuthenticated) return [];

    // If the organization ID matches the current one, use the refetch function
    if (currentOrganization?.id === organizationId) {
      return refetchVenues().then(result => result.data || []);
    }

    // Otherwise, manually fetch and update the cache
    try {
      console.log('Fetching venues for organization:', organizationId);
      const data = await VenueService.getAllForOrganization(organizationId);
      queryClient.setQueryData(['venues', 'organization', organizationId], data);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch venues';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    }
  }, [isAuthenticated, currentOrganization, queryClient, refetchVenues]);

  // Fetch venue by ID
  const fetchVenueById = useCallback(async (id: string): Promise<Venue | null> => {
    if (!isAuthenticated) return null;

    setError(null);

    try {
      // Check if we already have data in the cache
      const cachedVenue = queryClient.getQueryData<Venue>(['venue', id]);
      if (cachedVenue) {
        setCurrentVenue(cachedVenue);
        return cachedVenue;
      }

      const data = await VenueService.getById(id);
      setCurrentVenue(data);

      // Update the cache
      queryClient.setQueryData(['venue', id], data);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch venue';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [isAuthenticated, queryClient]);

  // Create a new venue
  const createVenue = useCallback(async (data: CreateVenueDto): Promise<Venue | null> => {
    if (!isAuthenticated) return null;

    setError(null);

    try {
      const newVenue = await VenueService.create(data);

      // Update the venues list in the cache
      queryClient.setQueryData(['venues', 'organization', data.organizationId],
        (oldData: Venue[] = []) => [...oldData, newVenue]);

      toast.success('Venue created successfully');
      return newVenue;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create venue';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [isAuthenticated, queryClient]);

  // Update a venue
  const updateVenue = useCallback(async (id: string, data: UpdateVenueDto): Promise<Venue | null> => {
    if (!isAuthenticated) return null;

    setError(null);

    try {
      const updatedVenue = await VenueService.update(id, data);

      // Update the venue in cache
      queryClient.setQueryData(['venue', id], updatedVenue);

      // Update the venue in the organization's venue list
      if (data.organizationId) {
        queryClient.setQueryData(['venues', 'organization', data.organizationId],
          (oldData: Venue[] = []) => oldData.map(venue => venue.id === id ? updatedVenue : venue));
      }

      if (currentVenue?.id === id) {
        setCurrentVenue(updatedVenue);
      }

      toast.success('Venue updated successfully');
      return updatedVenue;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update venue';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [isAuthenticated, currentVenue, queryClient]);

  // Delete a venue
  const deleteVenue = useCallback(async (id: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    setError(null);

    try {
      const venueToDelete = queryClient.getQueryData<Venue>(['venue', id]);
      await VenueService.delete(id);

      // Remove from cache
      queryClient.removeQueries(['venue', id]);

      // Update the organization's venue list if we know the organization ID
      if (venueToDelete?.organizationId) {
        queryClient.setQueryData(['venues', 'organization', venueToDelete.organizationId],
          (oldData: Venue[] = []) => oldData.filter(venue => venue.id !== id));
      }

      if (currentVenue?.id === id) {
        setCurrentVenue(null);
      }

      toast.success('Venue deleted successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete venue';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [isAuthenticated, currentVenue, queryClient]);

  // Select a venue
  const selectVenue = useCallback((venue: Venue) => {
    setCurrentVenue(venue);
  }, []);

  // Fetch tables for a venue using React Query patterns
  const fetchTablesForVenue = useCallback(async (venueId: string) => {
    if (!isAuthenticated) return [];

    // Check if we already have data in the cache
    const cachedTables = queryClient.getQueryData<Table[]>(['tables', 'venue', venueId]);
    if (cachedTables) {
      console.log('Using cached tables data for venue:', venueId);
      setTables(cachedTables);
      return cachedTables;
    }

    try {
      console.log('Fetching tables for venue:', venueId);
      const data = await VenueService.getAllTablesForVenue(venueId);
      setTables(data);
      // Update the cache
      queryClient.setQueryData(['tables', 'venue', venueId], data);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch tables';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    }
  }, [isAuthenticated, queryClient]);

  // Create a new table
  const createTable = useCallback(async (data: CreateTableDto): Promise<Table | null> => {
    if (!isAuthenticated) return null;

    setError(null);

    try {
      const newTable = await VenueService.createTable(data);

      // Update the tables list in the cache
      queryClient.setQueryData(['tables', 'venue', data.venueId],
        (oldData: Table[] = []) => [...oldData, newTable]);

      // Update local state
      setTables(prev => [...prev, newTable]);

      toast.success('Table created successfully');
      return newTable;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create table';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [isAuthenticated, queryClient]);

  // Update a table
  const updateTable = useCallback(async (id: string, data: UpdateTableDto): Promise<Table | null> => {
    if (!isAuthenticated) return null;

    setError(null);

    try {
      const updatedTable = await VenueService.updateTable(id, data);

      // Update the table in the venue's tables list
      if (data.venueId) {
        queryClient.setQueryData(['tables', 'venue', data.venueId],
          (oldData: Table[] = []) => oldData.map(table => table.id === id ? updatedTable : table));
      }

      // Update local state
      setTables(prev => prev.map(table => table.id === id ? updatedTable : table));

      toast.success('Table updated successfully');
      return updatedTable;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update table';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [isAuthenticated, queryClient]);

  // Delete a table
  const deleteTable = useCallback(async (id: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    setError(null);

    try {
      // Find the table to get its venueId
      const tableToDelete = tables.find(table => table.id === id);
      await VenueService.deleteTable(id);

      // Update the cache if we know the venueId
      if (tableToDelete?.venueId) {
        queryClient.setQueryData(['tables', 'venue', tableToDelete.venueId],
          (oldData: Table[] = []) => oldData.filter(table => table.id !== id));
      }

      // Update local state
      setTables(prev => prev.filter(table => table.id !== id));

      toast.success('Table deleted successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete table';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [isAuthenticated, tables, queryClient]);

  // No need for the useEffect to load venues - React Query handles this automatically

  // Context value
  const value: VenueContextType = {
    venues,
    currentVenue,
    tables,
    isLoading,
    error,
    fetchVenuesForOrganization,
    fetchVenueById,
    createVenue,
    updateVenue,
    deleteVenue,
    selectVenue,
    fetchTablesForVenue,
    createTable,
    updateTable,
    deleteTable
  };

  return (
    <VenueContext.Provider value={value}>
      {children}
    </VenueContext.Provider>
  );
};

// Hook to use the venue context
export const useVenue = () => {
  const context = useContext(VenueContext);
  if (context === undefined) {
    throw new Error('useVenue must be used within a VenueProvider');
  }
  return context;
};

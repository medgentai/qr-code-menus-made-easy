import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './auth-context';
import { useOrganization } from './organization-context';
import { MemberRole } from '@/types/organization';
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
  fetchVenueById: (id: string, forceRefresh?: boolean) => Promise<Venue | null>;
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
  const { state: authState } = useAuth();
  const { user, isAuthenticated, isLoading: authLoading } = authState;
  const { currentOrganization, currentOrganizationDetails } = useOrganization();

  // Fallback authentication check - if auth context user is missing, check localStorage
  const isUserAuthenticated = isAuthenticated || (() => {
    try {
      const storedUser = localStorage.getItem('user');
      return !!storedUser;
    } catch {
      return false;
    }
  })();
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
      if (!isUserAuthenticated || !currentOrganization) return [];
      return await VenueService.getAllForOrganization(currentOrganization.id);
    },
    enabled: !!isUserAuthenticated && !!currentOrganization && !authLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
  });

  // Fetch venues for an organization - now just a wrapper around the React Query refetch
  const fetchVenuesForOrganization = useCallback(async (organizationId: string): Promise<void> => {
    if (!isUserAuthenticated) return;

    // If the organization ID matches the current one, use the refetch function
    if (currentOrganization?.id === organizationId) {
      await refetchVenues();
      return;
    }

    // Otherwise, manually fetch and update the cache
    try {
      const data = await VenueService.getAllForOrganization(organizationId);
      queryClient.setQueryData(['venues', 'organization', organizationId], data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch venues';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [isUserAuthenticated, currentOrganization, queryClient, refetchVenues]);

  // Fetch venue by ID
  const fetchVenueById = useCallback(async (id: string, forceRefresh: boolean = false): Promise<Venue | null> => {
    if (!isUserAuthenticated) return null;

    setError(null);

    try {
      if (forceRefresh) {
        // Force refetch from server
        const result = await queryClient.fetchQuery({
          queryKey: ['venue', id],
          queryFn: () => VenueService.getById(id),
          staleTime: 0 // Force fresh data
        });
        setCurrentVenue(result);
        return result;
      } else {
        // Check if we already have data in the cache
        const cachedVenue = queryClient.getQueryData<Venue>(['venue', id]);
        if (cachedVenue) {
          setCurrentVenue(cachedVenue);
          return cachedVenue;
        }

        // Fetch and cache
        const data = await VenueService.getById(id);


        setCurrentVenue(data);
        queryClient.setQueryData(['venue', id], data);
        return data;
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch venue';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [isUserAuthenticated, queryClient]);

  // Create a new venue
  const createVenue = useCallback(async (data: CreateVenueDto): Promise<Venue | null> => {
    if (!isUserAuthenticated) return null;

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
  }, [isUserAuthenticated, queryClient]);

  // Update a venue
  const updateVenue = useCallback(async (id: string, data: UpdateVenueDto): Promise<Venue | null> => {
    if (!isUserAuthenticated) return null;

    setError(null);

    try {
      const updatedVenue = await VenueService.update(id, data);

      // Update the venue in cache
      queryClient.setQueryData(['venue', id], updatedVenue);

      // Update the venue in the organization's venue list
      // Get organization ID from the updated venue response
      if (updatedVenue.organizationId) {
        queryClient.setQueryData(['venues', 'organization', updatedVenue.organizationId],
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
  }, [isUserAuthenticated, currentVenue, queryClient]);

  // Delete a venue
  const deleteVenue = useCallback(async (id: string): Promise<boolean> => {
    if (!isUserAuthenticated) return false;

    setError(null);

    try {
      const venueToDelete = queryClient.getQueryData<Venue>(['venue', id]);
      await VenueService.delete(id);

      // Remove from cache
      queryClient.removeQueries({ queryKey: ['venue', id] });

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
  }, [isUserAuthenticated, currentVenue, queryClient]);

  // Get current user's venue assignments
  const userVenueIds = React.useMemo(() => {
    if (!user || !currentOrganizationDetails) return [];

    const currentMember = currentOrganizationDetails.members.find(
      member => member.user.id === user.id
    );

    if (!currentMember || currentMember.role !== MemberRole.STAFF) return [];
    return currentMember.venueIds || [];
  }, [user, currentOrganizationDetails]);

  // Auto-select venue for staff members
  useEffect(() => {
    if (!currentVenue && venues.length > 0 && userVenueIds.length > 0) {
      // If staff is assigned to specific venues, auto-select the first one
      const assignedVenue = venues.find(venue => userVenueIds.includes(venue.id));
      if (assignedVenue) {
        setCurrentVenue(assignedVenue);
      }
    }
  }, [currentVenue, venues, userVenueIds]);

  // Update current venue when venues list changes (e.g., after image upload)
  useEffect(() => {
    if (currentVenue && venues.length > 0) {
      const updatedVenue = venues.find(venue => venue.id === currentVenue.id);
      if (updatedVenue && updatedVenue.imageUrl !== currentVenue.imageUrl) {
        setCurrentVenue(updatedVenue);
      }
    }
  }, [venues, currentVenue]);

  // Select a venue
  const selectVenue = useCallback((venue: Venue) => {
    setCurrentVenue(venue);
  }, []);

  // Fetch tables for a venue using React Query patterns
  const fetchTablesForVenue = useCallback(async (venueId: string): Promise<void> => {
    if (!isUserAuthenticated) return;

    // Check if we already have data in the cache
    const cachedTables = queryClient.getQueryData<Table[]>(['tables', 'venue', venueId]);
    if (cachedTables) {
      setTables(cachedTables);
      return;
    }

    try {
      const data = await VenueService.getAllTablesForVenue(venueId);
      setTables(data);
      // Update the cache
      queryClient.setQueryData(['tables', 'venue', venueId], data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch tables';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, [isUserAuthenticated, queryClient]);

  // Create a new table
  const createTable = useCallback(async (data: CreateTableDto): Promise<Table | null> => {
    if (!isUserAuthenticated) return null;

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
  }, [isUserAuthenticated, queryClient]);

  // Update a table
  const updateTable = useCallback(async (id: string, data: UpdateTableDto): Promise<Table | null> => {
    if (!isUserAuthenticated) return null;

    setError(null);

    try {
      const updatedTable = await VenueService.updateTable(id, data);

      // Find the current table to get its venueId
      const currentTable = tables.find(table => table.id === id);
      if (currentTable) {
        queryClient.setQueryData(['tables', 'venue', currentTable.venueId],
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
  }, [isUserAuthenticated, queryClient]);

  // Delete a table
  const deleteTable = useCallback(async (id: string): Promise<boolean> => {
    if (!isUserAuthenticated) return false;

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
  }, [isUserAuthenticated, tables, queryClient]);

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

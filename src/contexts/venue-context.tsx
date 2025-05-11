import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from './auth-context';
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
  const [venues, setVenues] = useState<Venue[]>([]);
  const [currentVenue, setCurrentVenue] = useState<Venue | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch venues for an organization
  const fetchVenuesForOrganization = useCallback(async (organizationId: string) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await VenueService.getAllForOrganization(organizationId);
      setVenues(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch venues';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch venue by ID
  const fetchVenueById = useCallback(async (id: string): Promise<Venue | null> => {
    if (!isAuthenticated) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await VenueService.getById(id);
      setCurrentVenue(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch venue';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Create a new venue
  const createVenue = useCallback(async (data: CreateVenueDto): Promise<Venue | null> => {
    if (!isAuthenticated) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newVenue = await VenueService.create(data);
      setVenues(prev => [...prev, newVenue]);
      toast.success('Venue created successfully');
      return newVenue;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create venue';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Update a venue
  const updateVenue = useCallback(async (id: string, data: UpdateVenueDto): Promise<Venue | null> => {
    if (!isAuthenticated) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedVenue = await VenueService.update(id, data);
      setVenues(prev => prev.map(venue => venue.id === id ? updatedVenue : venue));
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
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentVenue]);

  // Delete a venue
  const deleteVenue = useCallback(async (id: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await VenueService.delete(id);
      setVenues(prev => prev.filter(venue => venue.id !== id));
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
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentVenue]);

  // Select a venue
  const selectVenue = useCallback((venue: Venue) => {
    setCurrentVenue(venue);
  }, []);

  // Fetch tables for a venue
  const fetchTablesForVenue = useCallback(async (venueId: string) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await VenueService.getAllTablesForVenue(venueId);
      setTables(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch tables';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Create a new table
  const createTable = useCallback(async (data: CreateTableDto): Promise<Table | null> => {
    if (!isAuthenticated) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newTable = await VenueService.createTable(data);
      setTables(prev => [...prev, newTable]);
      toast.success('Table created successfully');
      return newTable;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create table';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Update a table
  const updateTable = useCallback(async (id: string, data: UpdateTableDto): Promise<Table | null> => {
    if (!isAuthenticated) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedTable = await VenueService.updateTable(id, data);
      setTables(prev => prev.map(table => table.id === id ? updatedTable : table));
      toast.success('Table updated successfully');
      return updatedTable;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update table';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Delete a table
  const deleteTable = useCallback(async (id: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await VenueService.deleteTable(id);
      setTables(prev => prev.filter(table => table.id !== id));
      toast.success('Table deleted successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete table';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

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

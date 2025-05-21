import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { useAuth } from './auth-context';
import OrganizationService, {
  Organization,
  OrganizationDetails,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  AddMemberDto,
  UpdateMemberRoleDto
} from '@/services/organization-service';

// Organization context interface
export interface OrganizationContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  currentOrganizationDetails: OrganizationDetails | null;
  isLoading: boolean;
  error: string | null;
  fetchOrganizations: (force?: boolean) => Promise<void>;
  fetchOrganizationDetails: (id: string) => Promise<OrganizationDetails | null>;
  createOrganization: (data: CreateOrganizationDto) => Promise<Organization | null>;
  updateOrganization: (id: string, data: UpdateOrganizationDto) => Promise<Organization | null>;
  deleteOrganization: (id: string) => Promise<boolean>;
  selectOrganization: (organization: Organization) => void;
  addMember: (organizationId: string, data: AddMemberDto) => Promise<boolean>;
  updateMemberRole: (organizationId: string, memberId: string, data: UpdateMemberRoleDto) => Promise<boolean>;
  removeMember: (organizationId: string, memberId: string) => Promise<boolean>;
  leaveOrganization: (organizationId: string) => Promise<boolean>;
}

// Create the organization context
const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

// Organization provider props
interface OrganizationProviderProps {
  children: React.ReactNode;
}

// Local storage key for current organization
const CURRENT_ORGANIZATION_KEY = 'currentOrganization';

export const OrganizationProvider: React.FC<OrganizationProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [currentOrganizationDetails, setCurrentOrganizationDetails] = useState<OrganizationDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Track if organizations have been fetched
  const hasLoadedRef = useRef(false);

  // Track the last organization ID we fetched details for
  const [lastFetchedDetailsId, setLastFetchedDetailsId] = useState<string | null>(null);

  // Fetch organization details with caching and duplicate request prevention
  const fetchOrganizationDetails = useCallback(async (id: string): Promise<OrganizationDetails | null> => {
    if (!isAuthenticated) return null;

    // Prevent duplicate API calls for the same organization ID in rapid succession
    if (lastFetchedDetailsId === id && isLoading) {
      console.log('Already fetching details for organization:', id);
      return currentOrganizationDetails; // Return current details if already fetching
    }

    // If we already have details for this organization, return them
    if (currentOrganizationDetails && currentOrganizationDetails.id === id) {
      console.log('Using existing details for organization:', id);
      return currentOrganizationDetails;
    }

    setLastFetchedDetailsId(id);
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching details for organization:', id);
      const data = await OrganizationService.getDetails(id);
      setCurrentOrganizationDetails(data);
      return data;
    } catch (err) {
      console.error('Error fetching organization details:', err);
      setError('Failed to fetch organization details');
      toast.error('Failed to fetch organization details');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isLoading, currentOrganizationDetails, lastFetchedDetailsId]);

  // Fetch organizations
  const fetchOrganizations = useCallback(async (force: boolean = false): Promise<void> => {
    if (!isAuthenticated) return;

    // Skip if already loaded and not forced
    if (hasLoadedRef.current && !force) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await OrganizationService.getAll();
      setOrganizations(data);
      hasLoadedRef.current = true;

      // If there's a stored current organization, try to find it in the fetched list
      const storedOrgId = localStorage.getItem(CURRENT_ORGANIZATION_KEY);
      if (storedOrgId && data.length > 0) {
        const storedOrg = data.find(org => org.id === storedOrgId);
        if (storedOrg) {
          setCurrentOrganization(storedOrg);
        } else if (data.length > 0) {
          // If stored org not found, use the first one
          setCurrentOrganization(data[0]);
          localStorage.setItem(CURRENT_ORGANIZATION_KEY, data[0].id);
        }
      } else if (data.length > 0) {
        // If no stored org, use the first one
        setCurrentOrganization(data[0]);
        localStorage.setItem(CURRENT_ORGANIZATION_KEY, data[0].id);
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError('Failed to fetch organizations');
      toast.error('Failed to fetch organizations');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Select organization
  const selectOrganization = useCallback((organization: Organization): void => {
    setCurrentOrganization(organization);
    localStorage.setItem(CURRENT_ORGANIZATION_KEY, organization.id);
  }, []);

  // Create organization
  const createOrganization = async (data: CreateOrganizationDto): Promise<Organization | null> => {
    if (!isAuthenticated) return null;

    setIsLoading(true);
    setError(null);

    try {
      const newOrg = await OrganizationService.create(data);
      setOrganizations(prev => [...prev, newOrg]);

      // Set as current if it's the first one or always set as current
      if (organizations.length === 0 || true) {
        // Also pre-fetch organization details to avoid additional API calls
        try {
          const details = await OrganizationService.getDetails(newOrg.id);
          setCurrentOrganizationDetails(details);
          setLastFetchedDetailsId(newOrg.id);
        } catch (detailsErr) {
          console.error('Error pre-fetching organization details:', detailsErr);
          // Continue even if details fetch fails
        }

        setCurrentOrganization(newOrg);
        localStorage.setItem(CURRENT_ORGANIZATION_KEY, newOrg.id);
      }

      toast.success('Organization created successfully');
      return newOrg;
    } catch (err) {
      console.error('Error creating organization:', err);
      setError('Failed to create organization');
      toast.error('Failed to create organization');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update organization
  const updateOrganization = async (id: string, data: UpdateOrganizationDto): Promise<Organization | null> => {
    if (!isAuthenticated) return null;

    setIsLoading(true);
    setError(null);

    try {
      const updatedOrg = await OrganizationService.update(id, data);

      // Update in the organizations list
      setOrganizations(prev =>
        prev.map(org => org.id === id ? updatedOrg : org)
      );

      // Update current organization if it's the one being updated
      if (currentOrganization?.id === id) {
        setCurrentOrganization(updatedOrg);
      }

      toast.success('Organization updated successfully');
      return updatedOrg;
    } catch (err) {
      console.error('Error updating organization:', err);
      setError('Failed to update organization');
      toast.error('Failed to update organization');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete organization
  const deleteOrganization = async (id: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    setIsLoading(true);
    setError(null);

    try {
      await OrganizationService.delete(id);

      // Remove from organizations list
      const updatedOrgs = organizations.filter(org => org.id !== id);
      setOrganizations(updatedOrgs);

      // If the deleted org was the current one, select another one
      if (currentOrganization?.id === id) {
        if (updatedOrgs.length > 0) {
          setCurrentOrganization(updatedOrgs[0]);
          localStorage.setItem(CURRENT_ORGANIZATION_KEY, updatedOrgs[0].id);
        } else {
          setCurrentOrganization(null);
          setCurrentOrganizationDetails(null);
          localStorage.removeItem(CURRENT_ORGANIZATION_KEY);
          // Redirect to create organization page if no organizations left
          navigate('/organizations/create');
        }
      }

      toast.success('Organization deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting organization:', err);
      setError('Failed to delete organization');
      toast.error('Failed to delete organization');
      return false;
    } finally {
      setIsLoading(false);
    }
  };



  // Add member
  const addMember = async (organizationId: string, data: AddMemberDto): Promise<boolean> => {
    if (!isAuthenticated) return false;

    setIsLoading(true);
    setError(null);

    try {
      await OrganizationService.addMember(organizationId, data);
      toast.success('Member added successfully');

      // Refresh organization details to get updated members list
      if (currentOrganization?.id === organizationId) {
        fetchOrganizationDetails(organizationId);
      }

      return true;
    } catch (err) {
      console.error('Error adding member:', err);
      setError('Failed to add member');
      toast.error('Failed to add member');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update member role
  const updateMemberRole = async (
    organizationId: string,
    memberId: string,
    data: UpdateMemberRoleDto
  ): Promise<boolean> => {
    if (!isAuthenticated) return false;

    setIsLoading(true);
    setError(null);

    try {
      await OrganizationService.updateMemberRole(organizationId, memberId, data);
      toast.success('Member role updated successfully');

      // Refresh organization details to get updated members list
      if (currentOrganization?.id === organizationId) {
        fetchOrganizationDetails(organizationId);
      }

      return true;
    } catch (err) {
      console.error('Error updating member role:', err);
      setError('Failed to update member role');
      toast.error('Failed to update member role');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove member
  const removeMember = async (organizationId: string, memberId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    setIsLoading(true);
    setError(null);

    try {
      await OrganizationService.removeMember(organizationId, memberId);
      toast.success('Member removed successfully');

      // Refresh organization details to get updated members list
      if (currentOrganization?.id === organizationId) {
        fetchOrganizationDetails(organizationId);
      }

      return true;
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Failed to remove member');
      toast.error('Failed to remove member');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Leave organization
  const leaveOrganization = async (organizationId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    setIsLoading(true);
    setError(null);

    try {
      await OrganizationService.leaveOrganization(organizationId);

      // Remove from organizations list
      const updatedOrgs = organizations.filter(org => org.id !== organizationId);
      setOrganizations(updatedOrgs);

      // If the left org was the current one, select another one
      if (currentOrganization?.id === organizationId) {
        if (updatedOrgs.length > 0) {
          setCurrentOrganization(updatedOrgs[0]);
          localStorage.setItem(CURRENT_ORGANIZATION_KEY, updatedOrgs[0].id);
        } else {
          setCurrentOrganization(null);
          setCurrentOrganizationDetails(null);
          localStorage.removeItem(CURRENT_ORGANIZATION_KEY);
          // Redirect to create organization page if no organizations left
          navigate('/organizations/create');
        }
      }

      toast.success('Left organization successfully');
      return true;
    } catch (err) {
      console.error('Error leaving organization:', err);
      setError('Failed to leave organization');
      toast.error('Failed to leave organization');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch organizations when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrganizations();
    } else {
      // Clear organizations when not authenticated
      setOrganizations([]);
      setCurrentOrganization(null);
      setCurrentOrganizationDetails(null);
      hasLoadedRef.current = false;
    }
  }, [isAuthenticated, fetchOrganizations]);

  // Fetch organization details when current organization changes
  useEffect(() => {
    if (currentOrganization && isAuthenticated) {
      // Only fetch if we don't already have details for this organization
      if (!currentOrganizationDetails || currentOrganizationDetails.id !== currentOrganization.id) {
        console.log('Organization changed, fetching details for:', currentOrganization.id);
        fetchOrganizationDetails(currentOrganization.id);
      }
    }
  }, [currentOrganization?.id, isAuthenticated, currentOrganizationDetails]);

  // Context value
  const value: OrganizationContextType = {
    organizations,
    currentOrganization,
    currentOrganizationDetails,
    isLoading,
    error,
    fetchOrganizations,
    fetchOrganizationDetails,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    selectOrganization,
    addMember,
    updateMemberRole,
    removeMember,
    leaveOrganization,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

// Custom hook to use the organization context
export const useOrganization = (): OrganizationContextType => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

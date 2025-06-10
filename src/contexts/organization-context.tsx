import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from './auth-context';
import OrganizationService, {
  Organization,
  OrganizationDetails,
  OrganizationInvitation,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  AddMemberDto,
  UpdateMemberRoleDto,
  CreateInvitationDto,
} from '@/services/organization-service';

// Organization context interface
export interface OrganizationContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  currentOrganizationDetails: OrganizationDetails | null;
  isLoading: boolean;
  hasLoaded: boolean; // Track if organizations have been initially loaded
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
  // Invitation methods
  sendInvitation: (organizationId: string, data: CreateInvitationDto) => Promise<boolean>;
  getInvitations: (organizationId: string) => Promise<OrganizationInvitation[]>;
  cancelInvitation: (organizationId: string, invitationId: string) => Promise<boolean>;
  getInvitationByToken: (token: string) => Promise<OrganizationInvitation | null>;
  acceptInvitation: (token: string) => Promise<boolean>;
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
  const { state: { isAuthenticated, isLoading: authLoading } } = useAuth();
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
      return null; // Return null if already fetching to avoid using stale data
    }

    setLastFetchedDetailsId(id);
    setIsLoading(true);
    setError(null);

    try {
      const data = await OrganizationService.getDetails(id);
      setCurrentOrganizationDetails(data);
      return data;
    } catch (err) {
      setError('Failed to fetch organization details');
      toast.error('Failed to fetch organization details');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isLoading, lastFetchedDetailsId]);

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
        localStorage.setItem(CURRENT_ORGANIZATION_KEY, data[0].id);      } else {
        // If user has no organizations, set current organization to null
        // The OrganizationGuard components will handle redirects appropriately
        setCurrentOrganization(null);
        setCurrentOrganizationDetails(null);
        localStorage.removeItem(CURRENT_ORGANIZATION_KEY);
      }
    } catch (err) {
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
          // Continue even if details fetch fails
        }

        setCurrentOrganization(newOrg);
        localStorage.setItem(CURRENT_ORGANIZATION_KEY, newOrg.id);
      }

      toast.success('Organization created successfully');
      return newOrg;
    } catch (err) {
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

      // Optimistically update the member in the current organization details
      if (currentOrganization?.id === organizationId && currentOrganizationDetails) {
        setCurrentOrganizationDetails(prevDetails => {
          if (!prevDetails) return prevDetails;
          
          const updatedMembers = prevDetails.members.map(member => 
            member.id === memberId 
              ? { 
                  ...member, 
                  role: data.role,
                  staffType: data.staffType,
                  venueIds: data.venueIds
                }
              : member
          );
            
          return {
            ...prevDetails,
            members: updatedMembers
          };
        });
      }

      return true;
    } catch (err) {
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

      // Optimistically remove the member from the current organization details
      if (currentOrganization?.id === organizationId && currentOrganizationDetails) {
        setCurrentOrganizationDetails(prevDetails => {
          if (!prevDetails) return prevDetails;
          
          const updatedMembers = prevDetails.members.filter(
            member => member.id !== memberId
          );
          
          const updatedStats = {
            ...prevDetails.stats,
            totalMembers: updatedMembers.length
          };
            
          return {
            ...prevDetails,
            members: updatedMembers,
            stats: updatedStats
          };
        });
      }

      return true;
    } catch (err) {
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
      setError('Failed to leave organization');
      toast.error('Failed to leave organization');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Invitation methods  // Send invitation
  const sendInvitation = async (organizationId: string, data: CreateInvitationDto): Promise<boolean> => {
    if (!isAuthenticated) return false;

    setIsLoading(true);
    setError(null);

    try {
      const newInvitation = await OrganizationService.sendInvitation(organizationId, data);
      toast.success('Invitation sent successfully');

      // Optimistically update the current organization details with the new invitation
      if (currentOrganization?.id === organizationId && currentOrganizationDetails) {
        setCurrentOrganizationDetails(prevDetails => {
          if (!prevDetails) return prevDetails;
          
          const updatedInvitations = prevDetails.invitations ? 
            [...prevDetails.invitations, newInvitation] : 
            [newInvitation];
            
          return {
            ...prevDetails,
            invitations: updatedInvitations
          };
        });
      }

      return true;
    } catch (err) {
      setError('Failed to send invitation');
      toast.error('Failed to send invitation');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get invitations
  const getInvitations = async (organizationId: string): Promise<OrganizationInvitation[]> => {
    if (!isAuthenticated) return [];

    try {
      return await OrganizationService.getInvitations(organizationId);
    } catch (err) {
      setError('Failed to fetch invitations');
      toast.error('Failed to fetch invitations');
      return [];
    }
  };
  // Cancel invitation
  const cancelInvitation = async (organizationId: string, invitationId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    setIsLoading(true);
    setError(null);

    try {
      await OrganizationService.cancelInvitation(organizationId, invitationId);
      toast.success('Invitation cancelled successfully');

      // Optimistically remove the invitation from the current organization details
      if (currentOrganization?.id === organizationId && currentOrganizationDetails) {
        setCurrentOrganizationDetails(prevDetails => {
          if (!prevDetails || !prevDetails.invitations) return prevDetails;
          
          const updatedInvitations = prevDetails.invitations.filter(
            invitation => invitation.id !== invitationId
          );
            
          return {
            ...prevDetails,
            invitations: updatedInvitations
          };
        });
      }

      return true;
    } catch (err) {
      setError('Failed to cancel invitation');
      toast.error('Failed to cancel invitation');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get invitation by token (public)
  const getInvitationByToken = async (token: string): Promise<OrganizationInvitation | null> => {
    try {
      return await OrganizationService.getInvitationByToken(token);
    } catch (err) {
      setError('Failed to fetch invitation details');
      toast.error('Invalid or expired invitation');
      return null;
    }
  };

  // Accept invitation
  const acceptInvitation = async (token: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    setIsLoading(true);
    setError(null);

    try {
      const acceptedInvitation = await OrganizationService.acceptInvitation(token);
      toast.success('Invitation accepted successfully');

      // Refresh organizations list to include the new organization
      await fetchOrganizations(true);

      // If we're currently viewing the organization that the invitation was for,
      // refresh its details to update the invitations list
      if (currentOrganization && acceptedInvitation.organizationId === currentOrganization.id) {
        await fetchOrganizationDetails(currentOrganization.id);
      }

      return true;
    } catch (err) {
      setError('Failed to accept invitation');
      toast.error('Failed to accept invitation');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch organizations when authenticated and auth is ready
  useEffect(() => {
    // Wait for auth to finish loading before making API calls
    if (authLoading) return;

    if (isAuthenticated) {
      fetchOrganizations();
    } else {
      // Clear organizations when not authenticated
      setOrganizations([]);
      setCurrentOrganization(null);
      setCurrentOrganizationDetails(null);
      hasLoadedRef.current = false;
    }
  }, [isAuthenticated, authLoading, fetchOrganizations]);

  // Fetch organization details when current organization changes
  useEffect(() => {
    // Wait for auth to finish loading before making API calls
    if (authLoading) return;

    if (currentOrganization && isAuthenticated) {
      // Only fetch if we don't already have details for this organization
      // AND we're not currently loading details for this organization
      if (!currentOrganizationDetails ||
          (currentOrganizationDetails.id !== currentOrganization.id &&
           lastFetchedDetailsId !== currentOrganization.id)) {
        fetchOrganizationDetails(currentOrganization.id);
      }
    }
  }, [currentOrganization?.id, isAuthenticated, authLoading, lastFetchedDetailsId]);

  // Context value
  const value: OrganizationContextType = {
    organizations,
    currentOrganization,
    currentOrganizationDetails,
    isLoading,
    hasLoaded: hasLoadedRef.current,
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
    sendInvitation,
    getInvitations,
    cancelInvitation,
    getInvitationByToken,
    acceptInvitation,
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

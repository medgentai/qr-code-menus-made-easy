import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useOrganization } from '@/contexts/organization-context';
import UploadService, {
  UploadResponse,
  UploadMenuItemImageData,
  UploadOrganizationLogoData,
  UploadVenueImageData,
  UploadCategoryImageData,
  UploadUserProfileImageData,
} from '@/services/upload-service';

export const useUploadMenuItemImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, data }: { file: File; data: UploadMenuItemImageData }) =>
      UploadService.uploadMenuItemImage(file, data),
    onSuccess: (result: UploadResponse) => {
      toast.success('Menu item image uploaded successfully');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to upload image');
    },
  });
};

export const useUploadOrganizationLogo = () => {
  const queryClient = useQueryClient();
  const { fetchOrganizations, fetchOrganizationDetails, currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: ({
      file,
      organizationId,
      data = {},
    }: {
      file: File;
      organizationId: string;
      data?: UploadOrganizationLogoData;
    }) => UploadService.uploadOrganizationLogo(file, organizationId, data),
    onSuccess: async (result: UploadResponse) => {
      toast.success('Organization logo uploaded successfully');

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organization-details'] });
      queryClient.invalidateQueries({ queryKey: ['venues', 'organization'] });
      queryClient.invalidateQueries({ queryKey: ['menus', 'organization'] });

      // Manually refresh organization data since it doesn't use React Query
      try {
        await fetchOrganizations(true);
        if (currentOrganization) {
          await fetchOrganizationDetails(currentOrganization.id);
        }
      } catch (error) {
        // Silently handle refresh errors - the invalidated queries will still update the UI
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to upload logo');
    },
  });
};

export const useUploadVenueImage = () => {
  const queryClient = useQueryClient();
  const { currentOrganization } = useOrganization();

  return useMutation({
    mutationFn: ({ file, data }: { file: File; data: UploadVenueImageData }) =>
      UploadService.uploadVenueImage(file, data),
    onSuccess: (result: UploadResponse, variables) => {
      toast.success('Venue image uploaded successfully');

      // Invalidate venue queries
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['venues', 'organization'] });

      // Update the specific venue cache with the new image URL
      if (variables.data.venueId) {
        queryClient.setQueryData(['venue', variables.data.venueId], (oldVenue: any) => {
          if (oldVenue) {
            return { ...oldVenue, imageUrl: result.url };
          }
          return oldVenue;
        });

        // Also update the venue in the organization's venue list
        if (currentOrganization?.id) {
          queryClient.setQueryData(['venues', 'organization', currentOrganization.id], (oldData: any[] = []) => {
            return oldData.map(venue =>
              venue.id === variables.data.venueId
                ? { ...venue, imageUrl: result.url }
                : venue
            );
          });
        }

        // Invalidate queries to trigger re-renders
        queryClient.invalidateQueries({ queryKey: ['venue', variables.data.venueId] });
      }
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to upload venue image');
    },
  });
};

export const useUploadCategoryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, data }: { file: File; data: UploadCategoryImageData }) =>
      UploadService.uploadCategoryImage(file, data),
    onSuccess: (result: UploadResponse) => {
      toast.success('Category image uploaded successfully');
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to upload category image');
    },
  });
};

export const useUploadUserProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, data }: { file: File; data: UploadUserProfileImageData }) =>
      UploadService.uploadUserProfileImage(file, data),
    onSuccess: (result: UploadResponse) => {
      toast.success('Profile image uploaded successfully');
      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to upload profile image');
    },
  });
};

export const useDeleteMediaFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (mediaFileId: string) => UploadService.deleteMediaFile(mediaFileId),
    onSuccess: () => {
      toast.success('Media file deleted successfully');
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['venues'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete media file');
    },
  });
};

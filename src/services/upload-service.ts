import { api } from '@/lib/api';

export interface UploadResponse {
  id: string;
  url: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
}

export interface UploadMenuItemImageData {
  menuItemId: string;
  altText?: string;
}

export interface UploadOrganizationLogoData {
  altText?: string;
}

export interface UploadVenueImageData {
  venueId: string;
  altText?: string;
}

export interface UploadCategoryImageData {
  categoryId: string;
  altText?: string;
}

export interface UploadUserProfileImageData {
  altText?: string;
}

const UploadService = {
  uploadMenuItemImage: async (
    file: File,
    data: UploadMenuItemImageData
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('menuItemId', data.menuItemId);
    if (data.altText) {
      formData.append('altText', data.altText);
    }

    const response = await api.post<UploadResponse>('/uploads/menu-item', formData);
    return response.data;
  },

  uploadOrganizationLogo: async (
    file: File,
    organizationId: string,
    data: UploadOrganizationLogoData = {}
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('logo', file);
    if (data.altText) {
      formData.append('altText', data.altText);
    }

    const response = await api.post<UploadResponse>(
      `/uploads/organization-logo/${organizationId}`,
      formData
    );

    return response.data;
  },

  uploadVenueImage: async (
    file: File,
    data: UploadVenueImageData
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('venueId', data.venueId);
    if (data.altText) {
      formData.append('altText', data.altText);
    }

    const response = await api.post<UploadResponse>('/uploads/venue-image', formData);

    return response.data;
  },

  uploadCategoryImage: async (
    file: File,
    data: UploadCategoryImageData
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('categoryId', data.categoryId);
    if (data.altText) {
      formData.append('altText', data.altText);
    }

    const response = await api.post<UploadResponse>('/uploads/category-image', formData);
    return response.data;
  },

  uploadUserProfileImage: async (
    file: File,
    data: UploadUserProfileImageData
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    if (data.altText) {
      formData.append('altText', data.altText);
    }

    const response = await api.post<UploadResponse>('/uploads/user-profile', formData);
    return response.data;
  },

  deleteMediaFile: async (mediaFileId: string): Promise<void> => {
    await api.delete(`/uploads/media/${mediaFileId}`);
  },
};

export default UploadService;

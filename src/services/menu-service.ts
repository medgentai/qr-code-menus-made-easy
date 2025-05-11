import { api } from '@/lib/api';

// Menu interfaces
export interface Menu {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  categories?: Category[];
}

export interface Category {
  id: string;
  menuId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items?: MenuItem[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  price: string;
  discountPrice?: string | null;
  imageUrl?: string | null;
  preparationTime?: number | null;
  calories?: number | null;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spicyLevel?: number | null;
  allergens?: string | null;
  displayOrder: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

// DTOs
export interface CreateMenuDto {
  name: string;
  description?: string;
  organizationId: string;
  isActive?: boolean;
}

export interface UpdateMenuDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface CreateMenuItemDto {
  name: string;
  description?: string;
  price: string;
  discountPrice?: string;
  imageUrl?: string;
  preparationTime?: number;
  calories?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  spicyLevel?: number;
  allergens?: string;
  displayOrder?: number;
  isAvailable?: boolean;
}

export interface UpdateMenuItemDto {
  name?: string;
  description?: string;
  price?: string;
  discountPrice?: string;
  imageUrl?: string;
  preparationTime?: number;
  calories?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  spicyLevel?: number;
  allergens?: string;
  displayOrder?: number;
  isAvailable?: boolean;
}

// Menu service
const MenuService = {
  // Menu operations
  getAllForOrganization: async (organizationId: string): Promise<Menu[]> => {
    const response = await api.get<Menu[]>(`/menus/organization/${organizationId}`);
    return response.data;
  },

  getById: async (id: string): Promise<Menu> => {
    const response = await api.get<Menu>(`/menus/${id}`);
    return response.data;
  },

  create: async (data: CreateMenuDto): Promise<Menu> => {
    const response = await api.post<Menu>('/menus', data);
    return response.data;
  },

  update: async (id: string, data: UpdateMenuDto): Promise<Menu> => {
    const response = await api.patch<Menu>(`/menus/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/menus/${id}`);
  },

  // Category operations
  getAllCategoriesForMenu: async (menuId: string): Promise<Category[]> => {
    const response = await api.get<Category[]>(`/menus/${menuId}/categories`);
    return response.data;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await api.get<Category>(`/menus/categories/${id}`);
    return response.data;
  },

  createCategory: async (menuId: string, data: CreateCategoryDto): Promise<Category> => {
    const response = await api.post<Category>(`/menus/${menuId}/categories`, data);
    return response.data;
  },

  updateCategory: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    const response = await api.patch<Category>(`/menus/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/menus/categories/${id}`);
  },

  // MenuItem operations
  getAllMenuItemsForCategory: async (categoryId: string): Promise<MenuItem[]> => {
    const response = await api.get<MenuItem[]>(`/menus/categories/${categoryId}/items`);
    return response.data;
  },

  getMenuItemById: async (id: string): Promise<MenuItem> => {
    const response = await api.get<MenuItem>(`/menus/items/${id}`);
    return response.data;
  },

  createMenuItem: async (categoryId: string, data: CreateMenuItemDto): Promise<MenuItem> => {
    const response = await api.post<MenuItem>(`/menus/categories/${categoryId}/items`, data);
    return response.data;
  },

  updateMenuItem: async (id: string, data: UpdateMenuItemDto): Promise<MenuItem> => {
    const response = await api.patch<MenuItem>(`/menus/items/${id}`, data);
    return response.data;
  },

  deleteMenuItem: async (id: string): Promise<void> => {
    await api.delete(`/menus/items/${id}`);
  }
};

export default MenuService;

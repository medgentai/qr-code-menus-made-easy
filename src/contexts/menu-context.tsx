import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useOrganization } from './organization-context';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import MenuService, {
  Menu,
  Category,
  MenuItem,
  CreateMenuDto,
  UpdateMenuDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateMenuItemDto,
  UpdateMenuItemDto
} from '@/services/menu-service';

// Menu context interface
export interface MenuContextType {
  menus: Menu[];
  currentMenu: Menu | null;
  isLoading: boolean;
  error: string | null;
  fetchMenusForOrganization: (organizationId: string) => Promise<Menu[]>;
  fetchMenuById: (id: string) => Promise<Menu | null>;
  createMenu: (data: CreateMenuDto) => Promise<Menu | null>;
  updateMenu: (id: string, data: UpdateMenuDto) => Promise<Menu | null>;
  deleteMenu: (id: string) => Promise<boolean>;
  selectMenu: (menu: Menu) => void;

  // Category operations
  createCategory: (menuId: string, data: CreateCategoryDto) => Promise<Category | null>;
  updateCategory: (id: string, data: UpdateCategoryDto) => Promise<Category | null>;
  deleteCategory: (id: string) => Promise<boolean>;

  // MenuItem operations
  createMenuItem: (categoryId: string, data: CreateMenuItemDto) => Promise<MenuItem | null>;
  updateMenuItem: (id: string, data: UpdateMenuItemDto) => Promise<MenuItem | null>;
  deleteMenuItem: (id: string) => Promise<boolean>;
}

// Create the context
const MenuContext = createContext<MenuContextType | undefined>(undefined);

// Menu provider props
interface MenuProviderProps {
  children: React.ReactNode;
}

// Menu provider component
export const MenuProvider: React.FC<MenuProviderProps> = ({ children }) => {
  const { currentOrganization } = useOrganization();
  const queryClient = useQueryClient();
  const [currentMenu, setCurrentMenu] = useState<Menu | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use React Query to fetch menus - this handles caching, deduplication, and loading states
  const {
    data: menus = [],
    isLoading,
    refetch: refetchMenus
  } = useQuery({
    queryKey: ['menus', 'organization', currentOrganization?.id],
    queryFn: async () => {
      if (!currentOrganization) return [];
      console.log('Fetching menus for organization:', currentOrganization.id);
      return await MenuService.getAllForOrganization(currentOrganization.id);
    },
    enabled: !!currentOrganization,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
  });

  // Fetch menus for organization - now just a wrapper around the React Query refetch
  const fetchMenusForOrganization = useCallback(async (organizationId: string) => {
    // If the organization ID matches the current one, use the refetch function
    if (currentOrganization?.id === organizationId) {
      return refetchMenus().then(result => result.data || []);
    }

    // Otherwise, manually fetch and update the cache
    try {
      console.log('Fetching menus for organization:', organizationId);
      const fetchedMenus = await MenuService.getAllForOrganization(organizationId);
      queryClient.setQueryData(['menus', 'organization', organizationId], fetchedMenus);
      return fetchedMenus;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch menus';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    }
  }, [currentOrganization, queryClient, refetchMenus]);

  // Fetch menu by ID
  const fetchMenuById = useCallback(async (id: string) => {
    setError(null);
    try {
      // Check if we already have data in the cache
      const cachedMenu = queryClient.getQueryData<Menu>(['menu', id]);
      if (cachedMenu) {
        return cachedMenu;
      }

      const menu = await MenuService.getById(id);
      // Update the cache
      queryClient.setQueryData(['menu', id], menu);
      return menu;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch menu';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [queryClient]);

  // Create menu
  const createMenu = useCallback(async (data: CreateMenuDto) => {
    setError(null);
    try {
      const newMenu = await MenuService.create(data);
      // Update the cache
      queryClient.setQueryData(['menus', 'organization', data.organizationId],
        (oldData: Menu[] = []) => [...oldData, newMenu]);
      toast.success('Menu created successfully');
      return newMenu;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create menu';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [queryClient]);

  // Update menu
  const updateMenu = useCallback(async (id: string, data: UpdateMenuDto) => {
    setError(null);
    try {
      const updatedMenu = await MenuService.update(id, data);

      // Update the cache for the individual menu
      queryClient.setQueryData(['menu', id], updatedMenu);

      // Update the menu in the organization's menu list
      if (data.organizationId) {
        queryClient.setQueryData(['menus', 'organization', data.organizationId],
          (oldData: Menu[] = []) => oldData.map(menu => menu.id === id ? updatedMenu : menu));
      }

      if (currentMenu?.id === id) {
        setCurrentMenu(updatedMenu);
      }

      toast.success('Menu updated successfully');
      return updatedMenu;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update menu';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [currentMenu, queryClient]);

  // Delete menu
  const deleteMenu = useCallback(async (id: string) => {
    setError(null);
    try {
      const menuToDelete = queryClient.getQueryData<Menu>(['menu', id]);
      await MenuService.delete(id);

      // Remove from cache
      queryClient.removeQueries(['menu', id]);

      // Update the organization's menu list if we know the organization ID
      if (menuToDelete?.organizationId) {
        queryClient.setQueryData(['menus', 'organization', menuToDelete.organizationId],
          (oldData: Menu[] = []) => oldData.filter(menu => menu.id !== id));
      }

      if (currentMenu?.id === id) {
        setCurrentMenu(null);
      }

      toast.success('Menu deleted successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete menu';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [currentMenu, queryClient]);

  // Select menu
  const selectMenu = useCallback((menu: Menu) => {
    setCurrentMenu(menu);
  }, []);

  // Category operations
  const createCategory = useCallback(async (menuId: string, data: CreateCategoryDto) => {
    setError(null);
    try {
      const newCategory = await MenuService.createCategory(menuId, data);

      // Get the menu from cache
      const menu = queryClient.getQueryData<Menu>(['menu', menuId]);

      if (menu) {
        // Update the menu in cache with the new category
        const updatedMenu = {
          ...menu,
          categories: [...(menu.categories || []), newCategory]
        };

        // Update the cache
        queryClient.setQueryData(['menu', menuId], updatedMenu);

        // Update the menu in the organization's menu list if we know the organization ID
        if (menu.organizationId) {
          queryClient.setQueryData(['menus', 'organization', menu.organizationId],
            (oldData: Menu[] = []) => oldData.map(m => m.id === menuId ? updatedMenu : m));
        }
      }

      // Update currentMenu if it's the one being modified
      if (currentMenu?.id === menuId) {
        setCurrentMenu({
          ...currentMenu,
          categories: [...(currentMenu.categories || []), newCategory]
        });
      }

      toast.success('Category created successfully');
      return newCategory;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create category';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [currentMenu, queryClient]);

  // Update category
  const updateCategory = useCallback(async (id: string, data: UpdateCategoryDto) => {
    setError(null);
    try {
      const updatedCategory = await MenuService.updateCategory(id, data);

      // Update all menus in cache that contain this category
      queryClient.getQueriesData<Menu>(['menu']).forEach(([queryKey, menu]) => {
        if (menu?.categories?.some(cat => cat.id === id)) {
          const updatedMenu = {
            ...menu,
            categories: menu.categories.map(cat => cat.id === id ? updatedCategory : cat)
          };

          // Update the menu in cache
          queryClient.setQueryData(queryKey, updatedMenu);

          // Update the menu in the organization's menu list if we know the organization ID
          if (menu.organizationId) {
            queryClient.setQueryData(['menus', 'organization', menu.organizationId],
              (oldData: Menu[] = []) => oldData.map(m => m.id === menu.id ? updatedMenu : m));
          }
        }
      });

      // Update currentMenu if it contains the category being modified
      if (currentMenu?.categories?.some(cat => cat.id === id)) {
        setCurrentMenu({
          ...currentMenu,
          categories: currentMenu.categories.map(cat =>
            cat.id === id ? updatedCategory : cat
          )
        });
      }

      toast.success('Category updated successfully');
      return updatedCategory;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update category';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [currentMenu, queryClient]);

  // Delete category
  const deleteCategory = useCallback(async (id: string) => {
    setError(null);
    try {
      await MenuService.deleteCategory(id);

      // Update all menus in cache that contain this category
      queryClient.getQueriesData<Menu>(['menu']).forEach(([queryKey, menu]) => {
        if (menu?.categories?.some(cat => cat.id === id)) {
          const updatedMenu = {
            ...menu,
            categories: menu.categories.filter(cat => cat.id !== id)
          };

          // Update the menu in cache
          queryClient.setQueryData(queryKey, updatedMenu);

          // Update the menu in the organization's menu list if we know the organization ID
          if (menu.organizationId) {
            queryClient.setQueryData(['menus', 'organization', menu.organizationId],
              (oldData: Menu[] = []) => oldData.map(m => m.id === menu.id ? updatedMenu : m));
          }
        }
      });

      // Update currentMenu if it contains the category being deleted
      if (currentMenu?.categories?.some(cat => cat.id === id)) {
        setCurrentMenu({
          ...currentMenu,
          categories: currentMenu.categories.filter(cat => cat.id !== id)
        });
      }

      toast.success('Category deleted successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete category';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [currentMenu, queryClient]);

  // MenuItem operations
  const createMenuItem = useCallback(async (categoryId: string, data: CreateMenuItemDto) => {
    setError(null);
    try {
      const newMenuItem = await MenuService.createMenuItem(categoryId, data);

      // Update all menus in cache that contain this category
      queryClient.getQueriesData<Menu>(['menu']).forEach(([queryKey, menu]) => {
        if (menu?.categories?.some(cat => cat.id === categoryId)) {
          const updatedMenu = {
            ...menu,
            categories: menu.categories.map(cat => {
              if (cat.id === categoryId) {
                return {
                  ...cat,
                  items: [...(cat.items || []), newMenuItem]
                };
              }
              return cat;
            })
          };

          // Update the menu in cache
          queryClient.setQueryData(queryKey, updatedMenu);

          // Update the menu in the organization's menu list if we know the organization ID
          if (menu.organizationId) {
            queryClient.setQueryData(['menus', 'organization', menu.organizationId],
              (oldData: Menu[] = []) => oldData.map(m => m.id === menu.id ? updatedMenu : m));
          }
        }
      });

      // Update currentMenu if it contains the category being modified
      if (currentMenu?.categories?.some(cat => cat.id === categoryId)) {
        setCurrentMenu({
          ...currentMenu,
          categories: currentMenu.categories.map(cat => {
            if (cat.id === categoryId) {
              return {
                ...cat,
                items: [...(cat.items || []), newMenuItem]
              };
            }
            return cat;
          })
        });
      }

      toast.success('Menu item created successfully');
      return newMenuItem;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create menu item';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [currentMenu, queryClient]);

  // Update menu item
  const updateMenuItem = useCallback(async (id: string, data: UpdateMenuItemDto) => {
    setError(null);
    try {
      const updatedMenuItem = await MenuService.updateMenuItem(id, data);

      // Update all menus in cache that contain this menu item
      queryClient.getQueriesData<Menu>(['menu']).forEach(([queryKey, menu]) => {
        let menuUpdated = false;
        const updatedCategories = menu?.categories?.map(cat => {
          if (cat.items?.some(item => item.id === id)) {
            menuUpdated = true;
            return {
              ...cat,
              items: cat.items.map(item => item.id === id ? updatedMenuItem : item)
            };
          }
          return cat;
        });

        if (menuUpdated && menu) {
          const updatedMenu = { ...menu, categories: updatedCategories };

          // Update the menu in cache
          queryClient.setQueryData(queryKey, updatedMenu);

          // Update the menu in the organization's menu list if we know the organization ID
          if (menu.organizationId) {
            queryClient.setQueryData(['menus', 'organization', menu.organizationId],
              (oldData: Menu[] = []) => oldData.map(m => m.id === menu.id ? updatedMenu : m));
          }
        }
      });

      // Update currentMenu if it contains the menu item being modified
      if (currentMenu) {
        let menuUpdated = false;
        const updatedCategories = currentMenu.categories?.map(cat => {
          if (cat.items?.some(item => item.id === id)) {
            menuUpdated = true;
            return {
              ...cat,
              items: cat.items.map(item =>
                item.id === id ? updatedMenuItem : item
              )
            };
          }
          return cat;
        });

        if (menuUpdated) {
          setCurrentMenu({
            ...currentMenu,
            categories: updatedCategories
          });
        }
      }

      toast.success('Menu item updated successfully');
      return updatedMenuItem;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update menu item';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [currentMenu, queryClient]);

  // Delete menu item
  const deleteMenuItem = useCallback(async (id: string) => {
    setError(null);
    try {
      await MenuService.deleteMenuItem(id);

      // Update all menus in cache that contain this menu item
      queryClient.getQueriesData<Menu>(['menu']).forEach(([queryKey, menu]) => {
        let menuUpdated = false;
        const updatedCategories = menu?.categories?.map(cat => {
          if (cat.items?.some(item => item.id === id)) {
            menuUpdated = true;
            return {
              ...cat,
              items: cat.items.filter(item => item.id !== id)
            };
          }
          return cat;
        });

        if (menuUpdated && menu) {
          const updatedMenu = { ...menu, categories: updatedCategories };

          // Update the menu in cache
          queryClient.setQueryData(queryKey, updatedMenu);

          // Update the menu in the organization's menu list if we know the organization ID
          if (menu.organizationId) {
            queryClient.setQueryData(['menus', 'organization', menu.organizationId],
              (oldData: Menu[] = []) => oldData.map(m => m.id === menu.id ? updatedMenu : m));
          }
        }
      });

      // Update currentMenu if it contains the menu item being deleted
      if (currentMenu) {
        let menuUpdated = false;
        const updatedCategories = currentMenu.categories?.map(cat => {
          if (cat.items?.some(item => item.id === id)) {
            menuUpdated = true;
            return {
              ...cat,
              items: cat.items.filter(item => item.id !== id)
            };
          }
          return cat;
        });

        if (menuUpdated) {
          setCurrentMenu({
            ...currentMenu,
            categories: updatedCategories
          });
        }
      }

      toast.success('Menu item deleted successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete menu item';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  }, [currentMenu, queryClient]);

  // No need for the useEffect to load menus - React Query handles this automatically

  const value = {
    menus,
    currentMenu,
    isLoading,
    error,
    fetchMenusForOrganization,
    fetchMenuById,
    createMenu,
    updateMenu,
    deleteMenu,
    selectMenu,
    createCategory,
    updateCategory,
    deleteCategory,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};

// Hook to use the menu context
export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};

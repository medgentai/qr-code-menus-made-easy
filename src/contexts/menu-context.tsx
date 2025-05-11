import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/sonner';
import { useOrganization } from './organization-context';
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
  fetchMenusForOrganization: (organizationId: string) => Promise<void>;
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
  const [menus, setMenus] = useState<Menu[]>([]);
  const [currentMenu, setCurrentMenu] = useState<Menu | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch menus for organization
  const fetchMenusForOrganization = useCallback(async (organizationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedMenus = await MenuService.getAllForOrganization(organizationId);
      setMenus(fetchedMenus);
      return fetchedMenus;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch menus';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch menu by ID
  const fetchMenuById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const menu = await MenuService.getById(id);
      return menu;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch menu';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create menu
  const createMenu = useCallback(async (data: CreateMenuDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const newMenu = await MenuService.create(data);
      setMenus(prev => [...prev, newMenu]);
      toast.success('Menu created successfully');
      return newMenu;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create menu';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update menu
  const updateMenu = useCallback(async (id: string, data: UpdateMenuDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedMenu = await MenuService.update(id, data);
      setMenus(prev => prev.map(menu => menu.id === id ? updatedMenu : menu));
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
    } finally {
      setIsLoading(false);
    }
  }, [currentMenu]);

  // Delete menu
  const deleteMenu = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await MenuService.delete(id);
      setMenus(prev => prev.filter(menu => menu.id !== id));
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
    } finally {
      setIsLoading(false);
    }
  }, [currentMenu]);

  // Select menu
  const selectMenu = useCallback((menu: Menu) => {
    setCurrentMenu(menu);
  }, []);

  // Category operations
  const createCategory = useCallback(async (menuId: string, data: CreateCategoryDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const newCategory = await MenuService.createCategory(menuId, data);
      
      // Update menus state with the new category
      setMenus(prev => prev.map(menu => {
        if (menu.id === menuId) {
          return {
            ...menu,
            categories: [...(menu.categories || []), newCategory]
          };
        }
        return menu;
      }));
      
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
    } finally {
      setIsLoading(false);
    }
  }, [currentMenu]);

  // Update category
  const updateCategory = useCallback(async (id: string, data: UpdateCategoryDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedCategory = await MenuService.updateCategory(id, data);
      
      // Update menus state with the updated category
      setMenus(prev => prev.map(menu => {
        if (menu.categories?.some(cat => cat.id === id)) {
          return {
            ...menu,
            categories: menu.categories.map(cat => 
              cat.id === id ? updatedCategory : cat
            )
          };
        }
        return menu;
      }));
      
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
    } finally {
      setIsLoading(false);
    }
  }, [currentMenu]);

  // Delete category
  const deleteCategory = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await MenuService.deleteCategory(id);
      
      // Update menus state by removing the deleted category
      setMenus(prev => prev.map(menu => {
        if (menu.categories?.some(cat => cat.id === id)) {
          return {
            ...menu,
            categories: menu.categories.filter(cat => cat.id !== id)
          };
        }
        return menu;
      }));
      
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
    } finally {
      setIsLoading(false);
    }
  }, [currentMenu]);

  // MenuItem operations
  const createMenuItem = useCallback(async (categoryId: string, data: CreateMenuItemDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const newMenuItem = await MenuService.createMenuItem(categoryId, data);
      
      // Update menus state with the new menu item
      setMenus(prev => prev.map(menu => {
        if (menu.categories?.some(cat => cat.id === categoryId)) {
          return {
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
        }
        return menu;
      }));
      
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
    } finally {
      setIsLoading(false);
    }
  }, [currentMenu]);

  // Update menu item
  const updateMenuItem = useCallback(async (id: string, data: UpdateMenuItemDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedMenuItem = await MenuService.updateMenuItem(id, data);
      
      // Update menus state with the updated menu item
      setMenus(prev => prev.map(menu => {
        let menuUpdated = false;
        const updatedCategories = menu.categories?.map(cat => {
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
        
        return menuUpdated ? { ...menu, categories: updatedCategories } : menu;
      }));
      
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
    } finally {
      setIsLoading(false);
    }
  }, [currentMenu]);

  // Delete menu item
  const deleteMenuItem = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await MenuService.deleteMenuItem(id);
      
      // Update menus state by removing the deleted menu item
      setMenus(prev => prev.map(menu => {
        let menuUpdated = false;
        const updatedCategories = menu.categories?.map(cat => {
          if (cat.items?.some(item => item.id === id)) {
            menuUpdated = true;
            return {
              ...cat,
              items: cat.items.filter(item => item.id !== id)
            };
          }
          return cat;
        });
        
        return menuUpdated ? { ...menu, categories: updatedCategories } : menu;
      }));
      
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
    } finally {
      setIsLoading(false);
    }
  }, [currentMenu]);

  // Load menus when organization changes
  useEffect(() => {
    if (currentOrganization) {
      fetchMenusForOrganization(currentOrganization.id);
    }
  }, [currentOrganization, fetchMenusForOrganization]);

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

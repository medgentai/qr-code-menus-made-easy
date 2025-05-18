import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from '@/components/ui/sonner';
import PublicMenuService, { PublicMenu } from '@/services/public-menu-service';

// Public menu context interface
export interface PublicMenuContextType {
  menu: PublicMenu | null;
  isLoading: boolean;
  error: string | null;
  activeCategory: string | null;
  setActiveCategory: (categoryId: string | null) => void;
  loadMenuByOrganizationSlug: (slug: string, tableId?: string, venueId?: string) => Promise<void>;
  loadMenuById: (id: string) => Promise<void>;
}

// Create the context
const PublicMenuContext = createContext<PublicMenuContextType | undefined>(undefined);

// Props for the provider component
interface PublicMenuProviderProps {
  children: React.ReactNode;
}

// Public menu provider component
export const PublicMenuProvider: React.FC<PublicMenuProviderProps> = ({ children }) => {
  const [menu, setMenu] = useState<PublicMenu | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Load menu by organization slug
  const loadMenuByOrganizationSlug = useCallback(async (
    slug: string,
    tableId?: string,
    venueId?: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await PublicMenuService.getMenuByOrganizationAndTable(slug, tableId, venueId);
      setMenu(data);
      
      // Set the first category as active if there are categories
      if (data.categories && data.categories.length > 0) {
        setActiveCategory(data.categories[0].id);
      }
    } catch (err) {
      console.error('Error loading menu:', err);
      setError('Failed to load menu. Please try again.');
      toast.error('Failed to load menu');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load menu by ID
  const loadMenuById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await PublicMenuService.getMenuById(id);
      setMenu(data);
      
      // Set the first category as active if there are categories
      if (data.categories && data.categories.length > 0) {
        setActiveCategory(data.categories[0].id);
      }
    } catch (err) {
      console.error('Error loading menu:', err);
      setError('Failed to load menu. Please try again.');
      toast.error('Failed to load menu');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Context value
  const value = {
    menu,
    isLoading,
    error,
    activeCategory,
    setActiveCategory,
    loadMenuByOrganizationSlug,
    loadMenuById,
  };

  return (
    <PublicMenuContext.Provider value={value}>
      {children}
    </PublicMenuContext.Provider>
  );
};

// Hook to use the public menu context
export const usePublicMenu = () => {
  const context = useContext(PublicMenuContext);
  if (context === undefined) {
    throw new Error('usePublicMenu must be used within a PublicMenuProvider');
  }
  return context;
};

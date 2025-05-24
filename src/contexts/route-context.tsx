import React, { createContext, useContext, useEffect, useState } from 'react';
import { isPublicRoute } from '@/config/routes';

interface RouteContextType {
  isPublic: boolean;
  isProtected: boolean;
  pathname: string;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

interface RouteProviderProps {
  children: React.ReactNode;
}

/**
 * RouteProvider that tracks the current route without requiring React Router
 * This allows components outside the Router to know about route changes
 */
export const RouteProvider: React.FC<RouteProviderProps> = ({ children }) => {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    // Listen for route changes
    const handleLocationChange = () => {
      setPathname(window.location.pathname);
    };

    // Listen for popstate (back/forward buttons)
    window.addEventListener('popstate', handleLocationChange);

    // Listen for pushstate/replacestate (programmatic navigation)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      handleLocationChange();
    };

    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  const isPublic = isPublicRoute(pathname);

  const value: RouteContextType = {
    isPublic,
    isProtected: !isPublic,
    pathname,
  };

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
};

/**
 * Hook to access route information from anywhere in the app
 */
export const useRouteContext = (): RouteContextType => {
  const context = useContext(RouteContext);
  if (context === undefined) {
    throw new Error('useRouteContext must be used within a RouteProvider');
  }
  return context;
};

export default RouteProvider;

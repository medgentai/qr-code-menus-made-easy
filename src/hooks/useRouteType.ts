import { useLocation } from 'react-router-dom';
import { isCurrentRoutePublic } from '@/config/routes';

/**
 * Custom hook to determine if the current route is public or protected
 * Uses React Router's location context for proper route detection
 */
export const useRouteType = () => {
  const location = useLocation();
  
  const isPublic = isCurrentRoutePublic(location);
  
  return {
    isPublic,
    isProtected: !isPublic,
    pathname: location.pathname,
    location
  };
};

export default useRouteType;

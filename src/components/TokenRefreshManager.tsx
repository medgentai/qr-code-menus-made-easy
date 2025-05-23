import { useEffect, useState } from 'react';
import { refreshAccessToken } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';

/**
 * TokenRefreshManager is a component that handles token refresh on app initialization
 * and sets up periodic token refresh to ensure the app always has a valid token.
 *
 * It doesn't render anything visible - it just manages token refresh in the background.
 */
const TokenRefreshManager: React.FC = () => {
  const { state } = useAuth();
  const [isInitialRefreshDone, setIsInitialRefreshDone] = useState(false);

  // Refresh token on mount and set up periodic refresh
  useEffect(() => {
    // Function to refresh the token
    const refreshToken = async () => {
      try {
        const success = await refreshAccessToken();

        // Mark initial refresh as done regardless of success
        // This prevents infinite refresh attempts
        setIsInitialRefreshDone(true);
      } catch (error) {
        // Don't log errors for token refresh - this is expected for new users
        setIsInitialRefreshDone(true);
      }
    };

    // Only attempt to refresh if we have a user or session
    if (state.user || state.sessionId) {
      // Initial token refresh - but only if we have a user or session
      // This prevents unnecessary refresh attempts for new users
      if (!isInitialRefreshDone && !state.accessToken && (state.user || state.sessionId)) {
        refreshToken();
      }

      // Set up periodic token refresh (every 10 minutes)
      // This ensures the token is refreshed well before it expires (tokens expire in 1 hour)
      // Refreshing every 10 minutes prevents 401 errors from appearing in console
      const refreshInterval = setInterval(() => {
        refreshToken();
      }, 10 * 60 * 1000); // 10 minutes

      return () => {
        clearInterval(refreshInterval);
      };
    }
  }, [state.user, state.sessionId, state.accessToken, isInitialRefreshDone]);

  // This component doesn't render anything
  return null;
};

export default TokenRefreshManager;

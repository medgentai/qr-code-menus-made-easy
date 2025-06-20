import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api, API_BASE_URL, API_PREFIX } from '@/lib/api';
import { toast } from 'sonner';
import { isPublicRoute } from '@/config/routes';

// Declare global variables for TypeScript
declare global {
  interface Window {
    accessToken?: string;
    isRefreshingToken?: boolean;
  }
}

// User interface based on the backend JWT strategy's cleanUser
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  profileImageUrl?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// API response wrapper
export interface ApiResponseWrapper<T> {
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
  path?: string;
}

// Login response interfaces
export interface LoginResponseWithOtp {
  message: string;
  requiresOtp: true;
  userId: string;
  email: string;
}

export interface LoginResponseWithToken {
  message: string;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  expiresAt: Date;
  user: User;
  requiresOtp?: false;
}

export type LoginResponse = LoginResponseWithOtp | LoginResponseWithToken | ApiResponseWrapper<LoginResponseWithOtp | LoginResponseWithToken>;

// Auth state interface
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null; // Will be stored only in memory, not in localStorage
  sessionId: string | null;    // Used to identify the session on the server
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth context interface
export interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<User | null>;
  register: (email: string, name: string, password: string) => Promise<boolean>;
  verifyOtp: (email: string, otpCode: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  updateUser: (user: Partial<User>) => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: React.ReactNode;
}

// Local storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';
const SESSION_ID_KEY = 'sessionId';

// Cookie helper functions
const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const location = useLocation();

  // Add flags to prevent duplicate initialization
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize state from cookies and memory
  const [state, setState] = useState<AuthState>(() => {
    // Access token should only be in memory, not localStorage
    // We'll need to refresh it on page load
    let accessToken = null;

    // Get session ID from cookie only
    let sessionId = getCookie('sessionId');

    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');

    // Initialize auth state silently
    return {
      user,
      accessToken,
      refreshToken: null,
      sessionId,
      isAuthenticated: !!user && !!sessionId,
      isLoading: true, // Start with loading true
      error: null,
    };
  });

  // Validate session on mount - simplified and deduplicated
  useEffect(() => {
    const validateSession = async () => {
      // Prevent duplicate initialization
      if (isInitializing || hasInitialized) {
        return;
      }

      setIsInitializing(true);

      try {
        // Check if we're on a public route - if so, skip session validation
        const isPublic = isPublicRoute(location.pathname);

        if (isPublic) {
          // For public routes, just set loading to false and don't validate session
          setState(prev => ({ ...prev, isLoading: false }));
          return;
        }

        const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
        const sessionId = getCookie('sessionId');

        // If we have user data and session ID, try to refresh the token
        if (user && sessionId) {
          // Set global flag to prevent other requests
          window.isRefreshingToken = true;

          try {
            const refreshed = await refreshSession();
            if (refreshed) {
              setState(prev => ({
                ...prev,
                isAuthenticated: true,
                isLoading: false,
              }));
            } else {
              // Keep user authenticated if we have user data, even if refresh fails
              setState(prev => ({
                ...prev,
                isAuthenticated: !!user,
                isLoading: false,
              }));
            }
          } catch (error) {
            // Keep user authenticated if we have user data
            setState(prev => ({
              ...prev,
              isAuthenticated: !!user,
              isLoading: false,
            }));
          } finally {
            window.isRefreshingToken = false;
          }
        } else if (user) {
          // We have user data but no session - try to refresh
          try {
            const refreshed = await refreshSession();
            setState(prev => ({
              ...prev,
              isAuthenticated: refreshed,
              isLoading: false,
            }));
          } catch (error) {
            setState(prev => ({
              ...prev,
              isAuthenticated: false,
              isLoading: false,
            }));
          }
        } else {
          // No user data - not authenticated
          setState(prev => ({
            ...prev,
            isAuthenticated: false,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('Session validation error:', error);
        setState(prev => ({
          ...prev,
          isAuthenticated: false,
          isLoading: false,
        }));
      } finally {
        setIsInitializing(false);
        setHasInitialized(true);
      }
    };

    validateSession();
  }, []); // Only run once on mount

  // Save auth state to local storage (user only)
  const saveAuthState = (
    user: User | null,
    _accessToken: string | null, // Not used, only kept for API consistency
    _refreshToken: string | null, // Not used, only kept for API consistency
    _sessionId: string | null // Not used, only kept for API consistency
  ) => {
    // Only store user data in localStorage
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }

    // Never store access token in localStorage - security risk
    localStorage.removeItem(ACCESS_TOKEN_KEY);

    // Never store session ID in localStorage - it's in cookies
    localStorage.removeItem(SESSION_ID_KEY);

    // Never store refresh token in localStorage
    // It will only be kept in HttpOnly cookies
  };

  // Clear auth state from memory, local storage and cookies
  const clearAuthState = () => {
    // Clear user data from localStorage
    localStorage.removeItem(USER_KEY);

    // Clear any tokens that might have been stored in localStorage
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(SESSION_ID_KEY);

    // Clear organization data from localStorage
    localStorage.removeItem('currentOrganization');

    // Clear cart data
    localStorage.removeItem('cart');

    // Clear notification preferences
    localStorage.removeItem('enableNotifications');
    localStorage.removeItem('enableSoundAlerts');
    localStorage.removeItem('notifiedOrderIds');

    // Clear cookies by setting expiration in the past
    document.cookie = 'sessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'refreshToken=; path=/api/v1/auth; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    // Clear the global accessToken
    window.accessToken = undefined;

    // Force disconnect WebSocket
    try {
      const { default: webSocketService } = require('@/services/websocket-service');
      webSocketService.forceDisconnect();
    } catch (error) {
      // Ignore if websocket service is not available
    }

    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      sessionId: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  // Login function
  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const response = await api.post<LoginResponse>('/auth/login', { email, password }, {
        withAuth: false,
        skipTokenRefresh: true // Skip token refresh for login
      });

      // Extract the actual data from the nested structure if needed
      const responseData = 'data' in response.data
        ? (response.data as ApiResponseWrapper<LoginResponseWithOtp | LoginResponseWithToken>).data
        : response.data;

      // Check if OTP verification is required
      if ('requiresOtp' in responseData && responseData.requiresOtp === true) {
        toast.info('Please verify your email with the OTP code sent.');
        setState(prev => ({ ...prev, isLoading: false }));
        return null;
      }

      // At this point, we know it's a LoginResponseWithToken
      const loginResponse = responseData as LoginResponseWithToken;

      // Check user status before proceeding
      if (loginResponse.user.status === 'SUSPENDED') {
        toast.error('Your account has been suspended. Please contact support.');
        setState(prev => ({ ...prev, isLoading: false }));
        // Redirect to suspended page
        window.location.href = '/account-suspended';
        return null;
      }

      if (loginResponse.user.status === 'INACTIVE') {
        toast.error('Your account is inactive. Please contact support.');
        setState(prev => ({ ...prev, isLoading: false }));
        return null;
      }

      // Extract sessionId from the response
      const sessionId = loginResponse.sessionId;

      // Session ID received from login response

      if (!sessionId) {
        toast.error('Authentication error. Please try again.');
        setState(prev => ({ ...prev, isLoading: false }));
        return null;
      }

      // Save user data to localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(loginResponse.user));

      // Never store access token in localStorage - security risk
      localStorage.removeItem(ACCESS_TOKEN_KEY);

      // Never store session ID in localStorage - it's in cookies
      localStorage.removeItem(SESSION_ID_KEY);

      // Then use saveAuthState for consistency
      saveAuthState(
        loginResponse.user,
        loginResponse.accessToken,
        null, // Don't pass refresh token to localStorage
        sessionId
      );

      // Set the global accessToken for API requests
      window.accessToken = loginResponse.accessToken;

      // Then update state
      setState({
        user: loginResponse.user,
        accessToken: loginResponse.accessToken,
        refreshToken: loginResponse.refreshToken, // Store in memory only
        sessionId: sessionId,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Verify that data was saved correctly
      localStorage.getItem(USER_KEY);
      getCookie('sessionId');

      return loginResponse.user;
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Login failed', isLoading: false }));
      return null;
    }
  };

  // Register function
  const register = async (email: string, name: string, password: string): Promise<boolean> => {
    try {
      await api.post('/auth/register', { email, name, password }, { withAuth: false });
      toast.success('Registration successful! Please check your email for the OTP code.');
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Registration failed', isLoading: false }));
      return false;
    }
  };

  // Verify OTP function
  const verifyOtp = async (email: string, otpCode: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Define a response type for OTP verification
      interface VerifyOtpResponse {
        user: User;
        accessToken: string;
        refreshToken: string;
        sessionId: string;
      }

      const response = await api.post<VerifyOtpResponse | ApiResponseWrapper<VerifyOtpResponse>>(
        '/auth/verify-otp',
        { email, otpCode },
        {
          withAuth: false,
          skipTokenRefresh: true // Skip token refresh for OTP verification
        }
      );

      // Extract the actual data from the nested structure if needed
      const responseData = 'data' in response.data
        ? (response.data as ApiResponseWrapper<VerifyOtpResponse>).data
        : response.data;

      // Check user status before proceeding
      if (responseData.user.status === 'SUSPENDED') {
        toast.error('Your account has been suspended. Please contact support.');
        setState(prev => ({ ...prev, isLoading: false }));
        // Redirect to suspended page
        window.location.href = '/account-suspended';
        return false;
      }

      if (responseData.user.status === 'INACTIVE') {
        toast.error('Your account is inactive. Please contact support.');
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      const sessionId = responseData.sessionId;

      // Session ID received from OTP verification

      if (!sessionId) {
        toast.error('Authentication error. Please try again.');
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      // Save user data to localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(responseData.user));

      // Never store access token in localStorage - security risk
      localStorage.removeItem(ACCESS_TOKEN_KEY);

      // Never store session ID in localStorage - it's in cookies
      localStorage.removeItem(SESSION_ID_KEY);

      // Then use saveAuthState for consistency
      saveAuthState(
        responseData.user,
        responseData.accessToken,
        null, // Don't pass refresh token to localStorage
        sessionId
      );

      // Set the global accessToken for API requests
      window.accessToken = responseData.accessToken;

      // Then update state
      setState({
        user: responseData.user,
        accessToken: responseData.accessToken,
        refreshToken: responseData.refreshToken,
        sessionId: sessionId,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Auth data saved after OTP verification

      return true;
    } catch (error) {
      setState(prev => ({ ...prev, error: 'OTP verification failed', isLoading: false }));
      return false;
    }
  };

  // Resend OTP function
  const resendOtp = async (email: string): Promise<boolean> => {
    try {
      await api.post('/auth/resend-otp', { email }, { withAuth: false });
      toast.success('A new OTP code has been sent to your email.');
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to resend OTP', isLoading: false }));
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    // Store token before clearing state
    const currentToken = state.accessToken;

    // First clear the local state to ensure UI updates immediately
    clearAuthState();

    // Show success message to user
    toast.success('You have been logged out successfully');

    // Then try to notify the server (but don't wait for it)
    if (currentToken) {
      // Use setTimeout to push this to the next event loop cycle
      // This ensures it happens after the UI updates
      setTimeout(() => {
        try {
          // Use a simple fetch to avoid any dependencies on the auth state
          fetch(`${API_BASE_URL}${API_PREFIX}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${currentToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({}), // Send empty object as body
            credentials: 'include' // Important: include credentials to allow cookie clearing
          })
          .then(() => {
            // Double-check that cookies are cleared client-side as well
            document.cookie = 'sessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'refreshToken=; path=/api/v1/auth; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          })
          .catch(() => {
            // Silently ignore any errors - user is already logged out on the client
            // Ensure cookies are cleared even if server request fails
            document.cookie = 'sessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'refreshToken=; path=/api/v1/auth; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          });
        } catch (error) {
          // Ignore errors - user is already logged out on the client
          // Ensure cookies are cleared even if there's an exception
          document.cookie = 'sessionId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'refreshToken=; path=/api/v1/auth; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      }, 0);
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      await api.post('/auth/forgot-password', { email }, { withAuth: false });
      toast.success('If your email is registered, you will receive a password reset link.');
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to send reset email', isLoading: false }));
      return false;
    }
  };

  // Reset password function
  const resetPassword = async (token: string, password: string): Promise<boolean> => {
    try {
      await api.post('/auth/reset-password', { token, password }, { withAuth: false });
      toast.success('Password reset successful. You can now log in with your new password.');
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Password reset failed', isLoading: false }));
      return false;
    }
  };

  // Refresh session function with deduplication
  const refreshSession = async (): Promise<boolean> => {
    // Prevent duplicate refresh attempts
    if (window.isRefreshingToken) {
      // Wait for the current refresh to complete
      return new Promise((resolve) => {
        const checkRefresh = () => {
          if (!window.isRefreshingToken) {
            resolve(!!window.accessToken);
          } else {
            setTimeout(checkRefresh, 100);
          }
        };
        checkRefresh();
      });
    }

    // Set the global flag to indicate that token refresh is in progress
    window.isRefreshingToken = true;

    // With HttpOnly cookies, we don't need to explicitly get the session ID
    // The backend will extract it from the cookies automatically
    // We'll still try to get it for logging purposes
    const sessionId = state.sessionId || localStorage.getItem(SESSION_ID_KEY) || getCookie('sessionId');

    try {
      // Skip session status check to reduce API calls - go directly to refresh
      // The refresh endpoint will validate the session internally

      // Response types are handled directly in the fetch call

      // Use fetch directly to have more control over credentials
      const refreshUrl = `${API_BASE_URL}${API_PREFIX}/auth/refresh-session`;
      const refreshResponse = await fetch(refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Only include sessionId if we have it (for backward compatibility)
          ...(sessionId ? { sessionId } : {}),
          // Include simplified device fingerprint for additional security
          fingerprint: navigator.userAgent.split(' ').slice(0, 3).join(' ')
        }),
        // Include credentials to send and receive cookies
        credentials: 'include'
      });

      if (!refreshResponse.ok) {
        clearAuthState();
        return false;
      }

      const response = {
        data: await refreshResponse.json()
      };

      // Token refresh successful

      // Extract the actual data from the nested structure if needed
      // The backend wraps responses in a data property
      const tokenData = response.data.data || response.data;

      // Check if we have a valid response with accessToken
      if (!tokenData || !tokenData.accessToken) {
        clearAuthState();
        return false;
      }

      const newAccessToken = tokenData.accessToken;
      // Refresh token is now stored in HttpOnly cookie
      const newSessionId = tokenData.sessionId || getCookie('sessionId') || sessionId;

      // Never save tokens to localStorage - only keep in memory
      try {
        // Clear any existing values from localStorage
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(SESSION_ID_KEY);

        // Verify cookies are set
        getCookie('sessionId');

        // Then use saveAuthState for consistency
        saveAuthState(
          state.user,
          newAccessToken,
          null, // Don't pass refresh token to localStorage
          newSessionId
        );

        // Force a small delay to ensure localStorage is updated
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (storageError) {
        // Try an alternative approach
        document.cookie = `accessToken=${newAccessToken}; path=/; max-age=3600`;
      }

      // Check if user status has changed (e.g., suspended while logged in)
      if (state.user && (state.user.status === 'SUSPENDED' || state.user.status === 'INACTIVE')) {
        clearAuthState();
        toast.error('Your account has been suspended. Please contact support.');
        window.location.href = '/account-suspended';
        return false;
      }

      // Set the global accessToken for API requests
      window.accessToken = newAccessToken;

      // Then update state
      setState(prev => ({
        ...prev,
        accessToken: newAccessToken,
        refreshToken: null, // Refresh token is now in HttpOnly cookie
        sessionId: newSessionId,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));

      // Verify that data was saved correctly
      getCookie('sessionId');

      // Clear the refresh flag
      window.isRefreshingToken = false;
      return true;
    } catch (error: any) {
      // Clear the refresh flag
      window.isRefreshingToken = false;

      // Don't show error messages for token refresh failures on initial page load
      // This prevents confusing new users
      if (error.statusCode >= 500) {
        toast.error('Server error. Please try again later.');
      }

      // Only clear auth state and redirect if we don't have user data
      // This prevents losing authentication on temporary network issues
      const hasUserData = state.user || localStorage.getItem(USER_KEY);

      if (!hasUserData) {
        // Clear auth state only if we have no user data
        clearAuthState();

        // Only redirect to login if we're not on a public route
        const isPublic = isPublicRoute(location.pathname);

        if (!isPublic) {
          // Redirect to login page only for protected routes
          window.location.href = '/login';
        }
      } else {
        // If we have user data but refresh failed, just set loading to false
        // The user can continue using the app and API will handle token refresh
        setState(prev => ({
          ...prev,
          isLoading: false,
          // Keep the user authenticated if we have user data
          isAuthenticated: true
        }));
      }

      return false;
    }
  };

  // Update user function
  const updateUser = (userData: Partial<User>) => {
    if (!state.user) return;

    const updatedUser = { ...state.user, ...userData };
    setState(prev => ({ ...prev, user: updatedUser }));

    // Save to localStorage (except refresh token)
    saveAuthState(
      updatedUser,
      state.accessToken,
      null, // Don't pass refresh token to localStorage
      state.sessionId
    );
  };

  // Context value
  const value: AuthContextType = {
    state,
    login,
    register,
    verifyOtp,
    resendOtp,
    logout,
    forgotPassword,
    resetPassword,
    refreshSession,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};



// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

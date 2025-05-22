import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, API_BASE_URL, API_PREFIX } from '@/lib/api';
import { toast } from '@/components/ui/sonner';

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

export type LoginResponse = LoginResponseWithOtp | LoginResponseWithToken;

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
export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize state from local storage if available
  const [state, setState] = useState<AuthState>({
    user: JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: null, // Don't store refresh token in localStorage
    sessionId: localStorage.getItem(SESSION_ID_KEY),
    isAuthenticated: !!localStorage.getItem(ACCESS_TOKEN_KEY),
    isLoading: true,
    error: null,
  });

  // Check if the user is authenticated on mount
  useEffect(() => {
    const validateSession = async () => {
      console.log('Validating session...');

      if (state.accessToken) {
        try {
          console.log('Checking user session with /auth/me endpoint');
          const response = await api.get<User>('/auth/me', {
            showErrorToast: false,
          });

          console.log('Session validation successful');
          setState(prev => ({
            ...prev,
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          }));
        } catch (error: any) {
          console.warn('Session validation failed:', error);

          // Check if it's an authentication error
          if (error.statusCode === 401) {
            console.log('Authentication error, attempting to refresh token');
            // Try to refresh the token if validation fails
            const refreshed = await refreshSession();
            if (!refreshed) {
              console.warn('Token refresh failed, clearing auth state');
              // If refresh fails, clear auth state
              clearAuthState();

              // Only show toast if it's not a network error (which would be shown by the API client)
              if (error.statusCode !== 0) {
                toast.error('Your session has expired. Please log in again.');
              }
            }
          } else if (error.statusCode >= 500) {
            console.error('Server error during session validation');
            toast.error('Server error. Please try again later.');
          }

          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        console.log('No access token found, session not validated');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    validateSession();
  }, []);

  // Save auth state to local storage (but not refresh token)
  const saveAuthState = (
    user: User | null,
    accessToken: string | null,
    refreshToken: string | null,
    sessionId: string | null
  ) => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);

    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);

    if (sessionId) localStorage.setItem(SESSION_ID_KEY, sessionId);
    else localStorage.removeItem(SESSION_ID_KEY);

    // Don't store refresh token in localStorage
    // It will only be kept in memory (React state)
  };

  // Clear auth state from local storage
  const clearAuthState = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(SESSION_ID_KEY);

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
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password }, { withAuth: false });

      // Check if OTP verification is required
      if (response.data.requiresOtp) {
        toast.info('Please verify your email with the OTP code sent.');
        return false;
      }

      // At this point, we know it's a LoginResponseWithToken
      const loginResponse = response.data as LoginResponseWithToken;

      // Extract sessionId from the response
      const sessionId = loginResponse.sessionId;

      // Save auth state
      setState({
        user: loginResponse.user,
        accessToken: loginResponse.accessToken,
        refreshToken: loginResponse.refreshToken, // Store in memory only
        sessionId: sessionId,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Save to localStorage (except refresh token)
      saveAuthState(
        loginResponse.user,
        loginResponse.accessToken,
        null, // Don't pass refresh token to localStorage
        sessionId
      );

      return true;
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Login failed', isLoading: false }));
      return false;
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
      // Define a response type for OTP verification
      interface VerifyOtpResponse {
        user: User;
        accessToken: string;
        refreshToken: string;
        sessionId: string;
      }

      const response = await api.post<VerifyOtpResponse>('/auth/verify-otp', { email, otpCode }, { withAuth: false });

      // Save auth state
      setState({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        sessionId: response.data.sessionId,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      saveAuthState(
        response.data.user,
        response.data.accessToken,
        null, // Don't pass refresh token to localStorage
        response.data.sessionId
      );
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
            body: JSON.stringify({}) // Send empty object as body
          }).catch(() => {
            // Silently ignore any errors - user is already logged out on the client
            console.log('Backend logout notification attempted');
          });
        } catch (error) {
          // Ignore errors - user is already logged out on the client
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

  // Refresh session function
  const refreshSession = async (): Promise<boolean> => {
    if (!state.sessionId) {
      console.warn('No session ID available');
      return false;
    }

    try {
      // Define a response type for session refresh
      interface RefreshSessionResponse {
        accessToken: string;
        refreshToken: string;
        sessionId: string;
        expiresAt: Date;
      }

      console.log('Attempting to refresh token using session ID...');
      const response = await api.post<RefreshSessionResponse>(
        '/auth/refresh-session',
        {
          sessionId: state.sessionId,
          // Include device fingerprint for additional security
          fingerprint: navigator.userAgent
        },
        { withAuth: false, showErrorToast: false }
      );

      console.log('Token refresh successful');
      setState(prev => ({
        ...prev,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken, // Store in memory only
        sessionId: response.data.sessionId || prev.sessionId,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));

      // Save to localStorage (except refresh token)
      saveAuthState(
        state.user,
        response.data.accessToken,
        null, // Don't pass refresh token to localStorage
        response.data.sessionId || state.sessionId
      );

      return true;
    } catch (error: any) {
      console.error('Token refresh failed:', error);

      // Show a user-friendly message for token refresh failures
      if (error.statusCode === 401) {
        toast.error('Your session has expired. Please log in again.');
      } else if (error.statusCode >= 500) {
        toast.error('Server error. Please try again later.');
      }

      // Clear auth state on any refresh error
      clearAuthState();

      // Redirect to login page
      window.location.href = '/login';

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
    ...state,
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

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
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

// Auth state interface
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
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
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Initialize state from local storage if available
  const [state, setState] = useState<AuthState>({
    user: JSON.parse(localStorage.getItem(USER_KEY) || 'null'),
    accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    isAuthenticated: !!localStorage.getItem(ACCESS_TOKEN_KEY),
    isLoading: true,
    error: null,
  });

  // Check if the user is authenticated on mount
  useEffect(() => {
    const validateSession = async () => {
      if (state.accessToken) {
        try {
          const response = await api.get<User>('/auth/me', {
            showErrorToast: false,
          });
          setState(prev => ({
            ...prev,
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          }));
        } catch (error) {
          // Try to refresh the token if validation fails
          const refreshed = await refreshSession();
          if (!refreshed) {
            // If refresh fails, clear auth state
            clearAuthState();
          }
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    validateSession();
  }, []);

  // Save auth state to local storage
  const saveAuthState = (user: User | null, accessToken: string | null, refreshToken: string | null) => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
    
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
    
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  };

  // Clear auth state from local storage
  const clearAuthState = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', { email, password }, { withAuth: false });
      
      // Check if OTP verification is required
      if (response.data.requiresOtp) {
        toast.info('Please verify your email with the OTP code sent.');
        return false;
      }
      
      // Save auth state
      setState({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      saveAuthState(response.data.user, response.data.accessToken, response.data.refreshToken);
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
      const response = await api.post('/auth/verify-otp', { email, otpCode }, { withAuth: false });
      
      // Save auth state
      setState({
        user: response.data.user,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      saveAuthState(response.data.user, response.data.accessToken, response.data.refreshToken);
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
    if (state.accessToken) {
      try {
        await api.post('/auth/logout');
      } catch (error) {
        // Continue with logout even if the API call fails
        console.error('Logout API call failed:', error);
      }
    }
    
    clearAuthState();
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
    if (!state.refreshToken) return false;
    
    try {
      const response = await api.post(
        '/auth/refresh-token',
        { refreshToken: state.refreshToken },
        { withAuth: false, showErrorToast: false }
      );
      
      setState(prev => ({
        ...prev,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));
      
      saveAuthState(state.user, response.data.accessToken, response.data.refreshToken);
      return true;
    } catch (error) {
      clearAuthState();
      return false;
    }
  };

  // Update user function
  const updateUser = (userData: Partial<User>) => {
    if (!state.user) return;
    
    const updatedUser = { ...state.user, ...userData };
    setState(prev => ({ ...prev, user: updatedUser }));
    saveAuthState(updatedUser, state.accessToken, state.refreshToken);
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

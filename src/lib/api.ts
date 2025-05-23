import { toast } from "@/components/ui/sonner";

// Declare global variables for TypeScript
declare global {
  interface Window {
    accessToken?: string;
    isRefreshingToken?: boolean;
  }
}

/**
 * Base API URL from environment variables or default to localhost
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * API prefix for all endpoints
 */
export const API_PREFIX = '/api/v1';

/**
 * Error response structure from the backend
 */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
  path?: string;
  timestamp?: string;
  errors?: Record<string, string[]>;
}

/**
 * Success response structure from the backend
 */
export interface ApiResponse<T> {
  data: T;
  statusCode: number;
  message: string;
  timestamp: string;
  path?: string;
  meta?: Record<string, any>;
}

/**
 * Options for API requests
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  withAuth?: boolean;
  showErrorToast?: boolean;
  skipTokenRefresh?: boolean; // Skip token refresh on 401 errors
}

/**
 * Default request options
 */
const defaultOptions: RequestOptions = {
  withAuth: true,
  showErrorToast: true,
  skipTokenRefresh: false,
};

// Note: We now get the token directly in createHeaders for better reliability

/**
 * Get session ID from cookies
 */
const getSessionId = (): string | null => {
  // With HttpOnly cookies, we can't access the sessionId directly from JavaScript
  // The backend will extract it from the cookie automatically
  // This function now returns null, and the backend handles getting the session ID from cookies

  // For backward compatibility, still check localStorage
  return localStorage.getItem('sessionId');
};

/**
 * Format error message from API response
 */
const formatErrorMessage = (error: ApiError): string => {
  if (Array.isArray(error.message)) {
    return error.message.join(', ');
  }

  if (error.errors) {
    const errorMessages = Object.values(error.errors).flat();
    return errorMessages.join(', ');
  }

  return error.message || 'An unexpected error occurred';
};

/**
 * Handle API errors
 */
const handleApiError = async (response: Response, options?: RequestOptions): Promise<ApiError> => {
  try {
    const error = await response.json() as ApiError;

    // Don't show error toasts for authentication errors
    if (options?.showErrorToast !== false && response.status !== 401) {
      toast.error(formatErrorMessage(error));
    }

    return error;
  } catch (e) {
    const error: ApiError = {
      statusCode: response.status,
      message: response.statusText || 'An unexpected error occurred',
    };

    // Don't show error toasts for authentication errors
    if (options?.showErrorToast !== false && response.status !== 401) {
      toast.error(error.message);
    }

    return error;
  }
};

/**
 * Create headers for API requests
 */
const createHeaders = (options?: RequestOptions): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  if (options?.withAuth !== false) {
    // Get token from the global accessToken variable
    // This ensures we're using the token from memory, not localStorage
    let token = null;

    // Check if we have a global accessToken variable
    if (typeof window !== 'undefined' && window.accessToken) {
      token = window.accessToken;
    }

    // If we don't have a token in memory, we'll need to refresh
    if (!token) {
      console.warn('No access token in memory - will try to use cookies instead');

      // We'll still include the Authorization header with 'Bearer ' to indicate
      // that we're trying to use token authentication
      // The backend will check for cookies if the token is missing or invalid
      headers['Authorization'] = 'Bearer ';
    } else {
      headers['Authorization'] = `Bearer ${token}`;
      // Log the token being used for debugging (only show the beginning)
      console.log('Using token for request:', token.substring(0, 20) + '...');
    }
  }

  return headers;
};

/**
 * Check session status
 */
export async function checkSessionStatus(sessionId?: string | null): Promise<any> {
  try {
    // If no session ID is provided, we'll use a special endpoint that gets it from cookies
    const url = sessionId
      ? `${API_BASE_URL}${API_PREFIX}/auth/session-status/${sessionId}`
      : `${API_BASE_URL}${API_PREFIX}/auth/session-status/current`;

    // Check session status

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Include credentials to send and receive cookies
      credentials: 'include'
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    // Don't log errors for session status checks - this is expected for new users
    return null;
  }
}

/**
 * Silent refresh function that doesn't show errors to users
 */
export async function silentRefreshAccessToken(): Promise<boolean> {
  try {
    return await refreshAccessToken();
  } catch (error) {
    // Silent refresh - don't show any errors
    return false;
  }
}

/**
 * Refresh the access token using the session ID
 */
export async function refreshAccessToken(): Promise<boolean> {
  // Set the global flag to indicate that token refresh is in progress
  window.isRefreshingToken = true;

  // With HttpOnly cookies, we don't need to explicitly pass the session ID
  // The backend will extract it from the cookies automatically
  // We'll still try to get it for logging purposes
  const sessionId = getSessionId();

  // Session ID will be extracted from cookies by the server

  // First check if the session is valid using the current session from cookies
  const sessionStatus = await checkSessionStatus(null); // Pass null to use the cookie

  // Check if we got a valid response and if the session is valid
  if (sessionStatus) {
    // The actual session data is in the 'data' property
    const sessionData = sessionStatus.data || sessionStatus;

    if (!sessionData.exists || sessionData.isRevoked) {
      // Clear invalid session data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('sessionId');
      return false;
    }
  }

  try {
    const url = `${API_BASE_URL}${API_PREFIX}/auth/refresh-session`;
    console.log('Attempting to refresh token using session ID...');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Only include sessionId if we have it (for backward compatibility)
        ...(sessionId ? { sessionId } : {}),
        // Send a simplified fingerprint to avoid mismatches
        fingerprint: navigator.userAgent.split(' ').slice(0, 3).join(' ')
      }),
      // Include credentials to send and receive cookies
      credentials: 'include'
    });

    if (!response.ok) {
      // Clear invalid session data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('sessionId');
      return false;
    }

    const responseData = await response.json();

    // Extract the actual data from the nested structure
    // The backend wraps responses in a data property
    const data = responseData.data || responseData;

    // Check if we have a valid response with accessToken
    if (!data || !data.accessToken) {
      return false;
    }

    // Store the access token in memory only
    try {
      // Remove any tokens from localStorage for security
      localStorage.removeItem('accessToken');

      // Store the token in the global variable for use in API requests
      window.accessToken = data.accessToken;

      // Don't store session ID in localStorage - it's in cookies
      localStorage.removeItem('sessionId');

      // Force a small delay to ensure memory is updated
      // This helps with race conditions in some browsers
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      // Error storing token in memory - continue anyway
    }

    // Clear the refresh flag
    window.isRefreshingToken = false;
    return true;
  } catch (error) {
    // Token refresh not needed - normal for new users

    // Clear the refresh flag
    window.isRefreshingToken = false;
    return false;
  }
}

// Flag to prevent multiple simultaneous token refreshes
let isRefreshing = false;
// Pending requests to retry after token refresh
let pendingRequests: Array<() => void> = [];

/**
 * Process all pending requests after token refresh
 */
function processPendingRequests(_success: boolean) {
  // The success parameter could be used to handle failed refreshes differently
  // Currently we just process all pending requests regardless
  pendingRequests.forEach(callback => callback());
  pendingRequests = [];
}

/**
 * Generic API request function
 */
export async function apiRequest<T>(
  endpoint: string,
  method: string,
  data?: any,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  const mergedOptions = { ...defaultOptions, ...options };
  // Add API prefix to endpoint if it doesn't already start with it
  const prefixedEndpoint = endpoint.startsWith(API_PREFIX) ? endpoint : `${API_PREFIX}${endpoint}`;
  const url = `${API_BASE_URL}${prefixedEndpoint}`;

  // Prepare to execute the request

  async function executeRequest(): Promise<ApiResponse<T>> {
    try {
      // Check if a token refresh is in progress
      if (window.isRefreshingToken && !mergedOptions.skipTokenRefresh) {
        // Wait for token refresh to complete (max 3 seconds)
        let waitTime = 0;
        const maxWaitTime = 3000; // 3 seconds
        const checkInterval = 100; // 100ms

        while (window.isRefreshingToken && waitTime < maxWaitTime) {
          await new Promise(resolve => setTimeout(resolve, checkInterval));
          waitTime += checkInterval;
        }
      }

      // Proactively check if we need to refresh the token BEFORE making the request
      if (!mergedOptions.skipTokenRefresh && !window.accessToken) {
        // No access token available, try to refresh before making the request
        // Use silent refresh to avoid showing errors in console
        const refreshSuccess = await silentRefreshAccessToken();
        if (!refreshSuccess) {
          // If refresh fails, this might be a new user or expired session
          // For new users, we'll get a 401 which is expected
          // For expired sessions, the auth context will handle the redirect
        }
      }

      const response = await fetch(url, {
        method,
        headers: createHeaders(mergedOptions),
        body: data ? JSON.stringify(data) : undefined,
        // Include credentials to send and receive cookies
        credentials: 'include'
      });

      // Note: Browser will automatically log 401 errors in Network tab
      // This is normal browser behavior and indicates our token refresh system is working
      // The 401 error you see in console is expected when tokens expire and get refreshed

      // Handle 401 Unauthorized errors (token expired)
      if (response.status === 401 && !mergedOptions.skipTokenRefresh) {
        // If we're already refreshing, wait for that to complete
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            pendingRequests.push(() => {
              executeRequest().then(resolve).catch(reject);
            });
          });
        }

        isRefreshing = true;

        try {
          const refreshSuccess = await refreshAccessToken();
          isRefreshing = false;

          if (refreshSuccess) {
            processPendingRequests(true);
            // Retry the original request with the new token
            return executeRequest();
          } else {
            processPendingRequests(false);

            // Create a more user-friendly error for authentication failures
            const authError: ApiError = {
              statusCode: 401,
              message: 'Please log in again to continue',
            };

            // Don't show toast for auth errors - let the auth context handle it
            throw authError;
          }
        } catch (refreshError) {
          isRefreshing = false;
          processPendingRequests(false);

          // Create a user-friendly error message
          const authError: ApiError = {
            statusCode: 401,
            message: 'Session expired. Please log in again.',
          };

          throw authError;
        }
      }

      if (!response.ok) {
        // Don't show error toasts for authentication errors
        if (response.status === 401) {
          const error = await response.json() as ApiError;
          throw error;
        }

        throw await handleApiError(response, mergedOptions);
      }

      const responseData = await response.json();

      // Handle both direct data and wrapped data formats
      if (responseData.data !== undefined) {
        // It's a wrapped response
        return responseData as ApiResponse<T>;
      } else {
        // It's a direct response, wrap it
        return {
          data: responseData as T,
          statusCode: response.status,
          message: 'Success',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {

      if ((error as ApiError).statusCode) {
        throw error;
      }

      const apiError: ApiError = {
        statusCode: 500,
        message: (error as Error).message || 'Network error occurred',
      };

      if (mergedOptions.showErrorToast !== false) {
        toast.error(apiError.message);
      }

      throw apiError;
    }
  }

  return executeRequest();
}

/**
 * API client with methods for different HTTP verbs
 */
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, 'GET', undefined, options),

  post: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, 'POST', data, options),

  put: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, 'PUT', data, options),

  patch: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, 'PATCH', data, options),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, 'DELETE', {}, options),
};

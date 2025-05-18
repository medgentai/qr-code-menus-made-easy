import { toast } from "@/components/ui/sonner";

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
}

/**
 * Default request options
 */
const defaultOptions: RequestOptions = {
  withAuth: true,
  showErrorToast: true,
};

/**
 * Get authentication token from local storage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
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

    if (options?.showErrorToast !== false) {
      toast.error(formatErrorMessage(error));
    }

    return error;
  } catch (e) {
    const error: ApiError = {
      statusCode: response.status,
      message: response.statusText || 'An unexpected error occurred',
    };

    if (options?.showErrorToast !== false) {
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
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

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

  console.log(`API Request: ${method} ${url}`);
  if (data) console.log('Request data:', data);

  try {
    const response = await fetch(url, {
      method,
      headers: createHeaders(mergedOptions),
      body: data ? JSON.stringify(data) : undefined,
    });

    console.log(`API Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.error('API Error Response:', response);
      throw await handleApiError(response, mergedOptions);
    }

    const responseData = await response.json();
    console.log('API Response data:', responseData);

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
    console.error('API Request error:', error);

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

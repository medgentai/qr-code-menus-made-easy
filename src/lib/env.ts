/**
 * Environment variables with type safety and default values
 */

// API URL
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Environment (development, production, etc.)
export const NODE_ENV = import.meta.env.MODE || 'development';

// Is production environment
export const IS_PRODUCTION = NODE_ENV === 'production';

// Is development environment
export const IS_DEVELOPMENT = NODE_ENV === 'development';

// Application name
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'ScanServe';

// Default pagination limit
export const DEFAULT_PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 10;

// Maximum file upload size in bytes (default: 5MB)
export const MAX_UPLOAD_SIZE = Number(import.meta.env.VITE_MAX_UPLOAD_SIZE) || 5 * 1024 * 1024;

// Supported image formats for upload
export const SUPPORTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Supported document formats for upload
export const SUPPORTED_DOCUMENT_FORMATS = ['application/pdf'];

// Debug mode
export const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';

/**
 * Log debug information if debug mode is enabled
 */
export function debugLog(...args: any[]): void {
  if (DEBUG_MODE) {
    console.log('[DEBUG]', ...args);
  }
}

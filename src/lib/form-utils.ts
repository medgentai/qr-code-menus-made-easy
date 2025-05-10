import { ApiError } from './api';
import { FieldValues, Path, UseFormSetError } from 'react-hook-form';

/**
 * Maps API validation errors to form fields
 * @param error The API error response
 * @param setError The setError function from react-hook-form
 */
export function mapApiErrorsToForm<T extends FieldValues>(
  error: ApiError,
  setError: UseFormSetError<T>
): void {
  // Handle array of error messages
  if (Array.isArray(error.message)) {
    error.message.forEach((message) => {
      // Try to extract field name from message
      const match = message.match(/^([a-zA-Z0-9_]+):/);
      if (match && match[1]) {
        const field = match[1] as Path<T>;
        setError(field, {
          type: 'server',
          message: message.replace(`${match[1]}: `, ''),
        });
      }
    });
    return;
  }

  // Handle errors object with field-specific errors
  if (error.errors) {
    Object.entries(error.errors).forEach(([field, messages]) => {
      setError(field as Path<T>, {
        type: 'server',
        message: Array.isArray(messages) ? messages[0] : messages,
      });
    });
    return;
  }

  // If no specific field errors, set a generic form error
  setError('root.serverError' as Path<T>, {
    type: 'server',
    message: error.message,
  });
}

/**
 * Formats validation error messages for display
 * @param message The error message
 * @returns Formatted error message
 */
export function formatValidationError(message: string): string {
  // Remove field name prefix if present
  const colonIndex = message.indexOf(':');
  if (colonIndex > 0) {
    return message.slice(colonIndex + 1).trim();
  }
  return message;
}

/**
 * Extracts the first error message from form errors
 * @param errors The form errors object
 * @returns The first error message or undefined
 */
export function getFirstError(errors: Record<string, any>): string | undefined {
  for (const key in errors) {
    if (errors[key]?.message) {
      return errors[key].message;
    }
  }
  return undefined;
}

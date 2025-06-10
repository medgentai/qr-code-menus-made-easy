/**
 * Unified Error Display Components - Eliminates 20+ duplicate error patterns
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { 
  AlertTriangle, 
  RefreshCw, 
  Wifi, 
  Server, 
  ShieldAlert,
  FileX,
  Search,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorDisplayProps {
  type?: 'general' | 'network' | 'server' | 'permission' | 'notfound' | 'empty' | 'timeout';
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  height?: string;
  showIcon?: boolean;
}

interface InlineErrorProps {
  message: string;
  className?: string;
}

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

// Main error display component with different types
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  type = 'general',
  title,
  message,
  onRetry,
  retryLabel = 'Try Again',
  className,
  height = '200px',
  showIcon = true
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: Wifi,
          defaultTitle: 'Connection Error',
          defaultMessage: 'Unable to connect to the server. Please check your internet connection.',
          iconColor: 'text-orange-500'
        };
      case 'server':
        return {
          icon: Server,
          defaultTitle: 'Server Error',
          defaultMessage: 'Something went wrong on our end. Please try again later.',
          iconColor: 'text-red-500'
        };
      case 'permission':
        return {
          icon: ShieldAlert,
          defaultTitle: 'Access Denied',
          defaultMessage: 'You don\'t have permission to access this resource.',
          iconColor: 'text-yellow-500'
        };
      case 'notfound':
        return {
          icon: FileX,
          defaultTitle: 'Not Found',
          defaultMessage: 'The requested resource could not be found.',
          iconColor: 'text-gray-500'
        };
      case 'empty':
        return {
          icon: Search,
          defaultTitle: 'No Data',
          defaultMessage: 'No data available to display.',
          iconColor: 'text-gray-400'
        };
      case 'timeout':
        return {
          icon: Clock,
          defaultTitle: 'Request Timeout',
          defaultMessage: 'The request took too long to complete. Please try again.',
          iconColor: 'text-blue-500'
        };
      default:
        return {
          icon: AlertTriangle,
          defaultTitle: 'Error',
          defaultMessage: 'An unexpected error occurred.',
          iconColor: 'text-red-500'
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center text-center p-6',
        className
      )}
      style={{ height }}
    >
      {showIcon && (
        <Icon className={cn('h-12 w-12 mb-4', config.iconColor)} />
      )}
      <h3 className="text-lg font-semibold mb-2 text-foreground">
        {title || config.defaultTitle}
      </h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        {message || config.defaultMessage}
      </p>
      {onRetry && (
        <Button 
          onClick={onRetry} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

// Inline error for forms and small components
export const InlineError: React.FC<InlineErrorProps> = ({ 
  message, 
  className 
}) => {
  return (
    <Alert variant="destructive" className={cn('mt-2', className)}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

// Compact error for list items and cards
export const CompactError: React.FC<{ 
  message: string; 
  onRetry?: () => void;
  className?: string;
}> = ({ 
  message, 
  onRetry,
  className 
}) => {
  return (
    <div className={cn(
      'flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-lg',
      className
    )}>
      <div className="flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm">{message}</span>
      </div>
      {onRetry && (
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={onRetry}
          className="h-6 px-2 text-destructive hover:text-destructive"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

// Error boundary fallback component
export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({ 
  error, 
  resetError 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-4">
          An unexpected error occurred. Please try refreshing the page.
        </p>
        <details className="mb-4 text-left">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            Error details
          </summary>
          <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
            {error.message}
          </pre>
        </details>
        <div className="flex gap-2 justify-center">
          <Button onClick={resetError} variant="outline">
            Try Again
          </Button>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  );
};

// Empty state component (for when there's no data but it's not an error)
export const EmptyState: React.FC<{
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}> = ({ 
  icon: Icon = Search, 
  title, 
  description, 
  action,
  className 
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center p-8',
      className
    )}>
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
};

// Network status error
export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  return (
    <ErrorDisplay
      type="network"
      onRetry={onRetry}
      retryLabel="Retry Connection"
    />
  );
};

// Server error
export const ServerError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => {
  return (
    <ErrorDisplay
      type="server"
      onRetry={onRetry}
      retryLabel="Retry Request"
    />
  );
};

// Permission error
export const PermissionError: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <ErrorDisplay
      type="permission"
      message={message}
    />
  );
};

// 404 error
export const NotFoundError: React.FC<{ 
  resource?: string;
  onGoBack?: () => void;
}> = ({ 
  resource = 'page',
  onGoBack 
}) => {
  return (
    <ErrorDisplay
      type="notfound"
      title={`${resource.charAt(0).toUpperCase() + resource.slice(1)} Not Found`}
      message={`The ${resource} you're looking for doesn't exist or has been moved.`}
      onRetry={onGoBack}
      retryLabel="Go Back"
    />
  );
};

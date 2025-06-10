/**
 * Unified Loading Components - Eliminates 15+ duplicate loading patterns
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

interface LoadingStateProps {
  height?: string | number;
  message?: string;
  className?: string;
}

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

// Basic loading spinner with size variants
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <Loader2 
      className={cn(
        'animate-spin text-primary',
        sizeClasses[size],
        className
      )} 
    />
  );
};

// Loading state for containers with optional message
export const LoadingState: React.FC<LoadingStateProps> = ({ 
  height = '150px', 
  message = 'Loading...',
  className 
}) => {
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center text-muted-foreground',
        className
      )}
      style={{ height: heightStyle }}
    >
      <LoadingSpinner size="lg" className="mb-2" />
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
};

// Loading skeleton for content placeholders
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  lines = 3, 
  className 
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className={cn(
            'animate-pulse bg-muted rounded',
            index === 0 ? 'h-4 w-3/4' : index === lines - 1 ? 'h-4 w-1/2' : 'h-4 w-full'
          )}
        />
      ))}
    </div>
  );
};

// Page-level loading component
export const PageLoader: React.FC<{ message?: string }> = ({ 
  message = 'Loading page...' 
}) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

// Button loading state
export const ButtonLoader: React.FC<{ className?: string }> = ({ className }) => {
  return <LoadingSpinner size="sm" className={cn('mr-2', className)} />;
};

// Table loading state
export const TableLoader: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }, (_, colIndex) => (
            <div
              key={colIndex}
              className="animate-pulse bg-muted rounded h-8 flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Card loading state
export const CardLoader: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('p-4 border rounded-lg space-y-3', className)}>
      <div className="animate-pulse bg-muted rounded h-6 w-3/4" />
      <div className="animate-pulse bg-muted rounded h-4 w-full" />
      <div className="animate-pulse bg-muted rounded h-4 w-2/3" />
    </div>
  );
};

// Dashboard widget loading state
export const WidgetLoader: React.FC<{ height?: string }> = ({ 
  height = '200px' 
}) => {
  return (
    <div 
      className="p-4 border rounded-lg space-y-4"
      style={{ height }}
    >
      <div className="flex items-center justify-between">
        <div className="animate-pulse bg-muted rounded h-5 w-1/3" />
        <div className="animate-pulse bg-muted rounded h-4 w-4" />
      </div>
      <div className="space-y-2">
        <div className="animate-pulse bg-muted rounded h-8 w-full" />
        <div className="animate-pulse bg-muted rounded h-6 w-3/4" />
        <div className="animate-pulse bg-muted rounded h-6 w-1/2" />
      </div>
    </div>
  );
};

// List loading state
export const ListLoader: React.FC<{ 
  items?: number; 
  showAvatar?: boolean;
  className?: string;
}> = ({ 
  items = 5, 
  showAvatar = false,
  className 
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }, (_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 border rounded">
          {showAvatar && (
            <div className="animate-pulse bg-muted rounded-full h-10 w-10" />
          )}
          <div className="flex-1 space-y-2">
            <div className="animate-pulse bg-muted rounded h-4 w-3/4" />
            <div className="animate-pulse bg-muted rounded h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Form loading state
export const FormLoader: React.FC<{ fields?: number }> = ({ fields = 4 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="space-y-2">
          <div className="animate-pulse bg-muted rounded h-4 w-1/4" />
          <div className="animate-pulse bg-muted rounded h-10 w-full" />
        </div>
      ))}
      <div className="animate-pulse bg-muted rounded h-10 w-32" />
    </div>
  );
};

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useOrganization } from '@/contexts/organization-context';
import { useAuth } from '@/contexts/auth-context';
import { Loader2, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OrganizationGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  showMessage?: boolean;
}

/**
 * A guard component that ensures users have at least one organization
 * before accessing organization-dependent features
 */
export const OrganizationGuard: React.FC<OrganizationGuardProps> = ({
  children,
  redirectTo = '/organizations/create',
  showMessage = true,
}) => {
  const { state: { isAuthenticated, isLoading: authLoading, user } } = useAuth();
  const { organizations, isLoading: orgLoading, hasLoaded, fetchOrganizations } = useOrganization();
  const location = useLocation();

  // Admin users don't need organizations - bypass the guard
  if (user?.role === 'ADMIN') {
    return <>{children}</>;
  }

  // Fetch organizations when authenticated and not already loaded
  useEffect(() => {
    if (isAuthenticated && !authLoading && !hasLoaded && !orgLoading) {
      // Only fetch if we're not on the create page to avoid unnecessary calls
      if (location.pathname !== '/organizations/create' && location.pathname !== '/organizations/create-simple') {
        fetchOrganizations(true);
      }
    }
  }, [isAuthenticated, authLoading, hasLoaded, orgLoading, location.pathname, fetchOrganizations]);

  // Don't check organizations if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show loading while auth is loading, organizations are loading, or haven't been loaded yet
  if (authLoading || orgLoading || (!hasLoaded && isAuthenticated)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your organizations...</p>
        </div>
      </div>
    );
  }

  // If we're on the create page, allow access regardless of organization count
  if (location.pathname === '/organizations/create' || location.pathname === '/organizations/create-simple') {
    return <>{children}</>;
  }

  // Only redirect if we're sure the user has no organizations after fetching
  if (isAuthenticated && hasLoaded && !orgLoading && organizations.length === 0) {
    if (showMessage) {
      return (
        <div className="flex h-screen w-full items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Organization Setup Required</CardTitle>
              <CardDescription>
                You need to create an organization before accessing this feature.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Organizations help you manage your venues, menus, and team members all in one place.
              </p>
              <Navigate to={redirectTo} replace />
            </CardContent>
          </Card>
        </div>
      );
    } else {
      return <Navigate to={redirectTo} replace />;
    }
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default OrganizationGuard;

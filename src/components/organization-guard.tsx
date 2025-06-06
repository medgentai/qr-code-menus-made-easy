import React from 'react';
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
  const { state: { isAuthenticated, isLoading: authLoading } } = useAuth();
  const { organizations, isLoading: orgLoading } = useOrganization();
  const location = useLocation();

  // Don't check organizations if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show loading while checking organizations
  if (authLoading || orgLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your organizations...</p>
        </div>
      </div>
    );
  }

  // If user has no organizations, redirect to create or show message
  if (!organizations || organizations.length === 0) {
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

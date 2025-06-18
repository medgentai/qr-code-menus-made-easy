import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useOrganization } from '@/contexts/organization-context';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Building2,
  Plus,
  Settings,
  Users,
  ExternalLink,
  Calendar,
  ArrowRight,
  Hotel,
  Coffee,
  Utensils,
  Truck,
  Wine,
  Store
} from 'lucide-react';
import { OrganizationType, OrganizationTypeLabels } from '@/types/organization';

const OrganizationList = () => {
  const { organizations, isLoading, fetchOrganizations } = useOrganization();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Check if we're coming from payment success and force refresh
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const fromPayment = searchParams.get('from') === 'payment';

    if (fromPayment) {
      // Force refresh organization data when coming from payment
      queryClient.invalidateQueries({
        queryKey: ['organizations']
      });

      // Remove the query parameter to prevent repeated refreshes
      const newUrl = location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location, queryClient]);

  // Force refresh organizations when this component mounts
  useEffect(() => {
    fetchOrganizations(true); // Pass true to force refresh
  }, [fetchOrganizations]);

  // Function to get the appropriate icon based on organization type
  const getOrganizationIcon = (type: OrganizationType) => {
    switch (type) {
      case OrganizationType.RESTAURANT:
        return <Utensils className="h-5 w-5" />;
      case OrganizationType.HOTEL:
        return <Hotel className="h-5 w-5" />;
      case OrganizationType.CAFE:
        return <Coffee className="h-5 w-5" />;
      case OrganizationType.FOOD_TRUCK:
        return <Truck className="h-5 w-5" />;
        case OrganizationType.BAR:
        return <Wine className="h-5 w-5" />;
      default:
        return <Store className="h-5 w-5" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold tracking-tight">Organizations</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-sm md:text-base">
              Manage your organizations and their settings
            </p>
          </div>
          <Button onClick={() => navigate('/organizations/create')} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Create Organization</span>
            <span className="inline sm:hidden">Create</span>
          </Button>
        </div>

        <Separator />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden flex flex-col h-full">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="flex-grow">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : organizations.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>No Organizations Found</CardTitle>
              <CardDescription>
                You don't have any organizations yet. Create your first organization to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <Building2 className="h-16 w-16 text-muted-foreground/60" />
            </CardContent>
            <CardFooter className="flex justify-center pb-6">
              <Button onClick={() => navigate('/organizations/create')}>
                <Plus className="mr-2 h-4 w-4" /> Create Organization
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <Card key={org.id} className="overflow-hidden flex flex-col h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 max-w-[70%]">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        {org.logoUrl ? (
                          <AvatarImage
                            src={org.logoUrl}
                            alt={org.name}
                          />
                        ) : (
                          <AvatarFallback>
                            {getInitials(org.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {getOrganizationIcon(org.type)}
                          <span className="truncate">{org.name}</span>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {OrganizationTypeLabels[org.type]}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={org.isActive ? "default" : "secondary"} className="flex-shrink-0">
                      {org.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2 flex-grow">
                  {org.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {org.description}
                    </p>
                  )}
                  <div className="flex items-center text-xs text-muted-foreground gap-2">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span>Created {new Date(org.createdAt).toLocaleDateString()}</span>
                  </div>
                  {org.websiteUrl && (
                    <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2 w-full">
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      <a
                        href={org.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline truncate max-w-full"
                        title={org.websiteUrl}
                      >
                        {org.websiteUrl.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-col lg:flex-row gap-2 lg:justify-between pt-4">
                  <div className="grid grid-cols-2 gap-2 w-full sm:w-full lg:w-auto lg:flex lg:flex-row">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/organizations/${org.id}/members`)}
                      className="w-full lg:w-auto"
                    >
                      <Users className="h-4 w-4 mr-1" /> Members
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/organizations/${org.id}/settings`)}
                      className="w-full lg:w-auto"
                    >
                      <Settings className="h-4 w-4 mr-1" /> Settings
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/organizations/${org.id}`)}
                    className="w-full sm:w-full lg:w-auto mt-2 lg:mt-0"
                  >
                    View <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OrganizationList;

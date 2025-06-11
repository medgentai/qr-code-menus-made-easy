import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, User, MapPin, Calendar, Users, ShoppingCart } from 'lucide-react';
import { OrganizationManagement } from '@/services/admin-service';

interface OrganizationDetailsModalProps {
  organization: OrganizationManagement | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrganizationDetailsModal: React.FC<OrganizationDetailsModalProps> = ({
  organization,
  open,
  onOpenChange,
}) => {
  if (!organization) return null;

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      RESTAURANT: 'bg-blue-100 text-blue-800',
      HOTEL: 'bg-purple-100 text-purple-800',
      CAFE: 'bg-orange-100 text-orange-800',
      FOOD_TRUCK: 'bg-green-100 text-green-800',
      BAR: 'bg-red-100 text-red-800',
    };

    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors] || ''}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about {organization.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Organization Name</label>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{organization.name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  {getTypeBadge(organization.type)}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  {getStatusBadge(organization.isActive)}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Organization ID</label>
                  <span className="font-mono text-sm">{organization.id}</span>
                </div>
              </div>

              {organization.description && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm bg-muted p-3 rounded-lg">{organization.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Owner Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {organization.owner ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Owner Name</label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{organization.owner.name}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Owner Email</label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{organization.owner.email}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No owner information available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">{organization.memberCount}</div>
                  <p className="text-sm text-blue-800">Members</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">{organization.venueCount}</div>
                  <p className="text-sm text-green-800">Venues</p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-purple-600">{organization.orderCount}</div>
                  <p className="text-sm text-purple-800">Total Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Created:</strong> {new Date(organization.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Orders per Venue</label>
                  <div className="text-lg font-semibold">
                    {organization.venueCount > 0 
                      ? (organization.orderCount / organization.venueCount).toFixed(1)
                      : '0'
                    }
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Members per Venue</label>
                  <div className="text-lg font-semibold">
                    {organization.venueCount > 0 
                      ? (organization.memberCount / organization.venueCount).toFixed(1)
                      : '0'
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

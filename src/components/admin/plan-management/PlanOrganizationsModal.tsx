import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/ui/loading';
import { 
  Building2, 
  Users, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Mail,
  MapPin
} from 'lucide-react';
import { adminService } from '@/services/admin-service';
import { PlanEntity } from '@/types/plan-management';

interface PlanOrganizationsModalProps {
  plan: PlanEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PlanOrganizationsModal({ plan, open, onOpenChange }: PlanOrganizationsModalProps) {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: organizationsData, isLoading, error } = useQuery({
    queryKey: ['admin', 'plan-organizations', plan?.id, page],
    queryFn: () => plan ? adminService.getPlanOrganizations(plan.id, { page, limit }) : null,
    enabled: !!plan && open,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getOrganizationTypeColor = (type: string) => {
    const colors = {
      RESTAURANT: 'bg-orange-100 text-orange-800',
      HOTEL: 'bg-blue-100 text-blue-800',
      CAFE: 'bg-green-100 text-green-800',
      FOOD_TRUCK: 'bg-purple-100 text-purple-800',
      BAR: 'bg-red-100 text-red-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (organizationsData && page < organizationsData.totalPages) {
      setPage(page + 1);
    }
  };

  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organizations Using "{plan.name}"
          </DialogTitle>
          <DialogDescription>
            List of organizations currently subscribed to this plan
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <LoadingState height="400px" message="Loading organizations..." />
        )}

        {error && (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Building2 className="h-8 w-8 mx-auto mb-2" />
              <p>Unable to load organizations data</p>
            </div>
          </div>
        )}

        {organizationsData && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <div className="font-medium">
                  {organizationsData.total} organization{organizationsData.total !== 1 ? 's' : ''} using this plan
                </div>
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, organizationsData.total)} of {organizationsData.total}
                </div>
              </div>
              <Badge variant="outline" className="text-sm">
                Page {page} of {organizationsData.totalPages}
              </Badge>
            </div>

            {/* Organizations Table */}
            {organizationsData.organizations.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizationsData.organizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{org.name}</div>
                            <div className="text-sm text-muted-foreground">
                              /{org.slug}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={getOrganizationTypeColor(org.type)}
                          >
                            {org.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{org.owner.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {org.owner.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Building2 className="h-3 w-3" />
                              {org.venueCount} venue{org.venueCount !== 1 ? 's' : ''}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-3 w-3" />
                              {org.memberCount} member{org.memberCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant={org.isActive ? 'default' : 'secondary'}>
                              {org.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {org.planStartDate && (
                              <div className="text-xs text-muted-foreground">
                                Since {formatDate(org.planStartDate)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(org.createdAt)}</div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No organizations found for this plan</p>
                </div>
              </div>
            )}

            {/* Pagination */}
            {organizationsData.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, organizationsData.total)} of {organizationsData.total} organizations
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">Page</span>
                    <Badge variant="outline">{page}</Badge>
                    <span className="text-sm">of {organizationsData.totalPages}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={page === organizationsData.totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

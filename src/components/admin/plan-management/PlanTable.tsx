import { useState } from 'react';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Users,
  Building2,
  Package,
} from 'lucide-react';
import { PlanEntity } from '@/types/plan-management';

interface PlanTableProps {
  plans: PlanEntity[];
  onEdit: (plan: PlanEntity) => void;
  onDelete: (plan: PlanEntity) => void;
  onToggleStatus: (plan: PlanEntity) => void;
  onViewUsage: (plan: PlanEntity) => void;
  onViewOrganizations: (plan: PlanEntity) => void;
}

export function PlanTable({
  plans,
  onEdit,
  onDelete,
  onToggleStatus,
  onViewUsage,
  onViewOrganizations,
}: PlanTableProps) {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No plans found</p>
            <p className="text-sm">Try adjusting your filters or create a new plan</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plans ({plans.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Details</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{plan.name}</div>
                      {plan.description && (
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {plan.description}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {plan.venuesIncluded} venue{plan.venuesIncluded !== 1 ? 's' : ''} included
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getOrganizationTypeColor(plan.organizationType)}
                    >
                      {plan.organizationType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {formatCurrency(plan.monthlyPrice)}/mo
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(plan.annualPrice)}/yr
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Building2 className="h-3 w-3" />
                        {plan.organizationCount || 0} orgs
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {plan.subscriptionCount || 0} subs
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(plan.createdAt)}</div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onViewUsage(plan)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Usage
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewOrganizations(plan)}>
                          <Building2 className="mr-2 h-4 w-4" />
                          View Organizations
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(plan)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Plan
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleStatus(plan)}>
                          {plan.isActive ? (
                            <ToggleLeft className="mr-2 h-4 w-4" />
                          ) : (
                            <ToggleRight className="mr-2 h-4 w-4" />
                          )}
                          {plan.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(plan)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Plan
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

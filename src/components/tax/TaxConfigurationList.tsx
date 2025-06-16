import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { TaxService } from '@/services/tax-service';
import { TaxConfiguration, TaxTypeLabels } from '@/types/tax';
import { TaxConfigurationForm } from './TaxConfigurationForm';
import { TaxPreviewCard } from './TaxPreviewCard';
import { TaxConfigurationPlaceholder } from './TaxConfigurationPlaceholder';

interface TaxConfigurationListProps {
  organizationId: string;
  organizationType: string;
  canManage: boolean;
}

export const TaxConfigurationList: React.FC<TaxConfigurationListProps> = ({
  organizationId,
  organizationType,
  canManage,
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<TaxConfiguration | null>(null);
  const [deletingConfig, setDeletingConfig] = useState<TaxConfiguration | null>(null);

  const queryClient = useQueryClient();

  // Fetch tax configurations
  const {
    data: taxConfigurations = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['tax-configurations', organizationId],
    queryFn: () => TaxService.getTaxConfigurations(organizationId),
    retry: 1,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (configId: string) => TaxService.deleteTaxConfiguration(organizationId, configId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-configurations', organizationId] });
      toast.success('Tax configuration deleted successfully');
      setDeletingConfig(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete tax configuration');
    },
  });

  const handleDelete = (config: TaxConfiguration) => {
    setDeletingConfig(config);
  };

  const confirmDelete = () => {
    if (deletingConfig) {
      deleteMutation.mutate(deletingConfig.id);
    }
  };

  const getStatusBadge = (config: TaxConfiguration) => {
    try {
      const status = TaxService.getTaxConfigurationStatus(config);
      return (
        <Badge variant={status.variant} title={status.description}>
          {status.label}
        </Badge>
      );
    } catch (error) {
      console.error('Error getting status badge:', error);
      return (
        <Badge variant="secondary">
          Unknown
        </Badge>
      );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    console.error('Tax configuration error:', error);
    // Show placeholder when backend endpoints are not available
    return (
      <TaxConfigurationPlaceholder
        organizationType={organizationType}
        organizationId={organizationId}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tax Configurations</h3>
          <p className="text-sm text-muted-foreground">
            Manage tax rates and settings for your {organizationType.toLowerCase()}
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Configuration
          </Button>
        )}
      </div>

      {/* Tax Preview */}
      <TaxPreviewCard organizationId={organizationId} />

      {/* Tax Configurations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Configurations</CardTitle>
          <CardDescription>
            {taxConfigurations.length} tax configuration{taxConfigurations.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {taxConfigurations.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tax configurations</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first tax configuration
              </p>
              {canManage && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Configuration
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Tax Type</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                  {canManage && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxConfigurations.map((config) => (
                  <TableRow key={config.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{config.name}</div>
                        {config.description && (
                          <div className="text-sm text-muted-foreground">{config.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{TaxTypeLabels[config.taxType]}</TableCell>
                    <TableCell>
                      {config.isTaxExempt ? (
                        <span className="text-muted-foreground">Tax Exempt</span>
                      ) : (
                        <span className="font-mono">{TaxService.formatTaxRate(config.taxRate || 0)}</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(config)}</TableCell>
                    {canManage && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingConfig(config)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(config)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <TaxConfigurationForm
        organizationId={organizationId}
        organizationType={organizationType}
        isOpen={isCreateDialogOpen || !!editingConfig}
        onClose={() => {
          setIsCreateDialogOpen(false);
          setEditingConfig(null);
        }}
        editingConfig={editingConfig}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['tax-configurations', organizationId] });
          setIsCreateDialogOpen(false);
          setEditingConfig(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingConfig} onOpenChange={() => setDeletingConfig(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tax Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingConfig?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

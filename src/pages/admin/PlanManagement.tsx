import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading';
import { Plus, RefreshCw, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '@/services/admin-service';
import { PlanStatsCards, PlanTypeStats } from '@/components/admin/plan-management/PlanStatsCards';
import { PlanFilters } from '@/components/admin/plan-management/PlanFilters';
import { PlanTable } from '@/components/admin/plan-management/PlanTable';
import { PlanForm } from '@/components/admin/plan-management/PlanForm';
import { PlanUsageModal } from '@/components/admin/plan-management/PlanUsageModal';
import { PlanOrganizationsModal } from '@/components/admin/plan-management/PlanOrganizationsModal';
import { 
  PlanEntity, 
  PlanFilters as PlanFiltersType, 
  PlanFormData,
  CreatePlanDto,
  UpdatePlanDto 
} from '@/types/plan-management';

const PlanManagement = () => {
  const [selectedPlan, setSelectedPlan] = useState<PlanEntity | undefined>();
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showOrganizationsModal, setShowOrganizationsModal] = useState(false);
  const [usageModalPlan, setUsageModalPlan] = useState<PlanEntity | null>(null);
  const [organizationsModalPlan, setOrganizationsModalPlan] = useState<PlanEntity | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<PlanFiltersType>({
    search: '',
    organizationType: 'ALL',
    isActive: 'ALL',
    page: 1,
    limit: 20,
  });

  const queryClient = useQueryClient();

  // Fetch plan stats
  const {
    data: planStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['admin', 'plan-stats'],
    queryFn: adminService.getPlanStats,
  });

  // Fetch plans with filters
  const {
    data: plansData,
    isLoading: plansLoading,
    error: plansError,
    refetch: refetchPlans
  } = useQuery({
    queryKey: ['admin', 'plans', filters],
    queryFn: () => {
      const queryFilters = {
        ...filters,
        organizationType: filters.organizationType === 'ALL' ? undefined : filters.organizationType,
        isActive: filters.isActive === 'ALL' ? undefined : filters.isActive,
      };
      return adminService.getPlans(queryFilters);
    },
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: (data: CreatePlanDto) => adminService.createPlan(data),
    onSuccess: () => {
      toast.success('Plan created successfully');
      setShowPlanForm(false);
      setSelectedPlan(undefined);
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'plan-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create plan');
    },
  });

  // Update plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanDto }) => 
      adminService.updatePlan(id, data),
    onSuccess: () => {
      toast.success('Plan updated successfully');
      setShowPlanForm(false);
      setSelectedPlan(undefined);
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'plan-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update plan');
    },
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: (id: string) => adminService.deletePlan(id),
    onSuccess: () => {
      toast.success('Plan deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'plan-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete plan');
    },
  });

  // Toggle plan status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => adminService.togglePlanStatus(id),
    onSuccess: () => {
      toast.success('Plan status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'plan-stats'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update plan status');
    },
  });

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchStats(), refetchPlans()]);
      toast.success('Data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreatePlan = () => {
    setSelectedPlan(undefined);
    setShowPlanForm(true);
  };

  const handleEditPlan = (plan: PlanEntity) => {
    setSelectedPlan(plan);
    setShowPlanForm(true);
  };

  const handleDeletePlan = (plan: PlanEntity) => {
    if (confirm(`Are you sure you want to delete "${plan.name}"? This action cannot be undone.`)) {
      deletePlanMutation.mutate(plan.id);
    }
  };

  const handleToggleStatus = (plan: PlanEntity) => {
    const action = plan.isActive ? 'deactivate' : 'activate';
    if (confirm(`Are you sure you want to ${action} "${plan.name}"?`)) {
      toggleStatusMutation.mutate(plan.id);
    }
  };

  const handleViewUsage = (plan: PlanEntity) => {
    setUsageModalPlan(plan);
    setShowUsageModal(true);
  };

  const handleViewOrganizations = (plan: PlanEntity) => {
    setOrganizationsModalPlan(plan);
    setShowOrganizationsModal(true);
  };

  const handlePlanFormSubmit = (data: PlanFormData) => {
    const planData = {
      name: data.name,
      description: data.description || undefined,
      organizationType: data.organizationType,
      monthlyPrice: parseFloat(data.monthlyPrice),
      annualPrice: parseFloat(data.annualPrice),
      features: data.features,
      venuesIncluded: parseInt(data.venuesIncluded),
      isActive: data.isActive,
    };

    if (selectedPlan) {
      updatePlanMutation.mutate({ id: selectedPlan.id, data: planData });
    } else {
      createPlanMutation.mutate(planData);
    }
  };

  const handleFiltersChange = (newFilters: PlanFiltersType) => {
    setFilters(newFilters);
  };

  const handleFiltersReset = () => {
    setFilters({
      search: '',
      organizationType: 'ALL',
      isActive: 'ALL',
      page: 1,
      limit: 20,
    });
  };

  if (statsLoading || plansLoading) {
    return <LoadingState height="400px" message="Loading plan management..." />;
  }

  if (statsError || plansError) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        <div className="text-center">
          <Package className="h-8 w-8 mx-auto mb-2" />
          <p>Unable to load plan management</p>
          <Button variant="outline" onClick={refreshData} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plan Management</h1>
          <p className="text-muted-foreground">
            Manage pricing plans and configuration for organizations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={handleCreatePlan}>
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </div>
      </div>

      {/* Stats */}
      {planStats && (
        <>
          <PlanStatsCards stats={planStats} />
          <PlanTypeStats plansByType={planStats.plansByType} />
        </>
      )}

      {/* Filters */}
      <PlanFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleFiltersReset}
      />

      {/* Plans Table */}
      {plansData && (
        <>
          <PlanTable
            plans={plansData.plans}
            onEdit={handleEditPlan}
            onDelete={handleDeletePlan}
            onToggleStatus={handleToggleStatus}
            onViewUsage={handleViewUsage}
            onViewOrganizations={handleViewOrganizations}
          />

          {/* Pagination */}
          {plansData.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, plansData.total)} of {plansData.total} plans
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFiltersChange({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  <span className="text-sm">Page</span>
                  <Badge variant="outline">{filters.page}</Badge>
                  <span className="text-sm">of {plansData.totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFiltersChange({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === plansData.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Plan Form Modal */}
      <PlanForm
        plan={selectedPlan}
        open={showPlanForm}
        onOpenChange={setShowPlanForm}
        onSubmit={handlePlanFormSubmit}
        isLoading={createPlanMutation.isPending || updatePlanMutation.isPending}
      />

      {/* Plan Usage Modal */}
      <PlanUsageModal
        plan={usageModalPlan}
        open={showUsageModal}
        onOpenChange={setShowUsageModal}
      />

      {/* Plan Organizations Modal */}
      <PlanOrganizationsModal
        plan={organizationsModalPlan}
        open={showOrganizationsModal}
        onOpenChange={setShowOrganizationsModal}
      />
    </div>
  );
};

export default PlanManagement;

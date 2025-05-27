import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CreditCard,
  Calendar,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Settings,
  XCircle,
  RotateCcw,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import SubscriptionService from '@/services/subscription-service';
import {
  Subscription,
  SubscriptionStatusLabels,
  SubscriptionStatusColors,
  BillingCycleLabels,
  BillingCycle
} from '@/types/subscription';
import { formatPrice } from '@/lib/utils';
import BillingHistory from '@/components/subscriptions/BillingHistory';

const SubscriptionManage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: { user } } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('overview');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [showBillingCycleDialog, setShowBillingCycleDialog] = useState(false);
  const [newBillingCycle, setNewBillingCycle] = useState<BillingCycle | ''>('');

  // Fetch subscription details
  const {
    data: subscription,
    isLoading,
    error
  } = useQuery({
    queryKey: ['subscription', id],
    queryFn: () => SubscriptionService.getById(id!),
    enabled: !!id && !!user,
  });

  // Cancel subscription mutation
  const cancelMutation = useMutation({
    mutationFn: () => SubscriptionService.cancel(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription will be cancelled at the end of the current billing period');
      setShowCancelDialog(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    }
  });

  // Reactivate subscription mutation
  const reactivateMutation = useMutation({
    mutationFn: () => SubscriptionService.reactivate(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Subscription reactivated successfully');
      setShowReactivateDialog(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reactivate subscription');
    }
  });

  // Update billing cycle mutation
  const updateBillingCycleMutation = useMutation({
    mutationFn: (billingCycle: BillingCycle) =>
      SubscriptionService.updateBillingCycle(id!, { billingCycle }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription', id] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Billing cycle updated successfully');
      setShowBillingCycleDialog(false);
      setNewBillingCycle('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update billing cycle');
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-3 w-3" />;
      case 'CANCELLED':
        return <XCircle className="h-3 w-3" />;
      case 'PAST_DUE':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const formatSubscriptionPrice = (subscription: Subscription) => {
    const amount = Number(subscription.amount);
    const cycle = subscription.billingCycle === 'MONTHLY' ? '/month' : '/year';
    return `${formatPrice(amount)}${cycle}`;
  };

  const handleCancelSubscription = () => {
    cancelMutation.mutate(); // Always cancel at period end
  };

  const handleReactivateSubscription = () => {
    reactivateMutation.mutate();
  };

  const handleUpdateBillingCycle = () => {
    if (newBillingCycle) {
      updateBillingCycleMutation.mutate(newBillingCycle as BillingCycle);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/subscriptions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subscriptions
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load subscription details. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/subscriptions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Subscriptions
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Subscription</h1>
          <p className="text-muted-foreground">
            {subscription.organization?.name || 'Unknown Organization'}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Subscription Overview Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  {subscription.organization?.name || 'Unknown Organization'}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={SubscriptionStatusColors[subscription.status as keyof typeof SubscriptionStatusColors]}
                >
                  <div className="flex items-center gap-1">
                    {getStatusIcon(subscription.status)}
                    {SubscriptionStatusLabels[subscription.status as keyof typeof SubscriptionStatusLabels]}
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plan Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Plan Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Plan</span>
                      <span className="text-sm">{subscription.plan?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Billing Cycle</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{BillingCycleLabels[subscription.billingCycle]}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowBillingCycleDialog(true)}
                          disabled={subscription.status === 'CANCELLED'}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Amount</span>
                      <span className="text-sm font-semibold">
                        {formatSubscriptionPrice(subscription)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Billing Period</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Current Period</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                    </div>
                    {subscription.cancelAtPeriodEnd && (
                      <div className="text-sm text-orange-600">
                        Will cancel at period end
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {subscription.status === 'ACTIVE' && !subscription.cancelAtPeriodEnd && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowCancelDialog(true)}
                    disabled={cancelMutation.isPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Subscription
                  </Button>
                )}

                {(subscription.status === 'CANCELLED' || subscription.cancelAtPeriodEnd) && (
                  <Button
                    onClick={() => setShowReactivateDialog(true)}
                    disabled={reactivateMutation.isPending}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reactivate Subscription
                  </Button>
                )}

                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <BillingHistory subscriptionId={subscription.id} />
        </TabsContent>
      </Tabs>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this subscription? Your subscription will remain active until the end of the current billing period.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={cancelMutation.isPending}
            >
              Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivate Subscription Dialog */}
      <Dialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reactivate Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to reactivate this subscription? Billing will resume according to your current plan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReactivateDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReactivateSubscription}
              disabled={reactivateMutation.isPending}
            >
              Reactivate Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Billing Cycle Dialog */}
      <Dialog open={showBillingCycleDialog} onOpenChange={setShowBillingCycleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Billing Cycle</DialogTitle>
            <DialogDescription>
              Select a new billing cycle for your subscription. Changes will take effect on your next billing date.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newBillingCycle} onValueChange={setNewBillingCycle}>
              <SelectTrigger>
                <SelectValue placeholder="Select billing cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">Monthly</SelectItem>
                <SelectItem value="ANNUAL">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBillingCycleDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateBillingCycle}
              disabled={!newBillingCycle || updateBillingCycleMutation.isPending}
            >
              Update Billing Cycle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionManage;

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Calendar,
  Building2,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Settings,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import SubscriptionService from '@/services/subscription-service';
import {
  Subscription,
  SubscriptionStatusLabels,
  SubscriptionStatusColors,
  BillingCycleLabels
} from '@/types/subscription';
import { formatPrice } from '@/lib/utils';

const Subscriptions = () => {
  const { state: { user } } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch all subscriptions
  const {
    data: subscriptions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: SubscriptionService.getAll,
    enabled: !!user,
    refetchOnMount: true, // Always refetch when component mounts
    staleTime: 2 * 60 * 1000, // 2 minutes - consider data fresh for 2 minutes
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
        return <CheckCircle className="h-4 w-4" />;
      case 'TRIAL':
        return <Clock className="h-4 w-4" />;
      case 'CANCELLED':
      case 'EXPIRED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const calculateUsagePercentage = (used: number, included: number) => {
    return included > 0 ? Math.round((used / included) * 100) : 0;
  };

  const formatSubscriptionPrice = (subscription: Subscription) => {
    if (subscription.billingCycle === 'ANNUAL') {
      // For annual billing, show monthly equivalent
      const monthlyEquivalent = Math.round(Number(subscription.amount) / 12);
      return `${formatPrice(monthlyEquivalent)} / month`;
    } else {
      // For monthly billing, show monthly price
      return `${formatPrice(subscription.amount)} / month`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
            <p className="text-muted-foreground">
              Manage your subscription plans and billing
            </p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load subscriptions. Please try again.
            <Button variant="link" onClick={() => refetch()} className="ml-2 p-0 h-auto">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage your subscription plans and billing for all organizations
          </p>
        </div>
        <Button onClick={() => navigate('/organizations/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Organization
        </Button>
      </div>

      {/* Subscriptions Overview */}
      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-16 w-16 text-muted-foreground/60 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Subscriptions</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              You don't have any active subscriptions yet. Create your first organization to get started.
            </p>
            <Button onClick={() => navigate('/organizations/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Organization
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="billing">Billing History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptions.map((subscription) => (
                <Card key={subscription.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
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

                  <CardContent className="space-y-4">
                    {/* Plan Info */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Plan</span>
                        <span className="text-sm">{subscription.plan?.name}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Billing</span>
                        <span className="text-sm">{BillingCycleLabels[subscription.billingCycle]}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Amount</span>
                        <span className="text-sm font-semibold">
                          {formatSubscriptionPrice(subscription)}
                        </span>
                      </div>
                      {/* Consistent spacing section - always present for uniform card height */}
                      <div className="text-xs text-muted-foreground mt-1 min-h-[32px] space-y-1">
                        {subscription.billingCycle === 'ANNUAL' && (
                          <div>{formatPrice(subscription.amount)} billed annually</div>
                        )}
                        <div>*Excluding applicable taxes and payment gateway fees</div>
                      </div>
                    </div>

                    <Separator />

                    {/* Usage */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Venues Used</span>
                        <span className="text-sm">
                          {subscription.venuesUsed} / {subscription.venuesIncluded}
                        </span>
                      </div>
                      <Progress
                        value={calculateUsagePercentage(subscription.venuesUsed, subscription.venuesIncluded)}
                        className="h-2"
                      />
                    </div>

                    <Separator />

                    {/* Billing Period */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Current Period</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/subscriptions/${subscription.id}/manage`)}
                      >
                        <Settings className="mr-2 h-3 w-3" />
                        Manage
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>All Billing History</CardTitle>
                <CardDescription>Combined billing history for all your subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-muted-foreground/60 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Combined Billing History</h3>
                  <p className="text-sm text-muted-foreground">
                    View individual subscription billing history in the manage section.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Subscriptions;

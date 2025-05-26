import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { CheckCircle, AlertCircle, Utensils, Hotel, CircleDollarSign } from 'lucide-react';
import { usePlansByType } from '@/hooks/usePlans';
import { Plan } from '@/types/payment';
import { OrganizationType } from '@/types/organization';

const planSelectionSchema = z.object({
  planId: z.string().min(1, 'Please select a plan'),
  billingCycle: z.enum(['MONTHLY', 'ANNUAL']),
});

type FormValues = z.infer<typeof planSelectionSchema>;

interface PlanSelectionStepProps {
  organizationType?: OrganizationType;
  initialData?: Partial<FormValues>;
  onSubmit: (data: FormValues) => void;
  onBack: () => void;
}

const PlanSelectionStep: React.FC<PlanSelectionStepProps> = ({
  organizationType = OrganizationType.RESTAURANT,
  initialData,
  onSubmit,
  onBack,
}) => {
  const [isAnnual, setIsAnnual] = useState(initialData?.billingCycle === 'ANNUAL');

  // Map organization types that don't have specific plans to supported types
  const getSupportedOrganizationType = (orgType: OrganizationType): OrganizationType => {
    switch (orgType) {
      case OrganizationType.RESTAURANT:
      case OrganizationType.HOTEL:
      case OrganizationType.CAFE:
        return orgType;
      case OrganizationType.FOOD_TRUCK:
      case OrganizationType.BAR:
        return OrganizationType.RESTAURANT; // Use restaurant plans for food trucks and bars
      case OrganizationType.OTHER:
      default:
        return OrganizationType.CAFE; // Use cafe plans for other types
    }
  };

  const supportedOrgType = getSupportedOrganizationType(organizationType);
  const { plans, loading, error, refetch } = usePlansByType(supportedOrgType);

  const form = useForm<FormValues>({
    resolver: zodResolver(planSelectionSchema),
    defaultValues: {
      planId: initialData?.planId || '',
      billingCycle: initialData?.billingCycle || 'MONTHLY',
    },
  });

  // Update billing cycle when switch changes
  const handleBillingCycleChange = (annual: boolean) => {
    setIsAnnual(annual);
    form.setValue('billingCycle', annual ? 'ANNUAL' : 'MONTHLY');
  };

  // Get icon for organization type
  const getIcon = (orgType: string) => {
    switch (orgType) {
      case 'RESTAURANT':
        return <Utensils className="h-6 w-6 text-orange-500" />;
      case 'HOTEL':
        return <Hotel className="h-6 w-6 text-orange-500" />;
      case 'CAFE':
        return <CircleDollarSign className="h-6 w-6 text-orange-500" />;
      default:
        return <Utensils className="h-6 w-6 text-orange-500" />;
    }
  };

  // Calculate savings for annual billing
  const calculateSavings = (monthlyPrice: number, annualPrice: number) => {
    const monthlyTotal = monthlyPrice * 12; // Total if paying monthly for 12 months
    const annualTotal = annualPrice; // Annual price is already the total for the year
    const savings = monthlyTotal - annualTotal;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    return { amount: savings, percentage };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center space-x-3">
          <span className="text-sm font-medium">Monthly</span>
          <Skeleton className="h-6 w-12" />
          <span className="text-sm font-medium">Annual</span>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load plans.
          <Button variant="link" className="p-0 ml-1 h-auto" onClick={refetch}>
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Choose Your Subscription Plan</h3>
        <p className="text-muted-foreground">
          {supportedOrgType !== organizationType ? (
            <>
              Select the plan that best fits your {organizationType?.toLowerCase()} business needs.
              <br />
              <span className="text-sm text-orange-600">
                Using {supportedOrgType.toLowerCase()} plans as they are compatible with your business type.
              </span>
            </>
          ) : (
            `Select the plan that best fits your ${organizationType?.toLowerCase()} business needs`
          )}
        </p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center space-x-4 p-4 bg-muted/30 rounded-lg">
        <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
          Pay Monthly
        </span>
        <Switch
          checked={isAnnual}
          onCheckedChange={handleBillingCycleChange}
          className="data-[state=checked]:bg-orange-500"
        />
        <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
          Pay Annually
        </span>
        {isAnnual && (
          <Badge variant="secondary" className="bg-green-100 text-green-700 font-medium">
            🎉 Save up to 20%
          </Badge>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Plan Selection */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-center">Available Plans</h4>
            <FormField
              control={form.control}
              name="planId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                      {plans.map((plan: Plan) => {
                        const price = isAnnual ? Math.round(Number(plan.annualPrice) / 12) : Number(plan.monthlyPrice);
                        const totalPrice = isAnnual ? Number(plan.annualPrice) : Number(plan.monthlyPrice);
                        const savings = isAnnual ? calculateSavings(Number(plan.monthlyPrice), Number(plan.annualPrice)) : null;

                        return (
                          <div key={plan.id} className="relative">
                            <RadioGroupItem
                              value={plan.id}
                              id={plan.id}
                              className="peer sr-only"
                            />
                            <label
                              htmlFor={plan.id}
                              className="block cursor-pointer"
                            >
                              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02] peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-orange-500 peer-data-[state=checked]:border-orange-500 relative">
                                {/* Selected Badge */}
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 opacity-0 peer-data-[state=checked]:opacity-100 transition-opacity">
                                  <Badge className="bg-orange-500 text-white px-3 py-1">
                                    ✓ Selected
                                  </Badge>
                                </div>

                                <CardHeader className="text-center pb-4">
                                  <div className="flex justify-center mb-3">
                                    {getIcon(plan.organizationType)}
                                  </div>
                                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                                  <CardDescription className="text-sm">{plan.description}</CardDescription>

                                  {/* Pricing */}
                                  <div className="mt-4">
                                    <div className="text-3xl font-bold text-orange-600">₹{price}</div>
                                    <div className="text-sm text-muted-foreground">per month</div>
                                    {isAnnual && (
                                      <div className="text-sm text-muted-foreground mt-1">
                                        ₹{totalPrice} billed annually
                                      </div>
                                    )}
                                    {isAnnual && savings && (
                                      <div className="text-sm text-green-600 font-medium mt-2">
                                        💰 Save ₹{savings.amount} per year ({savings.percentage}% off)
                                      </div>
                                    )}
                                  </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                  {/* Key Features */}
                                  <div>
                                    <h5 className="font-medium mb-3 text-center">What's Included</h5>
                                    <ul className="space-y-2">
                                      <li className="flex items-center text-sm">
                                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                        <span><strong>{plan.venuesIncluded}</strong> venue included</span>
                                      </li>
                                      <li className="flex items-center text-sm">
                                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                        <span>Unlimited QR codes & tables</span>
                                      </li>
                                      <li className="flex items-center text-sm">
                                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                        <span>Real-time order management</span>
                                      </li>
                                      <li className="flex items-center text-sm">
                                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                        <span>Menu management system</span>
                                      </li>
                                      <li className="flex items-center text-sm">
                                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                        <span>Customer support</span>
                                      </li>
                                      {plan.features.length > 5 && (
                                        <li className="text-sm text-muted-foreground text-center">
                                          +{plan.features.length - 5} more features
                                        </li>
                                      )}
                                    </ul>
                                  </div>

                                  {/* Additional Info */}
                                  <div className="pt-3 border-t border-muted">
                                    <div className="text-xs text-muted-foreground text-center space-y-1">
                                      <div>• Additional venues: ₹{price}/month each</div>
                                      <div>• Cancel anytime</div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <h5 className="font-medium text-blue-900 mb-2">Need Help Choosing?</h5>
            <p className="text-sm text-blue-700 mb-3">
              All plans include everything you need to get started. You can always upgrade or add more venues later.
            </p>
            <div className="text-xs text-blue-600">
              💡 Tip: Start with the basic plan and scale as your business grows
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
              Continue to Venue Details
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PlanSelectionStep;


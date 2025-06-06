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
      case OrganizationType.FOOD_TRUCK:
      case OrganizationType.BAR:
        return orgType; // Each type has its own specific plan
      default:
        return OrganizationType.RESTAURANT; // Default fallback
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
      case 'FOOD_TRUCK':
        return <Utensils className="h-6 w-6 text-orange-500" />;
      case 'BAR':
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

  // Get appropriate venue text based on organization type
  const getVenueText = (orgType: OrganizationType, venuesIncluded: number): string => {
    switch (orgType) {
      case OrganizationType.FOOD_TRUCK:
        return `<strong>${venuesIncluded}</strong> mobile location included`;
      case OrganizationType.HOTEL:
        return `<strong>${venuesIncluded}</strong> property included`;
      default:
        return `<strong>${venuesIncluded}</strong> venue included`;
    }
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
      <div className="text-center space-y-3">
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
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-sm font-medium text-orange-800">
            📋 Please select a plan below to continue
          </p>
        </div>
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
            <FormField
              control={form.control}
              name="planId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                    >
                      {plans.map((plan: Plan) => {
                        const price = isAnnual ? Math.round(Number(plan.annualPrice) / 12) : Number(plan.monthlyPrice);
                        const totalPrice = isAnnual ? Number(plan.annualPrice) : Number(plan.monthlyPrice);
                        const savings = isAnnual ? calculateSavings(Number(plan.monthlyPrice), Number(plan.annualPrice)) : null;
                        const isSelected = field.value === plan.id;

                        return (
                          <div key={plan.id} className="relative">
                            <RadioGroupItem
                              value={plan.id}
                              id={plan.id}
                              className="sr-only"
                            />
                            <label
                              htmlFor={plan.id}
                              className="block cursor-pointer"
                            >
                              <Card className={`h-full transition-all duration-200 hover:shadow-md hover:border-orange-300 relative border-2 ${
                                isSelected
                                  ? 'ring-2 ring-orange-500 border-orange-500 bg-orange-50'
                                  : 'border-gray-200 hover:border-orange-300'
                              }`}>
                                {/* Selection Indicator */}
                                <div className="absolute top-3 right-3">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    isSelected
                                      ? 'border-orange-500 bg-orange-500'
                                      : 'border-gray-300'
                                  }`}>
                                    {isSelected && (
                                      <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                  </div>
                                </div>

                                {/* Selected Badge */}
                                {isSelected && (
                                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
                                    <Badge className="bg-orange-500 text-white px-3 py-1 shadow-md">
                                      ✓ Selected
                                    </Badge>
                                  </div>
                                )}

                                <CardHeader className="text-center pb-3 pt-6">
                                  <div className="flex justify-center mb-2">
                                    {getIcon(plan.organizationType)}
                                  </div>
                                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                                  <CardDescription className="text-xs">{plan.description}</CardDescription>

                                  {/* Pricing */}
                                  <div className="mt-3">
                                    <div className="text-2xl font-bold text-orange-600">₹{price}</div>
                                    <div className="text-xs text-muted-foreground">per month</div>
                                    {isAnnual && (
                                      <div className="text-xs text-muted-foreground mt-1">
                                        ₹{totalPrice} billed annually
                                      </div>
                                    )}
                                    {isAnnual && savings && (
                                      <div className="text-xs text-green-600 font-medium mt-1">
                                        💰 Save ₹{savings.amount}/year ({savings.percentage}% off)
                                      </div>
                                    )}
                                  </div>
                                </CardHeader>

                                <CardContent className="space-y-3 pt-0">
                                  {/* Key Features */}
                                  <div>
                                    <h5 className="font-medium mb-2 text-center text-sm">What's Included</h5>
                                    <ul className="space-y-1.5">
                                      <li className="flex items-center text-xs">
                                        <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                                        <span dangerouslySetInnerHTML={{ __html: getVenueText(plan.organizationType as OrganizationType, plan.venuesIncluded) }} />
                                      </li>
                                      {plan.features.slice(0, 3).map((feature, index) => (
                                        <li key={index} className="flex items-center text-xs">
                                          <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                                          <span>{feature}</span>
                                        </li>
                                      ))}
                                      {plan.features.length > 3 && (
                                        <li className="text-xs text-muted-foreground text-center pt-1">
                                          +{plan.features.length - 3} more features
                                        </li>
                                      )}
                                    </ul>
                                  </div>

                                  {/* Additional Info */}
                                  <div className="pt-2 border-t border-muted">
                                    <div className="text-xs text-muted-foreground text-center">
                                      <div>Cancel anytime • No setup fees</div>
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <p className="text-sm text-blue-700 mb-2">
              💡 All plans include everything you need to get started. You can always upgrade later.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <div className="flex items-center gap-3">
              {!form.watch('planId') && (
                <p className="text-sm text-orange-600 font-medium">
                  ← Please select a plan
                </p>
              )}
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600"
                disabled={!form.watch('planId')}
              >
                Continue to Venue Details
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PlanSelectionStep;


import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Phone, Mail, Building2, Globe, CreditCard, Loader2 } from 'lucide-react';
import { useOrganization } from '@/contexts/organization-context';
import PaymentService from '@/services/payment-service';
import { Plan } from '@/types/payment';

// Comprehensive validation schema
const venueDetailsSchema = z.object({
  venueName: z.string()
    .min(1, { message: 'Venue name is required' })
    .min(2, { message: 'Venue name must be at least 2 characters' })
    .max(100, { message: 'Venue name must be at most 100 characters' }),
  venueDescription: z.string()
    .max(500, { message: 'Description must be at most 500 characters' })
    .optional(),
  address: z.string()
    .min(1, { message: 'Street address is required' })
    .max(200, { message: 'Address must be less than 200 characters' }),
  city: z.string()
    .min(1, { message: 'City is required' })
    .max(100, { message: 'City must be less than 100 characters' }),
  state: z.string()
    .min(1, { message: 'State/Province is required' })
    .max(100, { message: 'State must be less than 100 characters' }),
  country: z.string()
    .min(1, { message: 'Country is required' })
    .max(100, { message: 'Country must be less than 100 characters' }),
  postalCode: z.string()
    .min(1, { message: 'Postal code is required' })
    .max(20, { message: 'Postal code must be less than 20 characters' }),
  phoneNumber: z.string()
    .min(1, { message: 'Phone number is required' })
    .max(20, { message: 'Phone number must be less than 20 characters' }),
  email: z.string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email address' })
    .max(100, { message: 'Email must be less than 100 characters' }),
  imageUrl: z.string()
    .min(1, { message: 'Image URL is required' })
    .url({ message: 'Invalid URL format' })
    .max(255, { message: 'URL must be less than 255 characters' }),
  billingCycle: z.enum(['MONTHLY', 'ANNUAL']).default('MONTHLY')
});

type VenueDetailsFormValues = z.infer<typeof venueDetailsSchema>;

interface VenueDetailsStepProps {
  initialData?: Partial<VenueDetailsFormValues>;
  onSubmit: (data: VenueDetailsFormValues) => void;
  onBack: () => void;
}

const VenueDetailsStep: React.FC<VenueDetailsStepProps> = ({
  initialData,
  onSubmit,
  onBack,
}) => {
  const { currentOrganization } = useOrganization();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);

  const form = useForm<VenueDetailsFormValues>({
    resolver: zodResolver(venueDetailsSchema),
    defaultValues: {
      venueName: initialData?.venueName || '',
      venueDescription: initialData?.venueDescription || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      state: initialData?.state || '',
      country: initialData?.country || '',
      postalCode: initialData?.postalCode || '',
      phoneNumber: initialData?.phoneNumber || '',
      email: initialData?.email || '',
      imageUrl: initialData?.imageUrl || '',
      billingCycle: (initialData as any)?.billingCycle || 'MONTHLY'
    },
  });

  // Fetch plans based on organization type
  useEffect(() => {
    const fetchPlans = async () => {
      if (!currentOrganization) return;

      try {
        setLoading(true);
        const allPlans = await PaymentService.getPlans();
        const organizationTypePlans = allPlans.filter(
          plan => plan.organizationType === currentOrganization.type
        );
        setPlans(organizationTypePlans);

        // Set the current plan (should be the first one for this organization type)
        if (organizationTypePlans.length > 0) {
          setCurrentPlan(organizationTypePlans[0]);
        }
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [currentOrganization]);

  const handleSubmit = (data: VenueDetailsFormValues) => {
    onSubmit(data);
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate savings for annual billing
  const calculateAnnualSavings = (monthlyPrice: number, annualPrice: number) => {
    const yearlyMonthlyTotal = monthlyPrice * 12;
    return yearlyMonthlyTotal - annualPrice;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Complete Venue Information</h3>
        <p className="text-sm text-muted-foreground">
          Provide comprehensive details about your new venue
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Basic Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="venueName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Downtown Branch, Main Location" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name of your venue as it will appear to customers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="venue@example.com" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Contact email for this venue
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="venueDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of your venue, its atmosphere, specialties..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about your venue (optional but recommended)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact Information
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="+1 (555) 123-4567" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="https://example.com/image.jpg" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      URL to an image of your venue
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h4 className="text-md font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address Information
            </h4>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address *</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main Street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input placeholder="New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province *</FormLabel>
                    <FormControl>
                      <Input placeholder="NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code *</FormLabel>
                    <FormControl>
                      <Input placeholder="10001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <FormControl>
                      <Input placeholder="USA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Billing Cycle Selection */}
          <div className="space-y-4">
            <h4 className="text-md font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing Cycle
            </h4>

            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">Loading pricing information...</span>
              </div>
            ) : currentPlan ? (
              <FormField
                control={form.control}
                name="billingCycle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Choose your billing cycle</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select billing cycle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MONTHLY">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              Monthly - {formatCurrency(currentPlan.monthlyPrice)}/month
                            </span>
                            <span className="text-sm text-muted-foreground">Pay monthly, cancel anytime</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ANNUAL">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              Annual - {formatCurrency(Math.round(currentPlan.annualPrice / 12))}/month
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(currentPlan.annualPrice)} billed annually, save {formatCurrency(calculateAnnualSavings(currentPlan.monthlyPrice, currentPlan.annualPrice))}/year
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose how you'd like to be billed for this venue
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="text-center py-4">
                <span className="text-sm text-muted-foreground">Unable to load pricing information</span>
              </div>
            )}
          </div>

          {/* Pricing Information */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-blue-900">Venue Pricing</h4>
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-sm text-blue-800">Loading pricing...</span>
                  </div>
                ) : currentPlan ? (
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• Monthly: {formatCurrency(currentPlan.monthlyPrice)} per venue</p>
                    <p>• Annual: {formatCurrency(Math.round(currentPlan.annualPrice / 12))} per venue ({formatCurrency(currentPlan.annualPrice)} billed annually)</p>
                    <p>• Payment required to activate the new venue</p>
                    <p>• Pricing based on your {currentOrganization?.type.toLowerCase()} organization type</p>
                  </div>
                ) : (
                  <div className="text-sm text-blue-800">
                    <p>• Unable to load pricing information</p>
                    <p>• Please try refreshing the page</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="sm:flex-1"
              disabled={form.formState.isSubmitting}
            >
              Continue to Payment
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default VenueDetailsStep;

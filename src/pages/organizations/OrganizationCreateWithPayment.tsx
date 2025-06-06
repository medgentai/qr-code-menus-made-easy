import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useOrganization } from '@/contexts/organization-context';

// Import step components (we'll create these)
import OrganizationDetailsStep from '@/components/organization/OrganizationDetailsStep';
import PlanSelectionStep from '@/components/organization/PlanSelectionStep';
import VenueDetailsStep from '@/components/organization/VenueDetailsStep';
import PaymentStep from '@/components/organization/PaymentStep';
import { PaymentSuccess } from '@/components/payments';

// Import services
import PaymentService from '@/services/payment-service';
import { CreateOrganizationPaymentDto, PaymentVerificationDto } from '@/types/payment';
import { OrganizationType } from '@/types/organization';

// Form schemas for each step
const organizationDetailsSchema = z.object({
  name: z.string()
    .min(1, 'Organization name is required')
    .min(2, 'Name must be at least 2 characters'),
  slug: z.string()
    .min(1, 'URL slug is required')
    .min(2, 'Slug must be at least 2 characters'),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  type: z.nativeEnum(OrganizationType),
});

const planSelectionSchema = z.object({
  planId: z.string().min(1, 'Please select a plan'),
  billingCycle: z.enum(['MONTHLY', 'ANNUAL']),
});

const venueDetailsSchema = z.object({
  venueName: z.string()
    .min(1, { message: 'Venue name is required' })
    .min(2, { message: 'Venue name must be at least 2 characters' })
    .max(100, { message: 'Venue name must be at most 100 characters' }),
  venueDescription: z.string()
    .max(500, { message: 'Description must be at most 500 characters' })
    .optional(),
  address: z.string()
    .max(200, { message: 'Address must be less than 200 characters' })
    .optional(),
  city: z.string()
    .max(100, { message: 'City must be less than 100 characters' })
    .optional(),
  state: z.string()
    .max(100, { message: 'State must be less than 100 characters' })
    .optional(),
  country: z.string()
    .max(100, { message: 'Country must be less than 100 characters' })
    .optional(),
  postalCode: z.string()
    .max(20, { message: 'Postal code must be less than 20 characters' })
    .optional(),
  phoneNumber: z.string()
    .max(20, { message: 'Phone number must be less than 20 characters' })
    .optional(),
  email: z.string()
    .email({ message: 'Invalid email address' })
    .max(100, { message: 'Email must be less than 100 characters' })
    .optional(),
  imageUrl: z.string()
    .url({ message: 'Invalid URL format' })
    .max(255, { message: 'URL must be less than 255 characters' })
    .optional()
});

type OrganizationDetailsForm = z.infer<typeof organizationDetailsSchema>;
type PlanSelectionForm = z.infer<typeof planSelectionSchema>;
type VenueDetailsForm = z.infer<typeof venueDetailsSchema>;

interface StepData {
  organizationDetails?: OrganizationDetailsForm;
  planSelection?: PlanSelectionForm;
  venueDetails?: VenueDetailsForm;
}

const STEPS = [
  { id: 1, title: 'Organization Details', description: 'Basic information about your organization' },
  { id: 2, title: 'Select Plan', description: 'Choose your subscription plan' },
  { id: 3, title: 'First Venue', description: 'Set up your first venue' },
  { id: 4, title: 'Payment', description: 'Complete your subscription' },
];

const OrganizationCreateWithPayment = () => {
  const navigate = useNavigate();
  const { organizations } = useOrganization();
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState<StepData>({});
  const [paymentOrder, setPaymentOrder] = useState<any>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if user has existing organizations
  const hasExistingOrganizations = organizations.length > 0;

  // Calculate progress percentage
  const progressPercentage = (currentStep / STEPS.length) * 100;

  // Handle step navigation
  const goToNextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle step data updates
  const updateStepData = (step: keyof StepData, data: any) => {
    setStepData(prev => ({ ...prev, [step]: data }));
  };

  // Handle organization details submission
  const handleOrganizationDetails = (data: OrganizationDetailsForm) => {
    updateStepData('organizationDetails', data);
    goToNextStep();
  };

  // Handle plan selection
  const handlePlanSelection = (data: PlanSelectionForm) => {
    updateStepData('planSelection', data);
    goToNextStep();
  };

  // Handle venue details
  const handleVenueDetails = (data: VenueDetailsForm) => {
    updateStepData('venueDetails', data);
    goToNextStep();
  };

  // Create payment order
  const createPaymentOrder = async () => {
    if (!stepData.organizationDetails || !stepData.planSelection || !stepData.venueDetails) {
      toast.error('Missing required information');
      return;
    }

    // Prevent multiple calls
    if (isProcessing || paymentOrder) {
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Creating payment order with data:', {
        organizationName: stepData.organizationDetails.name,
        organizationType: stepData.organizationDetails.type,
        planId: stepData.planSelection.planId,
        billingCycle: stepData.planSelection.billingCycle,
        venueName: stepData.venueDetails.venueName,
        venueDescription: stepData.venueDetails.venueDescription,
        address: stepData.venueDetails.address,
        city: stepData.venueDetails.city,
        state: stepData.venueDetails.state,
        country: stepData.venueDetails.country,
        postalCode: stepData.venueDetails.postalCode,
        phoneNumber: stepData.venueDetails.phoneNumber,
        email: stepData.venueDetails.email,
        imageUrl: stepData.venueDetails.imageUrl,
      });

      const paymentData: CreateOrganizationPaymentDto = {
        organizationName: stepData.organizationDetails.name,
        organizationType: stepData.organizationDetails.type,
        planId: stepData.planSelection.planId,
        billingCycle: stepData.planSelection.billingCycle,
        venueName: stepData.venueDetails.venueName,
        venueDescription: stepData.venueDetails.venueDescription,
        address: stepData.venueDetails.address,
        city: stepData.venueDetails.city,
        state: stepData.venueDetails.state,
        country: stepData.venueDetails.country,
        postalCode: stepData.venueDetails.postalCode,
        phoneNumber: stepData.venueDetails.phoneNumber,
        email: stepData.venueDetails.email,
        imageUrl: stepData.venueDetails.imageUrl,
      };

      const order = await PaymentService.createOrganizationPaymentOrder(paymentData);
      setPaymentOrder(order);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message ||
                          error?.response?.data?.error ||
                          error?.message ||
                          'Failed to create payment order';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async (verificationData: PaymentVerificationDto) => {
    setIsProcessing(true);
    try {
      const result = await PaymentService.completeOrganizationPayment(verificationData);
      setPaymentResult(result);
      toast.success('Organization created successfully!');
    } catch (error: any) {
      console.error('Error completing payment:', error);
      toast.error(error?.response?.data?.message || 'Payment verification failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment failure
  const handlePaymentFailure = (error: any) => {
    console.error('Payment failed:', error);
    toast.error('Payment failed. Please try again.');
  };

  // Render success page
  if (paymentResult?.success) {
    return (
      <PaymentSuccess
        organization={paymentResult.organization}
        venue={paymentResult.venue}
        subscription={paymentResult.subscription}
        type="organization"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row md:flex-row md:items-center">
        {hasExistingOrganizations && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/organizations')}
            className="self-start mb-2 sm:mb-0 md:mb-0 sm:mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        )}
        <div>
          <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Create Organization
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Set up your organization with subscription and first venue
          </p>
        </div>
      </div>

      <Separator />

      {/* Progress Bar */}
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex items-center ${
                currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                  currentStep > step.id
                    ? 'bg-primary text-primary-foreground'
                    : currentStep === step.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              <div className="hidden sm:block">
                <div className="font-medium">{step.title}</div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </div>
            </div>
          ))}
        </div>
        <Progress value={progressPercentage} className="w-full" />
      </div>

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{STEPS[currentStep - 1]?.title}</CardTitle>
              <CardDescription>{STEPS[currentStep - 1]?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep === 1 && (
                <OrganizationDetailsStep
                  initialData={stepData.organizationDetails}
                  onSubmit={handleOrganizationDetails}
                  onBack={hasExistingOrganizations ? () => navigate('/organizations') : undefined}
                />
              )}

              {currentStep === 2 && (
                <PlanSelectionStep
                  organizationType={stepData.organizationDetails?.type}
                  initialData={stepData.planSelection}
                  onSubmit={handlePlanSelection}
                  onBack={goToPreviousStep}
                />
              )}

              {currentStep === 3 && (
                <VenueDetailsStep
                  initialData={stepData.venueDetails}
                  onSubmit={handleVenueDetails}
                  onBack={goToPreviousStep}
                  organizationType={stepData.organizationDetails?.type}
                />
              )}

              {currentStep === 4 && (
                <PaymentStep
                  stepData={stepData}
                  paymentOrder={paymentOrder}
                  onCreateOrder={createPaymentOrder}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentFailure={handlePaymentFailure}
                  onBack={goToPreviousStep}
                  isProcessing={isProcessing}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Review your selections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stepData.organizationDetails && (
                <div>
                  <h4 className="font-medium">Organization</h4>
                  <p className="text-sm text-muted-foreground">
                    {stepData.organizationDetails.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stepData.organizationDetails.type}
                  </p>
                </div>
              )}

              {stepData.planSelection && (
                <div>
                  <h4 className="font-medium">Plan</h4>
                  <p className="text-sm text-muted-foreground">
                    {stepData.planSelection.billingCycle} billing
                  </p>
                </div>
              )}

              {stepData.venueDetails && (
                <div>
                  <h4 className="font-medium">First Venue</h4>
                  <p className="text-sm text-muted-foreground">
                    {stepData.venueDetails.venueName}
                  </p>
                  {stepData.venueDetails.city && stepData.venueDetails.state && (
                    <p className="text-xs text-muted-foreground">
                      {stepData.venueDetails.city}, {stepData.venueDetails.state}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrganizationCreateWithPayment;

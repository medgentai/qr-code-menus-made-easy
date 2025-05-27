import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// Import components
import VenueDetailsStep from '@/components/venue/VenueDetailsStep';
import VenuePaymentStep from '@/components/venue/VenuePaymentStep';
import { PaymentSuccess } from '@/components/payments';

// Import services and types
import PaymentService from '@/services/payment-service';
import { CreateVenuePaymentDto, PaymentVerificationDto, PaymentOrder } from '@/types/payment';

interface VenueStepData {
  venueDetails?: {
    venueName: string;
    venueDescription?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    phoneNumber?: string;
    email?: string;
    imageUrl?: string;
    billingCycle?: 'MONTHLY' | 'ANNUAL';
  };
}

const VenueCreateWithPayment = () => {
  const { id: organizationId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState<VenueStepData>({});
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!organizationId) {
    return <div>Organization ID is required</div>;
  }

  // Handle venue details submission
  const handleVenueDetails = (data: {
    venueName: string;
    venueDescription?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    phoneNumber?: string;
    email?: string;
    imageUrl?: string;
    billingCycle?: 'MONTHLY' | 'ANNUAL';
  }) => {
    setStepData(prev => ({
      ...prev,
      venueDetails: data
    }));
    setCurrentStep(2);
  };

  // Go back to previous step
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Create payment order
  const createPaymentOrder = async () => {
    if (!stepData.venueDetails) {
      toast.error('Missing venue details');
      return;
    }

    // Prevent multiple calls
    if (isProcessing || paymentOrder) {
      return;
    }

    setIsProcessing(true);
    try {
      const paymentData: CreateVenuePaymentDto = {
        organizationId,
        billingCycle: stepData.venueDetails.billingCycle || 'MONTHLY',
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

      const order = await PaymentService.createVenuePaymentOrder(paymentData);
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
      const result = await PaymentService.completeVenuePayment(verificationData);
      setPaymentResult(result);
      toast.success('Venue created successfully!');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Payment verification failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment failure
  const handlePaymentFailure = (error: any) => {
    toast.error('Payment failed. Please try again.');
  };

  // Render success page
  if (paymentResult?.success) {
    return (
      <PaymentSuccess
        organization={paymentResult.organization}
        venue={paymentResult.venue}
        subscription={paymentResult.subscription}
        type="venue"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row md:flex-row md:items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/organizations/${organizationId}/venues`)}
          className="self-start mb-2 sm:mb-0 md:mb-0 sm:mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Add New Venue
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Add a new venue to your organization (payment required)
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center space-x-4">
        <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            1
          </div>
          <span className="text-sm font-medium">Venue Details</span>
        </div>

        <div className={`h-px flex-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />

        <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}>
            2
          </div>
          <span className="text-sm font-medium">Payment</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && 'Venue Information'}
              {currentStep === 2 && 'Payment'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <VenueDetailsStep
                initialData={stepData.venueDetails}
                onSubmit={handleVenueDetails}
                onBack={() => navigate(`/organizations/${organizationId}/venues`)}
              />
            )}

            {currentStep === 2 && (
              <VenuePaymentStep
                organizationId={organizationId}
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
    </div>
  );
};

export default VenueCreateWithPayment;


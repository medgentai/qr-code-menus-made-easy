import React, { useEffect } from 'react';
import { Loader2, Building2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import RazorpayCheckout from '@/components/payments/RazorpayCheckout';
import { PaymentOrder, PaymentVerificationDto } from '@/types/payment';

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
  };
}

interface VenuePaymentStepProps {
  organizationId: string;
  stepData: VenueStepData;
  paymentOrder: PaymentOrder | null;
  onCreateOrder: () => Promise<void>;
  onPaymentSuccess: (data: PaymentVerificationDto) => Promise<void>;
  onPaymentFailure: (error: any) => void;
  onBack: () => void;
  isProcessing: boolean;
}

const VenuePaymentStep: React.FC<VenuePaymentStepProps> = ({
  organizationId,
  stepData,
  paymentOrder,
  onCreateOrder,
  onPaymentSuccess,
  onPaymentFailure,
  onBack,
  isProcessing,
}) => {
  // Create payment order when component mounts (only once)
  useEffect(() => {
    if (!paymentOrder && !isProcessing) {
      onCreateOrder();
    }
  }, []); // Empty dependency array to run only once

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Payment for New Venue</h3>
        <p className="text-sm text-muted-foreground">
          Complete payment to add your new venue
        </p>
      </div>

      {/* Venue Summary */}
      <Card className="bg-gray-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Venue Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Venue Name:</span>
            <span className="text-sm">{stepData.venueDetails?.venueName}</span>
          </div>
          {stepData.venueDetails?.venueDescription && (
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium">Description:</span>
              <span className="text-sm text-right max-w-[200px]">
                {stepData.venueDetails.venueDescription}
              </span>
            </div>
          )}
          {stepData.venueDetails?.email && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm">{stepData.venueDetails.email}</span>
            </div>
          )}
          {stepData.venueDetails?.phoneNumber && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Phone:</span>
              <span className="text-sm">{stepData.venueDetails.phoneNumber}</span>
            </div>
          )}
          {(stepData.venueDetails?.address || stepData.venueDetails?.city) && (
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium">Address:</span>
              <span className="text-sm text-right max-w-[200px]">
                {[
                  stepData.venueDetails?.address,
                  stepData.venueDetails?.city,
                  stepData.venueDetails?.state,
                  stepData.venueDetails?.country,
                  stepData.venueDetails?.postalCode
                ].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Summary */}
      {paymentOrder && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Organization:</span>
                <span className="text-sm font-medium">{paymentOrder.organizationName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Plan:</span>
                <span className="text-sm">{paymentOrder.planName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Additional Venue Fee:</span>
                <span className="text-sm">{formatCurrency(paymentOrder.amount)}</span>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center font-semibold">
              <span>Total Amount:</span>
              <span className="text-lg text-primary">
                {formatCurrency(paymentOrder.amount)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Button or Loading */}
      {isProcessing && !paymentOrder ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">
              Preparing your payment...
            </p>
          </div>
        </div>
      ) : paymentOrder ? (
        <div className="space-y-4">
          <div className="text-center">
            <RazorpayCheckout
              paymentOrder={paymentOrder}
              onSuccess={onPaymentSuccess}
              onFailure={onPaymentFailure}
              disabled={isProcessing}
              buttonText={`Pay ${formatCurrency(paymentOrder.amount)}`}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            />
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              Back to Venue Details
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-4">
            Failed to create payment order. Please try again.
          </p>
          <div className="space-x-3">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={onCreateOrder}>
              Retry Payment
            </Button>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="text-center text-xs text-muted-foreground">
        <p>🔒 Secure payment powered by Razorpay</p>
        <p>Your payment information is encrypted and secure</p>
      </div>
    </div>
  );
};

export default VenuePaymentStep;

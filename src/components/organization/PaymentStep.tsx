import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RazorpayCheckout } from '@/components/payments';
import {
  CreditCard,
  Shield,
  CheckCircle,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { PaymentOrder, PaymentVerificationDto } from '@/types/payment';

interface StepData {
  organizationDetails?: {
    name?: string;
    slug?: string;
    type?: 'RESTAURANT' | 'HOTEL' | 'CAFE' | 'FOOD_TRUCK' | 'BAR' | 'OTHER';
    description?: string;
    logoUrl?: string;
    websiteUrl?: string;
  };
  planSelection?: {
    planId?: string;
    billingCycle?: 'MONTHLY' | 'ANNUAL';
  };
  venueDetails?: {
    venueName?: string;
    venueDescription?: string;
  };
}

interface PaymentStepProps {
  stepData: StepData;
  paymentOrder: PaymentOrder | null;
  onCreateOrder: () => Promise<void>;
  onPaymentSuccess: (data: PaymentVerificationDto) => Promise<void>;
  onPaymentFailure: (error: any) => void;
  onBack: () => void;
  isProcessing: boolean;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
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
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Order Summary</span>
          </CardTitle>
          <CardDescription>Review your subscription details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Organization Details */}
          <div className="flex items-start space-x-3">
            <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium">{stepData.organizationDetails?.name}</h4>
              <p className="text-sm text-muted-foreground">
                {stepData.organizationDetails?.type} Organization
              </p>
              {stepData.organizationDetails?.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {stepData.organizationDetails.description}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Venue Details */}
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium">First Venue: {stepData.venueDetails?.venueName}</h4>
              {stepData.venueDetails?.venueDescription && (
                <p className="text-sm text-muted-foreground mt-1">
                  {stepData.venueDetails.venueDescription}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Plan Details */}
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium">
                  {paymentOrder?.planDetails?.name || 'Selected Plan'}
                </h4>
                <Badge variant="secondary">
                  {stepData.planSelection?.billingCycle}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {paymentOrder?.planDetails?.venuesIncluded || 1} venue included
              </p>
            </div>
            <div className="text-right">
              {paymentOrder && (
                <div className="text-lg font-bold">
                  {formatCurrency(paymentOrder.amount)}
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                /{stepData.planSelection?.billingCycle === 'ANNUAL' ? 'year' : 'month'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment</span>
          </CardTitle>
          <CardDescription>Complete your subscription payment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Security Notice */}
          <Alert className="border-green-200 bg-green-50">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your payment is secured by Razorpay with 256-bit SSL encryption.
              We don't store your payment information.
            </AlertDescription>
          </Alert>

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

              <div className="text-center text-xs text-muted-foreground">
                <p>By proceeding, you agree to our Terms of Service and Privacy Policy</p>
                <p className="mt-1">You can cancel your subscription anytime</p>
              </div>
            </div>
          ) : (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Failed to create payment order. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {/* Payment Methods */}
          <div className="pt-4">
            <h4 className="font-medium mb-3">Accepted Payment Methods</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { name: 'Visa', logo: '💳' },
                { name: 'Mastercard', logo: '💳' },
                { name: 'UPI', logo: '📱' },
                { name: 'Net Banking', logo: '🏦' },
              ].map((method) => (
                <div
                  key={method.name}
                  className="flex items-center space-x-2 p-2 border rounded-lg bg-gray-50"
                >
                  <span className="text-lg">{method.logo}</span>
                  <span className="text-sm font-medium">{method.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={isProcessing}>
          Back
        </Button>
        <div className="text-sm text-muted-foreground">
          Step 4 of 4
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;

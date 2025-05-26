import React from 'react';
import { XCircle, RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentFailureProps {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
  };
  onRetry?: () => void;
  onGoBack?: () => void;
  showRetry?: boolean;
}

const PaymentFailure: React.FC<PaymentFailureProps> = ({
  error,
  onRetry,
  onGoBack,
  showRetry = true,
}) => {
  const getErrorMessage = () => {
    if (error?.description) {
      return error.description;
    }
    
    switch (error?.code) {
      case 'BAD_REQUEST_ERROR':
        return 'Invalid payment request. Please try again.';
      case 'GATEWAY_ERROR':
        return 'Payment gateway error. Please try again later.';
      case 'NETWORK_ERROR':
        return 'Network error. Please check your connection and try again.';
      case 'SERVER_ERROR':
        return 'Server error. Please try again later.';
      default:
        return 'Payment failed. Please try again or contact support.';
    }
  };

  const getErrorSuggestion = () => {
    switch (error?.reason) {
      case 'payment_failed':
        return 'Your payment could not be processed. Please check your payment details and try again.';
      case 'payment_cancelled':
        return 'Payment was cancelled. You can try again when ready.';
      case 'insufficient_funds':
        return 'Insufficient funds in your account. Please try with a different payment method.';
      case 'card_declined':
        return 'Your card was declined. Please try with a different card or contact your bank.';
      default:
        return 'If the problem persists, please contact our support team for assistance.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">
            Payment Failed
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {getErrorMessage()}
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">What you can do:</h4>
            <p className="text-sm text-gray-600">
              {getErrorSuggestion()}
            </p>
          </div>

          {error?.code && (
            <div className="text-xs text-gray-500 bg-gray-100 rounded p-2">
              <p>Error Code: {error.code}</p>
              {error.reason && <p>Reason: {error.reason}</p>}
            </div>
          )}

          <div className="space-y-3">
            {showRetry && onRetry && (
              <Button onClick={onRetry} className="w-full">
                <RefreshCw className="mr-2 w-4 h-4" />
                Try Again
              </Button>
            )}
            
            {onGoBack && (
              <Button variant="outline" onClick={onGoBack} className="w-full">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Go Back
              </Button>
            )}

            <Button variant="ghost" asChild className="w-full">
              <a href="mailto:support@scanserve.com">
                Contact Support
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailure;

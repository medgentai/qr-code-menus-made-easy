import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import PaymentService from '@/services/payment-service';
import { useAuth } from '@/contexts/auth-context';
import {
  PaymentOrder,
  RazorpayOptions,
  PaymentVerificationDto,
} from '@/types/payment';

interface RazorpayCheckoutProps {
  paymentOrder: PaymentOrder;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
  disabled?: boolean;
  buttonText?: string;
  className?: string;
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  paymentOrder,
  onSuccess,
  onFailure,
  disabled = false,
  buttonText = 'Pay Now',
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const { state } = useAuth();
  const user = state.user;

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = async () => {
    try {
      const loaded = await PaymentService.loadRazorpayScript();
      setIsScriptLoaded(loaded);
      if (!loaded) {
        toast.error('Failed to load payment gateway. Please refresh and try again.');
      }
    } catch (error) {
      toast.error('Failed to load payment gateway.');
    }
  };

  const handlePayment = async () => {
    if (!isScriptLoaded) {
      toast.error('Payment gateway is not ready. Please try again.');
      return;
    }

    if (!user) {
      toast.error('Please login to continue with payment.');
      return;
    }

    setIsLoading(true);

    try {
      // Get Razorpay configuration
      const config = await PaymentService.getConfig();

      const options: RazorpayOptions = {
        key: config.key_id,
        amount: paymentOrder.amount * 100, // Convert to paise
        currency: paymentOrder.currency,
        name: 'ScanServe',
        description: paymentOrder.planDetails
          ? `${paymentOrder.planDetails.name} - ${paymentOrder.planDetails.billingCycle}`
          : 'Payment for ScanServe',
        order_id: paymentOrder.orderId,
        handler: async (response: any) => {
          try {
            setIsLoading(true);

            const verificationData: PaymentVerificationDto = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            };

            // Call success handler with verification data
            await onSuccess(verificationData);

            toast.success('Payment completed successfully!');
          } catch (error) {
            toast.error('Payment verification failed. Please contact support.');
            onFailure(error);
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: '', // Phone number not available in user profile
        },
        theme: {
          color: '#f97316', // Orange color matching your theme
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', (response: any) => {
        toast.error(`Payment failed: ${response.error.description}`);
        onFailure(response.error);
        setIsLoading(false);
      });

      razorpay.open();
    } catch (error) {
      toast.error('Failed to initiate payment. Please try again.');
      onFailure(error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isLoading || !isScriptLoaded}
      className={`${className}`}
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          {buttonText}
        </>
      )}
    </Button>
  );
};

export default RazorpayCheckout;

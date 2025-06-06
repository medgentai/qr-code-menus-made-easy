import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth-context';
import AuthLayout from '@/components/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import OrganizationService from '@/services/organization-service';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { toast } from 'sonner';

// Form validation schema
const otpSchema = z.object({
  otp: z.string().min(6, { message: 'OTP code must be 6 digits' }),
});

type OtpFormValues = z.infer<typeof otpSchema>;

const VerifyOtp = () => {
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Get email and redirect URL from location state
  const email = (location.state as any)?.email;
  const redirectUrl = (location.state as any)?.redirectUrl;

  // If no email is provided, redirect to login
  if (!email) {
    navigate('/login', { replace: true });
  }

  // Initialize form
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  // Form submission handler
  const onSubmit = async (data: OtpFormValues) => {
    if (!email) return;

    setIsLoading(true);
    try {
      const success = await verifyOtp(email, data.otp);

      if (success) {
        toast.success('Email verified successfully!');

        // If there's a redirect URL (e.g., from invitation flow), use it
        if (redirectUrl) {
          navigate(redirectUrl, { replace: true });
          return;
        }

        // Otherwise, check if user has any organizations
        try {
          const organizations = await OrganizationService.getAll();
          if (organizations.length === 0) {
            // New user with no organizations - redirect to create organization
            navigate('/organizations/create', { replace: true });
          } else {
            // User has organizations - redirect to dashboard
            navigate('/dashboard', { replace: true });
          }
        } catch (orgError) {
          // If we can't fetch organizations, default to dashboard
          // The organization context will handle the redirect if needed
          navigate('/dashboard', { replace: true });
        }
      } else {
        toast.error('Invalid or expired OTP code. Please try again.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (!email) return;

    setIsResending(true);
    try {
      const success = await resendOtp(email);

      if (success) {
        toast.success('A new OTP code has been sent to your email.');
      } else {
        toast.error('Failed to resend OTP. Please try again.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      description={`We've sent a verification code to ${email}. Please enter it below.`}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Verification Code</FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    {...field}
                    disabled={isLoading}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </Button>
          <div className="text-center">
            <Button
              variant="link"
              type="button"
              onClick={handleResendOtp}
              disabled={isResending}
              className="text-sm"
            >
              {isResending ? 'Sending...' : "Didn't receive a code? Resend"}
            </Button>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
};

export default VerifyOtp;

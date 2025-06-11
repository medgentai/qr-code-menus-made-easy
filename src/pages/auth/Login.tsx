import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth-context';
import { mapApiErrorsToForm } from '@/lib/form-utils';
import AuthLayout from '@/components/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Get the return URL from search params (for invitation flows) or location state, or default to dashboard
  const redirectUrl = searchParams.get('redirect');
  const reason = searchParams.get('reason');
  const from = redirectUrl || (location.state as any)?.from?.pathname || '/dashboard';

  // Show appropriate message based on redirect reason
  useEffect(() => {
    if (reason === 'suspended') {
      toast.error('Your account has been suspended. Please contact support for assistance.', {
        duration: 5000,
      });
    } else if (reason === 'session_expired') {
      toast.warning('Your session has expired. Please log in again.', {
        duration: 4000,
      });
    }
  }, [reason]);

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Form submission handler
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const user = await login(data.email, data.password);

      if (user) {
        toast.success('Login successful!');

        // Admin users should go to admin panel, regular users need organization check
        if (user.role === 'ADMIN') {
          navigate('/admin', { replace: true });
        } else {
          // Check if user has organizations before redirecting
          try {
            // Import here to avoid circular dependencies
            const OrganizationService = (await import('@/services/organization-service')).default;
            const organizations = await OrganizationService.getAll();

            if (organizations.length === 0) {
              // New user with no organizations - redirect to create organization
              navigate('/organizations/create', { replace: true });
            } else {
              // User has organizations - redirect to intended destination or dashboard
              navigate(from, { replace: true });
            }
          } catch (orgError) {
            // If we can't fetch organizations, default to the intended destination
            // The organization context will handle the redirect if needed
            navigate(from, { replace: true });
          }
        }
      } else {
        // If login returns null but no error was thrown, it might be because OTP is required
        // The auth context already shows a toast for this case
      }
    } catch (error: any) {
      // Map API errors to form fields
      if (error.errors) {
        mapApiErrorsToForm(error, form.setError);
      } else {
        toast.error(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign In to Your Account"
      description="Enter your credentials to access your account"
      footer={
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            to={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : "/register"}
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    type="email"
                    autoComplete="email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    autoComplete="current-password"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
};

export default Login;

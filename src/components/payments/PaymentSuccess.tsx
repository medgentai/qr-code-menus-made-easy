import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Building2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/contexts/organization-context';

interface PaymentSuccessProps {
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  venue?: {
    id: string;
    name: string;
  };
  subscription?: {
    id: string;
    billingCycle: string;
    amount: number;
  };
  type: 'organization' | 'venue';
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  organization,
  venue,
  subscription,
  type,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { fetchOrganizations } = useOrganization();
  const [countdown, setCountdown] = useState(5);

  // Invalidate cache and refresh data when component mounts
  useEffect(() => {
    const invalidateCache = async () => {
      if (type === 'venue' && organization) {
        // Invalidate venue cache for the organization
        await queryClient.invalidateQueries({
          queryKey: ['venues', 'organization', organization.id]
        });

        // Also invalidate organization details to refresh venue count
        await queryClient.invalidateQueries({
          queryKey: ['organization', 'details', organization.id]
        });
      } else if (type === 'organization') {
        // Invalidate organizations list
        await queryClient.invalidateQueries({
          queryKey: ['organizations']
        });

        // Refresh organizations data
        await fetchOrganizations(true);
      }
    };

    invalidateCache();
  }, [type, organization, queryClient, fetchOrganizations]);

  // Auto-redirect after 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (type === 'venue' && organization) {
            navigate(`/organizations/${organization.id}/venues?from=payment`);
          } else {
            navigate('/organizations?from=payment');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, type, organization]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            Payment Successful!
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {type === 'organization' && organization && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Organization Created</h3>
              </div>
              <p className="text-green-700">{organization.name}</p>
              {venue && (
                <div className="flex items-center gap-2 mt-2 text-sm text-green-600">
                  <MapPin className="w-4 h-4" />
                  <span>First venue: {venue.name}</span>
                </div>
              )}
            </div>
          )}

          {type === 'venue' && venue && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Venue Added</h3>
              </div>
              <p className="text-green-700">{venue.name}</p>
            </div>
          )}

          {subscription && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-2">Subscription Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Billing: {subscription.billingCycle}</p>
                <p>Amount: ₹{subscription.amount}</p>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-gray-600">
            <p>Your payment has been processed successfully.</p>
            <p>You can now start using ScanServe!</p>
          </div>

          {/* Auto-redirect countdown */}
          <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
            <p>
              Redirecting to {type === 'venue' ? 'venues' : 'organizations'} in {countdown} seconds...
            </p>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={async () => {
                // Ensure cache is invalidated before navigation
                if (type === 'venue' && organization) {
                  await queryClient.invalidateQueries({
                    queryKey: ['venues', 'organization', organization.id]
                  });
                  navigate(`/organizations/${organization.id}/venues?from=payment`);
                } else {
                  await queryClient.invalidateQueries({
                    queryKey: ['organizations']
                  });
                  navigate('/organizations?from=payment');
                }
              }}
            >
              {type === 'venue' ? 'Go to Venues Now' : 'Go to Organizations Now'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link to="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;

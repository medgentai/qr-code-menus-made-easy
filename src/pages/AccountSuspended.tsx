import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Mail, Phone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import ContactSupportModal from '@/components/modals/ContactSupportModal';

const AccountSuspended = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showContactModal, setShowContactModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleContactSupport = () => {
    setShowContactModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-red-200 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-800">
              Account Suspended
            </CardTitle>
            <CardDescription className="text-red-600 mt-2">
              Your account has been temporarily suspended
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Why was my account suspended?</h3>
              <p className="text-sm text-red-700">
                Your account may have been suspended due to:
              </p>
              <ul className="text-sm text-red-700 mt-2 space-y-1">
                <li>• Violation of terms of service</li>
                <li>• Suspicious account activity</li>
                <li>• Security concerns</li>
                <li>• Administrative review</li>
              </ul>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-2">What can I do?</h3>
              <p className="text-sm text-orange-700">
                If you believe this is a mistake, please contact our support team for assistance.
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleContactSupport}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>

              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Need immediate assistance?
              </p>
              <div className="flex items-center justify-center gap-4 mt-2">
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  support@scanserve.com
                </span>
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  +1 (555) 123-4567
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support Modal */}
        <ContactSupportModal
          open={showContactModal}
          onOpenChange={setShowContactModal}
          reason="suspension"
        />
      </div>
    </div>
  );
};

export default AccountSuspended;

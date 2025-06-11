import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ContactSupportModal from '@/components/modals/ContactSupportModal';

const ContactSupportTest: React.FC = () => {
  const [showSuspensionModal, setShowSuspensionModal] = useState(false);
  const [showGeneralModal, setShowGeneralModal] = useState(false);

  return (
    <div className="p-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Contact Support Modal Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => setShowSuspensionModal(true)}
            variant="destructive"
            className="w-full"
          >
            Test Suspension Support Modal
          </Button>
          
          <Button 
            onClick={() => setShowGeneralModal(true)}
            variant="outline"
            className="w-full"
          >
            Test General Support Modal
          </Button>
        </CardContent>
      </Card>

      {/* Modals */}
      <ContactSupportModal
        open={showSuspensionModal}
        onOpenChange={setShowSuspensionModal}
        reason="suspension"
      />
      
      <ContactSupportModal
        open={showGeneralModal}
        onOpenChange={setShowGeneralModal}
        reason="general"
      />
    </div>
  );
};

export default ContactSupportTest;

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Phone,
  Copy,
  ExternalLink,
  Clock,
  MessageCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useContactSupport } from '@/hooks/useContactSupport';

interface ContactSupportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: 'suspension' | 'general';
}

const ContactSupportModal: React.FC<ContactSupportModalProps> = ({
  open,
  onOpenChange,
  reason = 'general'
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Use centralized contact support hook
  const { contactInfo, openEmailClient: hookOpenEmailClient, openPhoneDialer } = useContactSupport();
  const { email: supportEmail, phone: supportPhone, businessHours } = contactInfo;

  const copyToClipboard = async (text: string, type: 'email' | 'phone') => {
    try {
      await navigator.clipboard.writeText(text);
      
      if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedPhone(true);
        setTimeout(() => setCopiedPhone(false), 2000);
      }
      
      toast.success(`${type === 'email' ? 'Email' : 'Phone number'} copied to clipboard`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const openEmailClient = () => {
    hookOpenEmailClient(reason);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            Contact Support
          </DialogTitle>
          <DialogDescription>
            {reason === 'suspension' 
              ? 'Get help with your account suspension. Our support team is here to assist you.'
              : 'Get in touch with our support team for assistance.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Priority Notice for Suspension */}
          {reason === 'suspension' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-orange-800 font-medium text-sm">
                <Clock className="h-4 w-4" />
                Priority Support
              </div>
              <p className="text-orange-700 text-xs mt-1">
                Account suspension appeals are handled with priority. You can expect a response within 24 hours.
              </p>
            </div>
          )}

          {/* Email Contact */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Email Support</h3>
              <Badge variant="outline" className="text-xs">
                Recommended
              </Badge>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-mono">{supportEmail}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(supportEmail, 'email')}
                  className="h-8 w-8 p-0"
                >
                  {copiedEmail ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <Button 
                onClick={openEmailClient}
                className="w-full"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Email Client
              </Button>
            </div>
          </div>

          {/* Phone Contact */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Phone Support</h3>
            
            <div className="bg-gray-50 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-mono">{supportPhone}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(supportPhone, 'phone')}
                  className="h-8 w-8 p-0"
                >
                  {copiedPhone ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="text-xs text-gray-600 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {businessHours}
              </div>
              
              <Button 
                onClick={openPhoneDialer}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Now
              </Button>
            </div>
          </div>

          {/* Response Time Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-800 text-sm mb-1">Response Times</h4>
            <div className="text-blue-700 text-xs space-y-1">
              <div>• Email: Within 24 hours</div>
              <div>• Phone: Immediate during business hours</div>
              {reason === 'suspension' && (
                <div>• Account appeals: Priority handling</div>
              )}
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactSupportModal;

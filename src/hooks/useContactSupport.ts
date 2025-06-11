import { useState } from 'react';

export interface ContactInfo {
  email: string;
  phone: string;
  businessHours: string;
}

export interface UseContactSupportReturn {
  contactInfo: ContactInfo;
  showModal: boolean;
  openModal: () => void;
  closeModal: () => void;
  copyToClipboard: (text: string, type: 'email' | 'phone') => Promise<void>;
  openEmailClient: (reason?: 'suspension' | 'general') => void;
  openPhoneDialer: () => void;
}

export const useContactSupport = (): UseContactSupportReturn => {
  const [showModal, setShowModal] = useState(false);

  // Company contact information - centralized configuration
  const contactInfo: ContactInfo = {
    email: 'support@scanserve.com',
    phone: '+1 (555) 123-4567',
    businessHours: 'Monday - Friday, 9:00 AM - 6:00 PM EST'
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const copyToClipboard = async (text: string, type: 'email' | 'phone') => {
    try {
      await navigator.clipboard.writeText(text);
      // You can add toast notification here if needed
    } catch (error) {
      throw new Error(`Failed to copy ${type} to clipboard`);
    }
  };

  const openEmailClient = (reason: 'suspension' | 'general' = 'general') => {
    const subject = reason === 'suspension' 
      ? 'Account Suspension Appeal - Urgent Review Requested'
      : 'Support Request - ScanServe Platform';
    
    const body = reason === 'suspension'
      ? `Dear ScanServe Support Team,

I am writing to request a review of my account suspension. I believe this may have been done in error or would like to understand the specific reason for the suspension.

Account Details:
- Email: [Your email address]
- Account Name: [Your account name]
- Date of Suspension: [Date if known]

I would appreciate a prompt review of my account status and any steps I can take to resolve this matter.

Thank you for your time and assistance.

Best regards,
[Your Name]`
      : `Dear ScanServe Support Team,

I need assistance with the following:

[Please describe your issue here]

Account Details:
- Email: [Your email address]
- Account Name: [Your account name]

Thank you for your assistance.

Best regards,
[Your Name]`;

    const mailtoLink = `mailto:${contactInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  const openPhoneDialer = () => {
    window.open(`tel:${contactInfo.phone}`, '_self');
  };

  return {
    contactInfo,
    showModal,
    openModal,
    closeModal,
    copyToClipboard,
    openEmailClient,
    openPhoneDialer
  };
};

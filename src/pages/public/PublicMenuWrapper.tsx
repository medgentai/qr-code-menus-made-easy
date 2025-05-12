import React from 'react';
import { PublicMenuProvider } from '@/contexts/public-menu-context';
import PublicMenu from './PublicMenu';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

const PublicMenuWrapper: React.FC = () => {
  return (
    <PublicMenuProvider>
      <Toaster />
      <Sonner />
      <PublicMenu />
    </PublicMenuProvider>
  );
};

export default PublicMenuWrapper;

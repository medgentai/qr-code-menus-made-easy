import React from 'react';
import { PublicMenuProvider } from '@/contexts/public-menu-context';
import { CartProvider } from '@/contexts/cart-context';
import PublicMenu from './PublicMenu';

const PublicMenuWrapper: React.FC = () => {
  return (
    <PublicMenuProvider>
      <CartProvider>
        <PublicMenu />
      </CartProvider>
    </PublicMenuProvider>
  );
};

export default PublicMenuWrapper;

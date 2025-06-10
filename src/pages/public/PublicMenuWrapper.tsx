import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicMenuProvider } from '@/contexts/public-menu-context';
import { CartProvider } from '@/contexts/cart-context';

const PublicMenuWrapper: React.FC = () => {
  return (
    <PublicMenuProvider>
      <CartProvider>
        <Outlet />
      </CartProvider>
    </PublicMenuProvider>
  );
};

export default PublicMenuWrapper;

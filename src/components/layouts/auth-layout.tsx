import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  footer?: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  description,
  footer,
}) => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container relative flex flex-1 flex-col items-center justify-center md:grid md:grid-cols-2 lg:max-w-none lg:px-0">
        {/* Left side - Content */}
        <div className="relative flex h-full flex-col bg-muted p-10 text-white dark:border-r md:h-auto lg:p-16">
          <div className="absolute inset-0 bg-primary" />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-white">ScanServe</span>
            </Link>
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                "ScanServe has revolutionized how we manage our restaurant menu. Our customers love the
                seamless digital experience, and we've seen a significant increase in orders."
              </p>
              <footer className="text-sm">Sofia Davis, Restaurant Owner</footer>
            </blockquote>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 p-8 sm:w-[350px] md:p-0">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {children}
          {footer && <div className="mt-4">{footer}</div>}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

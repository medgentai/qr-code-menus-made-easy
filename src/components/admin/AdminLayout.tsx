import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Settings,
  CreditCard,
  Menu,
  Shield,
  Package,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Platform overview and statistics',
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    description: 'Manage platform users',
  },
  {
    title: 'Organizations',
    href: '/admin/organizations',
    icon: Building2,
    description: 'Manage organizations and venues',
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Platform analytics and reports',
  },
  {
    title: 'Subscriptions',
    href: '/admin/subscriptions',
    icon: CreditCard,
    description: 'Manage subscriptions and billing',
  },
  {
    title: 'Plan Management',
    href: '/admin/plans',
    icon: Package,
    description: 'Manage pricing plans and configuration',
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System configuration',
  },
];

interface SidebarProps {
  className?: string;
}

function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className={cn('pb-12 min-h-screen', className)}>
      <div className="space-y-4 py-4 pr-7">
        {/* Header */}
        <div className="py-2">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold tracking-tight">
              Admin Panel
            </h2>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-2 h-auto p-3',
                    isActive && 'bg-secondary'
                  )}
                  onClick={() => navigate(item.href)}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{item.title}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-40 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <ScrollArea className="h-full">
            <Sidebar />
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow border-r bg-card">
          <ScrollArea className="flex-grow">
            <Sidebar />
          </ScrollArea>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-72">
        <main className="flex-1">
          <div className="p-6 pt-16 md:pt-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

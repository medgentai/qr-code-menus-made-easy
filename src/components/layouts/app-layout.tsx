import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import { usePermissions } from '@/contexts/permission-context';
import DynamicSidebar from '@/components/navigation/DynamicSidebar';
import MobileNavigation from '@/components/navigation/MobileNavigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import NotificationBell from '@/components/notifications/notification-bell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Menu,
  User,
  LogOut,
  ChevronDown,
  X,
  Building2,
  Plus,
  CreditCard,
} from 'lucide-react';
import { Organization } from '@/services/organization-service';
import { MemberRole, StaffType } from '@/types/organization';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { state: { user }, logout } = useAuth();
  const {
    organizations,
    currentOrganization,
    selectOrganization
  } = useOrganization();
  const { canManageOrganization, userRole, userStaffType } = usePermissions();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };



  // Handle organization selection
  const handleSelectOrganization = (org: Organization) => {
    selectOrganization(org);
    navigate(`/organizations/${org.id}`);
  };



  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0" onInteractOutside={closeMobileMenu} hideCloseButton={true}>
                <div className="flex h-full flex-col">
                  <div className="flex items-center justify-between border-b p-4">
                    <span className="text-lg font-bold">ScanServe</span>
                    <Button variant="ghost" size="icon" onClick={closeMobileMenu}>
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </div>
                  <MobileNavigation onLinkClick={closeMobileMenu} />
                </div>
              </SheetContent>
            </Sheet>
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">ScanServe</span>
            </Link>
          </div>          <div className="flex items-center gap-4">
            {/* Organization Management Dropdown - Only for owners and administrators */}
            {organizations.length > 0 && canManageOrganization && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="hidden sm:hidden md:flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span className="max-w-[100px] md:max-w-[150px] truncate">
                      {currentOrganization ? currentOrganization.name : 'Select Organization'}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Your Organizations</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {organizations.map((org) => (
                    <DropdownMenuItem
                      key={org.id}
                      onClick={() => handleSelectOrganization(org)}
                      className="flex items-center gap-2"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Avatar className="h-6 w-6">
                          {org.logoUrl ? (
                            <AvatarImage src={org.logoUrl} alt={org.name} />
                          ) : (
                            <AvatarFallback className="text-xs">
                              {getInitials(org.name)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="truncate">{org.name}</span>
                      </div>
                      {currentOrganization?.id === org.id && (
                        <Badge variant="outline" className="ml-auto text-xs">Current</Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/organizations/create')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Organization
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/organizations')}>
                    <Building2 className="mr-2 h-4 w-4" />
                    Manage Organizations
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Organization Indicator - Read-only for Staff/Managers */}
            {currentOrganization && !canManageOrganization && (
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-md border">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="max-w-[100px] md:max-w-[150px] truncate text-sm text-muted-foreground">
                  {currentOrganization.name}
                </span>
              </div>
            )}

            {/* Notification Bell */}
            {user && <NotificationBell />}

            {/* User Menu */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        {user.profileImageUrl ? (
                          <AvatarImage src={user.profileImageUrl} alt={user.name} />
                        ) : (
                          <AvatarFallback>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span className="hidden md:inline-block">{user.name}</span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {/* Hide Dashboard, Organizations, and Subscriptions for Kitchen Staff */}
                  {!(userRole === MemberRole.STAFF && userStaffType === StaffType.KITCHEN) && (
                    <>
                      <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/organizations')}>
                        <Building2 className="mr-2 h-4 w-4" />
                        Organizations
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/subscriptions')}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Subscriptions
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1">
        {/* Dynamic Sidebar */}
        <DynamicSidebar />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Settings,
  LogOut,
  ChevronDown,
  X,
  Building2,
  Plus,
  Users,
  Utensils,
  QrCode,
  BarChart,
  MapPin,
  Hotel,
  Coffee,
  Truck,
  Wine,
  Store,
} from 'lucide-react';
import { OrganizationType } from '@/types/organization';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const {
    organizations,
    currentOrganization,
    selectOrganization,
    fetchOrganizations
  } = useOrganization();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // We don't need to fetch organizations here anymore
  // The OrganizationProvider will handle that

  // Check if the screen is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
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

  // Function to get the appropriate icon based on organization type
  const getOrganizationIcon = (type: OrganizationType) => {
    switch (type) {
      case OrganizationType.RESTAURANT:
        return <Utensils className="h-4 w-4" />;
      case OrganizationType.HOTEL:
        return <Hotel className="h-4 w-4" />;
      case OrganizationType.CAFE:
        return <Coffee className="h-4 w-4" />;
      case OrganizationType.FOOD_TRUCK:
        return <Truck className="h-4 w-4" />;
      case OrganizationType.BAR:
        return <Wine className="h-4 w-4" />;
      case OrganizationType.OTHER:
      default:
        return <Store className="h-4 w-4" />;
    }
  };

  // Handle organization selection
  const handleSelectOrganization = (org: any) => {
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
                  <div className="flex-1 overflow-auto py-4">
                    <nav className="grid items-start px-4 text-sm font-medium gap-1">
                      <a
                        href="/dashboard"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                        onClick={closeMobileMenu}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </a>
                      <a
                        href="/organizations"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                        onClick={closeMobileMenu}
                      >
                        <Building2 className="h-4 w-4" />
                        Organizations
                      </a>
                      <a
                        href="/profile"
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                        onClick={closeMobileMenu}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </a>

                      {/* Organization section in mobile menu */}
                      {organizations.length > 0 && (
                        <>
                          <Separator className="my-2" />
                          <div className="px-3 py-2">
                            <h4 className="mb-1 text-xs font-semibold">Your Organizations</h4>
                            <div className="space-y-1">
                              {organizations.slice(0, 5).map((org) => (
                                <a
                                  key={org.id}
                                  href={`/organizations/${org.id}`}
                                  className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-primary"
                                  onClick={closeMobileMenu}
                                >
                                  {getOrganizationIcon(org.type)}
                                  <span className="truncate">{org.name}</span>
                                </a>
                              ))}
                              {organizations.length > 5 && (
                                <a
                                  href="/organizations"
                                  className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-primary"
                                  onClick={closeMobileMenu}
                                >
                                  <Plus className="h-3 w-3" />
                                  <span>View all ({organizations.length})</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </nav>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <a href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">ScanServe</span>
            </a>
          </div>
          <div className="flex items-center gap-4">
            {/* Organization Selector */}
            {organizations.length > 0 && (
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
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/organizations')}>
                    <Building2 className="mr-2 h-4 w-4" />
                    Organizations
                  </DropdownMenuItem>
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
        {/* Sidebar */}
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-auto py-4">
              <nav className="grid items-start px-4 text-sm font-medium gap-1">
                <a
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </a>
                <a
                  href="/organizations"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Building2 className="h-4 w-4" />
                  Organizations
                </a>
                <a
                  href="/profile"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <User className="h-4 w-4" />
                  Profile
                </a>

                {/* Organization section */}
                {currentOrganization && (
                  <>
                    <Separator className="my-2" />
                    <div className="px-3 py-2">
                      <h4 className="mb-2 text-xs font-semibold">
                        {currentOrganization.name}
                      </h4>
                      <div className="space-y-1">
                        <a
                          href={`/organizations/${currentOrganization.id}`}
                          className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-primary"
                        >
                          <Building2 className="h-3 w-3" />
                          <span>Overview</span>
                        </a>
                        <a
                          href={`/organizations/${currentOrganization.id}/members`}
                          className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-primary"
                        >
                          <Users className="h-3 w-3" />
                          <span>Members</span>
                        </a>
                        <a
                          href={`/organizations/${currentOrganization.id}/settings`}
                          className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-primary"
                        >
                          <Settings className="h-3 w-3" />
                          <span>Settings</span>
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </nav>
            </div>
          </div>
        </aside>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

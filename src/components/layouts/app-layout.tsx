import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  ClipboardList,
  Bell,
} from 'lucide-react';
import { OrganizationType } from '@/types/organization';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const {
    organizations,
    currentOrganization,
    selectOrganization,
    fetchOrganizations
  } = useOrganization();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  // Check if a link is active
  const isLinkActive = (path: string) => {
    return location.pathname.startsWith(path);
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
                      <Link
                        to="/dashboard"
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isLinkActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`}
                        onClick={closeMobileMenu}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        to="/organizations"
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isLinkActive('/organizations') ? 'text-primary' : 'text-muted-foreground'}`}
                        onClick={closeMobileMenu}
                      >
                        <Building2 className="h-4 w-4" />
                        Organizations
                      </Link>
                      {currentOrganization && (
                        <>
                          <Link
                            to={`/organizations/${currentOrganization.id}/venues`}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isLinkActive(`/organizations/${currentOrganization.id}/venues`) ? 'text-primary' : 'text-muted-foreground'}`}
                            onClick={closeMobileMenu}
                          >
                            <MapPin className="h-4 w-4" />
                            Venues
                          </Link>
                          <Link
                            to={`/organizations/${currentOrganization.id}/menus`}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isLinkActive(`/organizations/${currentOrganization.id}/menus`) ? 'text-primary' : 'text-muted-foreground'}`}
                            onClick={closeMobileMenu}
                          >
                            <Utensils className="h-4 w-4" />
                            Menus
                          </Link>
                          <Link
                            to={`/organizations/${currentOrganization.id}/orders`}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isLinkActive(`/organizations/${currentOrganization.id}/orders`) ? 'text-primary' : 'text-muted-foreground'}`}
                            onClick={closeMobileMenu}
                          >
                            <ClipboardList className="h-4 w-4" />
                            Orders
                          </Link>
                          <Link
                            to={`/organizations/${currentOrganization.id}?activeTab=qrcodes`}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${location.pathname === `/organizations/${currentOrganization.id}` && location.search.includes('activeTab=qrcodes') ? 'text-primary' : 'text-muted-foreground'}`}
                            onClick={closeMobileMenu}
                          >
                            <QrCode className="h-4 w-4" />
                            QR Codes
                          </Link>
                        </>
                      )}
                      <Link
                        to="/profile"
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isLinkActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}
                        onClick={closeMobileMenu}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </nav>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">ScanServe</span>
            </Link>
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
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isLinkActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  to="/organizations"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isLinkActive('/organizations') && !location.pathname.includes('/organizations/') ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <Building2 className="h-4 w-4" />
                  Organizations
                </Link>
                <Link
                  to="/profile"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${isLinkActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>

                {/* Organization section */}
                {currentOrganization && (
                  <>
                    <Separator className="my-2" />
                    <div className="px-3 py-2">
                      <h4 className="mb-2 text-xs font-semibold">
                        {currentOrganization.name}
                      </h4>
                      <div className="space-y-1">
                        <Link
                          to={`/organizations/${currentOrganization.id}`}
                          className={`flex items-center gap-2 rounded-md px-2 py-1 text-xs hover:text-primary ${location.pathname === `/organizations/${currentOrganization.id}` && !location.search.includes('activeTab=') ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                          <Building2 className="h-3 w-3" />
                          <span>Overview</span>
                        </Link>
                        <Link
                          to={`/organizations/${currentOrganization.id}/venues`}
                          className={`flex items-center gap-2 rounded-md px-2 py-1 text-xs hover:text-primary ${isLinkActive(`/organizations/${currentOrganization.id}/venues`) ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                          <MapPin className="h-3 w-3" />
                          <span>Venues</span>
                        </Link>
                        <Link
                          to={`/organizations/${currentOrganization.id}/menus`}
                          className={`flex items-center gap-2 rounded-md px-2 py-1 text-xs hover:text-primary ${isLinkActive(`/organizations/${currentOrganization.id}/menus`) ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                          <Utensils className="h-3 w-3" />
                          <span>Menus</span>
                        </Link>
                        <Link
                          to={`/organizations/${currentOrganization.id}/orders`}
                          className={`flex items-center gap-2 rounded-md px-2 py-1 text-xs hover:text-primary ${isLinkActive(`/organizations/${currentOrganization.id}/orders`) ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                          <ClipboardList className="h-3 w-3" />
                          <span>Orders</span>
                        </Link>
                        <Link
                          to={`/organizations/${currentOrganization.id}?activeTab=qrcodes`}
                          className={`flex items-center gap-2 rounded-md px-2 py-1 text-xs hover:text-primary ${location.pathname === `/organizations/${currentOrganization.id}` && location.search.includes('activeTab=qrcodes') ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                          <QrCode className="h-3 w-3" />
                          <span>QR Codes</span>
                        </Link>
                        <Link
                          to={`/organizations/${currentOrganization.id}/members`}
                          className={`flex items-center gap-2 rounded-md px-2 py-1 text-xs hover:text-primary ${isLinkActive(`/organizations/${currentOrganization.id}/members`) ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                          <Users className="h-3 w-3" />
                          <span>Members</span>
                        </Link>
                        <Link
                          to={`/organizations/${currentOrganization.id}/settings`}
                          className={`flex items-center gap-2 rounded-md px-2 py-1 text-xs hover:text-primary ${isLinkActive(`/organizations/${currentOrganization.id}/settings`) ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                          <Settings className="h-3 w-3" />
                          <span>Settings</span>
                        </Link>
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

export default AppLayout;

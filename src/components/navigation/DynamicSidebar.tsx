import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigation } from '@/contexts/navigation-context';
import { usePermissions } from '@/contexts/permission-context';
import { useOrganization } from '@/contexts/organization-context';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { MemberRole, StaffType } from '@/types/organization';
import {
  Building2,
  MapPin,
  Menu,
  ClipboardList,
  QrCode,
  Users,
  Settings,
} from 'lucide-react';

interface DynamicSidebarProps {
  className?: string;
}

const DynamicSidebar: React.FC<DynamicSidebarProps> = ({ className }) => {
  const location = useLocation();
  const { filteredNavigationItems, shouldShowNavigation } = useNavigation();
  const { userRole, userStaffType, accessLevelDescription } = usePermissions();
  const { currentOrganization } = useOrganization();

  // Don't render sidebar if navigation shouldn't be shown
  if (!shouldShowNavigation) {
    return null;
  }

  // Get role badge info
  const getRoleBadgeInfo = () => {
    if (userRole === MemberRole.STAFF && userStaffType) {
      switch (userStaffType) {
        case StaffType.KITCHEN:
          return { label: 'Kitchen Staff', variant: 'default' as const, color: 'bg-orange-100 text-orange-800' };
        case StaffType.FRONT_OF_HOUSE:
          return { label: 'Front of House', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' };
        default:
          return { label: 'Staff', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' };
      }
    }

    switch (userRole) {
      case MemberRole.OWNER:
        return { label: 'Owner', variant: 'default' as const, color: 'bg-green-100 text-green-800' };
      case MemberRole.ADMINISTRATOR:
        return { label: 'Administrator', variant: 'default' as const, color: 'bg-red-100 text-red-800' };
      case MemberRole.MANAGER:
        return { label: 'Manager', variant: 'default' as const, color: 'bg-yellow-100 text-yellow-800' };
      default:
        return { label: 'User', variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const roleBadgeInfo = getRoleBadgeInfo();

  return (
    <aside className={cn("hidden w-64 border-r bg-muted/40 md:block", className)}>
      <div className="flex h-full flex-col">
        {/* Role Badge Section */}
        {userRole && (
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <Badge className={cn("text-xs", roleBadgeInfo.color)}>
                {roleBadgeInfo.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {accessLevelDescription}
            </p>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-4 text-sm font-medium gap-1">
            {filteredNavigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.isActive || location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Organization-specific navigation */}
          {currentOrganization && userRole && [MemberRole.OWNER, MemberRole.ADMINISTRATOR, MemberRole.MANAGER].includes(userRole) && (
            <>
              <Separator className="mx-4 my-4" />
              <div className="px-4">
                <h4 className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
                  {currentOrganization.name}
                </h4>
                <nav className="grid items-start text-sm font-medium gap-1">
                  <OrganizationNavigationItems organizationId={currentOrganization.id} />
                </nav>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

// Organization-specific navigation items component
interface OrganizationNavigationItemsProps {
  organizationId: string;
}

const OrganizationNavigationItems: React.FC<OrganizationNavigationItemsProps> = ({ organizationId }) => {
  const location = useLocation();
  const { hasPermission } = usePermissions();
  
  // Organization navigation items with permissions
  const orgNavItems = [
    {
      path: `/organizations/${organizationId}`,
      label: 'Overview',
      icon: Building2,
      permissions: ['VIEW_ORGANIZATIONS'],
      exact: true,
    },
    {
      path: `/organizations/${organizationId}/venues`,
      label: 'Venues',
      icon: MapPin,
      permissions: ['VIEW_VENUES'],
    },
    {
      path: `/organizations/${organizationId}/menus`,
      label: 'Menus',
      icon: Menu,
      permissions: ['VIEW_MENUS'],
    },
    {
      path: `/organizations/${organizationId}/orders`,
      label: 'Orders',
      icon: ClipboardList,
      permissions: ['VIEW_ORDERS'],
    },
    {
      path: `/organizations/${organizationId}/qrcodes`,
      label: 'QR Codes',
      icon: QrCode,
      permissions: ['VIEW_QR_CODES'],
    },
    {
      path: `/organizations/${organizationId}/members`,
      label: 'Members',
      icon: Users,
      permissions: ['VIEW_MEMBERS'],
    },
    {
      path: `/organizations/${organizationId}/settings`,
      label: 'Settings',
      icon: Settings,
      permissions: ['MANAGE_ORGANIZATION_SETTINGS'],
    },
  ];



  const isLinkActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path && !location.search.includes('activeTab=');
    }
    return location.pathname.startsWith(path) || 
           (path.includes('?activeTab=') && location.pathname + location.search === path);
  };

  return (
    <>
      {orgNavItems.map((item) => {
        // Check permissions (simplified for now)
        // In a real implementation, you'd use the actual permission checking
        const Icon = item.icon;
        const isActive = isLinkActive(item.path, item.exact);

        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1 text-xs hover:text-primary transition-colors",
              isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
            )}
          >
            <Icon className="h-3 w-3" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
};

export default DynamicSidebar;

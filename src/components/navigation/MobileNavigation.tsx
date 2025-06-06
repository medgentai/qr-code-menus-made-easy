import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigation } from '@/contexts/navigation-context';
import { usePermissions } from '@/contexts/permission-context';
import { useOrganization } from '@/contexts/organization-context';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MemberRole } from '@/types/organization';

interface MobileNavigationProps {
  onLinkClick?: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ onLinkClick }) => {
  const { filteredNavigationItems } = useNavigation();
  const { userRole, userStaffType, accessLevelDescription } = usePermissions();
  const { currentOrganization } = useOrganization();

  // Get role badge info
  const getRoleBadgeInfo = () => {
    if (userRole === MemberRole.STAFF && userStaffType) {
      switch (userStaffType) {
        case 'KITCHEN':
          return { label: 'Kitchen Staff', color: 'bg-orange-100 text-orange-800' };
        case 'FRONT_OF_HOUSE':
          return { label: 'Front of House', color: 'bg-blue-100 text-blue-800' };
        case 'GENERAL':
          return { label: 'General Staff', color: 'bg-purple-100 text-purple-800' };
        default:
          return { label: 'Staff', color: 'bg-gray-100 text-gray-800' };
      }
    }

    switch (userRole) {
      case MemberRole.OWNER:
        return { label: 'Owner', color: 'bg-green-100 text-green-800' };
      case MemberRole.ADMINISTRATOR:
        return { label: 'Administrator', color: 'bg-red-100 text-red-800' };
      case MemberRole.MANAGER:
        return { label: 'Manager', color: 'bg-yellow-100 text-yellow-800' };
      default:
        return { label: 'User', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const roleBadgeInfo = getRoleBadgeInfo();

  return (
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
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  item.isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
                )}
                onClick={onLinkClick}
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

        {/* Organization-specific navigation for mobile */}
        {currentOrganization && userRole && [MemberRole.OWNER, MemberRole.ADMINISTRATOR, MemberRole.MANAGER].includes(userRole) && (
          <div className="px-4 mt-4">
            <div className="border-t pt-4">
              <h4 className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
                {currentOrganization.name}
              </h4>
              <nav className="grid items-start text-sm font-medium gap-1">
                <MobileOrganizationNavigationItems 
                  organizationId={currentOrganization.id} 
                  onLinkClick={onLinkClick}
                />
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mobile organization-specific navigation items component
interface MobileOrganizationNavigationItemsProps {
  organizationId: string;
  onLinkClick?: () => void;
}

const MobileOrganizationNavigationItems: React.FC<MobileOrganizationNavigationItemsProps> = ({ 
  organizationId, 
  onLinkClick 
}) => {
  // Organization navigation items for mobile
  const orgNavItems = [
    {
      path: `/organizations/${organizationId}`,
      label: 'Overview',
      icon: '🏢',
    },
    {
      path: `/organizations/${organizationId}/venues`,
      label: 'Venues',
      icon: '📍',
    },
    {
      path: `/organizations/${organizationId}/menus`,
      label: 'Menus',
      icon: '🍽️',
    },
    {
      path: `/organizations/${organizationId}/orders`,
      label: 'Orders',
      icon: '📋',
    },
    {
      path: `/organizations/${organizationId}/qrcodes`,
      label: 'QR Codes',
      icon: '📱',
    },
    {
      path: `/organizations/${organizationId}/members`,
      label: 'Members',
      icon: '👥',
    },
    {
      path: `/organizations/${organizationId}/settings`,
      label: 'Settings',
      icon: '⚙️',
    },
  ];

  return (
    <>
      {orgNavItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary text-muted-foreground"
          onClick={onLinkClick}
        >
          <span className="text-base">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </>
  );
};

export default MobileNavigation;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMenu } from '@/contexts/menu-context';
import { useOrganization } from '@/contexts/organization-context';
import { MenuItemForm } from '@/components/menus/menu-item-form';
import { Separator } from '@/components/ui/separator';
import { MenuItem } from '@/services/menu-service';
import { Skeleton } from '@/components/ui/skeleton';

const MenuItemEdit: React.FC = () => {
  const { id: organizationId, menuId, categoryId, itemId } = useParams<{ id: string; menuId: string; categoryId: string; itemId: string }>();
  const navigate = useNavigate();
  const { fetchMenuById, currentMenu, selectMenu } = useMenu();
  const { currentOrganization } = useOrganization();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      if (menuId) {
        setIsLoading(true);
        const menu = await fetchMenuById(menuId);
        if (menu) {
          selectMenu(menu);
          if (categoryId && itemId && menu.categories) {
            const category = menu.categories.find(cat => cat.id === categoryId);
            if (category) {
              setCategoryName(category.name);
              const item = category.items?.find(item => item.id === itemId);
              if (item) {
                setMenuItem(item);
              } else {
                // Item not found, redirect back to menu details
                navigate(`/organizations/${organizationId}/menus/${menuId}`);
              }
            } else {
              // Category not found, redirect back to menu details
              navigate(`/organizations/${organizationId}/menus/${menuId}`);
            }
          }
        }
        setIsLoading(false);
      }
    };
    loadData();
  }, [menuId, categoryId, itemId, fetchMenuById, selectMenu, organizationId, navigate]);

  const handleBackToMenu = () => {
    navigate(`/organizations/${organizationId}/menus/${menuId}`);
  };

  const handleSuccess = () => {
    navigate(`/organizations/${organizationId}/menus/${menuId}`);
  };

  if (isLoading) {
    return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" disabled>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Skeleton className="h-5 w-64" />
            </div>
          </div>
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          <Skeleton className="h-px w-full" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleBackToMenu}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm breadcrumbs">
              <ul className="flex items-center gap-1 text-muted-foreground">
                <li><Link to="/organizations">Organizations</Link></li>
                <li>•</li>
                <li><Link to={`/organizations/${organizationId}`}>{currentOrganization?.name}</Link></li>
                <li>•</li>
                <li><Link to={`/organizations/${organizationId}/menus`}>Menus</Link></li>
                <li>•</li>
                <li><Link to={`/organizations/${organizationId}/menus/${menuId}`}>{currentMenu?.name}</Link></li>
                <li>•</li>
                <li className="text-foreground font-medium">Edit Menu Item</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Menu Item</h1>
          <p className="text-muted-foreground mt-1">
            Update the details for "{menuItem?.name}" in the "{categoryName}" category.
          </p>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Menu Item Details</CardTitle>
            <CardDescription>
              Edit the details for your menu item.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categoryId && menuItem && (
              <MenuItemForm
                categoryId={categoryId}
                menuItem={menuItem}
                onSuccess={handleSuccess}
              />
            )}
          </CardContent>
        </Card>
      </div>
  );
};

export default MenuItemEdit;

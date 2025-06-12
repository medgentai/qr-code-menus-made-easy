import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMenu } from '@/contexts/menu-context';
import { useOrganization } from '@/contexts/organization-context';
import { CategoryForm } from '@/components/menus/category-form';
import { Separator } from '@/components/ui/separator';

const CategoryCreate: React.FC = () => {
  const { id: organizationId, menuId } = useParams<{ id: string; menuId: string }>();
  const navigate = useNavigate();
  const { fetchMenuById, currentMenu, selectMenu } = useMenu();
  const { currentOrganization } = useOrganization();

  React.useEffect(() => {
    if (menuId) {
      const loadMenu = async () => {
        const menu = await fetchMenuById(menuId);
        if (menu) {
          selectMenu(menu);
        }
      };
      loadMenu();
    }
  }, [menuId, fetchMenuById, selectMenu]);

  const handleBackToMenu = () => {
    navigate(`/organizations/${organizationId}/menus/${menuId}`);
  };

  const handleSuccess = () => {
    navigate(`/organizations/${organizationId}/menus/${menuId}`);
  };

  return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Button variant="ghost" size="icon" onClick={handleBackToMenu}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm breadcrumbs min-w-0 flex-1">
              <ul className="flex items-center gap-1 text-muted-foreground overflow-hidden">
                <li className="hidden sm:block"><Link to="/organizations">Organizations</Link></li>
                <li className="hidden sm:block">•</li>
                <li className="hidden sm:block"><Link to={`/organizations/${organizationId}`} className="truncate">{currentOrganization?.name}</Link></li>
                <li className="hidden sm:block">•</li>
                <li className="hidden sm:block"><Link to={`/organizations/${organizationId}/menus`}>Menus</Link></li>
                <li className="hidden sm:block">•</li>
                <li><Link to={`/organizations/${organizationId}/menus/${menuId}`} className="truncate">{currentMenu?.name}</Link></li>
                <li>•</li>
                <li className="text-foreground font-medium">Add Category</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Add Category</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Create a new category for your menu.
          </p>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
            <CardDescription>
              Enter the details for your new category.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {menuId && <CategoryForm menuId={menuId} onSuccess={handleSuccess} />}
          </CardContent>
        </Card>
      </div>
  );
};

export default CategoryCreate;

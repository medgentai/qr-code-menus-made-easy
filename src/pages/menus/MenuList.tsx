import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Clock, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useOrganization } from '@/contexts/organization-context';
import { useMenu } from '@/contexts/menu-context';
import { Menu } from '@/services/menu-service';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const MenuList: React.FC = () => {
  const { id: organizationId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const { menus, isLoading, fetchMenusForOrganization, deleteMenu } = useMenu();
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // No need to fetch menus here - the MenuContext will handle this automatically
  // when the currentOrganization changes

  const handleCreateMenu = () => {
    navigate(`/organizations/${organizationId}/menus/create`);
  };

  const handleEditMenu = (menuId: string) => {
    navigate(`/organizations/${organizationId}/menus/${menuId}/edit`);
  };

  const handleViewMenu = (menuId: string) => {
    navigate(`/organizations/${organizationId}/menus/${menuId}`);
  };

  const handleDeleteMenu = async () => {
    if (menuToDelete) {
      await deleteMenu(menuToDelete.id);
      setMenuToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const confirmDelete = (menu: Menu) => {
    setMenuToDelete(menu);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Menus</h1>
            <p className="text-muted-foreground">
              Manage your digital menus for {currentOrganization?.name || 'your organization'}
            </p>
          </div>
          <Button onClick={handleCreateMenu}>
            <Plus className="mr-2 h-4 w-4" /> Create Menu
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : menus.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No menus yet</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                Create your first menu to start managing your digital offerings.
              </p>
              <Button onClick={handleCreateMenu}>Create Menu</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menus.map((menu) => (
              <Card key={menu.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{menu.name}</CardTitle>
                    <Badge variant={menu.isActive ? "default" : "secondary"}>
                      {menu.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardDescription>
                    {menu.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2 text-sm">
                    {(menu.categories?.length || 0) > 0 ? (
                      <p>{menu.categories?.length} categories, {menu.categories?.reduce((acc, cat) => acc + (cat.items?.length || 0), 0)} items</p>
                    ) : (
                      <p>No categories or items yet</p>
                    )}
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>
                        Updated {format(new Date(menu.updatedAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewMenu(menu.id)}>
                    <Eye className="mr-2 h-4 w-4" /> View
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditMenu(menu.id)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => confirmDelete(menu)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the menu "{menuToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMenu} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MenuList;

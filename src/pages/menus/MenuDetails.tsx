import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit, ArrowLeft, Plus, Clock, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import DashboardLayout from '@/components/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMenu } from '@/contexts/menu-context';
import { useOrganization } from '@/contexts/organization-context';
import { Category, MenuItem } from '@/services/menu-service';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';

const MenuDetails: React.FC = () => {
  const { id: organizationId, menuId } = useParams<{ id: string; menuId: string }>();
  const navigate = useNavigate();
  const { fetchMenuById, isLoading, currentMenu, selectMenu, deleteCategory, deleteMenuItem } = useMenu();
  const { currentOrganization } = useOrganization();

  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [isDeleteMenuItemDialogOpen, setIsDeleteMenuItemDialogOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

  useEffect(() => {
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

  const handleEditMenu = () => {
    navigate(`/organizations/${organizationId}/menus/${menuId}/edit`);
  };

  const handleBackToMenus = () => {
    navigate(`/organizations/${organizationId}/menus`);
  };

  // Category handlers
  const handleAddCategory = () => {
    navigate(`/organizations/${organizationId}/menus/${menuId}/categories/create`);
  };

  const handleEditCategory = (category: Category) => {
    navigate(`/organizations/${organizationId}/menus/${menuId}/categories/${category.id}/edit`);
  };

  const handleDeleteCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteCategoryDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (selectedCategory) {
      await deleteCategory(selectedCategory.id);
      setIsDeleteCategoryDialogOpen(false);
      setSelectedCategory(null);
    }
  };

  // Menu item handlers
  const handleAddMenuItem = (category: Category) => {
    navigate(`/organizations/${organizationId}/menus/${menuId}/categories/${category.id}/items/create`);
  };

  const handleEditMenuItem = (menuItem: MenuItem) => {
    navigate(`/organizations/${organizationId}/menus/${menuId}/categories/${menuItem.categoryId}/items/${menuItem.id}/edit`);
  };

  const handleDeleteMenuItem = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setIsDeleteMenuItemDialogOpen(true);
  };

  const confirmDeleteMenuItem = async () => {
    if (selectedMenuItem) {
      await deleteMenuItem(selectedMenuItem.id);
      setIsDeleteMenuItemDialogOpen(false);
      setSelectedMenuItem(null);
    }
  };

  if (isLoading || !currentMenu) {
    return (
      <DashboardLayout>
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

          <Skeleton className="h-px w-full" /> {/* Separator skeleton */}

          <Skeleton className="h-10 w-full max-w-md" />
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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleBackToMenus}>
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
                <li className="text-foreground font-medium">{currentMenu.name}</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/organizations/${organizationId}/menus/${menuId}/preview`)}
            >
              <Eye className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Preview</span>
            </Button>
            <Button size="sm" onClick={handleEditMenu}>
              <Edit className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Edit Menu</span>
              <span className="inline sm:hidden">Edit</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{currentMenu.name}</h1>
              <Badge variant={currentMenu.isActive ? "default" : "secondary"}>
                {currentMenu.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-muted-foreground">
              <p>{currentMenu.description || 'No description provided'}</p>
              <div className="flex items-center text-xs">
                <Clock className="h-3 w-3 mr-1" />
                <span>Created {format(new Date(currentMenu.createdAt), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories & Items</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Menu Overview</CardTitle>
                <CardDescription>
                  Summary of your menu structure and items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Categories</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{currentMenu.categories?.length || 0}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Menu Items</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">
                          {currentMenu.categories?.reduce((acc, cat) => acc + (cat.items?.length || 0), 0) || 0}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge variant={currentMenu.isActive ? "default" : "secondary"} className="text-xs">
                          {currentMenu.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>

                  {(currentMenu.categories?.length || 0) > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Categories</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentMenu.categories?.map((category) => (
                          <Card key={category.id}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">{category.name}</CardTitle>
                              <CardDescription>
                                {category.items?.length || 0} items
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="text-sm">
                              {category.description || 'No description provided'}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="py-8 flex flex-col items-center justify-center text-center">
                        <div className="rounded-full bg-primary/10 p-3 mb-4">
                          <Plus className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">No categories yet</h3>
                        <p className="text-muted-foreground mb-4 max-w-md">
                          Add categories to organize your menu items.
                        </p>
                        <Button onClick={handleAddCategory}>Add Category</Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => setActiveTab('categories')}>
                  Manage Categories & Items
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Categories & Menu Items</h2>
              <Button onClick={handleAddCategory}>
                <Plus className="mr-2 h-4 w-4" /> Add Category
              </Button>
            </div>

            {(currentMenu.categories?.length || 0) === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 flex flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">No categories yet</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Add categories to organize your menu items.
                  </p>
                  <Button onClick={handleAddCategory}>Add Category</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {currentMenu.categories?.map((category) => (
                  <Card key={category.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <CardDescription>
                            {category.description || 'No description provided'}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Category
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteCategory(category)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Category
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {(category.items?.length || 0) === 0 ? (
                          <div className="border rounded-md p-4 text-center">
                            <p className="text-muted-foreground mb-2">No menu items in this category</p>
                            <Button variant="outline" size="sm" onClick={() => handleAddMenuItem(category)}>
                              <Plus className="mr-2 h-4 w-4" /> Add Menu Item
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {category.items?.map((item) => (
                              <div key={item.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-accent">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{item.name}</h4>
                                    {!item.isAvailable && (
                                      <Badge variant="outline" className="text-xs">Out of Stock</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {item.description || 'No description'}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">${parseFloat(item.price).toFixed(2)}</p>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleEditMenuItem(item)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit Item
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleDeleteMenuItem(item)} className="text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Item
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleAddMenuItem(category)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Menu Item
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Dialogs */}

      <AlertDialog open={isDeleteCategoryDialogOpen} onOpenChange={setIsDeleteCategoryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category "{selectedCategory?.name}" and all its menu items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteMenuItemDialogOpen} onOpenChange={setIsDeleteMenuItemDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the menu item "{selectedMenuItem?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMenuItem} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default MenuDetails;

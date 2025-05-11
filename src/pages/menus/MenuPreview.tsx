import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Info, Leaf, Wheat, Flame, X } from 'lucide-react';
import { useMenu } from '@/contexts/menu-context';
import { useOrganization } from '@/contexts/organization-context';
import { Menu, Category, MenuItem } from '@/services/menu-service';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SpicyLevelLabels } from '@/types/menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';

const MenuPreview: React.FC = () => {
  const { id: organizationId, menuId } = useParams<{ id: string; menuId: string }>();
  const navigate = useNavigate();
  const { fetchMenuById, isLoading } = useMenu();
  const { currentOrganization } = useOrganization();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isItemDetailsOpen, setIsItemDetailsOpen] = useState(false);

  useEffect(() => {
    const loadMenu = async () => {
      if (menuId) {
        const fetchedMenu = await fetchMenuById(menuId);
        if (fetchedMenu) {
          setMenu(fetchedMenu);
        }
      }
    };
    loadMenu();
  }, [menuId, fetchMenuById]);

  const handleBackToMenu = () => {
    navigate(`/organizations/${organizationId}/menus/${menuId}`);
  };

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setIsItemDetailsOpen(true);
  };

  const renderDietaryIcons = (item: MenuItem) => {
    return (
      <div className="flex gap-1">
        {item.isVegetarian && (
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            <Leaf className="h-3 w-3 mr-1" /> Veg
          </Badge>
        )}
        {item.isVegan && (
          <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
            <Leaf className="h-3 w-3 mr-1" /> Vegan
          </Badge>
        )}
        {item.isGlutenFree && (
          <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
            <Wheat className="h-3 w-3 mr-1" /> GF
          </Badge>
        )}
        {item.spicyLevel && item.spicyLevel > 0 && (
          <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
            <Flame className="h-3 w-3 mr-1" /> {SpicyLevelLabels[item.spicyLevel]}
          </Badge>
        )}
      </div>
    );
  };

  if (isLoading || !menu) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="sm" onClick={handleBackToMenu} className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Editor
            </Button>
          </div>
          <Skeleton className="h-10 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-6" />
          <Skeleton className="h-8 w-1/3 mb-4" />
          <div className="space-y-6">
            <div>
              <Skeleton className="h-6 w-1/4 mb-4" />
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <Skeleton className="h-5 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <Skeleton className="h-5 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={handleBackToMenu} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Editor
          </Button>
          <Badge variant="outline" className="text-sm">Preview Mode</Badge>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h1 className="text-2xl font-bold text-center mb-1">{menu.name}</h1>
          {menu.description && (
            <p className="text-gray-600 text-center mb-4">{menu.description}</p>
          )}
          <div className="text-center text-sm text-gray-500">
            {currentOrganization?.name}
          </div>
        </div>

        {menu.categories?.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No categories or items in this menu yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {menu.categories?.sort((a, b) => a.displayOrder - b.displayOrder).map((category) => (
              <div key={category.id} className="mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                )}
                <div className="space-y-4">
                  {category.items?.sort((a, b) => a.displayOrder - b.displayOrder).map((item) => (
                    <div 
                      key={item.id} 
                      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-100 transition-all hover:shadow-md cursor-pointer ${!item.isAvailable ? 'opacity-60' : ''}`}
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          {item.description && (
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{item.description}</p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2">
                            {renderDietaryIcons(item)}
                            {!item.isAvailable && (
                              <Badge variant="secondary">Out of Stock</Badge>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col items-end">
                          <div className="font-semibold">
                            ${parseFloat(item.price).toFixed(2)}
                          </div>
                          {item.discountPrice && (
                            <div className="text-sm">
                              <span className="line-through text-gray-400 mr-1">${parseFloat(item.price).toFixed(2)}</span>
                              <span className="text-green-600">${parseFloat(item.discountPrice).toFixed(2)}</span>
                            </div>
                          )}
                          {item.imageUrl && (
                            <div className="w-16 h-16 rounded-md overflow-hidden mt-2">
                              <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Item Details Sheet */}
      <Sheet open={isItemDetailsOpen} onOpenChange={setIsItemDetailsOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{selectedItem?.name}</SheetTitle>
            <SheetDescription>
              {selectedItem?.description}
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            {selectedItem?.imageUrl && (
              <div className="w-full h-48 rounded-md overflow-hidden mb-4">
                <img 
                  src={selectedItem.imageUrl} 
                  alt={selectedItem.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex justify-between items-center mb-4">
              <div className="text-xl font-semibold">
                ${parseFloat(selectedItem?.price || '0').toFixed(2)}
              </div>
              {selectedItem?.discountPrice && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  ${parseFloat(selectedItem.discountPrice).toFixed(2)} Special
                </Badge>
              )}
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              {selectedItem && (
                <>
                  <div className="flex flex-wrap gap-2">
                    {renderDietaryIcons(selectedItem)}
                  </div>
                  
                  {selectedItem.allergens && (
                    <div className="text-sm">
                      <span className="font-medium">Allergens:</span> {selectedItem.allergens}
                    </div>
                  )}
                  
                  {selectedItem.calories && (
                    <div className="text-sm">
                      <span className="font-medium">Calories:</span> {selectedItem.calories}
                    </div>
                  )}
                  
                  {selectedItem.preparationTime && (
                    <div className="text-sm flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span className="font-medium">Prep time:</span> {selectedItem.preparationTime} min
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="mt-4">
            <SheetClose asChild>
              <Button className="w-full">Close</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MenuPreview;

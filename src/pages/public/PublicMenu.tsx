import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Clock, Info, Leaf, Wheat, Flame, Search, X } from 'lucide-react';
import { usePublicMenu } from '@/contexts/public-menu-context';
import { Category, MenuItem } from '@/services/menu-service';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SpicyLevelLabels } from '@/types/menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

const PublicMenu: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('table');
  const venueId = searchParams.get('venue');
  
  const { menu, isLoading, error, activeCategory, setActiveCategory, loadMenuByOrganizationSlug } = usePublicMenu();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (slug) {
      loadMenuByOrganizationSlug(slug, tableId || undefined, venueId || undefined);
    }
  }, [slug, tableId, venueId, loadMenuByOrganizationSlug]);

  useEffect(() => {
    if (menu && menu.categories) {
      const allItems: MenuItem[] = [];
      menu.categories.forEach(category => {
        if (category.items) {
          allItems.push(...category.items);
        }
      });
      
      if (searchQuery.trim() !== '') {
        const filtered = allItems.filter(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setFilteredItems(filtered);
      } else {
        setFilteredItems([]);
      }
    }
  }, [searchQuery, menu]);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
  };

  const handleSearchFocus = () => {
    setIsSearching(true);
    setActiveCategory(null);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    if (menu?.categories && menu.categories.length > 0) {
      setActiveCategory(menu.categories[0].id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto max-w-3xl">
          <Skeleton className="h-16 w-full mb-6" />
          <Skeleton className="h-12 w-full mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !menu) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Menu Not Found</h1>
          <p className="text-gray-600 mb-4">
            Sorry, we couldn't find the menu you're looking for.
          </p>
          <p className="text-sm text-gray-500">
            Please check the URL or scan the QR code again.
          </p>
        </div>
      </div>
    );
  }

  const activeItems = isSearching 
    ? filteredItems 
    : activeCategory 
      ? menu.categories?.find(c => c.id === activeCategory)?.items || [] 
      : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Menu Header */}
        <div className="bg-white rounded-lg p-6 shadow-md mb-6">
          <h1 className="text-2xl font-bold text-center mb-1">{menu.name}</h1>
          {menu.description && (
            <p className="text-gray-600 text-center mb-4">{menu.description}</p>
          )}
          <div className="text-center text-sm text-gray-500">
            {menu.organization?.name}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search menu items..."
              className="pl-10 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
            />
            {searchQuery && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={clearSearch}
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Category Navigation */}
        {!isSearching && menu.categories && menu.categories.length > 0 && (
          <ScrollArea className="w-full whitespace-nowrap mb-6">
            <div className="flex space-x-2 pb-2">
              {menu.categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryClick(category.id)}
                  className="flex-shrink-0"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Search Results */}
        {isSearching && (
          <div className="mb-4">
            <h2 className="text-lg font-medium mb-2">
              {filteredItems.length > 0 
                ? `Search Results (${filteredItems.length})` 
                : 'No items found'}
            </h2>
            {searchQuery && filteredItems.length === 0 && (
              <p className="text-gray-500 text-sm">
                No items match your search. Try a different term or browse by category.
              </p>
            )}
          </div>
        )}

        {/* Menu Items */}
        <div className="space-y-4">
          {activeItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleItemClick(item)}
            >
              <div className="flex flex-col md:flex-row">
                {item.imageUrl && (
                  <div className="md:w-1/3 h-40 md:h-auto">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className={`p-4 flex-1 ${!item.imageUrl ? 'w-full' : ''}`}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <div className="text-lg font-semibold">
                      {item.discountPrice ? (
                        <div className="flex flex-col items-end">
                          <span className="text-red-600">${item.discountPrice}</span>
                          <span className="text-sm line-through text-gray-400">${item.price}</span>
                        </div>
                      ) : (
                        <span>${item.price}</span>
                      )}
                    </div>
                  </div>
                  
                  {item.description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.isVegetarian && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        <Leaf className="h-3 w-3 mr-1" /> Veg
                      </Badge>
                    )}
                    {item.isVegan && (
                      <Badge variant="outline" className="text-green-700 border-green-700">
                        <Leaf className="h-3 w-3 mr-1" /> Vegan
                      </Badge>
                    )}
                    {item.isGlutenFree && (
                      <Badge variant="outline" className="text-amber-600 border-amber-600">
                        <Wheat className="h-3 w-3 mr-1" /> GF
                      </Badge>
                    )}
                    {item.preparationTime && (
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        <Clock className="h-3 w-3 mr-1" /> {item.preparationTime} min
                      </Badge>
                    )}
                    {item.spicyLevel && item.spicyLevel > 0 && (
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        <Flame className="h-3 w-3 mr-1" /> {SpicyLevelLabels[item.spicyLevel]}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Item Detail Sheet */}
        <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>{selectedItem?.name}</SheetTitle>
              <SheetDescription>
                {selectedItem?.description}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {selectedItem?.imageUrl && (
                <div className="rounded-md overflow-hidden">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.name}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="font-medium">Price</span>
                <div className="text-lg font-semibold">
                  {selectedItem?.discountPrice ? (
                    <div className="flex items-center gap-2">
                      <span className="text-red-600">${selectedItem.discountPrice}</span>
                      <span className="text-sm line-through text-gray-400">${selectedItem?.price}</span>
                    </div>
                  ) : (
                    <span>${selectedItem?.price}</span>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-2">
                {selectedItem?.preparationTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedItem.preparationTime} min prep time</span>
                  </div>
                )}
                
                {selectedItem?.calories && (
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{selectedItem.calories} calories</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {selectedItem?.isVegetarian && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Leaf className="h-3 w-3 mr-1" /> Vegetarian
                  </Badge>
                )}
                
                {selectedItem?.isVegan && (
                  <Badge variant="outline" className="text-green-700 border-green-700">
                    <Leaf className="h-3 w-3 mr-1" /> Vegan
                  </Badge>
                )}
                
                {selectedItem?.isGlutenFree && (
                  <Badge variant="outline" className="text-amber-600 border-amber-600">
                    <Wheat className="h-3 w-3 mr-1" /> Gluten Free
                  </Badge>
                )}
                
                {selectedItem?.spicyLevel && selectedItem.spicyLevel > 0 && (
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    <Flame className="h-3 w-3 mr-1" /> {SpicyLevelLabels[selectedItem.spicyLevel]} Spicy
                  </Badge>
                )}
              </div>
              
              {selectedItem?.allergens && (
                <div>
                  <h4 className="font-medium mb-1">Allergens</h4>
                  <p className="text-sm text-gray-600">{selectedItem.allergens}</p>
                </div>
              )}
            </div>
            
            <SheetClose asChild>
              <Button className="w-full mt-6">Close</Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default PublicMenu;

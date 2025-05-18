import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, X, Info, Edit, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Category, MenuItem } from '@/services/menu-service';
import { CreateOrderItemDto, CreateOrderItemModifierDto } from '@/services/order-service';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MenuItemSelectorProps {
  categories: Category[];
  selectedItems: CreateOrderItemDto[];
  onItemsChange: (items: CreateOrderItemDto[]) => void;
}

const MenuItemSelector: React.FC<MenuItemSelectorProps> = ({
  categories,
  selectedItems,
  onItemsChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>(categories[0]?.id || '');

  // Filter categories and items based on search term
  const filteredCategories = categories.map(category => ({
    ...category,
    items: category.items?.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []
  })).filter(category => category.items.length > 0);

  // Add an item to the order
  const addItem = (item: MenuItem) => {
    const existingItemIndex = selectedItems.findIndex(
      selectedItem => selectedItem.menuItemId === item.id
    );

    if (existingItemIndex >= 0) {
      // Item already exists, increment quantity
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + 1
      };
      onItemsChange(updatedItems);
    } else {
      // Add new item
      onItemsChange([
        ...selectedItems,
        {
          menuItemId: item.id,
          quantity: 1,
          notes: '',
          modifiers: []
        }
      ]);
    }
  };

  // Remove an item from the order
  const removeItem = (index: number) => {
    const updatedItems = [...selectedItems];
    updatedItems.splice(index, 1);
    onItemsChange(updatedItems);
  };

  // Update item quantity
  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;

    const updatedItems = [...selectedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      quantity
    };
    onItemsChange(updatedItems);
  };

  // Update item notes
  const updateNotes = (index: number, notes: string) => {
    const updatedItems = [...selectedItems];
    updatedItems[index] = {
      ...updatedItems[index],
      notes
    };
    onItemsChange(updatedItems);
  };

  // Toggle a modifier for an item
  const toggleModifier = (itemIndex: number, modifier: { id: string, name: string }) => {
    const updatedItems = [...selectedItems];
    const item = updatedItems[itemIndex];

    const modifierIndex = item.modifiers?.findIndex(
      m => m.modifierId === modifier.id
    ) ?? -1;

    if (modifierIndex >= 0) {
      // Remove modifier
      item.modifiers = item.modifiers?.filter(m => m.modifierId !== modifier.id);
    } else {
      // Add modifier
      item.modifiers = [
        ...(item.modifiers || []),
        { modifierId: modifier.id }
      ];
    }

    updatedItems[itemIndex] = item;
    onItemsChange(updatedItems);
  };

  // Find a menu item by ID
  const findMenuItem = (menuItemId: string): MenuItem | undefined => {
    for (const category of categories) {
      const item = category.items?.find(item => item.id === menuItemId);
      if (item) return item;
    }
    return undefined;
  };

  // Format price
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(price));
  };

  // State for item details dialog
  const [selectedItemDetails, setSelectedItemDetails] = useState<MenuItem | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [itemNotes, setItemNotes] = useState<string>('');

  // Open item details dialog
  const openItemDetails = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItemDetails(item);
  };

  // Open edit dialog for an item
  const openEditDialog = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = selectedItems[index];
    setEditingItemIndex(index);
    setItemNotes(item.notes || '');
  };

  // Save edited item
  const saveItemEdit = () => {
    if (editingItemIndex !== null) {
      updateNotes(editingItemIndex, itemNotes);
      setEditingItemIndex(null);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Menu Items Selection */}
      <div className="w-full md:w-2/3">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {searchTerm ? (
          // Search results
          <div className="space-y-4">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div key={category.id} className="space-y-2">
                  <h3 className="font-medium text-lg">{category.name}</h3>
                  {category.items?.map((item) => (
                    <Card key={item.id} className="cursor-pointer hover:bg-accent/50">
                      <CardContent className="p-3 flex justify-between items-center">
                        <div className="flex-1" onClick={() => addItem(item)}>
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">{item.description}</div>
                          )}
                          <div className="flex gap-1 mt-1">
                            {item.isVegetarian && <Badge variant="outline" className="text-xs">Vegetarian</Badge>}
                            {item.isVegan && <Badge variant="outline" className="text-xs">Vegan</Badge>}
                            {item.isGlutenFree && <Badge variant="outline" className="text-xs">Gluten-Free</Badge>}
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div className="font-medium">{formatPrice(item.price)}</div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={(e) => openItemDetails(item, e)}
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{item.name}</DialogTitle>
                                <DialogDescription>
                                  Item details and description
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                {item.imageUrl && (
                                  <div className="w-full h-48 relative rounded-md overflow-hidden">
                                    <img
                                      src={item.imageUrl}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Description</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {item.description || 'No description available'}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Price</h4>
                                  <p className="text-sm">{formatPrice(item.price)}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {item.isVegetarian && <Badge variant="outline">Vegetarian</Badge>}
                                  {item.isVegan && <Badge variant="outline">Vegan</Badge>}
                                  {item.isGlutenFree && <Badge variant="outline">Gluten-Free</Badge>}
                                  {item.spicyLevel && item.spicyLevel > 0 && (
                                    <Badge variant="outline">Spicy Level: {item.spicyLevel}</Badge>
                                  )}
                                  {item.calories && <Badge variant="outline">{item.calories} calories</Badge>}
                                </div>
                                {item.allergens && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">Allergens</h4>
                                    <p className="text-sm text-muted-foreground">{item.allergens}</p>
                                  </div>
                                )}
                              </div>
                              <DialogFooter>
                                <Button onClick={() => addItem(item)}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add to Order
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => addItem(item)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No items found matching "{searchTerm}"</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setSearchTerm('')}
                >
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        ) : (
          // Category tabs
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start overflow-x-auto">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-4 mt-4">
                <ScrollArea className="h-[400px]">
                  {category.items?.map((item) => (
                    <Card key={item.id} className="mb-2 cursor-pointer hover:bg-accent/50">
                      <CardContent className="p-3 flex justify-between items-center">
                        <div className="flex-1" onClick={() => addItem(item)}>
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">{item.description}</div>
                          )}
                          <div className="flex gap-1 mt-1">
                            {item.isVegetarian && <Badge variant="outline" className="text-xs">Vegetarian</Badge>}
                            {item.isVegan && <Badge variant="outline" className="text-xs">Vegan</Badge>}
                            {item.isGlutenFree && <Badge variant="outline" className="text-xs">Gluten-Free</Badge>}
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div className="font-medium">{formatPrice(item.price)}</div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={(e) => openItemDetails(item, e)}
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{item.name}</DialogTitle>
                                <DialogDescription>
                                  Item details and description
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                {item.imageUrl && (
                                  <div className="w-full h-48 relative rounded-md overflow-hidden">
                                    <img
                                      src={item.imageUrl}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Description</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {item.description || 'No description available'}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium mb-1">Price</h4>
                                  <p className="text-sm">{formatPrice(item.price)}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {item.isVegetarian && <Badge variant="outline">Vegetarian</Badge>}
                                  {item.isVegan && <Badge variant="outline">Vegan</Badge>}
                                  {item.isGlutenFree && <Badge variant="outline">Gluten-Free</Badge>}
                                  {item.spicyLevel && item.spicyLevel > 0 && (
                                    <Badge variant="outline">Spicy Level: {item.spicyLevel}</Badge>
                                  )}
                                  {item.calories && <Badge variant="outline">{item.calories} calories</Badge>}
                                </div>
                                {item.allergens && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-1">Allergens</h4>
                                    <p className="text-sm text-muted-foreground">{item.allergens}</p>
                                  </div>
                                )}
                              </div>
                              <DialogFooter>
                                <Button onClick={() => addItem(item)}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add to Order
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => addItem(item)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      {/* Selected Items */}
      <div className="w-full md:w-1/3">
        <div className="bg-accent/20 rounded-lg p-4">
          <h3 className="font-medium text-lg mb-2">Selected Items</h3>
          {selectedItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items selected. Click on menu items to add them to the order.
            </div>
          ) : (
            <div className="space-y-4">
              {selectedItems.map((item, index) => {
                const menuItem = findMenuItem(item.menuItemId);
                return menuItem ? (
                  <div key={index} className="bg-background rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{menuItem.name}</div>
                      <div className="flex gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => openEditDialog(index, e)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Item</DialogTitle>
                              <DialogDescription>
                                Update quantity and notes for {menuItem.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <h4 className="text-sm font-medium mb-2">Quantity</h4>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateQuantity(index, item.quantity - 1)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="w-8 text-center text-lg">{item.quantity}</span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => updateQuantity(index, item.quantity + 1)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-2">Notes</h4>
                                <Textarea
                                  placeholder="Add special instructions (e.g., no onions)"
                                  value={itemNotes}
                                  onChange={(e) => setItemNotes(e.target.value)}
                                  className="min-h-[100px]"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button onClick={saveItemEdit}>Save Changes</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeItem(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <span className="ml-auto font-medium">
                        {formatPrice((parseFloat(menuItem.price) * item.quantity).toString())}
                      </span>
                    </div>
                    {item.notes && (
                      <div className="mt-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
                        Note: {item.notes}
                      </div>
                    )}
                  </div>
                ) : null;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemSelector;

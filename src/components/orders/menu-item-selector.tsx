import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, X, Info, Edit, AlertCircle, Utensils } from 'lucide-react';
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
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
    <div className="space-y-6">
      {/* Mobile-First Header with Search and Cart Summary */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 h-12 text-base"
          />
          {searchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Mobile Cart Summary */}
        {selectedItems.length > 0 && (
          <div className="lg:hidden bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {selectedItems.reduce((sum, item) => sum + item.quantity, 0)}
                </div>
                <span className="font-medium text-gray-900">
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const element = document.getElementById('selected-items-mobile');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-blue-600 border-blue-200 hover:bg-blue-100"
              >
                Review Items
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Menu Items Display */}
      <div className="space-y-6">
        {searchTerm ? (
          // Search results
          <div className="space-y-6">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <div key={category.id} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <h3 className="font-semibold text-lg text-gray-900">{category.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {category.items?.length} item{category.items?.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {category.items?.map((item) => (
                      <Card key={item.id} className="border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Item Header */}
                            <div className="flex justify-between items-start gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 text-base leading-tight">{item.name}</h4>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                {item.discountPrice ? (
                                  <div className="space-y-1">
                                    <div className="font-semibold text-green-600 text-base">{formatPrice(item.discountPrice)}</div>
                                    <div className="text-sm line-through text-gray-400">{formatPrice(item.price)}</div>
                                  </div>
                                ) : (
                                  <div className="font-semibold text-gray-900 text-base">{formatPrice(item.price)}</div>
                                )}
                              </div>
                            </div>

                            {/* Badges */}
                            {(item.isVegetarian || item.isVegan || item.isGlutenFree) && (
                              <div className="flex flex-wrap gap-2">
                                {item.isVegetarian && <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">🌱 Vegetarian</Badge>}
                                {item.isVegan && <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">🌿 Vegan</Badge>}
                                {item.isGlutenFree && <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">🌾 Gluten-Free</Badge>}
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2"
                                    onClick={(e) => openItemDetails(item, e)}
                                  >
                                    <Info className="h-4 w-4 mr-1" />
                                    Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md mx-auto">
                                  <DialogHeader>
                                    <DialogTitle className="text-lg font-semibold">{item.name}</DialogTitle>
                                    <DialogDescription>
                                      Item details and nutritional information
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    {item.imageUrl && (
                                      <div className="w-full h-48 relative rounded-lg overflow-hidden bg-gray-100">
                                        <img
                                          src={item.imageUrl}
                                          alt={item.name}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    )}
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                                      <p className="text-sm text-gray-600 leading-relaxed">
                                        {item.description || 'No description available'}
                                      </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-1">Price</h4>
                                        <p className="text-base font-semibold text-gray-900">{formatPrice(item.price)}</p>
                                      </div>
                                      {item.calories && (
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-900 mb-1">Calories</h4>
                                          <p className="text-sm text-gray-600">{item.calories} cal</p>
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {item.isVegetarian && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">🌱 Vegetarian</Badge>}
                                      {item.isVegan && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">🌿 Vegan</Badge>}
                                      {item.isGlutenFree && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">🌾 Gluten-Free</Badge>}
                                      {item.spicyLevel && item.spicyLevel > 0 && (
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">🌶️ Spicy Level: {item.spicyLevel}</Badge>
                                      )}
                                    </div>
                                    {item.allergens && (
                                      <div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Allergens</h4>
                                        <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                          ⚠️ {item.allergens}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      type="button"
                                      onClick={() => addItem(item)}
                                      className="w-full h-12 text-base font-medium"
                                    >
                                      <Plus className="mr-2 h-5 w-5" />
                                      Add to Order
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Button
                                type="button"
                                onClick={() => addItem(item)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 h-10 font-medium"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600 mb-6">No menu items match "{searchTerm}". Try a different search term.</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Search
                </Button>
              </div>
            )}
          </div>
        ) : (
          // Category tabs with mobile-optimized design
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Mobile-friendly tab navigation */}
              <div className="border-b border-gray-200">
                <TabsList className="w-full justify-start bg-transparent h-auto p-0 rounded-none overflow-x-auto">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none border-b-2 border-transparent py-3 px-4 font-medium text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap"
                    >
                      <div className="flex items-center gap-2">
                        <span>{category.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {category.items?.length || 0}
                        </Badge>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              {/* Category Content */}
              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-6">
                  <div className="space-y-4">
                    {category.items && category.items.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {category.items.map((item) => (
                          <Card key={item.id} className="border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                {/* Item Header */}
                                <div className="flex justify-between items-start gap-3">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 text-base leading-tight">{item.name}</h4>
                                    {item.description && (
                                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                                    )}
                                  </div>
                                  <div className="text-right shrink-0">
                                    {item.discountPrice ? (
                                      <div className="space-y-1">
                                        <div className="font-semibold text-green-600 text-base">{formatPrice(item.discountPrice)}</div>
                                        <div className="text-sm line-through text-gray-400">{formatPrice(item.price)}</div>
                                      </div>
                                    ) : (
                                      <div className="font-semibold text-gray-900 text-base">{formatPrice(item.price)}</div>
                                    )}
                                  </div>
                                </div>

                                {/* Badges */}
                                {(item.isVegetarian || item.isVegan || item.isGlutenFree) && (
                                  <div className="flex flex-wrap gap-2">
                                    {item.isVegetarian && <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">🌱 Vegetarian</Badge>}
                                    {item.isVegan && <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">🌿 Vegan</Badge>}
                                    {item.isGlutenFree && <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">🌾 Gluten-Free</Badge>}
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between pt-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2"
                                        onClick={(e) => openItemDetails(item, e)}
                                      >
                                        <Info className="h-4 w-4 mr-1" />
                                        Details
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md mx-auto">
                                      <DialogHeader>
                                        <DialogTitle className="text-lg font-semibold">{item.name}</DialogTitle>
                                        <DialogDescription>
                                          Item details and nutritional information
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        {item.imageUrl && (
                                          <div className="w-full h-48 relative rounded-lg overflow-hidden bg-gray-100">
                                            <img
                                              src={item.imageUrl}
                                              alt={item.name}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        )}
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                                          <p className="text-sm text-gray-600 leading-relaxed">
                                            {item.description || 'No description available'}
                                          </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-900 mb-1">Price</h4>
                                            <p className="text-base font-semibold text-gray-900">{formatPrice(item.price)}</p>
                                          </div>
                                          {item.calories && (
                                            <div>
                                              <h4 className="text-sm font-medium text-gray-900 mb-1">Calories</h4>
                                              <p className="text-sm text-gray-600">{item.calories} cal</p>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                          {item.isVegetarian && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">🌱 Vegetarian</Badge>}
                                          {item.isVegan && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">🌿 Vegan</Badge>}
                                          {item.isGlutenFree && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">🌾 Gluten-Free</Badge>}
                                          {item.spicyLevel && item.spicyLevel > 0 && (
                                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">🌶️ Spicy Level: {item.spicyLevel}</Badge>
                                          )}
                                        </div>
                                        {item.allergens && (
                                          <div>
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">Allergens</h4>
                                            <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                              ⚠️ {item.allergens}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                      <DialogFooter>
                                        <Button
                                          type="button"
                                          onClick={() => addItem(item)}
                                          className="w-full h-12 text-base font-medium"
                                        >
                                          <Plus className="mr-2 h-5 w-5" />
                                          Add to Order
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    type="button"
                                    onClick={() => addItem(item)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 h-10 font-medium"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Utensils className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Available</h3>
                        <p className="text-gray-600">This category doesn't have any menu items yet.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </div>

      {/* Selected Items - Mobile Optimized */}
      <div id="selected-items-mobile" className="space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-900">Selected Items</h3>
            {selectedItems.length > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {selectedItems.reduce((sum, item) => sum + item.quantity, 0)} items
              </Badge>
            )}
          </div>

          {selectedItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Utensils className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-base font-medium text-gray-900 mb-2">No Items Selected</h4>
              <p className="text-sm text-gray-600">Add menu items to see them here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedItems.map((item, index) => {
                const menuItem = findMenuItem(item.menuItemId);
                return menuItem ? (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    <div className="space-y-3">
                      {/* Item Header */}
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-base">{menuItem.name}</h4>
                          <p className="text-sm text-gray-600">{formatPrice(menuItem.price)} each</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-medium text-base min-w-[2rem] text-center">{item.quantity}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {formatPrice((parseFloat(menuItem.price) * item.quantity).toString())}
                          </div>
                        </div>
                      </div>

                      {/* Edit Notes */}
                      <div className="pt-2 border-t border-gray-100">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2"
                              onClick={(e) => openEditDialog(index, e)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              {item.notes ? 'Edit Notes' : 'Add Notes'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md mx-auto">
                            <DialogHeader>
                              <DialogTitle className="text-lg font-semibold">Edit Item</DialogTitle>
                              <DialogDescription>
                                Update notes for {menuItem.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Special Instructions</h4>
                                <Textarea
                                  placeholder="Add special instructions (e.g., no onions, extra spicy)"
                                  value={itemNotes}
                                  onChange={(e) => setItemNotes(e.target.value)}
                                  className="min-h-[120px] resize-none"
                                />
                                <p className="text-xs text-gray-500 mt-2">
                                  These notes will be sent to the kitchen with your order
                                </p>
                              </div>
                            </div>
                            <DialogFooter className="gap-2">
                              <DialogClose asChild>
                                <Button type="button" variant="outline" className="flex-1">Cancel</Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button type="button" onClick={saveItemEdit} className="flex-1">Save Notes</Button>
                              </DialogClose>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* Show current notes if any */}
                        {item.notes && (
                          <div className="mt-2 text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
                            <span className="font-medium">Note:</span> {item.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null;
              })}

              {/* Order Total */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-base font-medium text-gray-900">Total</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatPrice(
                      selectedItems.reduce((total, item) => {
                        const menuItem = findMenuItem(item.menuItemId);
                        if (menuItem) {
                          return total + (parseFloat(menuItem.discountPrice || menuItem.price) * item.quantity);
                        }
                        return total;
                      }, 0).toString()
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemSelector;

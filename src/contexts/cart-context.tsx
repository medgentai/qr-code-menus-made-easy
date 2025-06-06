import React, { createContext, useContext, useState, useEffect } from 'react';
import { MenuItem } from '@/services/menu-service';
import { CreateOrderItemDto, CreateOrderItemModifierDto } from '@/services/order-service';

// Cart item interface
export interface CartItem extends CreateOrderItemDto {
  menuItem: MenuItem;
}

// Cart context interface
export interface CartContextType {
  items: CartItem[];
  addItem: (menuItem: MenuItem, quantity?: number, notes?: string, modifiers?: CreateOrderItemModifierDto[]) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  updateNotes: (index: number, notes: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerEmail: string;
  setCustomerEmail: (email: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  tableId: string | null;
  setTableId: (tableId: string | null) => void;
  roomNumber: string;
  setRoomNumber: (roomNumber: string) => void;
  partySize: number | undefined;
  setPartySize: (partySize: number | undefined) => void;
}

// Create the cart context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart provider props
interface CartProviderProps {
  children: React.ReactNode;
}

// Cart provider component
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  // Cart state
  const [items, setItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [tableId, setTableId] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [partySize, setPartySize] = useState<number | undefined>(undefined);

  // Load cart from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart.items || []);
        setCustomerName(parsedCart.customerName || '');
        setCustomerEmail(parsedCart.customerEmail || '');
        setCustomerPhone(parsedCart.customerPhone || '');
        setTableId(parsedCart.tableId || null);
        setRoomNumber(parsedCart.roomNumber || '');
        setPartySize(parsedCart.partySize || undefined);
      } catch (error) {
        console.error('Error parsing cart from local storage:', error);
      }
    }
  }, []);

  // Save cart to local storage when it changes
  useEffect(() => {
    const cartData = {
      items,
      customerName,
      customerEmail,
      customerPhone,
      tableId,
      roomNumber,
      partySize,
    };
    localStorage.setItem('cart', JSON.stringify(cartData));
  }, [items, customerName, customerEmail, customerPhone, tableId, roomNumber, partySize]);

  // Calculate total items
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  // Calculate total amount
  const totalAmount = items.reduce((total, item) => {
    const itemPrice = parseFloat(item.menuItem.price);
    const modifiersPrice = item.modifiers?.reduce(
      (modTotal, mod) => {
        // Cast mod to any type with price property if it exists
        const modPrice = (mod as any).price ? parseFloat((mod as any).price) : 0;
        return modTotal + modPrice;
      },
      0
    ) || 0;
    return total + (itemPrice + modifiersPrice) * item.quantity;
  }, 0);

  // Add item to cart
  const addItem = (
    menuItem: MenuItem,
    quantity: number = 1,
    notes: string = '',
    modifiers: CreateOrderItemModifierDto[] = []
  ) => {
    // Check if the item already exists in the cart
    const existingItemIndex = items.findIndex(
      (item) => item.menuItemId === menuItem.id
    );

    if (existingItemIndex !== -1) {
      // Update quantity if the item already exists
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      setItems(updatedItems);
    } else {
      // Add new item to cart
      const newItem: CartItem = {
        menuItemId: menuItem.id,
        quantity,
        notes,
        modifiers,
        menuItem,
      };
      setItems([...items, newItem]);
    }
  };

  // Remove item from cart
  const removeItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  // Update item quantity
  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) {
      removeItem(index);
      return;
    }

    const updatedItems = [...items];
    updatedItems[index].quantity = quantity;
    setItems(updatedItems);
  };

  // Update item notes
  const updateNotes = (index: number, notes: string) => {
    const updatedItems = [...items];
    updatedItems[index].notes = notes;
    setItems(updatedItems);
  };

  // Clear cart
  const clearCart = () => {
    setItems([]);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setTableId(null);
    setRoomNumber('');
    setPartySize(undefined);
  };

  // Context value
  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    clearCart,
    totalItems,
    totalAmount,
    customerName,
    setCustomerName,
    customerEmail,
    setCustomerEmail,
    customerPhone,
    setCustomerPhone,
    tableId,
    setTableId,
    roomNumber,
    setRoomNumber,
    partySize,
    setPartySize,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

import { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (id: string, name: string, price: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemQuantity: (id: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (id: string, name: string, price: number) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === id);

      if (existingItem) {
        // Check if adding one more would exceed 100
        if (existingItem.quantity >= 100) {
          return currentItems;
        }

        return currentItems.map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentItems, { id, name, price, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === id);

      if (existingItem && existingItem.quantity > 1) {
        return currentItems.map(item =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }

      return currentItems.filter(item => item.id !== id);
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 0 || quantity > 100) {
      return;
    }

    setItems(currentItems => {
      if (quantity === 0) {
        return currentItems.filter(item => item.id !== id);
      }

      const existingItem = currentItems.find(item => item.id === id);

      if (existingItem) {
        return currentItems.map(item =>
          item.id === id
            ? { ...item, quantity }
            : item
        );
      }

      return currentItems;
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemQuantity = (id: string) => {
    const item = items.find(item => item.id === id);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        getItemQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

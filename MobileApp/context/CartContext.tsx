import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export type CartItem = {
  id: string;
  title: string;
  author?: string;
  price: number;
  originalPrice?: number;
  image: any;
  quantity: number;
  isCombo?: boolean;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = await SecureStore.getItemAsync('cart_data');
        if (storedCart) {
          setItems(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error('Failed to load cart', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadCart();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      SecureStore.setItemAsync('cart_data', JSON.stringify(items)).catch((err) =>
        console.error('Failed to save cart', err)
      );
    }
  }, [items, isLoaded]);

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id);
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  };

  const increaseQuantity = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};


import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getCart, getCurrentUser } from '../services/storageService';

interface CartContextType {
  cartCount: number;
  refreshCartCount: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    const user = getCurrentUser();
    if (!user) {
      setCartCount(0);
      return;
    }
    try {
      const items = await getCart(user.id);
      const count = items.reduce((acc, item) => acc + item.quantity, 0);
      setCartCount(count);
    } catch (error) {
      console.error("Cart sync error:", error);
    }
  }, []);

  useEffect(() => {
    refreshCartCount();
    
    // Listen for storage changes (e.g. login/logout in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'innovative_gadget_user') {
        refreshCartCount();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshCartCount]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

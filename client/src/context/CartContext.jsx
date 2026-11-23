import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Sync cart whenever authentication changes
  useEffect(() => {
    if (token && user) {
      fetchCart();
    } else {
      // Load guest cart from localStorage
      try {
        const savedGuestCart = localStorage.getItem('gomart_guest_cart');
        if (savedGuestCart) {
          const parsed = JSON.parse(savedGuestCart);
          setItems(parsed);
          const sub = parsed.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);
          setSubtotal(sub);
        } else {
          setItems([]);
          setSubtotal(0);
        }
      } catch (e) {
        setItems([]);
        setSubtotal(0);
      }
    }
  }, [token, user?.uid]);

  const saveGuestCart = (newItems) => {
    setItems(newItems);
    const sub = newItems.reduce((sum, item) => sum + (Number(item.price) * (item.quantity || 1)), 0);
    setSubtotal(sub);
    try {
      localStorage.setItem('gomart_guest_cart', JSON.stringify(newItems));
    } catch (e) {
      console.warn('Could not save guest cart:', e);
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartService.get();
      if (res.data.success) {
        setItems(res.data.items || []);
        setSubtotal(res.data.subtotal || 0);
      }
    } catch (err) {
      console.warn('Could not fetch cart:', err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add a product to the shopping cart
   */
  const addToCart = async (product, quantity = 1, selectedVariant = {}) => {
    const prodId = product.id || product.productId;
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    // Rule: Users must not purchase their own products
    if (user && product.sellerId === user?.uid) {
      toast.error('You cannot purchase your own product.');
      return false;
    }

    if (!token) {
      // Guest shopping cart
      const existingIdx = items.findIndex(item => item.productId === prodId);
      let updated;
      if (existingIdx > -1) {
        updated = items.map((item, idx) => 
          idx === existingIdx 
            ? { ...item, quantity: (item.quantity || 1) + qty } 
            : item
        );
      } else {
        updated = [
          ...items,
          {
            productId: prodId,
            name: product.name || product.title,
            title: product.title || product.name,
            price: Number(product.price),
            originalPrice: product.originalPrice || Math.round(Number(product.price) * 1.3),
            discountPercent: product.discountPercent || 25,
            category: product.category,
            brand: product.brand || 'GoMart Brand',
            thumbnailUrl: product.thumbnailUrl,
            sellerId: product.sellerId,
            quantity: qty,
            selectedSize: selectedVariant.size || null,
            selectedColor: selectedVariant.color || null
          }
        ];
      }
      saveGuestCart(updated);
      toast.success(`"${product.name || product.title}" added to cart!`);
      return true;
    }

    // Authenticated cart
    try {
      const existingItem = items.find(item => item.productId === prodId);
      if (existingItem) {
        // Update quantity
        const newQty = (existingItem.quantity || 1) + qty;
        await cartService.updateQuantity(prodId, newQty);
        toast.success(`Updated "${product.name || product.title}" quantity to ${newQty}!`);
      } else {
        await cartService.add(prodId, qty, selectedVariant);
        toast.success(`"${product.name || product.title}" added to cart!`);
      }
      await fetchCart();
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item to cart.');
      return false;
    }
  };

  /**
   * Update quantity of a product in the cart
   */
  const updateQuantity = async (productId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty)) return;

    if (qty <= 0) {
      return removeFromCart(productId);
    }

    if (!token) {
      const updated = items.map(item => 
        item.productId === productId ? { ...item, quantity: qty } : item
      );
      saveGuestCart(updated);
      return;
    }

    try {
      await cartService.updateQuantity(productId, qty);
      await fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update quantity.');
    }
  };

  /**
   * Remove product from cart
   */
  const removeFromCart = async (productId) => {
    if (!token) {
      const updated = items.filter(item => item.productId !== productId);
      saveGuestCart(updated);
      toast.info('Item removed from cart.');
      return;
    }

    try {
      const res = await cartService.remove(productId);
      if (res.data.success) {
        toast.info('Item removed from cart.');
        await fetchCart();
      }
    } catch (err) {
      toast.error('Failed to remove item.');
    }
  };

  /**
   * Clear entire cart
   */
  const clearCart = async () => {
    if (!token) {
      saveGuestCart([]);
      return;
    }
    try {
      await cartService.clear();
      setItems([]);
      setSubtotal(0);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const value = {
    items,
    itemCount: totalQuantity,
    totalQuantity,
    subtotal,
    total: subtotal,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

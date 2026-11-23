import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('eproducts_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('eproducts_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Could not save wishlist to storage:', e);
    }
  }, [wishlist]);

  const isInWishlist = (productId) => {
    return wishlist.some(item => (item.id === productId || item.productId === productId));
  };

  const toggleWishlist = (product) => {
    const id = product.id || product.productId;
    const exists = isInWishlist(id);

    if (exists) {
      setWishlist(prev => prev.filter(item => (item.id !== id && item.productId !== id)));
      toast.info(`Removed "${product.name || product.title}" from your Wishlist.`);
    } else {
      setWishlist(prev => [
        ...prev,
        {
          id,
          productId: id,
          name: product.name || product.title,
          title: product.title || product.name,
          price: product.price,
          originalPrice: product.originalPrice || Math.round(Number(product.price) * 1.3),
          discountPercent: product.discountPercent || 25,
          category: product.category,
          brand: product.brand || 'GoMart Brand',
          thumbnailUrl: product.thumbnailUrl,
          sellerName: product.sellerName,
          sellerId: product.sellerId,
          viewCount: product.viewCount,
          rating: product.rating || 4.5,
          reviewCount: product.reviewCount || 100
        }
      ]);
      toast.success(`Added "${product.name || product.title}" to your Wishlist!`);
    }
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      wishlistCount: wishlist.length,
      isInWishlist,
      toggleWishlist,
      clearWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

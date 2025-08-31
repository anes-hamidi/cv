
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from "react";
import type { Product, CartItem, Sale } from "@/types";
import { INITIAL_PRODUCTS } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

interface POSContextType {
  products: Product[];
  setProducts: Dispatch<SetStateAction<Product[]>>;
  addOrUpdateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  sales: Sale[];
  setSales: Dispatch<SetStateAction<Sale[]>>;
  completeSale: () => Sale;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem("pos-products");
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        setProducts(INITIAL_PRODUCTS);
      }
      
      const storedSales = localStorage.getItem("pos-sales");
      if (storedSales) {
        setSales(JSON.parse(storedSales));
      }
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
        setProducts(INITIAL_PRODUCTS);
        setSales([]);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("pos-products", JSON.stringify(products));
    }
  }, [products, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("pos-sales", JSON.stringify(sales));
    }
  }, [sales, isMounted]);

  const addOrUpdateProduct = (product: Product) => {
    setProducts((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) => (p.id === product.id ? product : p));
      }
      return [...prev, product];
    });
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently unavailable.`,
        variant: "destructive",
      });
      return;
    }

    setCart((prev) => {
      const existingItem = prev.find((item) => item.productId === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          toast({
            title: "Stock Limit Reached",
            description: `You cannot add more of ${product.name}.`,
            variant: "destructive",
          });
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
    toast({
        title: "Item Added",
        description: `${product.name} was added to your cart.`,
    })
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (quantity > product.stock) {
      toast({
        title: "Stock Limit Reached",
        description: `Only ${product.stock} of ${product.name} available.`,
        variant: "destructive",
      });
      quantity = product.stock;
    }

    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const completeSale = (): Sale => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newSale: Sale = {
      id: new Date().toISOString(),
      items: cart,
      total,
      date: new Date().toISOString(),
    };

    // Update stock
    setProducts(prevProducts => {
        const updatedProducts = [...prevProducts];
        cart.forEach(cartItem => {
            const productIndex = updatedProducts.findIndex(p => p.id === cartItem.productId);
            if (productIndex !== -1) {
                updatedProducts[productIndex].stock -= cartItem.quantity;
            }
        });
        return updatedProducts;
    });

    setSales((prev) => [newSale, ...prev]);
    clearCart();
    return newSale;
  };

  const value = {
    products,
    setProducts,
    addOrUpdateProduct,
    deleteProduct,
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    sales,
    setSales,
    completeSale,
  };

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error("usePOS must be used within a POSProvider");
  }
  return context;
};

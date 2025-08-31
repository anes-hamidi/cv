
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction, useCallback } from "react";
import type { Product, CartItem, Sale, Customer, PriceLevel } from "@/types";
import { INITIAL_PRODUCTS } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

interface POSContextType {
  isDataReady: boolean;
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
  customers: Customer[];
  setCustomers: Dispatch<SetStateAction<Customer[]>>;
  addOrUpdateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
  selectedCustomer: Customer | null;
  setSelectedCustomer: Dispatch<SetStateAction<Customer | null>>;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  const [isDataReady, setIsDataReady] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  // Load data from localStorage
  useEffect(() => {
    setIsMounted(true);
    try {
      const storedProducts = localStorage.getItem("pos-products");
      setProducts(storedProducts ? JSON.parse(storedProducts) : INITIAL_PRODUCTS);

      const storedSales = localStorage.getItem("pos-sales");
      setSales(storedSales ? JSON.parse(storedSales) : []);
      
      const storedCustomers = localStorage.getItem("pos-customers");
      setCustomers(storedCustomers ? JSON.parse(storedCustomers) : []);
      
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
        setProducts(INITIAL_PRODUCTS);
        setSales([]);
        setCustomers([]);
    } finally {
      setIsDataReady(true);
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("pos-products", JSON.stringify(products));
      localStorage.setItem("pos-sales", JSON.stringify(sales));
      localStorage.setItem("pos-customers", JSON.stringify(customers));
    }
  }, [products, sales, customers, isMounted]);

  const getPriceForCustomer = useCallback((product: Product, priceLevel: PriceLevel): number => {
    if (product.priceLevels && product.priceLevels[priceLevel]) {
      return product.priceLevels[priceLevel];
    }
    return product.price;
  }, []);

  // Update cart prices when selected customer changes
  useEffect(() => {
    if (cart.length > 0) {
      setCart(currentCart => {
        const newCart = currentCart.map(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            const newPrice = getPriceForCustomer(product, selectedCustomer?.priceLevel || 'retail');
            return { ...item, price: newPrice };
          }
          return item;
        });
        return newCart;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCustomer, products, getPriceForCustomer]);

  // Products
  const addOrUpdateProduct = useCallback((product: Product) => {
    setProducts((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) => (p.id === product.id ? product : p));
      }
      return [...prev, product];
    });
  }, []);
  const deleteProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  // Cart
  const addToCart = useCallback((product: Product) => {
    const p = products.find(p => p.id === product.id);
    if (!p || p.stock <= 0) {
      toast({ title: "Out of Stock", description: `${product.name} is currently unavailable.`, variant: "destructive" });
      return;
    }

    const priceLevel = selectedCustomer?.priceLevel || 'retail';
    const price = getPriceForCustomer(p, priceLevel);

    setCart((prev) => {
      const existingItem = prev.find((item) => item.productId === product.id);
      if (existingItem) {
        if (existingItem.quantity >= p.stock) {
          toast({ title: "Stock Limit Reached", description: `You cannot add more of ${product.name}.`, variant: "destructive" });
          return prev;
        }
        return prev.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + 1, price: price } : item);
      }
      return [...prev, { productId: product.id, name: product.name, price: price, quantity: 1 }];
    });
    toast({ title: "Item Added", description: `${product.name} was added to your cart.` });
  }, [products, toast, selectedCustomer, getPriceForCustomer]);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const updateCartItemQuantity = useCallback((productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    if (quantity > product.stock) {
      toast({ title: "Stock Limit Reached", description: `Only ${product.stock} of ${product.name} available.`, variant: "destructive" });
      quantity = product.stock;
    }
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => prev.map((item) => (item.productId === productId ? { ...item, quantity } : item)));
  }, [products, toast, removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);

  // Sales
  const completeSale = useCallback((): Sale => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newSale: Sale = {
      id: new Date().toISOString(),
      items: cart,
      total,
      date: new Date().toISOString(),
      customerId: selectedCustomer?.id,
    };

    setProducts(prevProducts => {
      const productsToUpdate = [...prevProducts];
      
      cart.forEach(cartItem => {
        const productIndex = productsToUpdate.findIndex(p => p.id === cartItem.productId);
        if (productIndex !== -1) {
          const currentStock = productsToUpdate[productIndex].stock;
          productsToUpdate[productIndex].stock = currentStock - cartItem.quantity;
        }
      });
      
      return productsToUpdate;
    });

    setSales((prev) => [newSale, ...prev]);
    clearCart();
    setSelectedCustomer(null);
    return newSale;
  }, [cart, selectedCustomer, clearCart]);

  // Customers
  const addOrUpdateCustomer = useCallback((customer: Customer) => {
    setCustomers(prev => {
        const existing = prev.find(c => c.id === customer.id);
        if(existing) return prev.map(c => c.id === customer.id ? customer : c);
        return [...prev, customer];
    });
  }, []);

  const deleteCustomer = useCallback((customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
  }, []);

  const value = {
    isDataReady,
    products, setProducts, addOrUpdateProduct, deleteProduct,
    cart, addToCart, removeFromCart, updateCartItemQuantity, clearCart,
    sales, setSales, completeSale,
    customers, setCustomers, addOrUpdateCustomer, deleteCustomer,
    selectedCustomer, setSelectedCustomer,
  };

  return <POSContext.Provider value={value}>{isDataReady ? children : <div>Loading...</div>}</POSContext.Provider>;
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (context === undefined) throw new Error("usePOS must be used within a POSProvider");
  return context;
};

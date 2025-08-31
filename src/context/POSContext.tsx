
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from "react";
import type { Product, CartItem, Sale, Customer, Circuit, Tour } from "@/types";
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
  completeSale: (customerId?: string) => Sale;

  customers: Customer[];
  addOrUpdateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
  circuits: Circuit[];
  addOrUpdateCircuit: (circuit: Circuit) => void;
  deleteCircuit: (circuitId: string) => void;
  tours: Tour[];
  addOrUpdateTour: (tour: Tour) => void;
  deleteTour: (tourId: string) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [circuits, setCircuits] = useState<Circuit[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);

  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  // Load data from localStorage
  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem("pos-products");
      setProducts(storedProducts ? JSON.parse(storedProducts) : INITIAL_PRODUCTS);

      const storedSales = localStorage.getItem("pos-sales");
      setSales(storedSales ? JSON.parse(storedSales) : []);
      
      const storedCustomers = localStorage.getItem("pos-customers");
      setCustomers(storedCustomers ? JSON.parse(storedCustomers) : []);
      
      const storedCircuits = localStorage.getItem("pos-circuits");
      setCircuits(storedCircuits ? JSON.parse(storedCircuits) : []);

      const storedTours = localStorage.getItem("pos-tours");
      setTours(storedTours ? JSON.parse(storedTours) : []);

    } catch (error) {
        console.error("Failed to load data from localStorage", error);
        setProducts(INITIAL_PRODUCTS);
        setSales([]);
        setCustomers([]);
        setCircuits([]);
        setTours([]);
    }
    setIsMounted(true);
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("pos-products", JSON.stringify(products));
      localStorage.setItem("pos-sales", JSON.stringify(sales));
      localStorage.setItem("pos-customers", JSON.stringify(customers));
      localStorage.setItem("pos-circuits", JSON.stringify(circuits));
      localStorage.setItem("pos-tours", JSON.stringify(tours));
    }
  }, [products, sales, customers, circuits, tours, isMounted]);

  // Products
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

  // Cart
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast({ title: "Out of Stock", description: `${product.name} is currently unavailable.`, variant: "destructive" });
      return;
    }
    setCart((prev) => {
      const existingItem = prev.find((item) => item.productId === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          toast({ title: "Stock Limit Reached", description: `You cannot add more of ${product.name}.`, variant: "destructive" });
          return prev;
        }
        return prev.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
    toast({ title: "Item Added", description: `${product.name} was added to your cart.` });
  };
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };
  const updateCartItemQuantity = (productId: string, quantity: number) => {
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
  };
  const clearCart = () => setCart([]);

  // Sales
  const completeSale = (customerId?: string): Sale => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newSale: Sale = {
      id: new Date().toISOString(),
      items: cart,
      total,
      date: new Date().toISOString(),
      customerId,
    };
    setProducts(prevProducts => {
        const updatedProducts = [...prevProducts];
        cart.forEach(cartItem => {
            const productIndex = updatedProducts.findIndex(p => p.id === cartItem.productId);
            if (productIndex !== -1) updatedProducts[productIndex].stock -= cartItem.quantity;
        });
        return updatedProducts;
    });
    setSales((prev) => [newSale, ...prev]);
    clearCart();
    return newSale;
  };

  // Customers
  const addOrUpdateCustomer = (customer: Customer) => {
    setCustomers(prev => {
        const existing = prev.find(c => c.id === customer.id);
        if(existing) return prev.map(c => c.id === customer.id ? customer : c);
        return [...prev, customer];
    });
  }
  const deleteCustomer = (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
  }

  // Circuits
  const addOrUpdateCircuit = (circuit: Circuit) => {
    setCircuits(prev => {
        const existing = prev.find(c => c.id === circuit.id);
        if(existing) return prev.map(c => c.id === circuit.id ? circuit : c);
        return [...prev, circuit];
    });
  }
  const deleteCircuit = (circuitId: string) => {
    setCircuits(prev => prev.filter(c => c.id !== circuitId));
  }

  // Tours
  const addOrUpdateTour = (tour: Tour) => {
    setTours(prev => {
      const existing = prev.find(t => t.id === tour.id);
      if(existing) return prev.map(t => t.id === tour.id ? tour : t);
      return [tour, ...prev].sort((a,b) => b.date.localeCompare(a.date));
    });
  }
  const deleteTour = (tourId: string) => {
    setTours(prev => prev.filter(t => t.id !== tourId));
  }


  const value = {
    products, setProducts, addOrUpdateProduct, deleteProduct,
    cart, addToCart, removeFromCart, updateCartItemQuantity, clearCart,
    sales, setSales, completeSale,
    customers, addOrUpdateCustomer, deleteCustomer,
    circuits, addOrUpdateCircuit, deleteCircuit,
    tours, addOrUpdateTour, deleteTour
  };

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>;
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (context === undefined) throw new Error("usePOS must be used within a POSProvider");
  return context;
};

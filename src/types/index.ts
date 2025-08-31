
export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  stock: number;
  barcode?: string;
  category?: string;
  packaging?: string;
  cost?: number;
  priceLevels?: {
    retail: number;
    semiwholesale: number;
    wholesale: number;
  };
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id:string;
  items: CartItem[];
  total: number;
  date: string;
  customerId?: string; // Associate sale with a customer
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  municipality: string;
  phone?: string;
}

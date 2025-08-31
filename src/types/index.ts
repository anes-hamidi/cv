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
}

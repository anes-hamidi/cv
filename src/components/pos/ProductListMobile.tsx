
"use client";

import { usePOS } from "@/context/POSContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Plus, Minus, Search, X } from "lucide-react";
import type { Product } from "@/types";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductListMobileProps {
  onScanClick: () => void;
  products: Product[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function ProductListMobile({ onScanClick, products, searchQuery, setSearchQuery }: ProductListMobileProps) {
  const { cart, addToCart, updateCartItemQuantity, removeFromCart } = usePOS();

  const getCartQuantity = (productId: string) => {
    return cart.find((item) => item.productId === productId)?.quantity || 0;
  };

  const handleQuantityChange = (product: Product, newQuantity: number) => {
    if (newQuantity > 0) {
      const cartItem = cart.find(item => item.productId === product.id);
      if (cartItem) {
        updateCartItemQuantity(product.id, newQuantity);
      } else {
        addToCart(product);
        if(newQuantity > 1) {
            updateCartItemQuantity(product.id, newQuantity);
        }
      }
    } else {
      removeFromCart(product.id);
    }
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-2">
        <h1 className="text-2xl font-bold font-headline">Products</h1>
        <Button variant="outline" onClick={onScanClick}>
          <QrCode className="mr-2 h-4 w-4" />
          Scan
        </Button>
      </div>
      <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4"/>
            </Button>
          )}
      </div>
      <div className="space-y-3">
        {products.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No products found.</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search.</p>
          </div>
        )}
        {products.map((product) => {
          const quantity = getCartQuantity(product.id);
          return (
            <div 
              key={product.id} 
              className={cn(
                "flex items-center gap-4 p-2 rounded-lg border bg-card transition-all duration-200",
                quantity > 0 && "border-primary shadow-lg bg-primary/5"
              )}
            >
              <Image
                src={product.imageUrl || 'https://picsum.photos/seed/product/100/100'}
                alt={product.name}
                width={64}
                height={64}
                className="rounded-md object-cover"
                data-ai-hint={product.name.split(' ').slice(0,1).join(' ').toLowerCase()}
              />
              <div className="flex-grow">
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-primary">{product.price.toFixed(2)} DZ</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(product, quantity - 1)}
                    disabled={quantity === 0}
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  className="h-8 w-14 text-center"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(product, parseInt(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                />
                <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-8 w-8"
                    onClick={() => handleQuantityChange(product, quantity + 1)}
                >
                    <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

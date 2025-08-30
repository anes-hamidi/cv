"use client";

import { usePOS } from "@/context/POSContext";
import { ProductCard } from "./ProductCard";

export function ProductGrid() {
  const { products } = usePOS();

  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No products found.</p>
        <p className="text-sm text-muted-foreground">Go to the Products page to add some.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

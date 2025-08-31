
"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { Product } from "@/types";
import { usePOS } from "@/context/POSContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = usePOS();
  
  const aiHint = product.name.split(' ').slice(0, 2).join(' ').toLowerCase();

  return (
    <Card 
      onClick={() => addToCart(product)}
      className="group relative flex aspect-[3/4] cursor-pointer flex-col overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1"
    >
      <Image
        src={product.imageUrl || 'https://picsum.photos/300/400'}
        alt={product.name}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        data-ai-hint={aiHint}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      
      <div className="absolute bottom-2 right-2 translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
        <Button size="sm" variant="secondary" className="bg-white/80 backdrop-blur-sm text-black hover:bg-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Add
        </Button>
      </div>

      <div className="relative mt-auto flex flex-col p-3 text-white">
        <h3 className="text-base font-semibold font-headline truncate">{product.name}</h3>
        <p className="text-lg font-bold">{product.price.toFixed(2)} DZ</p>
      </div>
    </Card>
  );
}

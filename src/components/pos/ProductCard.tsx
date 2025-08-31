"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { Product } from "@/types";
import { usePOS } from "@/context/POSContext";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = usePOS();
  
  const aiHint = product.name.split(' ').slice(0, 2).join(' ').toLowerCase();

  return (
    <Card 
      onClick={() => addToCart(product)}
      className="group relative flex cursor-pointer flex-col overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1"
    >
      <div className="aspect-[3/4] relative overflow-hidden">
        <Image
          src={product.imageUrl || 'https://picsum.photos/300/400'}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint={aiHint}
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute bottom-2 right-2 translate-y-2 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
          <Button size="sm" className="bg-primary/80 backdrop-blur-sm hover:bg-primary">
            <PlusCircle className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
      </div>
      <CardContent className="p-3 flex-grow">
        <h3 className="text-base font-semibold font-headline truncate">{product.name}</h3>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-end">
        <p className="text-lg font-bold text-primary">{product.price.toFixed(2)} DZ</p>
      </CardFooter>
    </Card>
  );
}

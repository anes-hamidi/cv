"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="aspect-video relative">
          <Image
            src={product.imageUrl || 'https://picsum.photos/400/225'}
            alt={product.name}
            fill
            className="object-cover"
            data-ai-hint={aiHint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold font-headline">{product.name}</CardTitle>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="text-xl font-bold text-primary">${product.price.toFixed(2)}</p>
        <Button size="sm" onClick={() => addToCart(product)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add
        </Button>
      </CardFooter>
    </Card>
  );
}

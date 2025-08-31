
"use client";

import { useMemo } from "react";
import type { Product } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PackageWarning } from "lucide-react";

interface StockOverviewProps {
  products: Product[];
}

const LOW_STOCK_THRESHOLD = 10;

export function StockOverview({ products }: StockOverviewProps) {
  const lowStockProducts = useMemo(() => {
    return products
        .filter(p => p.stock <= LOW_STOCK_THRESHOLD)
        .sort((a,b) => a.stock - b.stock);
  }, [products]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Stock Overview</CardTitle>
        <CardDescription>
          Products running low on stock (10 or fewer items).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
            {lowStockProducts.length > 0 ? (
                <div className="space-y-4">
                    {lowStockProducts.map(product => (
                        <div key={product.id} className="flex justify-between items-center">
                            <p className="font-medium">{product.name}</p>
                            <Badge variant={product.stock === 0 ? "destructive" : "secondary"}>
                                {product.stock} left
                            </Badge>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <PackageWarning className="h-10 w-10 mb-4" />
                    <p className="font-semibold">All products are well-stocked.</p>
                </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

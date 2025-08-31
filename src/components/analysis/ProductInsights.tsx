
"use client";

import { useMemo } from "react";
import type { Sale, Product } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ProductInsightsProps {
  sales: Sale[];
  products: Product[];
}

interface ProductMetric {
    id: string;
    name: string;
    quantity: number;
    revenue: number;
    profit: number;
}

export function ProductInsights({ sales, products }: ProductInsightsProps) {
  const productMetrics = useMemo(() => {
    const metricsMap = new Map<string, ProductMetric>();

    sales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            const current = metricsMap.get(item.productId) || {
                id: item.productId,
                name: item.name,
                quantity: 0,
                revenue: 0,
                profit: 0
            };
            const itemRevenue = item.price * item.quantity;
            const itemCost = (product.cost || 0) * item.quantity;
            
            current.quantity += item.quantity;
            current.revenue += itemRevenue;
            current.profit += (itemRevenue - itemCost);

            metricsMap.set(item.productId, current);
        }
      });
    });

    return Array.from(metricsMap.values());
  }, [sales, products]);

  const topSelling = useMemo(() => {
    return [...productMetrics].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  }, [productMetrics]);
  
  const mostProfitable = useMemo(() => {
    return [...productMetrics].sort((a, b) => b.profit - a.profit).slice(0, 5);
  }, [productMetrics]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Insights</CardTitle>
        <CardDescription>
          Analysis of your top performing products.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8">
            <div>
                <h3 className="font-semibold mb-2">Top 5 Selling Products</h3>
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Units Sold</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topSelling.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.name}</TableCell>
                                    <TableCell className="text-right">{p.quantity}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
             <div>
                <h3 className="font-semibold mb-2">Top 5 Most Profitable Products</h3>
                 <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Total Profit</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mostProfitable.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.name}</TableCell>
                                    <TableCell className="text-right text-green-600 font-medium">{p.profit.toFixed(2)} DZ</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}


"use client";

import { usePOS } from "@/context/POSContext";
import { useMemo } from "react";
import { StatCard } from "./StatCard";
import { DollarSign, ShoppingCart, Percent, Package } from "lucide-react";
import { SalesChart } from "./SalesChart";
import { ProductInsights } from "./ProductInsights";
import { StockOverview } from "./StockOverview";

export function AnalysisDashboard() {
  const { sales, products } = usePOS();

  const analysisData = useMemo(() => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    
    let totalCost = 0;
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product && product.cost) {
          totalCost += product.cost * item.quantity;
        }
      });
    });

    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const averageSale = sales.length > 0 ? totalRevenue / sales.length : 0;

    return {
      totalRevenue,
      totalProfit,
      profitMargin,
      averageSale,
      totalSales: sales.length,
    };
  }, [sales, products]);

  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingCart className="h-10 w-10" />
        </div>
        <h3 className="mt-6 text-xl font-semibold">No Sales Data</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          You haven't made any sales yet. Start selling to see your analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue" 
          value={`${analysisData.totalRevenue.toFixed(2)} DZ`} 
          icon={DollarSign} 
          description={`From ${analysisData.totalSales} sales`}
        />
        <StatCard 
          title="Total Profit" 
          value={`${analysisData.totalProfit.toFixed(2)} DZ`} 
          icon={DollarSign}
          iconClassName="text-green-500"
          description="Gross profit from all sales"
        />
        <StatCard 
          title="Profit Margin" 
          value={`${analysisData.profitMargin.toFixed(2)}%`} 
          icon={Percent} 
          description="Gross profit margin"
        />
        <StatCard 
          title="Average Sale" 
          value={`${analysisData.averageSale.toFixed(2)} DZ`} 
          icon={ShoppingCart} 
          description="Average transaction value"
        />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <SalesChart sales={sales} />
        </div>
        <div className="lg:col-span-1">
            <StockOverview products={products} />
        </div>
      </div>
      
      <div>
        <ProductInsights sales={sales} products={products} />
      </div>

    </div>
  );
}

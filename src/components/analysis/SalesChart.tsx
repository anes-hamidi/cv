
"use client"

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, subDays, parseISO } from "date-fns";
import type { Sale } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesChartProps {
  sales: Sale[];
}

export function SalesChart({ sales }: SalesChartProps) {
  const chartData = useMemo(() => {
    const data: { [key: string]: number } = {};
    const today = new Date();

    // Initialize the last 30 days with 0 revenue
    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(today, i), "MMM d");
      data[date] = 0;
    }

    // Populate with actual sales data
    sales.forEach(sale => {
        const saleDate = parseISO(sale.date);
        const diffDays = (today.getTime() - saleDate.getTime()) / (1000 * 3600 * 24);

        if (diffDays < 30) {
            const formattedDate = format(saleDate, "MMM d");
            if (data[formattedDate] !== undefined) {
                data[formattedDate] += sale.total;
            }
        }
    });

    return Object.entries(data).map(([name, total]) => ({ name, total }));
  }, [sales]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                    dataKey="name" 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis 
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value} DZ`}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                  }}
                  cursor={{fill: 'hsl(var(--muted))'}}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

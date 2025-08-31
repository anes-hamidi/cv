
"use client"

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, subDays, parseISO, eachDayOfInterval, startOfWeek, startOfMonth, startOfYear, eachWeekOfInterval, eachMonthOfInterval, formatISO, getYear } from "date-fns";
import type { Sale } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesChartProps {
  sales: Sale[];
  timeRange: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export function SalesChart({ sales, timeRange }: SalesChartProps) {
  const chartData = useMemo(() => {
    const now = new Date();
    let data: { name: string; total: number }[] = [];

    switch(timeRange) {
      case 'daily': {
        const last30Days = eachDayOfInterval({ start: subDays(now, 29), end: now });
        data = last30Days.map(day => ({ name: format(day, "MMM d"), total: 0 }));

        sales.forEach(sale => {
          const saleDateStr = format(parseISO(sale.date), "MMM d");
          const dayData = data.find(d => d.name === saleDateStr);
          if (dayData) {
            dayData.total += sale.total;
          }
        });
        break;
      }
      case 'weekly': {
        const start = startOfWeek(subDays(now, 365)); // a year of weeks
        const weeks = eachWeekOfInterval({ start, end: now });
        data = weeks.map(week => ({ name: format(week, "MMM d"), total: 0 }));

        sales.forEach(sale => {
            const saleWeekStartStr = format(startOfWeek(parseISO(sale.date)), "MMM d");
            const weekData = data.find(d => d.name === saleWeekStartStr);
            if (weekData) {
                weekData.total += sale.total;
            }
        });
        break;
      }
      case 'monthly': {
        const start = startOfYear(now);
        const months = eachMonthOfInterval({ start, end: now });
        data = months.map(month => ({ name: format(month, "MMM"), total: 0 }));
        
        sales.forEach(sale => {
            const saleMonthStr = format(parseISO(sale.date), "MMM");
            const monthData = data.find(d => d.name === saleMonthStr);
            if(monthData) {
                monthData.total += sale.total;
            }
        });
        break;
      }
      case 'yearly': {
          const yearData: { [year: string]: number } = {};
          sales.forEach(sale => {
              const year = getYear(parseISO(sale.date)).toString();
              if(!yearData[year]) yearData[year] = 0;
              yearData[year] += sale.total;
          });
          data = Object.entries(yearData).map(([name, total]) => ({ name, total })).sort((a,b) => parseInt(a.name) - parseInt(b.name));
          break;
      }
    }

    return data;
  }, [sales, timeRange]);

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

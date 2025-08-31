
"use client";

import { usePOS } from "@/context/POSContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SalesHistory() {
  const { sales, customers } = usePOS();

  const customerMap = useMemo(() => {
    return new Map(customers.map(c => [c.id, c.name]));
  }, [customers]);

  const totalSalesCount = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Sales History</h1>
        <p className="text-muted-foreground">Review all past transactions.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} DZ</div>
            <p className="text-xs text-muted-foreground">from {totalSalesCount} sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalSalesCount}</div>
            <p className="text-xs text-muted-foreground">transactions recorded</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">Sale Details</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">No sales recorded yet.</TableCell>
                </TableRow>
            ) : (
                sales.map((sale) => (
                <TableRow key={sale.id}>
                    <TableCell>
                        <div className="font-medium">Sale ID: {sale.id.substring(0, 8)}...</div>
                        <div className="text-sm text-muted-foreground">
                            {new Date(sale.date).toLocaleString()}
                        </div>
                        {sale.customerId && customerMap.has(sale.customerId) && (
                          <Badge variant="outline" className="mt-1">
                            {customerMap.get(sale.customerId)}
                          </Badge>
                        )}
                    </TableCell>
                    <TableCell>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>View {sale.items.length} items</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="list-disc pl-5 text-muted-foreground">
                                        {sale.items.map((item, index) => (
                                            <li key={index}>
                                                {item.name} <Badge variant="secondary">x{item.quantity}</Badge>
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                        {sale.total.toFixed(2)} DZ
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

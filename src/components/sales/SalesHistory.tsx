
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

export function SalesHistory() {
  const { sales, customers } = usePOS();

  const customerMap = useMemo(() => {
    return new Map(customers.map(c => [c.id, c.name]));
  }, [customers]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 font-headline">Sales History</h1>
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


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
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import type { Sale } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function SalesHistory() {
  const { sales, customers, products } = usePOS();
  const { toast } = useToast();

  const customerMap = useMemo(() => {
    return new Map(customers.map(c => [c.id, c.name]));
  }, [customers]);

  const totalSalesCount = sales.length;
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

  const handlePrintReceipt = async (sale: Sale) => {
    
    if (!navigator.bluetooth) {
      console.error("Web Bluetooth API is not available in this browser.");
      toast({
        variant: "destructive",
        title: "Bluetooth Not Supported",
        description: "Your browser or environment does not support or allow Web Bluetooth.",
      });
      return;
    }
    
    toast({
      title: "Printing receipt...",
      description: "Please select your Bluetooth printer from the list.",
    });

    const totalItemsInCart = sale.items.reduce((sum, item) => sum + item.quantity, 0);

    let receiptText = "OfflinePOS Receipt\n";
    receiptText += "----------------------\n";
    receiptText += `Sale ID: ${sale.id.substring(0, 8)}...\n`;
    receiptText += `Date: ${new Date(sale.date).toLocaleString()}\n\n`;
    if (sale.customerId && customerMap.has(sale.customerId)) {
      receiptText += `Customer: ${customerMap.get(sale.customerId)}\n`;
    }
    receiptText += "Items:\n";
    sale.items.forEach(item => {
      const itemTotal = (item.price * item.quantity).toFixed(2);
      receiptText += `${item.name} (x${item.quantity}) - ${itemTotal} DZ\n`;
    });
    receiptText += "----------------------\n";
    receiptText += `Total: ${sale.total.toFixed(2)} DZ\n`;
    receiptText += `Total Items: ${totalItemsInCart}\n`;
    receiptText += "----------------------\n";
    receiptText += "Thank you!\n\n\n";

    try {
      // Request a Bluetooth device. This will trigger a permission prompt in the browser.
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true, // For demo purposes, you should filter this in production by service UUIDs.
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'] // Example service UUID for a thermal printer
      });
      
      if(!device.gatt) {
        toast({
            variant: "destructive",
            title: "Connection Failed",
            description: "Could not connect to the GATT server of the device.",
        });
        return;
      }
      
      toast({ title: `Connecting to ${device.name}...` });

      const server = await device.gatt.connect();
      
      toast({ title: `Connected to ${device.name}. Getting service...` });
      
      // IMPORTANT: Replace with the actual service and characteristic UUIDs
      // for your Bluetooth printer.
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb'); 
      const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

      toast({ title: 'Sending data to printer...'});

      const encoder = new TextEncoder();
      const data = encoder.encode(receiptText);
      
      // Write data in chunks if it's too large for a single write
      const chunkSize = 100; // Adjust chunk size based on your printer's capability
      for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        await characteristic.writeValue(chunk);
      }

      toast({
        title: "Receipt Sent",
        description: "The receipt was sent to the printer.",
      });

    } catch (error) {
      console.error("Bluetooth printing failed:", error);
      if (error instanceof DOMException && error.name === 'NotFoundError') {
        toast({
            variant: "destructive",
            title: "Printing Cancelled",
            description: "No printer was selected.",
        });
      } else if (error instanceof Error && error.message.includes('Permissions-Policy')) {
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "Bluetooth access is disallowed by your browser or the site's permissions policy.",
        });
      }
       else {
         toast({
            variant: "destructive",
            title: "Printing Failed",
            description: "Could not connect to the printer. See console for details.",
         });
      }
    }
  };


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
              <TableHead className="w-2/5">Sale Details</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">No sales recorded yet.</TableCell>
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
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handlePrintReceipt(sale)}>
                            <Printer className="h-4 w-4" />
                            <span className="sr-only">Print Receipt</span>
                        </Button>
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

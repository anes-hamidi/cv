
"use client";

import { usePOS } from "@/context/POSContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { X, ShoppingCart, Trash2, Printer } from "lucide-react";
import type { Sale } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function Cart() {
  const { cart, removeFromCart, updateCartItemQuantity, clearCart, completeSale } = usePOS();
  const { toast } = useToast();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some products before checking out.",
        variant: "destructive"
      });
      return;
    }
    const newSale = completeSale();
    toast({
      title: "Sale Completed!",
      description: `Total: $${newSale.total.toFixed(2)}.`,
      action: (
        <Button variant="outline" size="sm" onClick={() => handlePrintReceipt(newSale)}>
          <Printer className="mr-2 h-4 w-4" />
          Print Receipt
        </Button>
      ),
    });
  };

  const handlePrintReceipt = async (sale: Sale) => {
    toast({
      title: "Printing receipt...",
      description: "Please select your Bluetooth printer.",
    });

    // In a real implementation, you would format this data
    // into a specific format for your printer (e.g., ESC/POS commands).
    let receiptText = "OfflinePOS Receipt\n";
    receiptText += "----------------------\n";
    receiptText += `Sale ID: ${sale.id.substring(0, 8)}...\n`;
    receiptText += `Date: ${new Date(sale.date).toLocaleString()}\n\n`;
    receiptText += "Items:\n";
    sale.items.forEach(item => {
      const itemTotal = (item.price * item.quantity).toFixed(2);
      receiptText += `${item.name} (x${item.quantity}) - $${itemTotal}\n`;
    });
    receiptText += "----------------------\n";
    receiptText += `Total: $${sale.total.toFixed(2)}\n\n`;
    receiptText += "Thank you!\n\n\n";

    if (!navigator.bluetooth) {
      console.error("Web Bluetooth API is not available in this browser.");
      toast({
        variant: "destructive",
        title: "Bluetooth Not Supported",
        description: "Your browser does not support Web Bluetooth.",
      });
      console.log("--- Receipt (for console) ---");
      console.log(receiptText);
      return;
    }

    try {
      // Request a Bluetooth device. You may need to filter by services
      // supported by your specific printer model.
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true, // For demo purposes, you should filter this in production
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'] // Example service UUID for a printer
      });
      
      toast({ title: "Connecting to device..." });

      const server = await device.gatt?.connect();
      
      // IMPORTANT: Replace with the actual service and characteristic UUIDs
      // for your Bluetooth printer.
      const service = await server?.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb'); 
      const characteristic = await service?.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

      const encoder = new TextEncoder();
      const data = encoder.encode(receiptText);
      
      await characteristic?.writeValue(data);

      toast({
        title: "Receipt Sent",
        description: "The receipt was sent to the printer.",
      });

    } catch (error) {
      console.error("Bluetooth printing failed:", error);
      toast({
        variant: "destructive",
        title: "Printing Failed",
        description: "Could not connect to the printer. See console for details.",
      });
    }
  };


  return (
    <Card className="flex flex-col flex-1 shadow-none border-0">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <CardTitle className="font-headline text-xl flex items-center"><ShoppingCart className="mr-3 h-6 w-6 text-primary"/>Current Sale</CardTitle>
        {cart.length > 0 && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearCart}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Clear Cart</span>
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <ScrollArea className="h-full pr-4 -mr-4">
          {cart.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground p-8">
                <ShoppingCart className="mx-auto h-12 w-12 mb-4" />
                <p>Your cart is empty.</p>
                <p className="text-sm">Select products to get started.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center justify-between gap-2">
                  <div className="flex-grow overflow-hidden">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateCartItemQuantity(item.productId, parseInt(e.target.value) || 1)}
                      className="h-8 w-14 text-center"
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeFromCart(item.productId)}>
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      {cart.length > 0 && (
        <CardFooter className="flex-col p-4 pt-0 border-t mt-auto">
           <div className="w-full py-4 space-y-2 text-sm">
             <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${total.toFixed(2)}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-muted-foreground">Taxes</span>
                <span>$0.00</span>
             </div>
           </div>
          <Separator />
          <div className="w-full flex justify-between items-center text-lg font-bold py-4">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <Button className="w-full text-lg h-12 bg-primary hover:bg-primary/90" onClick={handleCheckout}>
            Checkout
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

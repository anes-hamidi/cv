
"use client";

import { usePOS } from "@/context/POSContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { X, ShoppingCart, Trash2 } from "lucide-react";
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
          Print Receipt
        </Button>
      ),
    });
  };

  const handlePrintReceipt = (sale: Sale) => {
    console.log("--- Printing Receipt ---");
    console.log("OfflinePOS Receipt");
    console.log("----------------------");
    console.log(`Sale ID: ${sale.id}`);
    console.log(`Date: ${new Date(sale.date).toLocaleString()}`);
    console.log("\nItems:");
    sale.items.forEach(item => {
      console.log(`${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`);
    });
    console.log("----------------------");
    console.log(`Total: $${sale.total.toFixed(2)}`);
    console.log("\nThank you!");
    console.log("--- End of Receipt ---");

    toast({
      title: "Receipt sent to console",
      description: "Bluetooth printer integration required for physical printing.",
    });
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

    
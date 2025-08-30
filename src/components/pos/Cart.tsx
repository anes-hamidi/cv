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

    // NOTE: Real Bluetooth printing logic would go here.
    // This requires using the Web Bluetooth API, which is complex and requires user permissions.
    // The following is a commented-out example:
    /*
    async function print() {
      if (!navigator.bluetooth) {
        alert("Web Bluetooth API is not available.");
        return;
      }
      try {
        const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
        // ... connect and send data to printer
      } catch(error) {
        console.error("Bluetooth error:", error);
      }
    }
    print();
    */
  };

  return (
    <Card className="sticky top-20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline flex items-center"><ShoppingCart className="mr-2"/>Cart</CardTitle>
        {cart.length > 0 && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearCart}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Clear Cart</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          {cart.length === 0 ? (
            <p className="text-muted-foreground text-center">Your cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center justify-between">
                  <div className="flex-grow">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateCartItemQuantity(item.productId, parseInt(e.target.value) || 1)}
                      className="h-8 w-16 text-center"
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFromCart(item.productId)}>
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
        <CardFooter className="flex-col">
          <Separator className="my-4" />
          <div className="w-full flex justify-between items-center text-lg font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <Button className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleCheckout}>
            Checkout
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

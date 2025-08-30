"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePOS } from "@/context/POSContext";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";

interface QRCodeScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRCodeScannerDialog({ open, onOpenChange }: QRCodeScannerDialogProps) {
  const { products, addToCart } = usePOS();
  const { toast } = useToast();

  const handleSimulatedScan = () => {
    if (products.length === 0) {
      toast({
        title: "No products available",
        description: "Cannot simulate scan without products.",
        variant: "destructive"
      });
      return;
    }
    // In a real app, you would use a library like jsQR to decode the video stream.
    // The result of the scan would be a product ID.
    // For this simulation, we'll just pick a random product.
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    addToCart(randomProduct);
    toast({
      title: "Product Added",
      description: `${randomProduct.name} was added to the cart.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Scan QR Code</DialogTitle>
          <DialogDescription>
            Point your camera at a product's QR code to add it to the cart.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="aspect-video bg-secondary rounded-md flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Camera className="mx-auto h-12 w-12" />
              <p className="mt-2">Camera feed would appear here.</p>
              <p className="text-xs">(Integration with `navigator.mediaDevices` needed)</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <strong>Note:</strong> This is a simulation. A real implementation would require camera access and a QR code decoding library.
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={handleSimulatedScan}>Simulate Scan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

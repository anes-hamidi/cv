
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
import { useEffect, useRef, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface QRCodeScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRCodeScannerDialog({ open, onOpenChange }: QRCodeScannerDialogProps) {
  const { products, addToCart } = usePOS();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (open) {
      const getCameraPermission = async () => {
        try {
          // Check for permissions first
          const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (permissionStatus.state === 'denied') {
            setHasCameraPermission(false);
            return;
          }

          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
        }
      };

      getCameraPermission();

      return () => {
        // Stop camera stream when dialog is closed
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  }, [open]);

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
          <div className="aspect-video bg-secondary rounded-md flex items-center justify-center overflow-hidden">
             {hasCameraPermission === null ? (
                <div className="text-center text-muted-foreground">
                    <p>Requesting camera access...</p>
                </div>
             ) : (
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
             )}
          </div>

          {hasCameraPermission === false && (
             <Alert variant="destructive" className="mt-4">
              <AlertTitle>Camera Access Denied</AlertTitle>
              <AlertDescription>
                Please enable camera permissions in your browser settings to use this feature.
              </AlertDescription>
            </Alert>
          )}

          <p className="text-xs text-muted-foreground mt-2">
            <strong>Note:</strong> Scanning is simulated. A real implementation would require a QR code decoding library.
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

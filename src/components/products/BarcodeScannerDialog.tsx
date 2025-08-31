
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
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface BarcodeScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (barcode: string) => void;
  children?: React.ReactNode;
}

export function BarcodeScannerDialog({ open, onOpenChange, onScan, children }: BarcodeScannerDialogProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (open) {
      const getCameraPermission = async () => {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
          if (permissionStatus.state === 'denied') {
            setHasCameraPermission(false);
            return;
          }

          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
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
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
      };
    }
  }, [open]);

  const handleSimulatedScan = () => {
    // In a real app, you would use a library to decode the video stream.
    // The result of the scan would be a barcode string.
    // For this simulation, we'll just generate a random barcode number.
    const randomBarcode = Math.random().toString().slice(2, 14);
    onScan(randomBarcode);
    toast({
      title: "Barcode Scanned",
      description: `Scanned value: ${randomBarcode}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Scan Barcode</DialogTitle>
          <DialogDescription>
            Point your camera at a product's barcode to capture it.
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
            <strong>Note:</strong> Scanning is simulated. A real implementation would use a library to decode the barcode from the camera stream.
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

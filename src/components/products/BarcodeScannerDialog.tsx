
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
import { useEffect, useRef, useState, useCallback } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import type jsQR from "jsqr";

interface BarcodeScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (barcode: string) => void;
  children?: React.ReactNode;
}

export function BarcodeScannerDialog({ open, onOpenChange, onScan, children }: BarcodeScannerDialogProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const jsqr = useRef<typeof jsQR | null>(null);

  useEffect(() => {
    import("jsqr").then(module => {
      jsqr.current = module.default;
    });
  }, []);


  const handleScan = useCallback((code: string) => {
    onScan(code);
    onOpenChange(false);
  }, [onScan, onOpenChange]);

  useEffect(() => {
    let animationFrameId: number | null = null;

    const tick = () => {
      if (jsqr.current && videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsqr.current(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            setIsScanning(false);
            handleScan(code.data);
          }
        }
      }
      if (isScanning) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    if (open && isScanning) {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [open, isScanning, handleScan]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (open) {
      setIsScanning(false); // Reset scanning state
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
             videoRef.current.addEventListener('loadeddata', () => {
                setIsScanning(true);
            });
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
        }
      };

      getCameraPermission();

      return () => {
        setIsScanning(false);
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };
    }
  }, [open]);

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
           <canvas ref={canvasRef} style={{ display: 'none' }} />

          {hasCameraPermission === false && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Camera Access Denied</AlertTitle>
              <AlertDescription>
                Please enable camera permissions in your browser settings to use this feature.
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
           <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

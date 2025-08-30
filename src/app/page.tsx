"use client";

import { Button } from "@/components/ui/button";
import { Cart } from "@/components/pos/Cart";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { QrCode } from "lucide-react";
import { AIRecommender } from "@/components/pos/AIRecommender";
import { QRCodeScannerDialog } from "@/components/pos/QRCodeScannerDialog";
import { useState } from "react";

export default function Home() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold font-headline">Products</h1>
            <QRCodeScannerDialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
              <Button variant="outline" onClick={() => setIsScannerOpen(true)}>
                <QrCode className="mr-2 h-4 w-4" />
                Scan QR Code
              </Button>
            </QRCodeScannerDialog>
          </div>
          <ProductGrid />
        </div>
        <div className="space-y-6">
          <Cart />
          <AIRecommender />
        </div>
      </div>
    </div>
  );
}

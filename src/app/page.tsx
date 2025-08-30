
"use client";

import { Button } from "@/components/ui/button";
import { Cart } from "@/components/pos/Cart";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { QrCode } from "lucide-react";
import { AIRecommender } from "@/components/pos/AIRecommender";
import { QRCodeScannerDialog } from "@/components/pos/QRCodeScannerDialog";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-3.5rem)]">
      {/* Main Content - Product Grid */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold font-headline">Products</h1>
          <QRCodeScannerDialog
            open={isScannerOpen}
            onOpenChange={setIsScannerOpen}
          >
            <Button variant="outline" onClick={() => setIsScannerOpen(true)}>
              <QrCode className="mr-2 h-4 w-4" />
              Scan QR Code
            </Button>
          </QRCodeScannerDialog>
        </div>
        <ProductGrid />
      </main>

      {/* Right Sidebar - Cart & Checkout */}
      <aside className="w-full md:w-[350px] lg:w-[400px] border-l bg-background flex flex-col">
        <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
          <h2 className="text-xl font-semibold font-headline">Cart & Checkout</h2>
          <Cart />
          <AIRecommender />
        </div>
      </aside>
    </div>
  );
}

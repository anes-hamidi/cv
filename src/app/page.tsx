
"use client";

import { Button } from "@/components/ui/button";
import { Cart } from "@/components/pos/Cart";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { QrCode } from "lucide-react";
import { AIRecommender } from "@/components/pos/AIRecommender";
import { QRCodeScannerDialog } from "@/components/pos/QRCodeScannerDialog";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProductListMobile } from "@/components/pos/ProductListMobile";

export default function Home() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div className="md:col-span-2">
          <ProductListMobile onScanClick={() => setIsScannerOpen(true)} />
        </div>
        <div className="md:col-span-1">
          <div className="space-y-4">
            <Cart />
            <AIRecommender />
          </div>
        </div>
        <QRCodeScannerDialog
          open={isScannerOpen}
          onOpenChange={setIsScannerOpen}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-0 h-[calc(100vh-3.5rem)] bg-muted/20">
      {/* Main Content - Product Grid */}
      <main className="lg:col-span-2 xl:col-span-3 flex flex-col">
        <div className="p-4 md:p-6 flex justify-between items-center bg-background border-b">
          <h1 className="text-2xl font-bold font-headline">Products</h1>
          <QRCodeScannerDialog
            open={isScannerOpen}
            onOpenChange={setIsScannerOpen}
          >
            <Button variant="outline" onClick={() => setIsScannerOpen(true)}>
              <QrCode className="mr-2 h-4 w-4" />
              Scan Product
            </Button>
          </QRCodeScannerDialog>
        </div>
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <ProductGrid />
        </div>
      </main>

      {/* Right Sidebar - Cart & Checkout */}
      <aside className="lg:col-span-1 xl:col-span-1 bg-background border-l flex flex-col">
        <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
          <Cart />
          <AIRecommender />
        </div>
      </aside>
    </div>
  );
}

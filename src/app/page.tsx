"use client";

import { Button } from "@/components/ui/button";
import { Cart } from "@/components/pos/Cart";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { QrCode } from "lucide-react";
import { AIRecommender } from "@/components/pos/AIRecommender";
import { QRCodeScannerDialog } from "@/components/pos/QRCodeScannerDialog";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Home() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <SidebarProvider>
        <div className="flex">
          <SidebarInset>
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="md:hidden" />
                  <h1 className="text-2xl font-bold font-headline">Products</h1>
                </div>
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
            </div>
          </SidebarInset>
          <Sidebar side="right" variant="sidebar" collapsible="icon">
            <SidebarHeader>
                <h2 className="text-xl font-semibold font-headline">Cart & Checkout</h2>
            </SidebarHeader>
            <SidebarContent className="p-2 flex flex-col gap-4">
                <Cart />
                <AIRecommender />
            </SidebarContent>
          </Sidebar>
        </div>
    </SidebarProvider>
  );
}

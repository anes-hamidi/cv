
"use client";

import { Button } from "@/components/ui/button";
import { Cart } from "@/components/pos/Cart";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { QrCode, Boxes, ShoppingBag, Search, Users, UserPlus, X } from "lucide-react";
import { AIRecommender } from "@/components/pos/AIRecommender";
import { QRCodeScannerDialog } from "@/components/pos/QRCodeScannerDialog";
import { useState, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProductListMobile } from "@/components/pos/ProductListMobile";
import { usePOS } from "@/context/POSContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CustomerForm } from "@/components/customers/CustomerForm";
import { useToast } from "@/hooks/use-toast";
import type { Customer } from "@/types";

export default function Home() {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  const { cart, products, customers, selectedCustomer, setSelectedCustomer, addOrUpdateCustomer } = usePOS();
  const { toast } = useToast();

  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);

  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalProducts = products.length;

  const filteredProducts = useMemo(() => {
    if (!searchQuery) {
      return products;
    }
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const handleCustomerSelect = (customerId: string) => {
    if (customerId === "new") {
      setIsCustomerFormOpen(true);
    } else {
      const customer = customers.find(c => c.id === customerId);
      setSelectedCustomer(customer || null);
    }
  };

  const handleNewCustomerSubmit = (data: Omit<Customer, 'id'>) => {
    const newCustomer = { ...data, id: new Date().toISOString() };
    addOrUpdateCustomer(newCustomer);
    setSelectedCustomer(newCustomer);
    toast({
      title: "Customer Created",
      description: `${newCustomer.name} has been created and selected.`
    });
    setIsCustomerFormOpen(false);
  };

  const CustomerSelector = () => (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Select
          value={selectedCustomer?.id || ""}
          onValueChange={handleCustomerSelect}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Select a customer..." />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">
              <div className="flex items-center">
                <UserPlus className="mr-2 h-4 w-4" />
                Create New Customer
              </div>
            </SelectItem>
            {customers.map((customer) => (
              <SelectItem key={customer.id} value={customer.id}>
                {customer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {selectedCustomer && (
        <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(null)}>
          <X className="h-4 w-4" />
        </Button>
      )}
       <Dialog open={isCustomerFormOpen} onOpenChange={setIsCustomerFormOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Customer</DialogTitle>
                </DialogHeader>
                <CustomerForm onSubmit={handleNewCustomerSubmit} onClose={() => setIsCustomerFormOpen(false)} />
            </DialogContent>
        </Dialog>
    </div>
  );

  const Counters = () => (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4 flex items-center">
        <ShoppingBag className="h-6 w-6 mr-4 text-primary" />
        <div>
          <p className="text-2xl font-bold">{totalItemsInCart}</p>
          <p className="text-sm text-muted-foreground">Items in Cart</p>
        </div>
      </Card>
      <Card className="p-4 flex items-center">
        <Boxes className="h-6 w-6 mr-4 text-accent" />
        <div>
          <p className="text-2xl font-bold">{totalProducts}</p>
          <p className="text-sm text-muted-foreground">Total Products</p>
        </div>
      </Card>
    </div>
  );

  if (isMobile) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        <div className="md:col-span-2 space-y-4">
          <Counters />
          <CustomerSelector />
          <ProductListMobile 
            onScanClick={() => setIsScannerOpen(true)}
            products={filteredProducts}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
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
        <div className="p-4 md:p-6 flex flex-wrap gap-4 justify-between items-center bg-background border-b">
          <h1 className="text-2xl font-bold font-headline">Products</h1>
          <div className="flex-1 min-w-[200px] max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
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
          <div className="mb-6">
            <Counters />
          </div>
          <ProductGrid products={filteredProducts} />
        </div>
      </main>

      {/* Right Sidebar - Cart & Checkout */}
      <aside className="lg:col-span-1 xl:col-span-1 bg-background border-l flex flex-col">
        <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="space-y-2">
            <h3 className="font-semibold font-headline text-lg">Customer</h3>
            <CustomerSelector />
          </div>
          <Cart />
          <AIRecommender />
        </div>
      </aside>
    </div>
  );
}

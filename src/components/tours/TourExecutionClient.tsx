
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePOS } from "@/context/POSContext";
import { Cart } from "@/components/pos/Cart";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MapPin,
  Phone,
  Play,
  Flag,
  ArrowLeft,
  ShoppingBag,
  Search,
  CheckCircle,
} from "lucide-react";
import type { Customer } from "@/types";
import { Input } from "@/components/ui/input";
import { AIRecommender } from "@/components/pos/AIRecommender";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";

interface TourExecutionClientProps {
  tourId: string;
}

export function TourExecutionClient({ tourId }: TourExecutionClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { tours, circuits, customers, addOrUpdateTour, products, clearCart, cart } = usePOS();
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const tour = useMemo(() => tours.find(t => t.id === tourId), [tours, tourId]);
  
  const circuit = useMemo(() => {
    if (!tour) return null;
    return circuits.find(c => c.id === tour.circuitId);
  }, [circuits, tour]);

  const tourCustomers = useMemo(() => {
    if (!circuit) return [];
    return customers.filter(c => c.circuitId === circuit.id);
  }, [customers, circuit]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  if (!tour || !circuit) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Tour Not Found</h2>
          <p className="text-muted-foreground">The requested tour could not be found.</p>
          <Button onClick={() => router.push('/tours')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tours
          </Button>
        </div>
      </div>
    );
  }

  const handleSelectCustomer = (customer: Customer) => {
    if (cart.length > 0) {
        toast({
            title: "Unsaved Sale",
            description: "Please complete or clear the current sale before switching customers.",
            variant: "destructive",
        })
        return;
    }
    setSelectedCustomer(customer);
  }

  const startTour = () => {
    addOrUpdateTour({ ...tour, status: 'in-progress' });
    toast({ title: "Tour Started!", description: `You are now on the ${circuit.name} tour.` });
  };

  const completeTour = () => {
    addOrUpdateTour({ ...tour, status: 'completed' });
    toast({ title: "Tour Completed!", description: `Congratulations on finishing the ${circuit.name} tour.` });
    router.push('/tours');
  };

  const CustomerListSidebar = () => (
    <aside className="lg:col-span-1 xl:col-span-1 bg-background border-r flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center">
            <Users className="mr-3 h-6 w-6 text-primary"/>
            {circuit.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground pt-1">
            {tourCustomers.length} customer(s) in this circuit.
          </p>
        </CardHeader>
        <ScrollArea className="flex-1">
            <div className="p-4 pt-0 space-y-2">
                {tourCustomers.map(customer => (
                    <Card 
                        key={customer.id} 
                        className={`p-3 cursor-pointer transition-all ${selectedCustomer?.id === customer.id ? 'border-primary ring-2 ring-primary' : 'hover:bg-muted/50'}`}
                        onClick={() => handleSelectCustomer(customer)}
                    >
                        <p className="font-semibold">{customer.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4" /> {customer.address}, {customer.municipality}
                        </p>
                    </Card>
                ))}
            </div>
        </ScrollArea>
        <div className="p-4 border-t">
          {tour.status === 'planned' && (
            <Button className="w-full" onClick={startTour}>
              <Play className="mr-2 h-4 w-4" /> Start Tour
            </Button>
          )}
           {tour.status === 'in-progress' && (
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button className="w-full" variant="secondary">
                        <Flag className="mr-2 h-4 w-4" /> Complete Tour
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to complete this tour?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will mark the tour as completed. You will not be able to make further sales on this tour.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={completeTour}>Complete Tour</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          )}
           {tour.status === 'completed' && (
            <Button className="w-full" disabled>
              <CheckCircle className="mr-2 h-4 w-4" /> Tour Completed
            </Button>
          )}
        </div>
    </aside>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-0 h-full bg-muted/20">
      <CustomerListSidebar />
      
      {/* Main Content */}
      <main className="lg:col-span-2 xl:col-span-2 flex flex-col">
        {selectedCustomer ? (
           <>
             <div className="p-4 md:p-6 flex-wrap gap-4 justify-between items-center bg-background border-b">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold font-headline">{selectedCustomer.name}</h1>
                        <p className="text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4"/>{selectedCustomer.phone || 'No phone number'}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedCustomer(null); clearCart(); }}>Switch Customer</Button>
                </div>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <ProductGrid products={filteredProducts} />
            </div>
           </>
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Users className="h-16 w-16 mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold font-headline">Select a Customer</h2>
                <p className="text-muted-foreground">Choose a customer from the list to start a sale.</p>
            </div>
        )}
      </main>

      {/* Right Sidebar - Cart */}
      <aside className="lg:col-span-1 xl:col-span-1 bg-background border-l flex flex-col">
        <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto">
            {selectedCustomer ? (
                <>
                    <Cart />
                    <AIRecommender />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <ShoppingBag className="h-16 w-16 mb-4 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">No Active Sale</h2>
                    <p className="text-muted-foreground">Select a customer to view their cart.</p>
                </div>
            )}
        </div>
      </aside>
    </div>
  );
}

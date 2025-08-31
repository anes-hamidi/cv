
"use client";

import { useState, useCallback } from "react";
import { usePOS } from "@/context/POSContext";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

import { CustomerForm } from "./CustomerForm";
import type { Customer, PriceLevel } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const priceLevelLabels: Record<PriceLevel, string> = {
  retail: "Retail",
  semiwholesale: "Semi-Wholesale",
  wholesale: "Wholesale",
};

export function CustomerList() {
  const { customers, addOrUpdateCustomer, deleteCustomer } = usePOS();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(undefined);
  const { toast } = useToast();


  const handleFormSubmit = useCallback((data: Omit<Customer, 'id' | 'sales'>) => {
    const customerData = {
      ...data,
      id: editingCustomer?.id || new Date().toISOString(),
    } as Customer;
    addOrUpdateCustomer(customerData);
    toast({
      title: `Customer ${editingCustomer ? 'updated' : 'created'}`,
      description: `${data.name} has been saved.`,
    });
    setIsFormOpen(false);
    setEditingCustomer(undefined);
  }, [addOrUpdateCustomer, editingCustomer, toast]);
  
  const openEditDialog = useCallback((customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  }, []);
  
  const openNewDialog = useCallback(() => {
    setEditingCustomer(undefined);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((customerId: string) => {
    deleteCustomer(customerId);
    toast({
        title: "Customer Deleted",
        description: "The customer has been successfully deleted.",
        variant: "destructive"
    })
  }, [deleteCustomer, toast]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold font-headline">Manage Customers</h1>
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) {
            setEditingCustomer(undefined);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-headline">
                {editingCustomer ? "Edit Customer" : "Add New Customer"}
              </DialogTitle>
            </DialogHeader>
            <CustomerForm
              customer={editingCustomer}
              onSubmit={handleFormSubmit}
              onClose={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Municipality</TableHead>
              <TableHead>Price Level</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">No customers found.</TableCell>
                </TableRow>
            ) : (
                customers.map((customer) => (
                <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.address}</TableCell>
                    <TableCell>{customer.municipality}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{priceLevelLabels[customer.priceLevel]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(customer)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the customer "{customer.name}".
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(customer.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

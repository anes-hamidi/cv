
"use client";

import { useState } from "react";
import Image from "next/image";
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

import { ProductForm } from "./ProductForm";
import type { Product } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "../ui/scroll-area";

export function ProductList() {
  const { products, addOrUpdateProduct, deleteProduct } = usePOS();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const { toast } = useToast();

  const handleFormSubmit = (data: Product) => {
    addOrUpdateProduct(data);
    toast({
      title: `Product ${editingProduct ? 'updated' : 'created'}`,
      description: `${data.name} has been saved.`,
    });
    setIsFormOpen(false);
    setEditingProduct(undefined);
  };
  
  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  }
  
  const openNewDialog = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold font-headline">Manage Products</h1>
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) {
            setEditingProduct(undefined);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-headline">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[80vh] p-4">
                <ProductForm
                product={editingProduct}
                onSubmit={handleFormSubmit}
                onClose={() => setIsFormOpen(false)}
                />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price (Retail)</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">No products found.</TableCell>
                </TableRow>
            ) : (
                products.map((product) => (
                <TableRow key={product.id}>
                    <TableCell>
                    <Image
                        src={product.imageUrl || 'https://picsum.photos/50/50'}
                        alt={product.name}
                        width={50}
                        height={50}
                        className="rounded-md object-cover"
                        data-ai-hint={product.name.split(' ').slice(0,1).join(' ').toLowerCase()}
                    />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category || 'N/A'}</TableCell>
                    <TableCell>{(product.priceLevels?.retail ?? product.price).toFixed(2)} DZ</TableCell>
                    <TableCell>
                      {product.stock > 0 ? (
                        <Badge variant={product.stock < 10 ? "destructive" : "secondary"}>{product.stock} in stock</Badge>
                      ) : (
                        <Badge variant="destructive">Out of stock</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
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
                                This action cannot be undone. This will permanently delete the product "{product.name}".
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteProduct(product.id)}>Continue</AlertDialogAction>
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

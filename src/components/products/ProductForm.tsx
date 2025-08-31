"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  price: z.coerce.number().min(0.01, "Price must be greater than 0."),
  stock: z.coerce.number().min(0, "Stock can't be negative."),
  imageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
});

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: Product) => void;
  onClose: () => void;
}

export function ProductForm({ product, onSubmit, onClose }: ProductFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || "",
      price: product?.price || 0,
      stock: product?.stock || 0,
      imageUrl: product?.imageUrl || "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      ...values,
      id: product?.id || new Date().toISOString(),
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Espresso" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-4">
            <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
                <FormItem className="flex-1">
                <FormLabel>Price</FormLabel>
                <FormControl>
                    <Input type="number" step="0.01" placeholder="e.g., 2.50" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
                <FormItem className="flex-1">
                <FormLabel>Stock</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="e.g., 100" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://picsum.photos/400/225" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{product ? "Save Changes" : "Create Product"}</Button>
        </div>
      </form>
    </Form>
  );
}

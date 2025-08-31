
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types";
import { BarcodeScannerDialog } from "@/components/products/BarcodeScannerDialog";
import { useState } from "react";
import { Barcode, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { usePOS } from "@/context/POSContext";


const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  category: z.string().optional(),
  packaging: z.string().optional(),
  cost: z.coerce.number().min(0, "Cost can't be negative."),
  priceLevels: z.object({
    retail: z.coerce.number().min(0.01, "Price must be greater than 0."),
    semiwholesale: z.coerce.number().min(0.01, "Price must be greater than 0."),
    wholesale: z.coerce.number().min(0.01, "Price must be greater than 0."),
  }),
  stock: z.coerce.number().min(0, "Stock can't be negative."),
  imageUrl: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  barcode: z.string().optional(),
}).refine(data => data.priceLevels.retail >= (data.cost || 0), {
  message: "Retail price must be greater than or equal to cost.",
  path: ["priceLevels.retail"],
}).refine(data => data.priceLevels.semiwholesale >= (data.cost || 0), {
    message: "Semi-wholesale price must be greater than or equal to cost.",
    path: ["priceLevels.semiwholesale"],
}).refine(data => data.priceLevels.wholesale >= (data.cost || 0), {
    message: "Wholesale price must be greater than or equal to cost.",
    path: ["priceLevels.wholesale"],
});

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: Product) => void;
  onClose: () => void;
}

const ComboboxFormField = ({
    form,
    name,
    label,
    placeholder,
    options,
    ...props
}: {
    form: any,
    name: "category" | "packaging",
    label: string,
    placeholder: string,
    options: { value: string; label: string }[]
}) => {
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState(form.getValues(name) || "")

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex-1">
                    <FormLabel>{label}</FormLabel>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {field.value
                                        ? options.find(
                                            (option) => option.value.toLowerCase() === field.value.toLowerCase()
                                        )?.label
                                        : `Select ${label.toLowerCase()}`}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                                <CommandInput 
                                    placeholder={`Search or create ${label.toLowerCase()}...`}
                                    value={inputValue}
                                    onValueChange={setInputValue}
                                />
                                <CommandList>
                                    <CommandEmpty>
                                      <Button variant="ghost" className="w-full" onMouseDown={() => {
                                        form.setValue(name, inputValue);
                                        setOpen(false);
                                      }}>
                                        Create "{inputValue}"
                                      </Button>
                                    </CommandEmpty>
                                    <CommandGroup>
                                        {options.map((option) => (
                                            <CommandItem
                                                value={option.label}
                                                key={option.value}
                                                onSelect={() => {
                                                    form.setValue(name, option.value)
                                                    setOpen(false)
                                                }}
                                            >
                                                {option.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

export function ProductForm({ product, onSubmit, onClose }: ProductFormProps) {
  const { products } = usePOS();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const defaultPriceLevels = {
    retail: 0,
    semiwholesale: 0,
    wholesale: 0,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || "",
      category: product?.category || "",
      packaging: product?.packaging || "",
      cost: product?.cost || 0,
      priceLevels: product?.priceLevels || defaultPriceLevels,
      stock: product?.stock || 0,
      imageUrl: product?.imageUrl || "",
      barcode: product?.barcode || "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      ...values,
      id: product?.id || new Date().toISOString(),
      price: values.priceLevels.retail,
    });
  };

  const handleBarcodeScanned = (barcode: string) => {
    form.setValue('barcode', barcode);
    setIsScannerOpen(false);
  }

  const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean) as string[])]
    .map(c => ({ value: c, label: c }));

  const uniquePackagings = [...new Set(products.map(p => p.packaging).filter(Boolean) as string[])]
    .map(p => ({ value: p, label: p }));

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
            <ComboboxFormField
                form={form}
                name="category"
                label="Category"
                placeholder="Select category"
                options={uniqueCategories}
            />
            <ComboboxFormField
                form={form}
                name="packaging"
                label="Packaging"
                placeholder="Select packaging"
                options={uniquePackagings}
            />
        </div>

        <div className="flex gap-4">
            <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                    <FormItem className="flex-1">
                        <FormLabel>Cost</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" placeholder="e.g., 1.00" {...field} />
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
        
        <div>
            <FormLabel>Price Levels</FormLabel>
            <FormDescription>Set the different prices for this product.</FormDescription>
            <div className="grid grid-cols-3 gap-4 mt-2">
                <FormField
                    control={form.control}
                    name="priceLevels.retail"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-normal text-muted-foreground">Retail</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" placeholder="e.g., 2.50" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="priceLevels.semiwholesale"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-normal text-muted-foreground">Semi-Wholesale</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" placeholder="e.g., 2.20" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="priceLevels.wholesale"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-normal text-muted-foreground">Wholesale</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" placeholder="e.g., 2.00" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>

        <FormField
          control={form.control}
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Barcode</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="e.g., 123456789012" {...field} />
                </FormControl>
                <BarcodeScannerDialog
                  open={isScannerOpen}
                  onOpenChange={setIsScannerOpen}
                  onScan={handleBarcodeScanned}
                >
                  <Button type="button" variant="outline" onClick={() => setIsScannerOpen(true)}>
                    <Barcode className="mr-2 h-4 w-4" />
                    Scan
                  </Button>
                </BarcodeScannerDialog>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
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

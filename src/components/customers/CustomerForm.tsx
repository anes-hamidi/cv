
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
import type { Customer } from "@/types";
import { usePOS } from "@/context/POSContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  address: z.string().min(5, "Address must be at least 5 characters."),
  municipality: z.string().min(2, "Municipality is required."),
  phone: z.string().optional(),
  circuitId: z.string().optional(),
});

type CustomerFormData = z.infer<typeof formSchema>;

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerFormData) => void;
  onClose: () => void;
}

export function CustomerForm({ customer, onSubmit, onClose }: CustomerFormProps) {
  const { circuits } = usePOS();

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: customer?.name || "",
      address: customer?.address || "",
      municipality: customer?.municipality || "",
      phone: customer?.phone || "",
      circuitId: customer?.circuitId || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 123 Main St" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <div className="flex gap-4">
            <FormField
                control={form.control}
                name="municipality"
                render={({ field }) => (
                    <FormItem className="flex-1">
                    <FormLabel>Municipality</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Springfield" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem className="flex-1">
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., 555-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
             />
        </div>
        <FormField
          control={form.control}
          name="circuitId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Circuit (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Assign to a circuit" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {circuits.map(circuit => (
                            <SelectItem key={circuit.id} value={circuit.id}>{circuit.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{customer ? "Save Changes" : "Create Customer"}</Button>
        </div>
      </form>
    </Form>
  );
}

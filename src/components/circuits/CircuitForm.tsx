
"use client";

import { useForm, useFieldArray } from "react-hook-form";
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
import type { Circuit } from "@/types";
import { PlusCircle, Trash2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  municipalities: z.array(z.object({ value: z.string().min(1, "Municipality cannot be empty.") })).min(1, "At least one municipality is required."),
});

type CircuitFormData = z.infer<typeof formSchema>;

interface CircuitFormProps {
  circuit?: Circuit;
  onSubmit: (data: {name: string, municipalities: string[]}) => void;
  onClose: () => void;
}

export function CircuitForm({ circuit, onSubmit, onClose }: CircuitFormProps) {
  const form = useForm<CircuitFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: circuit?.name || "",
      municipalities: circuit?.municipalities.map(m => ({ value: m })) || [{value: ""}],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "municipalities"
  });

  const handleFormSubmit = (values: CircuitFormData) => {
    onSubmit({
        name: values.name,
        municipalities: values.municipalities.map(m => m.value),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Circuit Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., North Route" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
            <FormLabel>Municipalities</FormLabel>
            <div className="space-y-2 mt-2">
                {fields.map((field, index) => (
                    <FormField
                        key={field.id}
                        control={form.control}
                        name={`municipalities.${index}.value`}
                        render={({field}) => (
                            <FormItem>
                                <div className="flex items-center gap-2">
                                    <FormControl>
                                        <Input {...field} placeholder="Enter a municipality name"/>
                                    </FormControl>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ))}
            </div>
            <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({value: ""})}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Municipality
            </Button>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{circuit ? "Save Changes" : "Create Circuit"}</Button>
        </div>
      </form>
    </Form>
  );
}

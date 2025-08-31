
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
import type { Circuit } from "@/types";
import { allMunicipalities } from "@/lib/algeria-localities";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, PlusCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import React from "react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  municipalities: z.array(z.string()).min(1, "At least one municipality is required."),
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
      municipalities: circuit?.municipalities || [],
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
              <FormLabel>Circuit Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., North Route" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="municipalities"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Municipalities</FormLabel>
                <Popover>
                    <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                    "w-full justify-between h-auto min-h-10",
                                    !field.value?.length && "text-muted-foreground"
                                )}
                            >
                                <div className="flex gap-1 flex-wrap">
                                    {field.value.length > 0 ? field.value.map((m) => (
                                        <Badge variant="secondary" key={m}>{m}</Badge>
                                    )) : "Select municipalities"}
                                </div>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                            <CommandInput placeholder="Search municipality..." />
                            <CommandList>
                                <CommandEmpty>No municipality found.</CommandEmpty>
                                <CommandGroup>
                                    {allMunicipalities.map((municipality) => (
                                        <CommandItem
                                            value={municipality.label}
                                            key={municipality.value}
                                            onSelect={() => {
                                                const currentValues = form.getValues("municipalities");
                                                if (currentValues.includes(municipality.value)) {
                                                    form.setValue("municipalities", currentValues.filter(v => v !== municipality.value));
                                                } else {
                                                    form.setValue("municipalities", [...currentValues, municipality.value]);
                                                }
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    field.value.includes(municipality.value)
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                                )}
                                            />
                                            {municipality.label}
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
        
        <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{circuit ? "Save Changes" : "Create Circuit"}</Button>
        </div>
      </form>
    </Form>
  );
}


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
import type { Tour } from "@/types";
import { usePOS } from "@/context/POSContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


const formSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  circuitId: z.string().min(1, "A circuit is required."),
});

type TourFormData = z.infer<typeof formSchema>;

interface TourFormProps {
  tour?: Tour;
  onSubmit: (data: {date: string, circuitId: string}) => void;
  onClose: () => void;
}

export function TourForm({ tour, onSubmit, onClose }: TourFormProps) {
    const { circuits } = usePOS();
  
  const form = useForm<TourFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: tour ? new Date(tour.date) : new Date(),
      circuitId: tour?.circuitId || "",
    },
  });

  const handleFormSubmit = (values: TourFormData) => {
    onSubmit({
        date: values.date.toISOString(),
        circuitId: values.circuitId,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tour Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0,0,0,0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="circuitId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Circuit</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a circuit for the tour" />
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
            <Button type="submit">{tour ? "Save Changes" : "Create Tour"}</Button>
        </div>
      </form>
    </Form>
  );
}



"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
import { TourForm } from "./TourForm";
import type { Tour } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2, Play, CheckCircle, PackageOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig = {
  planned: { label: "Planned", icon: PackageOpen, color: "bg-blue-500" },
  "in-progress": { label: "In Progress", icon: Play, color: "bg-yellow-500" },
  completed: { label: "Completed", icon: CheckCircle, color: "bg-green-500" },
};

export function TourList() {
  const { tours, circuits, addOrUpdateTour, deleteTour } = usePOS();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | undefined>(undefined);
  const { toast } = useToast();

  const circuitMap = useMemo(() => {
    return new Map(circuits.map(c => [c.id, c.name]));
  }, [circuits]);

  const handleFormSubmit = (data: Omit<Tour, 'id' | 'status'>) => {
    const tourData = {
      ...data,
      id: editingTour?.id || new Date().toISOString(),
      status: editingTour?.status || 'planned',
    } as Tour;
    addOrUpdateTour(tourData);
    toast({
      title: `Tour ${editingTour ? 'updated' : 'created'}`,
      description: `Tour for ${new Date(data.date).toLocaleDateString()} has been saved.`,
    });
    setIsFormOpen(false);
    setEditingTour(undefined);
  };
  
  const openEditDialog = (tour: Tour) => {
    setEditingTour(tour);
    setIsFormOpen(true);
  }
  
  const openNewDialog = () => {
    setEditingTour(undefined);
    setIsFormOpen(true);
  }
  
  const getButtonText = (status: Tour['status']) => {
    switch (status) {
        case 'planned': return 'Start Tour';
        case 'in-progress': return 'Continue Tour';
        case 'completed': return 'View Completed';
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold font-headline">Manage Tours</h1>
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) {
            setEditingTour(undefined);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Tour
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-headline">
                {editingTour ? "Edit Tour" : "Plan New Tour"}
              </DialogTitle>
            </DialogHeader>
            <TourForm
              tour={editingTour}
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
              <TableHead>Date</TableHead>
              <TableHead>Circuit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tours.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">No tours planned.</TableCell>
                </TableRow>
            ) : (
                tours.map((tour) => {
                  const config = statusConfig[tour.status];
                  return (
                    <TableRow key={tour.id}>
                        <TableCell className="font-medium">{new Date(tour.date).toLocaleDateString()}</TableCell>
                        <TableCell>{circuitMap.get(tour.circuitId) || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge className={cn("text-white", config.color)}>
                            <config.icon className="mr-1 h-3 w-3" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/tours/${tour.id}`}>
                              {getButtonText(tour.status)}
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(tour)} disabled={tour.status !== 'planned'}>
                              <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={tour.status !== 'planned'}>
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the tour for {circuitMap.get(tour.circuitId)} on {new Date(tour.date).toLocaleDateString()}.
                                      </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteTour(tour.id)}>Continue</AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                    </TableRow>
                  )
                })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


"use client";

import { useState } from "react";
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

import { CircuitForm } from "./CircuitForm";
import type { Circuit } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CircuitList() {
  const { circuits, addOrUpdateCircuit, deleteCircuit } = usePOS();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCircuit, setEditingCircuit] = useState<Circuit | undefined>(undefined);
  const { toast } = useToast();

  const handleFormSubmit = (data: Omit<Circuit, 'id'>) => {
    const circuitData = {
        ...data,
        id: editingCircuit?.id || new Date().toISOString(),
    }
    addOrUpdateCircuit(circuitData);
    toast({
      title: `Circuit ${editingCircuit ? 'updated' : 'created'}`,
      description: `${data.name} has been saved.`,
    });
    setIsFormOpen(false);
    setEditingCircuit(undefined);
  };
  
  const openEditDialog = (circuit: Circuit) => {
    setEditingCircuit(circuit);
    setIsFormOpen(true);
  }
  
  const openNewDialog = () => {
    setEditingCircuit(undefined);
    setIsFormOpen(true);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold font-headline">Manage Circuits</h1>
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) {
            setEditingCircuit(undefined);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Circuit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-headline">
                {editingCircuit ? "Edit Circuit" : "Add New Circuit"}
              </DialogTitle>
            </DialogHeader>
            <CircuitForm
              circuit={editingCircuit}
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
              <TableHead>Municipalities</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {circuits.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">No circuits found.</TableCell>
                </TableRow>
            ) : (
                circuits.map((circuit) => (
                <TableRow key={circuit.id}>
                    <TableCell className="font-medium">{circuit.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {circuit.municipalities.map(m => <Badge key={m} variant="secondary">{m}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(circuit)}>
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
                                This action cannot be undone. This will permanently delete the circuit "{circuit.name}".
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteCircuit(circuit.id)}>Continue</AlertDialogAction>
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

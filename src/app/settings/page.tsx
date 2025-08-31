
"use client";

import { useState } from "react";
import { usePOS } from "@/context/POSContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

export default function SettingsPage() {
  const { products, sales, setProducts, setSales } = usePOS();
  const { toast } = useToast();
  const [fileToRestore, setFileToRestore] = useState<File | null>(null);

  const handleBackup = () => {
    try {
      const backupData = {
        products,
        sales,
        backupDate: new Date().toISOString(),
      };
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.download = `liveryly-pos-backup-${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup Successful",
        description: "Your data has been downloaded.",
      });
    } catch (error) {
      console.error("Backup failed:", error);
      toast({
        title: "Backup Failed",
        description: "Could not create a backup file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/json") {
      setFileToRestore(file);
    } else {
      setFileToRestore(null);
      toast({
        title: "Invalid File",
        description: "Please select a valid JSON backup file.",
        variant: "destructive",
      });
    }
  };

  const handleRestore = () => {
    if (!fileToRestore) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
            throw new Error("File content is not readable text.");
        }
        const restoredData = JSON.parse(text);

        if (Array.isArray(restoredData.products) && Array.isArray(restoredData.sales)) {
          setProducts(restoredData.products);
          setSales(restoredData.sales);
          toast({
            title: "Restore Successful",
            description: "Your data has been restored from the backup.",
          });
        } else {
          throw new Error("Invalid backup file format.");
        }
      } catch (error) {
        console.error("Restore failed:", error);
        toast({
          title: "Restore Failed",
          description: "The selected file is not a valid backup file.",
          variant: "destructive",
        });
      } finally {
        setFileToRestore(null);
        // Reset file input
        const fileInput = document.getElementById('restore-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    };
    reader.readAsText(fileToRestore);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your application data and preferences.</p>
      </header>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Data Backup</CardTitle>
            <CardDescription>
              Download a JSON file containing all of your products and sales history. 
              Keep this file in a safe place to prevent data loss.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBackup}>
              <Download className="mr-2 h-4 w-4" /> Download Backup
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Restore</CardTitle>
            <CardDescription>
              Restore your application's state from a previously downloaded backup file.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <Input
                id="restore-input"
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
               <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button disabled={!fileToRestore}>
                        <Upload className="mr-2 h-4 w-4" /> Restore Data
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center"><AlertTriangle className="mr-2 text-destructive"/>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                        This action cannot be undone. Restoring from a backup will
                        <span className="font-semibold text-destructive"> permanently overwrite</span> all current products and sales data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRestore}>Continue & Overwrite</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

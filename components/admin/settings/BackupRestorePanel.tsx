"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as BackupController from "@/server/controllers/admin/BackupController";
import { AlertCircle, Database, Download, Upload } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export function BackupRestorePanel() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);

      // Call server action directly
      const result = await BackupController.createBackup();

      if (!result.success || !result.data || !result.filename) {
        throw new Error(result.error || "Failed to create backup");
      }

      // Convert base64 to blob and download
      const byteCharacters = atob(result.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/sql" });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Backup created successfully", {
        description: "The database backup has been downloaded to your computer.",
      });
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error("Failed to create backup", {
        description: error instanceof Error ? error.message : "An error occurred while creating the backup",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".sql")) {
        toast.error("Invalid file type", {
          description: "Please select a .sql file",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      toast.error("No file selected", {
        description: "Please select a backup file to restore",
      });
      return;
    }

    const confirmed = window.confirm("⚠️ WARNING: This will completely replace your current database with the backup.\n\n" + "All existing data will be lost. Are you absolutely sure you want to continue?");

    if (!confirmed) {
      return;
    }

    try {
      setIsRestoring(true);

      // Read file and convert to base64
      const fileData = await selectedFile.arrayBuffer();
      const base64Data = Buffer.from(fileData).toString("base64");

      // Call server action directly
      const result = await BackupController.restoreBackup(base64Data, selectedFile.name);

      if (!result.success) {
        throw new Error(result.error || "Failed to restore backup");
      }

      toast.success("Database restored successfully", {
        description: "The database has been restored from the backup file. The page will reload in 2 seconds.",
      });

      // Reload the page after 2 seconds to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error restoring backup:", error);
      toast.error("Failed to restore backup", {
        description: error instanceof Error ? error.message : "An error occurred while restoring the backup",
      });
    } finally {
      setIsRestoring(false);
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById("backup-file") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Backup Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Database Backup</CardTitle>
          </div>
          <CardDescription>Create a backup of the entire database to download to your computer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-muted-foreground mt-0.5 h-5 w-5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Backup Information:</p>
                <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1">
                  <li>Creates a complete SQL dump of your database</li>
                  <li>Includes all tables, data, and schema</li>
                  <li>File will be automatically downloaded to your computer</li>
                  <li>Recommended to create backups regularly</li>
                </ul>
              </div>
            </div>
          </div>

          <Button onClick={handleBackup} disabled={isBackingUp} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            {isBackingUp ? "Creating Backup..." : "Download Backup"}
          </Button>
        </CardContent>
      </Card>

      {/* Restore Section */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            <CardTitle>Database Restore</CardTitle>
          </div>
          <CardDescription>Restore the database from a backup file</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-destructive/10 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-destructive mt-0.5 h-5 w-5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-destructive font-medium">⚠️ Warning - Destructive Action:</p>
                <ul className="text-destructive/90 mt-2 list-inside list-disc space-y-1">
                  <li>This will completely replace your current database</li>
                  <li>All existing data will be permanently lost</li>
                  <li>This action cannot be undone</li>
                  <li>Create a backup before restoring if needed</li>
                  <li>The application will need to reload after restore</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label htmlFor="backup-file" className="text-sm font-medium">
                Select Backup File (.sql)
              </label>
              <Input id="backup-file" type="file" accept=".sql" onChange={handleFileSelect} disabled={isRestoring} className="mt-2" />
              {selectedFile && (
                <p className="text-muted-foreground mt-2 text-sm">
                  Selected: <span className="font-medium">{selectedFile.name}</span> ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <Button onClick={handleRestore} disabled={!selectedFile || isRestoring} variant="destructive" className="w-full sm:w-auto">
              <Upload className="mr-2 h-4 w-4" />
              {isRestoring ? "Restoring Database..." : "Restore Database"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

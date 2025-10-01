"use server";

import { AdminBackupService } from "@/server/services/admin/AdminBackupService";
import AuthService from "@/server/services/auth/authService";
import fs from "fs";

// Utility function to check if user is admin
async function checkAdminAccess() {
  const authUser = await AuthService.getAuthUser();
  if (!authUser || !authUser.isAdmin) {
    throw new Error("Unauthorized access. Admin privileges required.");
  }
  return authUser;
}

/**
 * Create a database backup and return as base64 for download
 */
export const createBackup = async (): Promise<{ success: boolean; data?: string; filename?: string; error?: string }> => {
  try {
    await checkAdminAccess();

    const result = await AdminBackupService.createBackup();

    if (!result.success || !result.filePath) {
      return {
        success: false,
        error: result.error || "Failed to create backup",
      };
    }

    // Read the file and convert to base64
    const fileContent = fs.readFileSync(result.filePath);
    const base64Data = fileContent.toString("base64");
    const filename = result.filePath.split("/").pop() || "backup.sql";

    // Clean up the temp file
    await AdminBackupService.cleanupBackupFile(result.filePath);

    return {
      success: true,
      data: base64Data,
      filename,
    };
  } catch (error) {
    console.error("Error creating backup:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create backup",
    };
  }
};

/**
 * Restore database from backup file (base64 encoded)
 */
export const restoreBackup = async (fileData: string, fileName: string): Promise<{ success: boolean; error?: string }> => {
  try {
    await checkAdminAccess();

    // Validate file name
    if (!fileName.endsWith(".sql")) {
      return {
        success: false,
        error: "Invalid file type. Only .sql files are allowed",
      };
    }

    const result = await AdminBackupService.restoreBackupFromBase64(fileData, fileName);

    return result;
  } catch (error) {
    console.error("Error restoring backup:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to restore backup",
    };
  }
};

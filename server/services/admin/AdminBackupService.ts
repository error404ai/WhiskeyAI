import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const execPromise = promisify(exec);

export class AdminBackupService {
  /**
   * Create a database backup and return the file path
   */
  static async createBackup(): Promise<{ success: boolean; filePath?: string; error?: string }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `backup_${timestamp}.sql`;
    const filePath = path.join("/tmp", fileName);

    try {
      const DB_PASSWORD = process.env.DB_PASSWORD;
      const DB_USER = process.env.DB_USER;
      const DB_HOST = process.env.NODE_ENV === "production" ? "db" : "db";
      const DB_NAME = process.env.DB_NAME;

      if (!DB_PASSWORD || !DB_USER || !DB_NAME) {
        return {
          success: false,
          error: "Database credentials not configured",
        };
      }

      // Create backup using pg_dump
      const command = `PGPASSWORD="${DB_PASSWORD}" pg_dump -h ${DB_HOST} -U ${DB_USER} ${DB_NAME} > ${filePath}`;

      await execPromise(command);

      // Verify file was created
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          error: "Failed to create backup file",
        };
      }

      // Check file size
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        return {
          success: false,
          error: "Backup file is empty",
        };
      }

      return {
        success: true,
        filePath,
      };
    } catch (error) {
      console.error("Error creating backup:", error);

      // Clean up partial file if exists
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create backup",
      };
    }
  }

  /**
   * Restore database from backup file
   */
  static async restoreBackup(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const DB_PASSWORD = process.env.DB_PASSWORD;
      const DB_USER = process.env.DB_USER;
      const DB_HOST = process.env.NODE_ENV === "production" ? "db" : "db";
      const DB_NAME = process.env.DB_NAME;

      if (!DB_PASSWORD || !DB_USER || !DB_NAME) {
        return {
          success: false,
          error: "Database credentials not configured",
        };
      }

      // Verify file exists
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          error: "Backup file not found",
        };
      }

      // Use template1 as the maintenance database (always available and safe to connect to)
      const maintenanceDb = "template1";

      // Drop all existing connections to the target database
      const dropConnectionsCommand = `PGPASSWORD="${DB_PASSWORD}" psql -h ${DB_HOST} -U ${DB_USER} ${maintenanceDb} -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();"`;

      try {
        await execPromise(dropConnectionsCommand);
      } catch (error) {
        console.log("No active connections to terminate or error terminating:", error);
      }

      // Drop the target database (connecting via template1)
      const dropCommand = `PGPASSWORD="${DB_PASSWORD}" psql -h ${DB_HOST} -U ${DB_USER} ${maintenanceDb} -c "DROP DATABASE IF EXISTS \\"${DB_NAME}\\";"`;
      await execPromise(dropCommand);

      // Create the database fresh (connecting via template1)
      const createCommand = `PGPASSWORD="${DB_PASSWORD}" psql -h ${DB_HOST} -U ${DB_USER} ${maintenanceDb} -c "CREATE DATABASE \\"${DB_NAME}\\";"`;
      await execPromise(createCommand);

      // Restore from backup into the newly created database
      const restoreCommand = `PGPASSWORD="${DB_PASSWORD}" psql -h ${DB_HOST} -U ${DB_USER} ${DB_NAME} < ${filePath}`;
      await execPromise(restoreCommand);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error restoring backup:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to restore backup",
      };
    }
  }

  /**
   * Restore database from base64 encoded backup data
   */
  static async restoreBackupFromBase64(base64Data: string, fileName: string): Promise<{ success: boolean; error?: string }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const tempFilePath = path.join("/tmp", `restore_${timestamp}_${fileName}`);

    try {
      // Decode base64 and write to temp file
      const buffer = Buffer.from(base64Data, "base64");
      fs.writeFileSync(tempFilePath, buffer);

      // Use the existing restore method
      const result = await this.restoreBackup(tempFilePath);

      return result;
    } catch (error) {
      console.error("Error restoring from base64:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to restore backup",
      };
    } finally {
      // Clean up temp file
      await this.cleanupBackupFile(tempFilePath);
    }
  }

  /**
   * Clean up temporary backup files
   */
  static async cleanupBackupFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error("Error cleaning up backup file:", error);
    }
  }

  /**
   * Get list of available backups from a directory
   */
  static async getAvailableBackups(directory: string = "/tmp"): Promise<{ success: boolean; backups?: string[]; error?: string }> {
    try {
      if (!fs.existsSync(directory)) {
        return {
          success: true,
          backups: [],
        };
      }

      const files = fs.readdirSync(directory);
      const backupFiles = files
        .filter((file) => file.startsWith("backup_") && file.endsWith(".sql"))
        .sort()
        .reverse();

      return {
        success: true,
        backups: backupFiles,
      };
    } catch (error) {
      console.error("Error listing backups:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list backups",
      };
    }
  }
}

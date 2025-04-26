import * as fs from "fs/promises";
import * as path from "path";
import { Disk } from "./Disk";

export class LocalDisk extends Disk {
  private root: string;
  private baseUrl: string;
  constructor(root: string, baseUrl: string) {
    super();
    this.root = root;
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  async upload(buffer: Buffer, filename: string, directory: string): Promise<UploadResult> {
    const targetDir = path.join(this.root, directory);
    await fs.mkdir(targetDir, { recursive: true });

    const filePath = path.join(targetDir, filename);
    await fs.writeFile(filePath, buffer);

    return {
      filename,
      path: path.join("/", directory, filename).replace(/\\/g, "/"),
    };
  }

  async delete(filePath: string): Promise<boolean> {
    const relativePath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    const fullPath = path.join(this.root, relativePath);
    try {
      await fs.unlink(fullPath);
      return true;
    } catch (err: unknown) {
      console.error(`Error deleting file at ${fullPath}:`, err);
      return false;
    }
  }

  async exists(filePath: string): Promise<boolean> {
    // Construct the full path.
    const relativePath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    const fullPath = path.join(this.root, relativePath);
    try {
      await fs.access(fullPath);
      return true;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      return false;
    }
  }
  url(filePath: string): string {
    // Combine the base URL with the stored path.
    return `${this.baseUrl}${filePath}`;
  }

  async getFileContent(filePath: string): Promise<Buffer | null> {
    try {
      const relativePath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
      const fullPath = path.join(this.root, relativePath);
      
      // Check if file exists
      const exists = await this.exists(filePath);
      if (!exists) {
        console.error(`File not found at path: ${fullPath}`);
        return null;
      }
      
      // Read file content
      return await fs.readFile(fullPath);
    } catch (error) {
      console.error(`Error reading file content from LocalDisk: ${filePath}`, error);
      return null;
    }
  }
}

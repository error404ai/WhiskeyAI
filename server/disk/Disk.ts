export abstract class Disk {
  abstract upload(buffer: Buffer, filename: string, directory: string): Promise<UploadResult>;
  abstract delete(filePath: string): Promise<boolean>;
  abstract exists(filePath: string): Promise<boolean>;
  abstract url(filePath: string): string;
  abstract getFileContent(filePath: string): Promise<Buffer | null>;
}

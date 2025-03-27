import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { Disk } from "../disk/Disk";
import { LocalDisk } from "../disk/LocalDisk";
import { S3Disk } from "../disk/S3Disk";

export interface UploadOptions {
  disk?: string;
  directory?: string;
}

export interface ImageUploadOptions extends UploadOptions {
  width?: number;
  height?: number;
  quality?: number;
}

export class UploadService {
  private disks: Record<string, Disk>;
  private defaultDisk: string;

  constructor() {
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    this.disks = {
      public: new LocalDisk("public", appUrl),
      storage: new LocalDisk("storage", appUrl),
      s3: new S3Disk(),
    };
    this.defaultDisk = process.env.DISK || "s3";
  }
  private getDisk(diskName?: string): Disk {
    const name = diskName || this.defaultDisk;
    const disk = this.disks[name];
    if (!disk) {
      throw new Error(`Disk "${name}" is not configured.`);
    }
    return disk;
  }

  async uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResult> {
    const disk = this.getDisk(options.disk);
    const directory = options.directory || "uploads/files";
    const id = uuidv4();
    const filename = `${id}-${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return disk.upload(buffer, filename, directory);
  }
  async uploadImage(file: File, options: ImageUploadOptions = {}): Promise<UploadResult> {
    const disk = this.getDisk(options.disk);
    const directory = options.directory || "uploads/images";
    const id = uuidv4();
    const filename = `${id}-${file.name}`;

    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer as ArrayBufferLike);

    let imageProcessor = sharp(buffer);

    const metadata = await imageProcessor.metadata();

    if (options.width || options.height) {
      imageProcessor = imageProcessor.resize(options.width, options.height, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    if (options.quality) {
      if (metadata.format === "jpeg") {
        imageProcessor = imageProcessor.jpeg({ quality: options.quality });
      } else if (metadata.format === "png") {
        imageProcessor = imageProcessor.png({ quality: options.quality });
      } else if (metadata.format === "webp") {
        imageProcessor = imageProcessor.webp({ quality: options.quality });
      }
    }

    buffer = await imageProcessor.toBuffer();

    return disk.upload(buffer, filename, directory);
  }

  async deleteFile(filePath: string, disk?: string): Promise<boolean> {
    const diskInstance = this.getDisk(disk);
    return diskInstance.delete(filePath);
  }

  async fileExists(filePath: string, disk?: string): Promise<boolean> {
    const diskInstance = this.getDisk(disk);
    return diskInstance.exists(filePath);
  }
  getUrl(filePath: string, disk?: string): string {
    return this.getDisk(disk).url(filePath);
  }
}

import { DeleteObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Disk } from "./Disk";

export class S3Disk extends Disk {
  private client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    super();
    this.bucketName = process.env.S3_BUCKET || "my-bucket";
    this.publicUrl = process.env.S3_PUBLIC_URL || "";

    console.log("access key is", process.env.S3_ACCESS_KEY_ID);
    console.log("secret key is", process.env.S3_SECRET_ACCESS_KEY);

    this.client = new S3Client({
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
      region: process.env.S3_REGION || "us-east-1",
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
      },
    });
  }
  async upload(buffer: Buffer, filename: string, directory: string): Promise<UploadResult> {
    const key = `${directory}/${filename}`;
    console.log("key is", key);
    console.log("S3_ACCESS_KEY_ID", process.env.S3_ACCESS_KEY_ID);
    console.log("S3_ACCESS_KEY_ID", process.env.S3_SECRET_ACCESS_KEY);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: "application/octet-stream",
      }),
    );

    console.log("filename is", filename);

    return {
      filename,
      path: key,
    };
  }

  async delete(filePath: string): Promise<boolean> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: filePath,
        }),
      );
      return true;
    } catch (err) {
      console.error("S3 delete error:", err);
      return false;
    }
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucketName,
          Key: filePath,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  url(filePath: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl}/${this.bucketName}/${filePath}`;
    }
    return `https://${this.bucketName}.s3.${process.env.S3_REGION}.amazonaws.com/${filePath}`;
  }
}

"use server";

import { UploadService } from "../services/uploadService";

export const uploadImage = async (file: File): Promise<{ url: string }> => {
  try {
    const uploadService = new UploadService();
    const result = await uploadService.uploadImage(file, {
      directory: "uploads/tweet-media",
      quality: 80,
      allowedTypes: ["image/"],
      maxSize: 5 * 1024 * 1024, // 5MB
    });

    return { url: result.path };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
};

export const uploadFile = async (file: File): Promise<{ url: string }> => {
  try {
    const uploadService = new UploadService();
    const result = await uploadService.uploadFile(file, {
      directory: "uploads/tweet-media",
      allowedTypes: ["image/", "video/"],
      maxSize: 50 * 1024 * 1024, // 50MB for videos
    });

    return { url: result.path };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Failed to upload file");
  }
};

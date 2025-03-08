"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardTitle } from "@/components/ui/card";
import { RefreshCcw } from "lucide-react";
import { useFormContext } from "react-hook-form";

type ImageInputProps = {
  name?: string;
  label?: string;
  required?: boolean;
  maxSize?: number;
};
const ImageInput: React.FC<ImageInputProps> = ({ name, label, required, maxSize = 20 }) => {
  const context = useFormContext();
  context.watch(name as string);
  const errors = context?.formState.errors ?? {};
  const error = name ? (errors?.[name as keyof typeof errors]?.message as string) : "";
  const getImageSrc = () => {
    if (context?.getValues(name as string) && typeof context?.getValues(name as string) === "string") {
      return context?.getValues(name as string);
    } else if (context?.getValues(name as string) && typeof context?.getValues(name as string) === "object") {
      return URL.createObjectURL(context?.getValues(name as string));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const maxSizeInBytes = maxSize * 1024 * 1024;
    const fileType = file.type;
    if (fileType.split("/")[0] !== "image") {
      context.setError(name as string, {
        type: "manual",
        message: "File must be an image",
      });
    } else if (file.size > maxSizeInBytes) {
      context.setError(name as string, {
        type: "manual",
        message: `File size must be less than ${maxSize}MB`,
      });
    } else {
      context.clearErrors(name as string);
      console.log("file is", file instanceof File);
      context.setValue(name as string, file);
    }
  };
  return (
    <label className="relative flex w-fit cursor-pointer flex-col gap-2">
      {label && (
        <CardTitle className="text-black dark:text-white">
          {label} {required && <span className="text-red-600">* </span>}
        </CardTitle>
      )}
      <div className="absolute top-1/3 right-1 z-10 flex size-6 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow-md shadow-black/50">
        <RefreshCcw className="size-4" />
      </div>
      <Avatar className="h-24 w-24 border-3 border-gray-600 object-cover">
        <AvatarImage loading="lazy" className="object-cover" src={getImageSrc()} />
        <AvatarFallback>Image</AvatarFallback>
      </Avatar>
      <input onChange={handleFileChange} type="file" className="hidden" />
      {error && <p className="text-xs text-red-500 select-none">{error}</p>}
    </label>
  );
};

export default ImageInput;

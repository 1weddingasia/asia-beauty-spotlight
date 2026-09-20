"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
}

export function ImageUpload({ value, onChange, bucket = "media", folder = "uploads" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("image/")) {
      toast.error("Vui lòng chọn file hình ảnh!");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 5MB!");
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success("Tải ảnh lên thành công!");
    } catch (error: any) {
      console.error(error);
      toast.error("Lỗi khi tải ảnh: " + error.message);
    } finally {
      setIsUploading(false);
      // reset input
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {value ? (
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-xl border-2 border-border overflow-hidden group bg-white flex items-center justify-center">
          <img 
            src={value} 
            alt="Uploaded" 
            className="max-w-full max-h-full object-contain p-2"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button 
              type="button"
              variant="destructive" 
              size="icon" 
              className="rounded-full"
              onClick={() => onChange("")}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <label className="relative flex flex-col items-center justify-center w-32 h-32 md:w-40 md:h-40 border-2 border-dashed border-border rounded-xl cursor-pointer bg-muted/30 hover:bg-muted transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isUploading ? (
              <Loader2 className="size-8 text-gold animate-spin mb-2" />
            ) : (
              <UploadCloud className="size-8 text-muted-foreground mb-2" />
            )}
            <p className="text-xs text-muted-foreground text-center px-2">
              {isUploading ? "Đang tải..." : "Click hoặc kéo thả ảnh (Tối đa 5MB)"}
            </p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  className?: string;
  label?: string;
}

export function ImageUpload({
  value,
  onChange,
  bucket = "media",
  folder = "uploads",
  className,
  label,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh (JPG, PNG, WEBP)!");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 10MB!");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Không thể tải ảnh lên máy chủ");
      }

      onChange(data.url);
      toast.success("Tải ảnh từ thiết bị thành công!");
    } catch (error: unknown) {
      console.error("[ImageUpload Error]:", error);
      const msg = error instanceof Error ? error.message : "Không thể tải ảnh lên";
      toast.error("Lỗi khi tải ảnh: " + msg);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const defaultSize = "w-32 h-32 md:w-40 md:h-40";
  const containerClass = className || defaultSize;

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        <div
          className={`relative rounded-xl border-2 border-border overflow-hidden group bg-white flex items-center justify-center ${containerClass}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Uploaded"
            className="max-w-full max-h-full object-contain p-1"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="rounded-full shadow-lg"
              onClick={() => onChange("")}
              title="Xóa ảnh"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <label
          className={`relative flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl cursor-pointer bg-muted/30 hover:bg-muted/70 transition-colors ${containerClass}`}
        >
          <div className="flex flex-col items-center justify-center p-3 text-center">
            {isUploading ? (
              <Loader2 className="size-7 text-amber-500 animate-spin mb-1.5" />
            ) : (
              <UploadCloud className="size-7 text-muted-foreground mb-1.5" />
            )}
            <p className="text-[11px] text-muted-foreground font-medium px-1 leading-tight">
              {isUploading
                ? "Đang tải ảnh..."
                : label || "Tải ảnh từ thiết bị (Tối đa 10MB)"}
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

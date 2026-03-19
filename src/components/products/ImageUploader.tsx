// src/components/products/ImageUploader.tsx
"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, X, ImageIcon, Loader2, AlertCircle, GripVertical } from "lucide-react";
import { uploadImageToCloudinary } from "@/hooks/use-products";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  error?: string;
}

interface UploadItem {
  id: string;
  url?: string;
  file?: File;
  preview?: string;
  status: "idle" | "uploading" | "done" | "error";
  error?: string;
  progress?: number;
}

export function ImageUploader({
  value,
  onChange,
  maxImages = 8,
  error,
}: ImageUploaderProps) {
  const [items, setItems] = useState<UploadItem[]>(() =>
    value.map((url) => ({ id: url, url, status: "done" as const }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  const syncUrls = useCallback(
    (updatedItems: UploadItem[]) => {
      const urls = updatedItems
        .filter((i) => i.status === "done" && i.url)
        .map((i) => i.url!);
      onChange(urls);
    },
    [onChange]
  );

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).slice(0, maxImages - items.length);
      if (fileArray.length === 0) return;

      const newItems: UploadItem[] = fileArray.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        status: "uploading",
      }));

      setItems((prev) => {
        const updated = [...prev, ...newItems];
        return updated;
      });

      // Upload in parallel
      await Promise.all(
        newItems.map(async (item) => {
          try {
            const url = await uploadImageToCloudinary(item.file!);
            setItems((prev) => {
              const updated = prev.map((i) =>
                i.id === item.id ? { ...i, url, status: "done" as const, preview: undefined } : i
              );
              syncUrls(updated);
              return updated;
            });
          } catch {
            setItems((prev) =>
              prev.map((i) =>
                i.id === item.id
                  ? { ...i, status: "error" as const, error: "Upload failed" }
                  : i
              )
            );
          }
        })
      );
    },
    [items.length, maxImages, syncUrls]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleRemove = (id: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      syncUrls(updated);
      return updated;
    });
  };

  const handleReorder = () => {
    if (dragItem.current === null || dragOver.current === null) return;
    setItems((prev) => {
      const updated = [...prev];
      const [dragged] = updated.splice(dragItem.current!, 1);
      updated.splice(dragOver.current!, 0, dragged);
      syncUrls(updated);
      dragItem.current = null;
      dragOver.current = null;
      return updated;
    });
  };

  const hasSlots = items.length < maxImages;

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {hasSlots && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
            isDragging
              ? "border-brand-500 bg-brand-50 scale-[1.01]"
              : "border-gray-300 bg-gray-50 hover:border-brand-400 hover:bg-brand-50",
            error && "border-red-400 bg-red-50"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && processFiles(e.target.files)}
          />
          <div className="flex flex-col items-center gap-2">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              isDragging ? "bg-brand-100" : "bg-gray-200"
            )}>
              <Upload className={cn("w-5 h-5", isDragging ? "text-brand-600" : "text-gray-400")} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {isDragging ? "Drop images here" : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                JPEG, PNG, WEBP · Max 5MB each · {items.length}/{maxImages} uploaded
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </p>
      )}

      {/* Image grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item, idx) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => { dragItem.current = idx; }}
              onDragEnter={() => { dragOver.current = idx; }}
              onDragEnd={handleReorder}
              className={cn(
                "relative group rounded-xl overflow-hidden bg-gray-100 aspect-square border-2 transition-all",
                item.status === "error"
                  ? "border-red-300"
                  : item.status === "uploading"
                  ? "border-brand-300 border-dashed"
                  : "border-transparent hover:border-brand-400",
                idx === 0 && "ring-2 ring-brand-500 ring-offset-1"
              )}
            >
              {/* Image */}
              {(item.url || item.preview) && (
                <img
                  src={item.url ?? item.preview}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}

              {/* No image placeholder */}
              {!item.url && !item.preview && (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                </div>
              )}

              {/* Uploading overlay */}
              {item.status === "uploading" && (
                <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-1.5">
                  <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
                  <span className="text-xs font-medium text-brand-700">Uploading…</span>
                </div>
              )}

              {/* Error overlay */}
              {item.status === "error" && (
                <div className="absolute inset-0 bg-red-50/90 flex flex-col items-center justify-center gap-1">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-xs text-red-600 text-center px-1">Failed</span>
                </div>
              )}

              {/* Controls */}
              {item.status === "done" && (
                <>
                  {/* Drag handle */}
                  <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/40 rounded-md p-1 cursor-grab">
                      <GripVertical className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemove(item.id); }}
                    className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-red-600 rounded-full p-1"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>

                  {/* Primary badge */}
                  {idx === 0 && (
                    <div className="absolute bottom-1.5 left-1.5">
                      <span className="bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                        COVER
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Drag images to reorder. First image will be the cover photo.
      </p>
    </div>
  );
}

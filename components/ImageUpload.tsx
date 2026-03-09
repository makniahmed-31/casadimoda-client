"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { API_URL } from "@/utils/api";

interface ImageUploadProps {
  onSuccess: (url: string) => void;
  label?: string;
  className?: string;
  buttonClassName?: string;
}

export default function ImageUpload({ onSuccess, label, className, buttonClassName }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        onSuccess(data.url);
      } else {
        const error = await res.json();
        alert(error.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during upload");
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        accept="image/*"
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className={buttonClassName || "bg-accent/10 text-accent font-black uppercase text-[10px] tracking-widest px-4 py-2 hover:bg-accent/20 transition-all cursor-pointer flex items-center gap-2"}
      >
        {uploading ? (
          <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        ) : (
          <Upload size={14} />
        )}
        {label || (uploading ? "Uploading..." : "Upload Image")}
      </button>
    </div>
  );
}

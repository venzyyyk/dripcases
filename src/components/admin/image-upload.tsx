"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { Upload, X, Loader2 } from "lucide-react";

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: "cases" | "products";
  /** Подпись над полем */
  label?: string;
  /** Тёмный превью-фон как на сайте */
  preview?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  folder = "cases",
  label = "Рендер витрины",
  preview = true,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function upload(file: File) {
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Ошибка загрузки");
        return;
      }

      onChange(data.url);
      toast.success("Загружено");
    } catch {
      toast.error("Ошибка сети");
    } finally {
      setUploading(false);
    }
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    upload(file);
  }

  return (
    <div>
      <label className="label">{label}</label>

      {value && preview ? (
        <div className="relative rounded-lg border border-border overflow-hidden bg-[#0a0a0b]">
          {/* Превью на тёмном фоне — как будет на сайте */}
          <div className="relative aspect-[4/5] max-h-64 flex items-center justify-center">
            <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[70%] h-[55%] rounded-full blur-[50px] bg-[radial-gradient(ellipse,rgba(255,255,255,0.12),transparent_70%)]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Превью"
              className="relative z-10 max-h-full object-contain"
            />
          </div>

          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-black/70 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            aria-label="Убрать"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <p className="px-3 py-2 text-[11px] text-text-tertiary border-t border-border truncate">
            {value}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          disabled={uploading}
          className={`w-full rounded-lg border border-dashed px-4 py-8 flex flex-col items-center gap-2 transition-colors ${
            dragging
              ? "border-accent/60 bg-accent/5"
              : "border-white/15 hover:border-white/30"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 text-accent animate-spin" />
              <span className="text-xs text-text-secondary">Загрузка...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-text-tertiary" strokeWidth={1.4} />
              <span className="text-xs text-text-secondary">
                Перетащи файл или нажми
              </span>
              <span className="text-[10px] text-text-tertiary">
                PNG с прозрачным фоном, 4:5, до 8 МБ
              </span>
            </>
          )}
        </button>
      )}

      {/* Ручной ввод пути — если рендеры уже лежат в public/ */}
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="input mt-2 text-xs"
        placeholder={`/uploads/${folder}/имя-файла.png`}
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/webp,image/jpeg,image/avif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

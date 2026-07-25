"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { invalidateUserAvatarCache } from "@/components/layout/user-avatar";
import { cn } from "@/lib/utils/cn";

export type ProfilePhotoItem = {
  secureUrl: string;
  cloudinaryPublicId: string;
  isPrimary?: boolean;
};

type Props = {
  photos: ProfilePhotoItem[];
  required?: boolean;
  onChanged: (photos: ProfilePhotoItem[]) => void;
  onMessage?: (message: string | null) => void;
  onError?: (error: string | null) => void;
};

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export function ProfilePhotoUploader({
  photos,
  required = true,
  onChanged,
  onMessage,
  onError,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const primary = photos.find((p) => p.isPrimary)?.secureUrl || photos[0]?.secureUrl || null;
  const displaySrc = primary || previewUrl;

  const postPhoto = useCallback(
    async (body: Record<string, unknown>) => {
      setBusy(true);
      onError?.(null);
      onMessage?.(null);
      try {
        const res = await fetch("/api/profile/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, makePrimary: photos.length === 0 }),
        });
        const json = await res.json();
        if (!json.success) {
          onError?.(json.error?.message || "Could not add photo");
          return;
        }
        onChanged(json.data.photos || []);
        invalidateUserAvatarCache();
        onMessage?.(photos.length === 0 ? "Profile picture added" : "Photo added");
        setImageUrl("");
        setPreviewUrl(null);
      } catch {
        onError?.("Could not add photo. Please try again.");
      } finally {
        setBusy(false);
      }
    },
    [onChanged, onError, onMessage, photos.length],
  );

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const allowed = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]);
    if (!allowed.has(file.type.toLowerCase())) {
      onError?.(
        file.type.startsWith("image/")
          ? "Only JPG, PNG, WEBP, or GIF are supported (not HEIC/AVIF)"
          : "Please choose a JPG, PNG, WEBP, or GIF image",
      );
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      onError?.("Image must be under 5 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || "");
      setPreviewUrl(dataUrl);
      await postPhoto({ dataUrl });
    };
    reader.readAsDataURL(file);
  }

  async function handleLinkSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = imageUrl.trim();
    if (!trimmed) {
      onError?.("Paste an HTTPS image link");
      return;
    }
    if (!/^https:\/\//i.test(trimmed)) {
      onError?.("Image links must start with https://");
      return;
    }
    setPreviewUrl(trimmed);
    await postPhoto({ imageUrl: trimmed });
  }

  async function removePhoto(publicId: string) {
    if (photos.length <= 1) {
      onError?.("Profile picture is required. Add another photo before removing this one.");
      return;
    }
    setBusy(true);
    onError?.(null);
    try {
      const res = await fetch(`/api/profile/photos?publicId=${encodeURIComponent(publicId)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) {
        onError?.(json.error?.message || "Could not remove photo");
        return;
      }
      onChanged(json.data.photos || []);
      invalidateUserAvatarCache();
      onMessage?.("Photo removed");
    } catch {
      onError?.("Could not remove photo");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">
            Profile picture{required ? <span className="text-destructive"> *</span> : null}
          </p>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            A clear face photo is required to appear in matches. Upload a file or paste an image
            link.
          </p>
        </div>
        {required && photos.length === 0 ? (
          <span className="bg-destructive/10 text-destructive rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase">
            Required
          </span>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
        <div
          className={cn(
            "border-border/60 relative aspect-[4/5] overflow-hidden rounded-2xl border",
            !displaySrc && "bg-muted/40",
          )}
        >
          {displaySrc ? (
            // User-provided HTTPS / data URLs — native img for host flexibility
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displaySrc} alt="Profile preview" className="h-full w-full object-cover" />
          ) : (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 p-3 text-center text-xs">
              <ImagePlus className="h-6 w-6 opacity-60" />
              No photo yet
            </div>
          )}
        </div>

        <div className="min-w-0">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="upload" className="gap-1.5">
                <Upload className="h-3.5 w-3.5" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="link" className="gap-1.5">
                <Link2 className="h-3.5 w-3.5" />
                Image link
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-3 space-y-3">
              <div
                className={cn(
                  "border-border/70 rounded-2xl border border-dashed px-4 py-6 text-center transition-colors",
                  dragOver && "border-gold bg-gold/5",
                  busy && "pointer-events-none opacity-60",
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  void handleFile(e.dataTransfer.files?.[0]);
                }}
              >
                <p className="text-sm font-medium">Drag & drop your photo</p>
                <p className="text-muted-foreground mt-1 text-xs">JPG, PNG, or WEBP · max 5 MB</p>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-4"
                  disabled={busy}
                  onClick={() => inputRef.current?.click()}
                >
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Choose file
                </Button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden"
                  onChange={(e) => void handleFile(e.target.files?.[0])}
                />
              </div>
            </TabsContent>

            <TabsContent value="link" className="mt-3">
              <form className="space-y-3" onSubmit={handleLinkSubmit}>
                <Input
                  type="url"
                  placeholder="https://example.com/your-photo.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={busy}
                />
                <p className="text-muted-foreground text-xs">
                  Use a direct HTTPS image URL (Unsplash, Cloudinary, Wikimedia, etc.).
                </p>
                <Button type="submit" disabled={busy || !imageUrl.trim()}>
                  {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Add from link
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.cloudinaryPublicId}
              className="border-border/50 group relative aspect-square overflow-hidden rounded-xl border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.secureUrl} alt="" className="h-full w-full object-cover" />
              {photo.isPrimary ? (
                <span className="bg-navy/80 text-ivory absolute top-1.5 left-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium">
                  Primary
                </span>
              ) : null}
              <button
                type="button"
                disabled={busy || photos.length <= 1}
                onClick={() => void removePhoto(photo.cloudinaryPublicId)}
                className="bg-navy/75 text-ivory absolute right-1.5 bottom-1.5 rounded-full p-1.5 opacity-0 transition group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Remove photo"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

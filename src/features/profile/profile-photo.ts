export type ProfilePhoto = {
  secureUrl?: string;
  url?: string;
  isPrimary?: boolean;
};

export function photoUrl(photo?: ProfilePhoto | null): string | null {
  return photo?.secureUrl || photo?.url || null;
}

export function primaryPhotoUrl(photos?: ProfilePhoto[] | null): string | null {
  if (!photos?.length) return null;
  return photoUrl(photos.find((p) => p.isPrimary) || photos[0]);
}

export function shouldUnoptimizeImage(src: string): boolean {
  return (
    src.startsWith("data:") ||
    src.startsWith("/") ||
    (!src.includes("res.cloudinary.com") &&
      !src.includes("images.unsplash.com") &&
      !src.includes("upload.wikimedia.org"))
  );
}

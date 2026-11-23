import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const BUCKET = "content-media";
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.8;

function sanitizeFileName(name: string): string {
  const lastDot = name.lastIndexOf(".");
  const base = lastDot > 0 ? name.slice(0, lastDot) : name;
  const safeBase =
    base
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "image";
  return `${safeBase}.jpg`;
}

async function compressImage(file: File): Promise<Blob> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });

  const image: HTMLImageElement = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("This image could not be decoded by the browser."));
    img.src = dataUrl;
  });

  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not prepare the image for upload.");
  }
  ctx.drawImage(image, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not compress the image."));
      },
      "image/jpeg",
      JPEG_QUALITY
    );
  });
}

export async function uploadContentImage(
  file: File,
  clientSlug: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  if (!isSupabaseConfigured()) {
    onProgress?.(100);
    return URL.createObjectURL(file);
  }

  const supabase = createClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  try {
    onProgress?.(10);
    const compressed = await compressImage(file);
    onProgress?.(45);

    const safeSlug = (clientSlug || "general").toLowerCase().replace(/[^a-z0-9-]+/g, "-") || "general";
    const path = `${safeSlug}/${Date.now()}-${sanitizeFileName(file.name)}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, compressed, {
      contentType: "image/jpeg",
      cacheControl: "3600",
      upsert: false,
    });
    onProgress?.(90);

    if (error) {
      throw new Error(error.message || "Failed to upload image.");
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    onProgress?.(100);
    return data.publicUrl;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error("Failed to upload image.");
  }
}

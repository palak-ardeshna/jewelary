// Server-side Cloudinary client. The API secret lives only here (never shipped to
// the browser). Configured from CLOUDINARY_* env vars. Used by the admin image
// upload route (src/app/api/admin/upload/route.ts).
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || "aurelia/products";

/** True if the server has enough config to talk to Cloudinary. */
export function cloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

/** Uploads raw image bytes and returns the delivered secure URL. */
export async function uploadImage(bytes: Buffer): Promise<string> {
  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: UPLOAD_FOLDER, resource_type: "image" },
        (err, res) => (err || !res ? reject(err ?? new Error("Upload failed")) : resolve(res)),
      )
      .end(bytes);
  });
  return result.secure_url;
}

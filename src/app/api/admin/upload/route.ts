// Admin-only image upload → Cloudinary. Not covered by src/middleware.ts (which
// only matches /admin/*), so we re-check the admin session here. Accepts a
// multipart form with a single `file`; returns { url } of the hosted image.
import { NextResponse } from "next/server";
import { isAdmin } from "@/server/auth";
import { cloudinaryConfigured, uploadImage } from "@/server/cloudinary";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!cloudinaryConfigured()) {
    return NextResponse.json({ error: "Cloudinary is not configured on the server." }, { status: 500 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: `Unsupported type: ${file.type || "unknown"}.` }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 8 MB)." }, { status: 400 });
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const url = await uploadImage(bytes);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }
}

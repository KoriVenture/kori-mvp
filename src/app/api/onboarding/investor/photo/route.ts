import { NextResponse } from "next/server";
import { requireRole } from "@/lib/onboarding/http";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const MIME_TYPES = new Set(["image/png", "image/jpeg"]);

function extension(file: File) {
  return file.type === "image/png" ? "png" : "jpg";
}

export async function POST(request: Request) {
  const auth = await requireRole("investor");
  if (auth.error) return auth.error;

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A photo is required." }, { status: 400 });
  }

  if (!MIME_TYPES.has(file.type) || file.size > MAX_PHOTO_SIZE) {
    return NextResponse.json(
      { error: "Use a PNG or JPG up to 5MB." },
      { status: 400 },
    );
  }

  const path = `${auth.userId}/avatar.${extension(file)}`;
  const upload = await auth.supabase.storage
    .from("profile-photos")
    .upload(path, file, { contentType: file.type, upsert: true });

  if (upload.error) {
    return NextResponse.json({ error: "Photo upload failed." }, { status: 500 });
  }

  const saved = await auth.supabase.from("profiles").update({
    photo_path: path,
    updated_at: new Date().toISOString(),
  }).eq("id", auth.userId);

  if (saved.error) {
    return NextResponse.json(
      { error: "Photo path could not be saved." },
      { status: 500 },
    );
  }

  const publicUrl = auth.supabase.storage
    .from("profile-photos")
    .getPublicUrl(path).data.publicUrl;

  return NextResponse.json({ ok: true, path, publicUrl });
}

export async function DELETE() {
  const auth = await requireRole("investor");
  if (auth.error) return auth.error;

  const profile = await auth.supabase.from("profiles")
    .select("photo_path").eq("id", auth.userId).single();
  if (profile.error) {
    return NextResponse.json(
      { error: "Unable to load profile photo." },
      { status: 500 },
    );
  }

  const path = profile.data?.photo_path;

  if (path) {
    const removed = await auth.supabase.storage
      .from("profile-photos")
      .remove([path]);
    if (removed.error) {
      return NextResponse.json(
        { error: "Photo removal failed." },
        { status: 500 },
      );
    }
  }

  const cleared = await auth.supabase.from("profiles").update({
    photo_path: null,
    updated_at: new Date().toISOString(),
  }).eq("id", auth.userId);
  if (cleared.error) {
    return NextResponse.json(
      { error: "Photo path could not be cleared." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

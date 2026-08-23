import { NextResponse } from "next/server";

import { documentUploadSchema } from "@/lib/onboarding/contracts";
import { requireRole } from "@/lib/onboarding/http";

export async function POST(request: Request) {
  const auth = await requireRole("founder");
  if (auth.error) return auth.error;

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "A file is required." },
      { status: 400 },
    );
  }

  const check = documentUploadSchema.safeParse({
    documentType: form.get("documentType"),
    title: form.get("title"),
    size: file.size,
    mimeType: file.type,
  });

  if (!check.success) {
    return NextResponse.json(
      { error: "Unsupported document." },
      { status: 400 },
    );
  }

  const startupId = String(form.get("startupId") ?? "");
  const owned = await auth.supabase
    .from("startups")
    .select("id")
    .eq("id", startupId)
    .eq("primary_founder_user_id", auth.userId)
    .maybeSingle();

  if (owned.error) {
    return NextResponse.json(
      { error: "Unable to verify startup ownership." },
      { status: 500 },
    );
  }

  if (!owned.data) {
    return NextResponse.json(
      { error: "Startup not found." },
      { status: 404 },
    );
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `${auth.userId}/${startupId}/${crypto.randomUUID()}-${safeName}`;

  const upload = await auth.supabase.storage
    .from("startup-data-room")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (upload.error) {
    return NextResponse.json(
      { error: "Upload failed." },
      { status: 500 },
    );
  }

  const saved = await auth.supabase
    .from("startup_documents")
    .insert({
      startup_id: startupId,
      uploaded_by_user_id: auth.userId,
      document_type: check.data.documentType,
      title: check.data.title,
      storage_path: path,
      mime_type: file.type,
      size_bytes: file.size,
    });

  if (saved.error) {
    await auth.supabase.storage
      .from("startup-data-room")
      .remove([path]);

    return NextResponse.json(
      { error: "Document could not be recorded." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { ok: true, path },
    { status: 201 },
  );
}

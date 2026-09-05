import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(320),
  role: z.enum([
    "founder",
    "investor",
    "community",
    "expert",
    "partner",
    "other",
  ]),
  country: z.string().trim().min(1).max(120),
  linkedin: z.string().trim().url().max(500).nullable(),
  interest: z.string().trim().max(800).nullable(),
  consent: z.literal(true),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid waiting-list submission." },
      { status: 400 },
    );
  }

  try {
    const supabase = await createClient();
    const result = await supabase.from("waiting_list_form").insert({
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      email: parsed.data.email.toLowerCase(),
      role: parsed.data.role,
      country: parsed.data.country,
      linkedin: parsed.data.linkedin || null,
      interest: parsed.data.interest || null,
      consent: parsed.data.consent,
    });

    if (result.error) {
      console.error(
        "Kori waiting-list submission failed:",
        result.error.message,
      );
      return NextResponse.json(
        { error: "Unable to submit waiting-list form." },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Kori waiting-list submission failed:", error);
    return NextResponse.json(
      { error: "Unable to submit waiting-list form." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

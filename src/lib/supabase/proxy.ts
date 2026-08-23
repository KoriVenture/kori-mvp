import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseConfig, supabaseConfig } from "./config";
export async function refreshSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (!hasSupabaseConfig()) return response;
  const { url, key } = supabaseConfig();
  const client = createServerClient(url, key, { cookies: {
    getAll: () => request.cookies.getAll(),
    setAll: (items) => { items.forEach(({ name, value }) => request.cookies.set(name, value)); response = NextResponse.next({ request }); items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); },
  }});
  const { data } = await client.auth.getUser();
  if (request.nextUrl.pathname === "/profile" && !data.user) {
    const url = request.nextUrl.clone(); url.pathname = "/join"; return NextResponse.redirect(url);
  }
  return response;
}

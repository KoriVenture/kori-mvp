import { redirect } from "next/navigation";
import { ProfileView } from "@/components/onboarding/profile/ProfileView";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "My profile · Kori" };
type Role = "investor" | "founder" | "admin";
type SearchParams = { role?: string | string[] };

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  if (!hasSupabaseConfig()) redirect("/join");
  const params = await searchParams;
  const requested = Array.isArray(params.role) ? params.role[0] : params.role;
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/join");

  const profileResult = await supabase.from("profiles").select("*").eq("id", auth.user.id).single();
  if (!profileResult.data) redirect("/join");
  const roles = Array.isArray(profileResult.data.roles) ? profileResult.data.roles as Role[] : [];
  const validRequested = requested === "investor" || requested === "founder" || requested === "admin";
  const role: Role | undefined = validRequested && roles.includes(requested)
    ? requested
    : roles.includes("investor") ? "investor" : roles.includes("founder") ? "founder" : roles.includes("admin") ? "admin" : undefined;
  if (!role) redirect("/join");

  if (role === "investor") {
    const investor = await supabase.from("investor_profiles").select("onboarding_status").eq("user_id", auth.user.id).maybeSingle();
    if (investor.data?.onboarding_status !== "completed") redirect("/onboarding/investor");
    return <ProfileView role="investor" profile={profileResult.data} />;
  }
  if (role === "founder") {
    const founder = await supabase.from("founder_profiles").select("onboarding_status").eq("user_id", auth.user.id).maybeSingle();
    if (founder.data?.onboarding_status !== "completed") redirect("/onboarding/founder");
    const startup = await supabase.from("startups").select("legal_name,display_name,sector").eq("primary_founder_user_id", auth.user.id).order("created_at", { ascending: true }).limit(1).maybeSingle();
    return <ProfileView role="founder" profile={profileResult.data} startup={startup.data} />;
  }
  return <ProfileView role="admin" profile={profileResult.data} />;
}

import { redirect } from "next/navigation";

import { ProfileView } from "@/components/onboarding/profile/ProfileView";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "My profile · Kori",
};

type Role = "investor" | "founder" | "admin";

type SearchParams = {
  role?: string | string[];
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const auth = await supabase.auth.getUser();

  if (auth.error || !auth.data.user) {
    redirect("/join");
  }

  const userId = auth.data.user.id;
  const params = await searchParams;
  const requested = Array.isArray(params.role) ? params.role[0] : params.role;

  const profileResult = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileResult.error || !profileResult.data) {
    redirect("/join");
  }

  const roles = Array.isArray(profileResult.data.roles)
    ? (profileResult.data.roles as Role[])
    : [];

  const validRequested =
    requested === "investor" ||
    requested === "founder" ||
    requested === "admin";

  const role: Role | undefined =
    validRequested && roles.includes(requested as Role)
      ? (requested as Role)
      : roles.includes("investor")
        ? "investor"
        : roles.includes("founder")
          ? "founder"
          : roles.includes("admin")
            ? "admin"
            : undefined;

  if (!role) redirect("/join");

  if (role === "investor") {
    const investor = await supabase
      .from("investor_profiles")
      .select("onboarding_status")
      .eq("user_id", userId)
      .maybeSingle();

    if (investor.data?.onboarding_status !== "completed") {
      redirect("/onboarding/investor");
    }

    return <ProfileView role="investor" profile={profileResult.data} />;
  }

  if (role === "founder") {
    const founder = await supabase
      .from("founder_profiles")
      .select("onboarding_status")
      .eq("user_id", userId)
      .maybeSingle();

    if (founder.data?.onboarding_status !== "completed") {
      redirect("/onboarding/founder");
    }

    const startup = await supabase
      .from("startups")
      .select("legal_name,display_name,sector")
      .eq("primary_founder_user_id", userId)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    return (
      <ProfileView
        role="founder"
        profile={profileResult.data}
        startup={startup.data}
      />
    );
  }

  return <ProfileView role="admin" profile={profileResult.data} />;
}

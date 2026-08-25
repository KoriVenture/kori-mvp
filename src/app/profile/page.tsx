import { redirect } from "next/navigation";

import { ProfileView } from "@/components/onboarding/profile/ProfileView";

import { auth0 } from "@/lib/auth0";
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
  const session = await auth0.getSession();

  if (!session) {
    redirect("/auth/login?returnTo=/profile");
  }

  const params = await searchParams;
  const requested = Array.isArray(params.role)
    ? params.role[0]
    : params.role;

  const supabase = await createClient();
  const profileIdResult = await supabase.rpc("current_profile_id");

  if (profileIdResult.error || !profileIdResult.data) {
    redirect("/join");
  }

  const profileResult = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileIdResult.data)
    .single();

  if (!profileResult.data) {
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

  if (!role) {
    redirect("/join");
  }

  const userId = profileResult.data.id;

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

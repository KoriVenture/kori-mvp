import { redirect } from "next/navigation";

import { InvestorDashboardView } from "@/components/dashboard/InvestorDashboardView";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Deal workspace · Kori",
};

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

  if (auth.error || !auth.data.user) redirect("/login");

  const userId = auth.data.user.id;
  const [profileResult, investorResult, founderResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("roles,legal_first_name,legal_last_name,photo_path")
      .eq("id", userId)
      .single(),
    supabase
      .from("investor_profiles")
      .select("onboarding_status,investor_type")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("founder_profiles")
      .select("onboarding_status")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (profileResult.error || !profileResult.data) {
    redirect("/onboarding/investor");
  }

  const roles = Array.isArray(profileResult.data.roles)
    ? (profileResult.data.roles as string[])
    : [];
  const params = await searchParams;
  const requested = Array.isArray(params.role) ? params.role[0] : params.role;
  const investorComplete =
    roles.includes("investor") &&
    investorResult.data?.onboarding_status === "completed";
  const founderComplete =
    roles.includes("founder") &&
    founderResult.data?.onboarding_status === "completed";
  const admin = roles.includes("admin");

  if (requested === "admin" && admin) {
    return (
      <InvestorDashboardView
        profile={profileResult.data}
        investor={investorResult.data}
        persona="Kori Operator"
        profileRole="admin"
        profileRoles={roles}
      />
    );
  }

  if (requested === "founder" && roles.includes("founder")) {
    if (!founderComplete) redirect("/onboarding/founder");
    return (
      <InvestorDashboardView
        profile={profileResult.data}
        investor={investorResult.data}
        persona="Startup Founder"
        profileRole="founder"
        profileRoles={roles}
      />
    );
  }

  if (requested === "investor" && roles.includes("investor")) {
    if (!investorComplete) redirect("/onboarding/investor");
    return (
      <InvestorDashboardView
        profile={profileResult.data}
        investor={investorResult.data}
        profileRoles={roles}
      />
    );
  }

  if (investorComplete) {
    return (
      <InvestorDashboardView
        profile={profileResult.data}
        investor={investorResult.data}
        profileRoles={roles}
      />
    );
  }

  if (founderComplete) {
    return (
      <InvestorDashboardView
        profile={profileResult.data}
        investor={investorResult.data}
        persona="Startup Founder"
        profileRole="founder"
        profileRoles={roles}
      />
    );
  }

  if (roles.includes("investor")) redirect("/onboarding/investor");
  if (roles.includes("founder")) redirect("/onboarding/founder");
  if (admin) {
    return (
      <InvestorDashboardView
        profile={profileResult.data}
        investor={investorResult.data}
        persona="Kori Operator"
        profileRole="admin"
        profileRoles={roles}
      />
    );
  }
  redirect("/profile");
}

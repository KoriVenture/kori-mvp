import { redirect } from "next/navigation";

import { InvestorDashboardView } from "@/components/dashboard/InvestorDashboardView";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Investor dashboard · Kori",
};

export default async function Page() {
  const supabase = await createClient();
  const auth = await supabase.auth.getUser();

  if (auth.error || !auth.data.user) {
    redirect("/join");
  }

  const userId = auth.data.user.id;

  const [profileResult, investorResult] = await Promise.all([
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
  ]);

  if (profileResult.error || !profileResult.data) {
    redirect("/join");
  }

  const roles = Array.isArray(profileResult.data.roles)
    ? (profileResult.data.roles as string[])
    : [];

  if (!roles.includes("investor")) {
    redirect("/profile");
  }

  if (investorResult.data?.onboarding_status !== "completed") {
    redirect("/onboarding/investor");
  }

  return (
    <InvestorDashboardView
      profile={profileResult.data}
      investor={investorResult.data}
    />
  );
}

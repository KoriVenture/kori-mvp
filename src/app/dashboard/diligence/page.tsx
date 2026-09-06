import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { DiligenceViewPreference } from "@/lib/diligence/access";

export const metadata = {
  title: "Diligence · Kori",
};

type SearchParams = { view?: string | string[] };

function preference(value: string | string[] | undefined): DiligenceViewPreference {
  const selected = Array.isArray(value) ? value[0] : value;
  return selected === "founder" || selected === "investor" ? selected : null;
}

function EmptyState({ founder }: { founder: boolean }) {
  return (
    <main className="kori-onboarding investor-dashboard-page">
      <section className="investor-dashboard"><div className="dashboard-main">
        <header className="dashboard-room-header"><div><h1>Due Diligence</h1><p>{founder ? "No diligence room is available for your company yet." : "No active diligence room is assigned to your account yet."}</p></div></header>
        <p>{founder ? "Investor diligence questions will appear here when a room is opened." : "When you are added as an active reviewer to a diligence room, it will become available here automatically."}</p>
        <a className="ko-primary" href="/dashboard">Back to dashboard</a>
      </div></section>
    </main>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const supabase = await createClient();
  const auth = await supabase.auth.getUser();

  if (auth.error || !auth.data.user) {
    redirect("/join");
  }

  const userId = auth.data.user.id;
  const requestedView = preference((await searchParams).view);

  const profileResult = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", userId)
    .maybeSingle();

  if (profileResult.error || !profileResult.data) {
    redirect("/profile");
  }

  const roles = Array.isArray(profileResult.data.roles)
    ? (profileResult.data.roles as string[])
    : [];

  const canBeFounder = roles.includes("founder");
  const canBeInvestor = roles.includes("investor");

  if (requestedView === "founder" && canBeFounder) {
    const founderProfile = await supabase.from("founder_profiles").select("onboarding_status").eq("user_id", userId).maybeSingle();
    const startup = await supabase.from("startups").select("id").eq("primary_founder_user_id", userId).order("created_at", { ascending: true }).limit(1).maybeSingle();
    if (founderProfile.data?.onboarding_status === "completed" && startup.data) {
      const deal = await supabase.from("deals").select("id").eq("startup_id", startup.data.id).maybeSingle();
      if (deal.data) {
        const room = await supabase.from("diligence_rooms").select("id").eq("deal_id", deal.data.id).in("status", ["active_review", "paused", "decision_recorded", "closed"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (room.data) redirect(`/dashboard/diligence/${room.data.id}?view=founder`);
      }
    }
    return <EmptyState founder />;
  }

  if (!canBeInvestor) {
    if (canBeFounder) redirect("/dashboard/diligence?view=founder");
    redirect("/profile");
  }

  const membershipResult = await supabase
    .from("diligence_room_members")
    .select("room_id,created_at")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (membershipResult.error) {
    return (
      <main className="kori-onboarding investor-dashboard-page">
        <section className="investor-dashboard">
          <div className="dashboard-main">
            <header className="dashboard-room-header">
              <div>
                <h1>Due Diligence</h1>
                <p>
                  We could not load your diligence workspace.
                </p>
              </div>
            </header>

            <p className="ko-message" role="alert">
              Unable to read your active diligence rooms.
            </p>

            <a className="ko-primary" href="/dashboard">
              Back to dashboard
            </a>
          </div>
        </section>
      </main>
    );
  }

  if (!membershipResult.data) {
    return (
      <main className="kori-onboarding investor-dashboard-page">
        <section className="investor-dashboard">
          <div className="dashboard-main">
            <header className="dashboard-room-header">
              <div>
                <h1>Due Diligence</h1>
                <p>
                  No active diligence room is assigned to your account yet.
                </p>
              </div>
            </header>

            <p>
              When you are added as an active reviewer to a diligence room,
              it will become available here automatically.
            </p>

            <a className="ko-primary" href="/dashboard">
              Back to dashboard
            </a>
          </div>
        </section>
      </main>
    );
  }

  redirect(`/dashboard/diligence/${membershipResult.data.room_id}?view=investor`);
}

import type { Metadata } from "next";
import { DueDiligenceRoom } from "../../../../components/diligence/DueDiligenceRoom";
import { loadDiligenceRoom } from "../../../../lib/diligence/queries";
import { resolveDiligenceRoomAccess, type DiligenceViewPreference } from "../../../../lib/diligence/access";
import { loadFounderDiligenceRoom } from "../../../../lib/diligence/founder/queries";
import { FounderDiligenceTerms } from "../../../../components/diligence/founder/FounderDiligenceTerms";

type DiligenceRoomPageProps = {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ view?: string | string[] }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Diligence · Kori",
  };
}

export default async function Page({ params, searchParams }: DiligenceRoomPageProps) {
  const { roomId } = await params;
  const query = await searchParams;
  const requested = Array.isArray(query.view) ? query.view[0] : query.view;
  const preference: DiligenceViewPreference = requested === "founder" || requested === "investor" ? requested : null;
  const access = await resolveDiligenceRoomAccess(roomId, preference);

  if (access.selectedView === "founder") {
    const room = await loadFounderDiligenceRoom(roomId);
    return <FounderDiligenceTerms initialRoom={room} />;
  }

  const room = await loadDiligenceRoom(roomId);

  return <DueDiligenceRoom initialRoom={room} />;
}

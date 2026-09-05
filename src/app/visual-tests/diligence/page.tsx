import { notFound } from "next/navigation";
import { DueDiligenceRoom } from "../../../components/diligence/DueDiligenceRoom";
import { DILIGENCE_VISUAL_ROOM, VISUAL_REFERENCE_TIME } from "../../../lib/diligence/visual-fixture";

export default function DiligenceVisualPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <DueDiligenceRoom initialRoom={DILIGENCE_VISUAL_ROOM} referenceTime={VISUAL_REFERENCE_TIME} />;
}

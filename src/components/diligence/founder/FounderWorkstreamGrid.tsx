import type { FounderDiligenceRoomDTO } from "@/lib/diligence/founder/types";

export function FounderWorkstreamGrid({ workstreams }: { workstreams: FounderDiligenceRoomDTO["workstreams"] }) {
  return <div className="dd-founder-workstream-grid">{workstreams.map((item) => {
    const attention = item.awaitingFounder + item.clarificationRequested > 0;
    const label = item.total === 0 ? "0/0 active" : item.resolved === item.total ? `${item.resolved}/${item.total} complete` : item.clarificationRequested ? `${item.resolved}/${item.total} (${item.clarificationRequested} clarification)` : item.awaitingFounder ? `${item.resolved}/${item.total} (${item.awaitingFounder} awaiting)` : `${item.resolved}/${item.total} active`;
    return <article className={attention ? "attention" : item.total > 0 && item.resolved === item.total ? "complete" : ""} key={item.id}><span>{item.title}</span><strong>{label}</strong></article>;
  })}</div>;
}

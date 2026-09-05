import type { FounderDiligenceRoomDTO } from "@/lib/diligence/founder/types";

export function FounderClosingChecklist({ items }: { items: FounderDiligenceRoomDTO["closingChecklist"] }) {
  return <section className="dd-founder-checklist"><h3>Closing Checklist</h3>{items.length ? items.map((item) => <div key={item.id}><span>{item.status === "complete" ? "Complete ✓" : item.status === "under_review" ? "Under review" : item.status === "incomplete" ? "Incomplete" : "Pending"}</span><strong>{item.title}</strong><small>{item.ownerName}{item.dueAt ? ` · Due ${new Date(item.dueAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}` : ""}</small></div>) : <p>No closing checklist items yet.</p>}<small>Kori displays and coordinates the process but does not replace legal counsel or the governing agreements.</small></section>;
}

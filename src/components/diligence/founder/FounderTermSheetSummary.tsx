import type { FounderDiligenceRoomDTO } from "@/lib/diligence/founder/types";

export function FounderTermSheetSummary({ room }: { room: FounderDiligenceRoomDTO }) {
  const term = room.termSheet;
  const rows = [["Investment", `${term.investment.amount} ${term.investment.currency}`], ["Instrument", term.instrument], ["Pre-money valuation", term.preMoneyValuation], ["Investor rights", term.investorRights], ["Governance", term.governance], ["Milestone structure", `${term.milestoneCount} milestones`], ["Vehicle", term.vehicle], ["Jurisdiction", term.jurisdiction]];
  return <section className="dd-founder-term-summary"><h3>Term Sheet Summary</h3>{rows.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value || "—"}</strong></div>)}<button type="button">Review Full Terms</button><small>Kori displays and coordinates the process but does not replace legal counsel or the governing agreements.</small></section>;
}

"use client";

import { useState } from "react";
import type { FounderDiligenceRoomDTO } from "@/lib/diligence/founder/types";
import { FounderDiligenceSidebar } from "./FounderDiligenceSidebar";
import { FounderDiligenceTopbar } from "./FounderDiligenceTopbar";
import { FounderWorkstreamGrid } from "./FounderWorkstreamGrid";
import { FounderDiligenceState } from "./FounderDiligenceState";
import { FounderDiligenceRequestCard } from "./FounderDiligenceRequestCard";
import { FounderResponseDialog } from "./FounderResponseDialog";
import { FounderEvidenceDialog } from "./FounderEvidenceDialog";
import { FounderTermProgress } from "./FounderTermProgress";
import { FounderTermSheetSummary } from "./FounderTermSheetSummary";
import { FounderClosingChecklist } from "./FounderClosingChecklist";
import { FounderDiligenceAiPanel } from "./ai/FounderDiligenceAiPanel";

export function FounderDiligenceTerms({ initialRoom }: { initialRoom: FounderDiligenceRoomDTO }) {
  const [room, setRoom] = useState(initialRoom); const [search, setSearch] = useState(""); const [responseRequest, setResponseRequest] = useState<FounderDiligenceRoomDTO["requests"][number] | null>(null); const [evidenceRequest, setEvidenceRequest] = useState<FounderDiligenceRoomDTO["requests"][number] | null>(null); const [aiOpen, setAiOpen] = useState(false); const [error, setError] = useState("");
  async function refresh() { const response = await fetch(`/api/diligence/rooms/${room.room.id}/founder`, { cache: "no-store" }); if (!response.ok) throw new Error("Unable to refresh founder diligence."); setRoom(await response.json() as FounderDiligenceRoomDTO); }
  const requests = room.requests.filter((request) => `${request.title} ${request.question} ${request.workstreamTitle} ${request.requestedBy.displayName} ${request.status}`.toLowerCase().includes(search.toLowerCase()));
  return <main className="dd-founder-shell"><FounderDiligenceSidebar room={room} /><section className="dd-founder-main"><FounderDiligenceTopbar round={room.deal.round} search={search} onSearch={setSearch} onOpenAi={() => setAiOpen(true)} /><div className="dd-founder-content"><section className="dd-founder-intro"><p className="eyebrow">{room.startup.displayName}</p><h2>Questions investors are working through</h2><p>Respond once, support every answer with evidence, and preserve the complete decision record.</p></section><FounderWorkstreamGrid workstreams={room.workstreams} /><FounderDiligenceState state={room.state} /><section className="dd-founder-requests"><header><h2>Investor questions</h2><span>{requests.length} visible</span></header>{requests.length ? requests.map((request, index) => <FounderDiligenceRequestCard key={request.id} request={request} index={index} onRespond={() => setResponseRequest(request)} onEvidence={() => setEvidenceRequest(request)} />) : <p>No investor diligence questions have been assigned yet.</p>}</section><section className="dd-founder-terms"><div><p className="eyebrow">From shared conviction to an investment agreement</p><h2>Term Sheet</h2><FounderTermProgress stage={room.deal.termSheetStage} /></div><FounderTermSheetSummary room={room} /><FounderClosingChecklist items={room.closingChecklist} /></section></div>{responseRequest ? <FounderResponseDialog request={responseRequest} onClose={() => setResponseRequest(null)} onSaved={async () => { try { await refresh(); } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to refresh."); } }} /> : null}{evidenceRequest ? <FounderEvidenceDialog request={evidenceRequest} documents={room.startupDocuments} onClose={() => setEvidenceRequest(null)} onSaved={refresh} /> : null}{aiOpen ? <FounderDiligenceAiPanel roomId={room.room.id} onClose={() => setAiOpen(false)} /> : null}{error ? <p className="dd-founder-error" role="alert">{error}</p> : null}</section></main>;
}

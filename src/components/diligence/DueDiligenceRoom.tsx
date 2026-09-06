"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DiligenceRoomDTO, DiligenceView, RecommendationDecision } from "../../lib/diligence/types";
import { formatRelativeUpdatedAt } from "../../lib/diligence/format";
import { DiligenceSidebar } from "./DiligenceSidebar";
import { DiligenceTopbar } from "./DiligenceTopbar";
import { DiligenceDealStrip } from "./DiligenceDealStrip";
import { DiligenceTabs } from "./DiligenceTabs";
import {
  DILIGENCE_NOTICES,
  DiligenceToast,
} from "./DiligenceToast";
import { DiligenceOverview } from "./views/DiligenceOverview";
import { DiligenceEvidence } from "./views/DiligenceEvidence";
import { DiligenceRisks } from "./views/DiligenceRisks";
import { DiligenceDiscussion } from "./views/DiligenceDiscussion";
import { DiligenceDecision } from "./views/DiligenceDecision";
import { DiligenceAiPanel } from "./ai/DiligenceAiPanel";

type DueDiligenceRoomProps = {
  initialRoom: DiligenceRoomDTO;
  referenceTime?: string;
};

export function DueDiligenceRoom({ initialRoom: room, referenceTime }: DueDiligenceRoomProps) {
  const [view, setView] = useState<DiligenceView>("Overview");
  const [decision, setDecision] = useState<RecommendationDecision>(
    room.latestRecommendation?.decision ?? "Proceed with conditions",
  );
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const router = useRouter();
  const now = referenceTime ? new Date(referenceTime) : new Date();
  const rows = room.evidence.map((item) => [
    item.title, item.workstream, item.status, item.ownerName ?? "—",
    formatRelativeUpdatedAt(item.updatedAt, now),
  ]).filter((row) => row.join(" ").toLowerCase().includes(query.toLowerCase()));
  const riskCount = room.risks.filter((risk) => risk.status === "open" || risk.status === "under_review").length;

  return (
    <main className="dd-app">
      <DiligenceSidebar viewer={room.viewer} />
      <section className="dd-main">
        <DiligenceTopbar
          room={room}
          onOpenAi={() => setAiOpen(true)}
          onInviteReviewers={() =>
            setNotice(DILIGENCE_NOTICES.inviteCopied)
          }
          onRecordDecision={() => setView("Decision")}
        />
        <DiligenceDealStrip room={room} />
        <DiligenceTabs view={view} setView={setView} riskCount={riskCount} />
        <DiligenceToast notice={notice} onDismiss={() => setNotice("")} />
        {view === "Overview" && <DiligenceOverview room={room} onOpenEvidence={() => setView("Evidence")} onOpenDiscussion={() => setView("Discussion")} />}
        {view === "Evidence" && <DiligenceEvidence query={query} setQuery={setQuery} rows={rows} requests={room.evidenceRequests ?? []} onRefresh={() => router.refresh()} />}
        {view === "Risks" && <DiligenceRisks risks={room.risks} />}
        {view === "Discussion" && <DiligenceDiscussion messages={room.discussion} />}
        {view === "Decision" && (
          <DiligenceDecision
            decision={decision}
            setDecision={setDecision}
            recommendation={room.latestRecommendation}
            onSubmitRecommendation={() =>
              setNotice(DILIGENCE_NOTICES.recommendationRecorded)
            }
          />
        )}
        {aiOpen ? (
          <DiligenceAiPanel
            roomId={room.id}
            onClose={() => setAiOpen(false)}
          />
        ) : null}
      </section>
    </main>
  );
}

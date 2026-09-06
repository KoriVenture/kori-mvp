"use client";

import { useState } from "react";
import { DiligenceMark as Mark } from "../DiligenceMark";
import type { DiligenceRoomDTO } from "../../../lib/diligence/types";

export function DiligenceEvidence({
  query,
  setQuery,
  rows,
  requests,
  onRefresh,
}: {
  query: string;
  setQuery: (s: string) => void;
  rows: string[][];
  requests: NonNullable<DiligenceRoomDTO["evidenceRequests"]>;
  onRefresh: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [clarification, setClarification] = useState("");

  async function requestClarification(requestId: string) {
    if (!clarification.trim()) return;
    setBusy(requestId);
    await fetch(`/api/diligence/requests/${requestId}/clarification`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body: clarification }),
    });
    setClarification("");
    setBusy(null);
    onRefresh();
  }

  async function resolveRequest(requestId: string) {
    setBusy(requestId);
    await fetch(`/api/diligence/requests/${requestId}/resolve`, { method: "POST" });
    setBusy(null);
    onRefresh();
  }
  return (
    <div className="dd-content">
      <section className="dd-page-title">
        <div>
          <p className="dd-kicker">Evidence register</p>
          <h2>Trace every claim to its source.</h2>
          <p>
            Documents, reviewer notes, and founder responses remain connected to the
            decision record.
          </p>
        </div>
        <button className="primary">Request evidence</button>
      </section>

      <label className="dd-search">
        Search evidence
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by document, owner, or workstream"
        />
      </label>

      <div className="dd-table">
        <header>
          <span>Evidence</span>
          <span>Workstream</span>
          <span>Status</span>
          <span>Owner</span>
          <span>Updated</span>
        </header>
        {rows.length ? (
          rows.map((row) => (
            <button key={row[0]}>
              {row.map((cell, i) => (
                <span key={cell}>{i === 2 ? <Mark>{cell}</Mark> : cell}</span>
              ))}
            </button>
          ))
        ) : (
          <div className="dd-empty">
            <b>No evidence found</b>
            <p>Try a broader search or request a new document.</p>
          </div>
        )}
      </div>

      <section className="dd-founder-bridge">
        <h3>Founder requests</h3>
        {requests.filter((request) => request.status !== "cancelled").map((request) => {
          const latest = request.messages[request.messages.length - 1];
          return <article key={request.id}>
            <header><strong>{request.workstream}</strong><Mark>{request.status}</Mark></header>
            <h4>{request.title}</h4>
            <p>{request.requestText}</p>
            <small>{request.requestedFromName ?? "Assigned Founder"}{request.dueAt ? ` · Due ${request.dueAt}` : ""}</small>
            {latest ? <p><b>Latest response:</b> {latest.body}</p> : null}
            {request.status === "response_submitted" ? <>
              <textarea value={clarification} onChange={(event) => setClarification(event.target.value)} placeholder="Request clarification" />
              <button type="button" disabled={busy === request.id || !clarification.trim()} onClick={() => void requestClarification(request.id)}>Request clarification</button>
              <button type="button" disabled={busy === request.id} onClick={() => void resolveRequest(request.id)}>Mark resolved</button>
            </> : null}
          </article>;
        })}
        {!requests.length ? <p>No investor questions have been assigned.</p> : null}
      </section>
    </div>
  );
}

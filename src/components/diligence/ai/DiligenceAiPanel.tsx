"use client";

import { useState } from "react";
import {
  DiligenceAiMessage,
  type DiligenceAiMessageValue,
} from "./DiligenceAiMessage";

const SUGGESTIONS = [
  "What are the main risks in this deal?",
  "What evidence is missing before a decision?",
  "Challenge the investment case for this deal.",
  "Draft a recommendation for human review.",
] as const;

function messageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function DiligenceAiPanel({
  roomId,
  onClose,
}: {
  roomId: string;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<DiligenceAiMessageValue[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function request(path: string, question: string) {
    const response = await fetch(`/api/diligence/rooms/${encodeURIComponent(roomId)}/ai/${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: question }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      provider?: "minimax";
      answer?: string;
      error?: string;
    };
    if (!response.ok || !payload.answer || !payload.provider) {
      throw new Error(payload.error ?? "Unable to reach Kori AI.");
    }
    return payload;
  }

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || busy) return;

    setError("");
    setInput("");
    setMessages((current) => [
      ...current,
      { id: messageId(), role: "user", content: trimmed },
    ]);
    setBusy(true);

    try {
      const result = await request("chat", trimmed);
      setMessages((current) => [
        ...current,
        {
          id: messageId(),
          role: "assistant",
          content: result.answer ?? "",
          provider: result.provider,
        },
      ]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to reach Kori AI.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="dd-ai-panel" aria-label="Kori AI">
      <header className="dd-ai-header">
        <div>
          <p className="dd-ai-eyebrow">Due Diligence Assistant</p>
          <h2>Kori AI</h2>
        </div>
        <button type="button" className="dd-ai-close" onClick={onClose} aria-label="Close Kori AI">
          ×
        </button>
      </header>

      <p className="dd-ai-notice">
        AI analysis can be incomplete. You make the final decision.
      </p>

      <div className="dd-ai-messages" aria-live="polite">
        {!messages.length ? (
          <div className="dd-ai-welcome">
            <p>Ask about the current diligence room.</p>
            <div className="dd-ai-suggestions">
              {SUGGESTIONS.map((suggestion) => (
                <button type="button" key={suggestion} onClick={() => setInput(suggestion)}>
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((message) => (
          <DiligenceAiMessage
            key={message.id}
            message={message}
            onCopy={(content) => void navigator.clipboard.writeText(content)}
          />
        ))}

        {busy ? <p className="dd-ai-loading">Kori AI is reviewing the room…</p> : null}
        {error ? <p className="dd-ai-error" role="alert">{error}</p> : null}
      </div>

      <form
        className="dd-ai-composer"
        onSubmit={(event) => {
          event.preventDefault();
          void ask(input);
        }}
      >
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about this diligence room"
          maxLength={4000}
          rows={3}
          disabled={busy}
        />
        <button type="submit" className="primary" disabled={busy || !input.trim()}>
          Ask Kori AI
        </button>
      </form>
    </aside>
  );
}

import type { DiligenceView } from "../../lib/diligence/types";

const DILIGENCE_VIEWS = ["Overview", "Evidence", "Risks", "Discussion", "Decision"] as const;

export function DiligenceTabs({ view, setView, riskCount }: { view: DiligenceView; setView: (view: DiligenceView) => void; riskCount: number }) {
  return (
        <nav className="dd-tabs" aria-label="Diligence sections">
          {DILIGENCE_VIEWS.map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={view === tab ? "active" : ""}
            >
              {tab}
              {tab === "Risks" && <b>{riskCount}</b>}
            </button>
          ))}
        </nav>
  );
}

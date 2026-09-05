import type { DiligenceRoomDTO } from "../../../lib/diligence/types";
import { DiligenceMark as Mark } from "../DiligenceMark";

export function DiligenceRisks({ risks }: { risks: DiligenceRoomDTO["risks"] }) {
  return (
    <div className="dd-content">
      <section className="dd-page-title">
        <div>
          <p className="dd-kicker">Risk register</p>
          <h2>Resolve what could change the outcome.</h2>
        </div>
        <button className="primary">Add risk</button>
      </section>
      <div className="dd-risk-list">
        {risks.map((r) => (
          <article key={r.title}>
            <b>{r.riskCode}</b>
            <Mark>{r.severity}</Mark>
            <span>{r.category}</span>
            <div>
              <h3>{r.title}</h3>
              <p>{r.description}</p>
            </div>
            <button>Review</button>
          </article>
        ))}
      </div>
    </div>
  );
}

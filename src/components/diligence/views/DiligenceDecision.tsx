import type { DiligenceRoomDTO, RecommendationDecision } from "../../../lib/diligence/types";

const RECOMMENDATIONS = ["Proceed", "Proceed with conditions", "Pause diligence", "Decline"] as const;

export function DiligenceDecision({
  decision,
  setDecision,
  recommendation,
  onSubmitRecommendation,
}: {
  decision: RecommendationDecision;
  setDecision: (s: RecommendationDecision) => void;
  recommendation: DiligenceRoomDTO["latestRecommendation"];
  onSubmitRecommendation: () => void;
}) {
  return (
    <div className="dd-content">
      <section className="dd-page-title">
        <div>
          <p className="dd-kicker">Investment recommendation</p>
          <h2>State the decision and preserve the reasoning.</h2>
          <p>
            Your recommendation will be visible to the investment committee with the
            evidence snapshot used today.
          </p>
        </div>
      </section>
      <div className="dd-decision">
        <section>
          <h3>Your recommendation</h3>
          {RECOMMENDATIONS.map((x) => (
            <label key={x} className={decision === x ? "selected" : ""}>
              <input
                type="radio"
                name="decision"
                checked={decision === x}
                onChange={() => setDecision(x)}
              />
              <span>
                <b>{x}</b>
                <small>
                  {x === "Proceed with conditions"
                    ? "Advance after named dependencies are resolved."
                    : "Record this recommendation for committee review."}
                </small>
              </span>
            </label>
          ))}
        </section>
        <section>
          <label>
            Decision rationale
            <textarea defaultValue={recommendation?.rationale ?? ""} />
          </label>
          <label>
            Conditions
            <textarea defaultValue={recommendation?.conditions ?? ""} />
          </label>
          <button
            type="button"
            className="primary"
            onClick={onSubmitRecommendation}
          >
            Submit recommendation
          </button>
        </section>
      </div>
    </div>
  );
}

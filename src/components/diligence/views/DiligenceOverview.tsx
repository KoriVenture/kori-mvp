import type { DiligenceRoomDTO } from "../../../lib/diligence/types";
import { DiligenceMark as Mark } from "../DiligenceMark";

export function DiligenceOverview({ room, onOpenEvidence, onOpenDiscussion }: { room: DiligenceRoomDTO; onOpenEvidence: () => void; onOpenDiscussion: () => void }) {
  return (
    <div className="dd-content dd-overview">
      <section className="dd-summary">
        <div>
          <p className="dd-kicker">Collective assessment</p>
          <h2>
            Conviction is building.
            <br />
            <span>One legal dependency remains.</span>
          </h2>
          <p>
            Reviewers see strong customer retention and capital efficiency. The Rwanda
            operating licence needs independent confirmation before the room can advance.
          </p>
        </div>
        <div className="dd-score">
          <span>Readiness</span>
          <strong>
            {room.readinessScore}<small>/100</small>
          </strong>
          <div>
            <i style={{ "--score": `${room.readinessScore}%` } as React.CSSProperties} />
          </div>
          <p>{room.evidenceSummary.resolved} of {room.evidenceSummary.total} evidence requests resolved</p>
        </div>
      </section>

      <section className="dd-section-head">
        <div>
          <p className="dd-kicker">Review coverage</p>
          <h3>Workstreams</h3>
        </div>
        <button onClick={onOpenEvidence}>View all evidence</button>
      </section>

      <div className="dd-workstreams">
        {room.workstreams.map((item, index) => (
          <article
            key={item.title}
            style={{ "--delay": `${index * 70}ms` } as React.CSSProperties}
          >
            <div>
              <span>0{index + 1}</span>
              <h4>{item.title}</h4>
              <Mark>{item.status}</Mark>
            </div>
            <p>Owned by {item.ownerName ?? "—"}</p>
            <div className="dd-progress">
              <i style={{ width: `${item.progress}%` }} />
            </div>
            <small>{item.progress}% reviewed</small>
          </article>
        ))}
      </div>

      <section className="dd-lower">
        <div>
          <div className="dd-section-head">
            <div>
              <p className="dd-kicker">Material signals</p>
              <h3>What changed</h3>
            </div>
          </div>
          {room.signals.slice(0, 3).map((x) => (
            <div className="dd-signal" key={x.kind}>
              <Mark>{x.kind}</Mark>
              <p>{x.message}</p>
            </div>
          ))}
        </div>
        <aside>
          <p className="dd-kicker">Room activity</p>
          <h3>{room.activity.reviewerCount} reviewers</h3>
          <p>{room.activity.activeTodayCount} active today across {room.activity.marketCount} markets</p>
          <div className="dd-avatar-row">
            {room.activity.avatars.map((x, index) => (
              <i key={`${x.displayName}-${index}`}>{x.initials}</i>
            ))}
          </div>
          <button onClick={onOpenDiscussion}>Open discussion</button>
        </aside>
      </section>
    </div>
  );
}

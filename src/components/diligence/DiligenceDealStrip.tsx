import type { DiligenceRoomDTO } from "../../lib/diligence/types";
import { formatCompactCurrency, formatRoomClose } from "../../lib/diligence/format";
import { DiligenceMark } from "./DiligenceMark";

const ROOM_STATUS = { active_review: "Active review", paused: "Paused", decision_recorded: "Decision recorded", closed: "Closed" } as const;

export function DiligenceDealStrip({ room }: { room: DiligenceRoomDTO }) {
  return (
        <div className="dd-deal-strip">
          <div>
            <span className="dd-company">{room.deal.companyInitials}</span>
            <p>
              <b>{room.deal.companyName}</b>
              <small>{room.deal.descriptor || "—"}</small>
            </p>
          </div>
          <dl>
            <div>
              <dt>Round</dt>
              <dd>{room.deal.round ?? "—"}</dd>
            </div>
            <div>
              <dt>Target</dt>
              <dd>{formatCompactCurrency(room.deal.targetAmount, room.deal.currency)}</dd>
            </div>
            <div>
              <dt>Lead</dt>
              <dd>{room.deal.leadName ?? "—"}</dd>
            </div>
            <div>
              <dt>Room closes</dt>
              <dd>{formatRoomClose(room.closesAt) || "—"}</dd>
            </div>
          </dl>
          <DiligenceMark>{ROOM_STATUS[room.status]}</DiligenceMark>
        </div>
  );
}

import type { DiligenceRoomDTO } from "../../lib/diligence/types";

export function DiligenceTopbar({
  room,
  onOpenAi,
  onInviteReviewers,
  onRecordDecision,
}: {
  room: DiligenceRoomDTO;
  onOpenAi: () => void;
  onInviteReviewers: () => void;
  onRecordDecision: () => void;
}) {
  return (
        <header className="dd-topbar">
          <div>
            <p>Diligence room / {room.code}</p>
            <h1>{room.deal.companyName}</h1>
          </div>
          <div className="dd-top-actions">
            <button type="button" onClick={onOpenAi}>
              Kori AI
            </button>
            <button type="button" onClick={onInviteReviewers}>
              Invite reviewers
            </button>
            <button type="button" className="primary" onClick={onRecordDecision}>
              Record decision
            </button>
          </div>
        </header>
  );
}

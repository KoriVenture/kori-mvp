// Display only after the corresponding API and clipboard operation succeeds.
export const DILIGENCE_NOTICES = {
  inviteCopied: "Invite link copied",
  recommendationRecorded: "Recommendation recorded for the investment committee",
} as const;

export function DiligenceToast({ notice, onDismiss }: { notice: string; onDismiss: () => void }) {
  if (!notice) return null;
  return (
    <div className="dd-toast" role="status">
      {notice}
      <button onClick={onDismiss}>Dismiss</button>
    </div>
  );
}

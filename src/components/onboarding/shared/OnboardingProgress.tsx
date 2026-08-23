export function OnboardingProgress({
  label,
  width,
}: {
  label: string;
  width: number;
}) {
  return (
    <div className="ko-progress-block">
      <div className="ko-progress-meta">
        <span>{label}</span>
        <span>Onboarding Progress</span>
      </div>
      <div className="ko-progress-track">
        <span style={{ width: `${width}px` }} />
      </div>
    </div>
  );
}

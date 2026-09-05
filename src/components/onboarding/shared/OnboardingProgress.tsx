export function OnboardingProgress({
  label,
  progress,
}: {
  label: string;
  progress: number;
}) {
  const value = Math.max(0, Math.min(100, progress));

  return (
    <div className="ko-progress-block">
      <div className="ko-progress-meta">
        <span>{label}</span>
        <span>Onboarding Progress</span>
      </div>
      <div className="ko-progress-track">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

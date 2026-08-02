import { cn } from "@kori/ui/lib/utils";

type MilestoneSegmentStatus = "done" | "current" | "pending";

type MilestoneSegment = {
  id: string;
  label: string;
  status: MilestoneSegmentStatus;
};

type MilestoneBarProps = {
  ariaLabel: string;
  className?: string;
  segments: readonly MilestoneSegment[];
};

const segmentStyles: Record<MilestoneSegmentStatus, string> = {
  done: "bg-success",
  current: "bg-primary",
  pending: "bg-border",
};

function MilestoneBar({ ariaLabel, className, segments }: MilestoneBarProps) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn("flex h-1 gap-0.5", className)}
    >
      {segments.map((segment) => (
        <span
          key={segment.id}
          className={cn("h-full flex-1", segmentStyles[segment.status])}
        >
          <span className="sr-only">{segment.label}</span>
        </span>
      ))}
    </div>
  );
}

export { MilestoneBar };
export type { MilestoneSegment, MilestoneSegmentStatus };

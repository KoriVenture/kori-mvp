"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@kori/ui/lib/utils";

const progressVariants = cva("", {
  variants: {
    variant: {
      default: "[&_[data-slot=progress-indicator]]:bg-primary",
      funding: "[&_[data-slot=progress-indicator]]:bg-primary",
      milestone: "[&_[data-slot=progress-indicator]]:bg-warning",
      locked: "[&_[data-slot=progress-indicator]]:bg-primary",
      released: "[&_[data-slot=progress-indicator]]:bg-success",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

function Progress({
  className,
  children,
  value,
  variant = "default",
  ...props
}: ProgressPrimitive.Root.Props & VariantProps<typeof progressVariants>) {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      className={cn(
        "flex flex-wrap gap-3",
        progressVariants({ variant }),
        className,
      )}
      {...props}
    >
      {children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  );
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className,
      )}
      data-slot="progress-track"
      {...props}
    />
  );
}

function ProgressIndicator({
  className,
  ...props
}: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn("h-full transition-all", className)}
      {...props}
    />
  );
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-sm font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  );
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn(
        "ml-auto text-sm text-muted-foreground tabular-nums",
        className,
      )}
      data-slot="progress-value"
      {...props}
    />
  );
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
  progressVariants,
};

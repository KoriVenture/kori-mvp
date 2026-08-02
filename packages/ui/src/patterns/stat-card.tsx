import type { ComponentProps, ReactNode } from "react";

import { cn } from "@kori/ui/lib/utils";

type StatCardProps = ComponentProps<"article"> & {
  label: ReactNode;
  value: ReactNode;
  delta?: ReactNode;
};

function StatCard({ className, label, value, delta, ...props }: StatCardProps) {
  return (
    <article
      className={cn(
        "rounded-md border border-border bg-secondary px-[1.375rem] py-5",
        className,
      )}
      {...props}
    >
      <p className="font-interface text-[0.625rem] tracking-[0.1em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 font-data text-[1.625rem] font-light tracking-[-0.02em] text-foreground">
        {value}
      </p>
      {delta ? (
        <p className="mt-2 text-[0.6875rem] text-muted-foreground">{delta}</p>
      ) : null}
    </article>
  );
}

export { StatCard };

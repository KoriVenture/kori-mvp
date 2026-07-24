import type { ComponentProps, ReactNode } from "react";

import { cn } from "@kori/ui/lib/utils";

type PanelProps = ComponentProps<"section"> & {
  title?: ReactNode;
};

function Panel({ className, children, title, ...props }: PanelProps) {
  return (
    <section
      className={cn(
        "rounded-md border border-border bg-secondary p-5 text-secondary-foreground",
        className,
      )}
      {...props}
    >
      {title ? (
        <h2 className="mb-5 font-interface text-[0.8125rem] tracking-[0.1em] uppercase">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

export { Panel };

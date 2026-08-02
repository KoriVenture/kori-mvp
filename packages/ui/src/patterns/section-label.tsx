import type { ComponentProps } from "react";

import { cn } from "@kori/ui/lib/utils";

function SectionLabel({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "mb-6 inline-flex items-center gap-4 font-interface text-[0.625rem] font-extralight tracking-[0.5em] text-primary uppercase after:h-px after:w-12 after:bg-primary/50",
        className,
      )}
      {...props}
    />
  );
}

export { SectionLabel };

import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@kori/ui/lib/utils";

const tagVariants = cva(
  "inline-flex w-fit items-center whitespace-nowrap rounded-[3px] border px-2 py-0.5 font-interface text-[0.5625rem] tracking-[0.06em] uppercase",
  {
    variants: {
      tone: {
        gold: "border-primary/50 bg-accent text-primary",
        teal: "border-success/50 bg-success/15 text-success dark:text-success-foreground",
        grey: "border-border bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      tone: "grey",
    },
  },
);

function Tag({
  className,
  tone,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof tagVariants>) {
  return <span className={cn(tagVariants({ tone }), className)} {...props} />;
}

export { Tag, tagVariants };

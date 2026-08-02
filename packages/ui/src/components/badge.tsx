import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@kori/ui/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex min-h-5 w-fit items-center justify-center gap-1.5 rounded-full border border-transparent px-2 py-0.5 text-center font-interface text-[0.625rem] leading-snug font-medium tracking-[0.08em] uppercase transition-all focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
        gold: "border-primary/60 bg-accent text-primary",
        teal: "border-success/60 bg-success/15 text-success dark:text-success-foreground",
        pending: "border-warning/60 bg-warning/15 text-foreground",
        approved:
          "border-success/60 bg-success/15 text-success dark:text-success-foreground",
        rejected:
          "border-destructive/60 bg-destructive/15 text-destructive dark:text-destructive-foreground",
        locked: "border-primary/60 bg-accent text-primary",
        released:
          "border-success/60 bg-success/15 text-success dark:text-success-foreground",
        warning: "border-warning/60 bg-warning/15 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props,
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };

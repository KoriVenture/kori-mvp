import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@kori/ui/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex min-h-9 items-center justify-center gap-2 rounded-[2px] border border-transparent bg-clip-padding px-4 py-2 text-center font-interface text-xs leading-snug font-medium tracking-[0.08em] uppercase transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/88",
        gold: "bg-primary text-primary-foreground hover:bg-primary/88",
        teal: "bg-success text-success-foreground hover:bg-success/88",
        secondary:
          "border-border bg-secondary text-secondary-foreground hover:bg-muted",
        outline:
          "border-primary bg-transparent text-primary hover:bg-accent aria-expanded:bg-accent",
        ghost:
          "bg-transparent text-foreground hover:bg-muted aria-expanded:bg-muted",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/88 focus-visible:border-destructive",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "min-h-9 px-4 py-2 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "min-h-7 px-2.5 py-1 text-[0.625rem] [&_svg:not([class*='size-'])]:size-3",
        sm: "min-h-8 px-3 py-1.5 text-[0.6875rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "min-h-11 px-6 py-3",
        icon: "size-9 min-h-0 p-0",
        "icon-xs": "size-7 min-h-0 p-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 min-h-0 p-0 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-11 min-h-0 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

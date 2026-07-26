import type { ComponentProps } from "react";

import { cn } from "@kori/ui/lib/utils";

function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("kori-container", className)} {...props} />;
}

export { Container };

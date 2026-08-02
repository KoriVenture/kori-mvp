import type { ComponentProps } from "react";

import { Badge } from "@kori/ui/components/badge";

export type StatusBadgeStatus =
  | "draft"
  | "pending"
  | "underReview"
  | "approved"
  | "rejected"
  | "locked"
  | "released"
  | "warning";

const statusVariants = {
  draft: "secondary",
  pending: "pending",
  underReview: "gold",
  approved: "approved",
  rejected: "rejected",
  locked: "locked",
  released: "released",
  warning: "warning",
} as const;

type StatusBadgeProps = Omit<ComponentProps<typeof Badge>, "variant"> & {
  status: StatusBadgeStatus;
  label: string;
};

function StatusBadge({ status, label, ...props }: StatusBadgeProps) {
  return (
    <Badge variant={statusVariants[status]} {...props}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {label}
    </Badge>
  );
}

export { StatusBadge };

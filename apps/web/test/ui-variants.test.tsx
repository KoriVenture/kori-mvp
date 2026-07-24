import { Badge, badgeVariants } from "@kori/ui/components/badge";
import { buttonVariants } from "@kori/ui/components/button";
import { cardVariants } from "@kori/ui/components/card";
import { progressVariants } from "@kori/ui/components/progress";
import { StatusBadge } from "@kori/ui/patterns/status-badge";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("Kori variants", () => {
  it("maps shared components to semantic Kori tokens", () => {
    expect(buttonVariants({ variant: "gold" })).toContain("bg-primary");
    expect(buttonVariants({ variant: "teal" })).toContain("bg-success");
    expect(cardVariants({ variant: "editorial" })).toContain("border-primary");
    expect(badgeVariants({ variant: "locked" })).toContain("text-primary");
    expect(progressVariants({ variant: "released" })).toContain("bg-success");
  });

  it("communicates status with visible text instead of color alone", () => {
    render(<StatusBadge status="released" label="Released" />);

    expect(screen.getByText("Released")).toBeVisible();
  });

  it("keeps semantic badges compatible with the shared primitive", () => {
    render(<Badge variant="approved">Approved</Badge>);

    expect(screen.getByText("Approved")).toBeVisible();
  });

  it("keeps translucent status badges readable in dark mode", () => {
    expect(badgeVariants({ variant: "pending" })).toContain("text-foreground");
    expect(badgeVariants({ variant: "released" })).toContain(
      "dark:text-success-foreground",
    );
    expect(badgeVariants({ variant: "rejected" })).toContain(
      "dark:text-destructive-foreground",
    );
  });
});

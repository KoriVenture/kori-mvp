import { Container } from "@kori/ui/patterns/container";
import { MilestoneBar } from "@kori/ui/patterns/milestone-bar";
import { Panel } from "@kori/ui/patterns/panel";
import { SectionLabel } from "@kori/ui/patterns/section-label";
import { StatCard } from "@kori/ui/patterns/stat-card";
import { Tag } from "@kori/ui/patterns/tag";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("framework-independent Kori patterns", () => {
  it("renders translated labels and values supplied by the application", () => {
    render(
      <Container>
        <SectionLabel>Capital contrôlé</SectionLabel>
        <Panel title="Résumé">
          <StatCard label="Capital reçu" value="$280K" />
          <Tag tone="teal">Débloqué</Tag>
        </Panel>
      </Container>,
    );

    expect(screen.getByText("Capital contrôlé")).toBeVisible();
    expect(screen.getByText("Résumé")).toBeVisible();
    expect(screen.getByText("Capital reçu")).toBeVisible();
    expect(screen.getByText("$280K")).toBeVisible();
    expect(screen.getByText("Débloqué")).toBeVisible();
  });

  it("communicates milestone state with accessible text", () => {
    render(
      <MilestoneBar
        ariaLabel="Progression des jalons"
        segments={[
          { id: "one", status: "done", label: "Terminé" },
          { id: "two", status: "current", label: "En cours" },
          { id: "three", status: "pending", label: "En attente" },
        ]}
      />,
    );

    expect(
      screen.getByRole("img", { name: "Progression des jalons" }),
    ).toBeVisible();
    expect(screen.getByText("Terminé")).toHaveClass("sr-only");
    expect(screen.getByText("En cours")).toHaveClass("sr-only");
    expect(screen.getByText("En attente")).toHaveClass("sr-only");
  });
});

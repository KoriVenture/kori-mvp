import {
  DemoActionDialog,
  EvidenceDialog,
  InvestmentDialog,
} from "@/components/dashboard/demo-dialogs";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

const commonLabels = {
  cancel: "Cancel",
  close: "Close",
  demoNotice: "Stored in this page only. Nothing is sent.",
  success: "Demo state updated.",
  submit: "Save demo",
};

describe("dashboard demo interactions", () => {
  it("only confirms a local action after a named field is completed", async () => {
    const user = userEvent.setup();
    render(
      <DemoActionDialog
        {...commonLabels}
        trigger="Create SPV"
        title="Create New SPV"
        fieldLabel="SPV name"
        fieldPlaceholder="SolarGrid Kenya SPV"
      />,
    );

    await user.click(screen.getByRole("button", { name: "Create SPV" }));
    const save = screen.getByRole("button", { name: "Save demo" });
    expect(save).toBeDisabled();

    await user.type(
      screen.getByRole("textbox", { name: "SPV name" }),
      "New demo vehicle",
    );
    await user.click(save);

    expect(screen.getByText("Demo state updated.")).toBeVisible();
    expect(screen.getByText(commonLabels.demoNotice)).toBeVisible();
  });

  it("gates an open investment behind explicit agreement", async () => {
    const user = userEvent.setup();
    render(
      <InvestmentDialog
        {...commonLabels}
        agreement="I understand this is only a simulation."
        amountLabel="Demo amount"
        dealName="HealthLink South Africa"
        open
        closedLabel="Deal closed"
        trigger="View & Invest"
      />,
    );

    await user.click(screen.getByRole("button", { name: "View & Invest" }));
    const submit = screen.getByRole("button", { name: "Save demo" });
    expect(submit).toBeDisabled();

    await user.type(
      screen.getByRole("textbox", { name: "Demo amount" }),
      "25000",
    );
    expect(submit).toBeDisabled();

    await user.click(
      screen.getByRole("checkbox", {
        name: "I understand this is only a simulation.",
      }),
    );
    expect(submit).toBeEnabled();
  });

  it("keeps closed deals disabled and displays selected evidence locally", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <InvestmentDialog
        {...commonLabels}
        agreement="I understand"
        amountLabel="Demo amount"
        dealName="SolarGrid Kenya"
        open={false}
        closedLabel="Deal closed"
        trigger="View & Invest"
      />,
    );

    expect(screen.getByRole("button", { name: "Deal closed" })).toBeDisabled();

    rerender(
      <EvidenceDialog
        {...commonLabels}
        fileLabel="Supporting documents"
        notesLabel="Evidence notes"
        title="Submit Milestone Evidence"
        trigger="Submit Evidence"
      />,
    );
    await user.click(screen.getByRole("button", { name: "Submit Evidence" }));
    const file = new File(["demo"], "evidence.pdf", {
      type: "application/pdf",
    });
    await user.upload(screen.getByLabelText("Supporting documents"), file);

    expect(screen.getByText("evidence.pdf")).toBeVisible();
  });
});

import simulatorMessages from "@/messages/en/simulator.json";
import { SimulatorClient } from "@/components/simulator/simulator-client";
import { NextIntlClientProvider } from "next-intl";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

function renderSimulator() {
  return render(
    <NextIntlClientProvider
      locale="en"
      messages={{ simulator: simulatorMessages }}
      timeZone="UTC"
    >
      <SimulatorClient />
    </NextIntlClientProvider>,
  );
}

describe("SimulatorClient", () => {
  it("labels the surface as a local demonstration and warns on invalid allocation", async () => {
    const user = userEvent.setup();
    renderSimulator();

    expect(
      screen.getByText("Demonstration only — no contract is deployed."),
    ).toBeVisible();
    expect(screen.getByText("$1,000,000")).toBeVisible();

    const firstPercentage = screen.getByRole("spinbutton", {
      name: "Milestone 1 percentage",
    });
    await user.clear(firstPercentage);
    await user.type(firstPercentage, "25");

    expect(screen.getByRole("alert")).toHaveTextContent("105%");
    expect(
      screen.getByRole("button", { name: "Submit validation proof" }),
    ).toBeDisabled();
  });

  it("gates sequential release, records events, and resets local state", async () => {
    const user = userEvent.setup();
    renderSimulator();

    expect(
      screen.getAllByRole("button", {
        name: "Locked — complete previous milestone",
      }),
    ).toHaveLength(2);

    await user.click(
      screen.getByRole("button", { name: "Submit validation proof" }),
    );
    expect(
      screen.getByRole("button", { name: "Execute demo transfer" }),
    ).toBeEnabled();
    expect(screen.getByText(/Validator proof submitted/)).toBeVisible();

    await user.click(
      screen.getByRole("button", { name: "Execute demo transfer" }),
    );
    expect(screen.getAllByText("$200,000")).toHaveLength(2);
    expect(screen.getByText(/MilestoneReleased\(0\)/)).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Reset simulator" }));
    expect(screen.getByText("$0")).toBeVisible();
    expect(
      screen.getAllByRole("button", { name: "Submit validation proof" }),
    ).toHaveLength(1);
  });
});

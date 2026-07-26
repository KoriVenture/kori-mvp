import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

const labels = {
  emailLabel: "Email address",
  placeholder: "your@email.com",
  submit: "Join",
  required: "Email is required.",
  invalid: "Enter a valid email address.",
  success: "Recorded for this browser session only.",
  demoNotice: "No remote registration is created.",
};

describe("WaitlistForm", () => {
  it("shows localized validation for missing and invalid email values", async () => {
    const user = userEvent.setup();
    render(<WaitlistForm {...labels} />);

    await user.click(screen.getByRole("button", { name: "Join" }));
    expect(screen.getByText("Email is required.")).toBeVisible();

    await user.type(
      screen.getByRole("textbox", { name: "Email address" }),
      "x",
    );
    await user.click(screen.getByRole("button", { name: "Join" }));
    expect(screen.getByText("Enter a valid email address.")).toBeVisible();
  });

  it("updates explicit local demo state without claiming remote persistence", async () => {
    const user = userEvent.setup();
    render(<WaitlistForm {...labels} />);
    const input = screen.getByRole("textbox", { name: "Email address" });

    await user.type(input, "amara@example.com");
    await user.click(screen.getByRole("button", { name: "Join" }));

    expect(screen.getByText(labels.success)).toBeVisible();
    expect(screen.getByText(labels.demoNotice)).toBeVisible();
    expect(input).toHaveValue("");
  });
});

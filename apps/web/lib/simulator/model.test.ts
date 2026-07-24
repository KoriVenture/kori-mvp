import { describe, expect, it } from "vitest";

import {
  beginValidation,
  calculateLocked,
  calculateReleased,
  createDemoHash,
  createInitialSimulatorState,
  releaseMilestone,
  renderContractPreview,
  resetSimulator,
  updateMilestonePercentage,
  validatePercentages,
} from "./model";

describe("simulator model", () => {
  it("starts with the canonical 20/30/50 allocation and a fully locked fund", () => {
    const state = createInitialSimulatorState();

    expect(state.fund).toBe(1_000_000);
    expect(state.milestones.map(({ percentage }) => percentage)).toEqual([
      20, 30, 50,
    ]);
    expect(state.milestones.every(({ status }) => status === "locked")).toBe(
      true,
    );
    expect(validatePercentages(state.milestones)).toEqual({
      total: 100,
      valid: true,
    });
    expect(calculateReleased(state)).toBe(0);
    expect(calculateLocked(state)).toBe(1_000_000);
  });

  it("rejects an invalid total before validation can begin", () => {
    const invalid = updateMilestonePercentage(
      createInitialSimulatorState(),
      0,
      25,
    );

    expect(validatePercentages(invalid.milestones)).toEqual({
      total: 105,
      valid: false,
    });
    expect(() => beginValidation(invalid, 0)).toThrow(/100/);
  });

  it("enforces sequential locked → validating → released transitions", () => {
    const initial = createInitialSimulatorState();

    expect(() => beginValidation(initial, 1)).toThrow(/previous/i);
    const validating = beginValidation(initial, 0, {
      hash: "0x1111111111111111111111111111111111111111",
      time: "09:00:00",
    });
    expect(validating.milestones[0]?.status).toBe("validating");
    expect(calculateReleased(validating)).toBe(0);

    const released = releaseMilestone(validating, 0, {
      hash: "0x2222222222222222222222222222222222222222",
      time: "09:01:00",
    });
    expect(released.milestones[0]?.status).toBe("released");
    expect(released.milestones[0]?.hash).toBe(
      "0x2222222222222222222222222222222222222222",
    );
    expect(calculateReleased(released)).toBe(200_000);
    expect(calculateLocked(released)).toBe(800_000);
    expect(beginValidation(released, 1).milestones[1]?.status).toBe(
      "validating",
    );
  });

  it("resets progress and creates 40-hex-character demo hashes", () => {
    const validating = beginValidation(createInitialSimulatorState(), 0);
    const released = releaseMilestone(validating, 0);
    const reset = resetSimulator(released);
    const hash = createDemoHash(() => 0.5);

    expect(reset.milestones.every(({ status }) => status === "locked")).toBe(
      true,
    );
    expect(reset.milestones.map(({ percentage }) => percentage)).toEqual([
      20, 30, 50,
    ]);
    expect(hash).toMatch(/^0x[0-9a-f]{40}$/);
  });

  it("renders an honest, pedagogical contract preview", () => {
    const preview = renderContractPreview(createInitialSimulatorState());

    expect(preview).toContain("contract KoriSPV");
    expect(preview).toContain("totalFund = 1000000");
    expect(preview).toContain("MVP shipped");
    expect(preview).toContain("released: false");
    expect(preview).toContain("DEMO ONLY");
  });
});

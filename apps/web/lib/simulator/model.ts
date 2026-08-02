export type SimulatorMilestoneStatus = "locked" | "validating" | "released";

export type SimulatorMilestone = {
  id: number;
  label: string;
  condition: string;
  percentage: number;
  status: SimulatorMilestoneStatus;
  hash: string | null;
  time: string | null;
};

export type SimulatorEvent = {
  id: string;
  type: "create" | "validate" | "release";
  message: string;
  hash: string;
  amount: number | null;
  time: string;
};

export type SimulatorState = {
  fund: number;
  milestones: SimulatorMilestone[];
  events: SimulatorEvent[];
};

type TransitionContext = {
  hash?: string;
  time?: string;
};

const initialMilestones: readonly Omit<
  SimulatorMilestone,
  "hash" | "status" | "time"
>[] = [
  {
    id: 0,
    label: "Milestone 1",
    condition: "MVP shipped · 100 active users",
    percentage: 20,
  },
  {
    id: 1,
    label: "Milestone 2",
    condition: "$10K MRR · product–market signal",
    percentage: 30,
  },
  {
    id: 2,
    label: "Milestone 3",
    condition: "$50K MRR · 3 enterprise pilot contracts",
    percentage: 50,
  },
];

function timestamp() {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

export function createDemoHash(random: () => number = Math.random): string {
  const characters = "0123456789abcdef";
  let value = "0x";
  for (let index = 0; index < 40; index += 1) {
    const position = Math.min(
      characters.length - 1,
      Math.floor(random() * characters.length),
    );
    value += characters[position];
  }
  return value;
}

function createEvent(
  type: SimulatorEvent["type"],
  message: string,
  amount: number | null,
  context: TransitionContext = {},
): SimulatorEvent {
  const hash = context.hash ?? createDemoHash();
  const time = context.time ?? timestamp();
  return {
    id: `${type}-${hash}-${time}`,
    type,
    message,
    hash,
    amount,
    time,
  };
}

export function createInitialSimulatorState(
  context: TransitionContext = {},
): SimulatorState {
  const fund = 1_000_000;
  return {
    fund,
    milestones: initialMilestones.map((milestone) => ({
      ...milestone,
      status: "locked",
      hash: null,
      time: null,
    })),
    events: [
      createEvent(
        "create",
        "KoriSPV demo initialized · 1,000,000 USDC represented as locked",
        null,
        context,
      ),
    ],
  };
}

export function validatePercentages(
  milestones: readonly Pick<SimulatorMilestone, "percentage">[],
): { total: number; valid: boolean } {
  const total = milestones.reduce(
    (sum, milestone) => sum + milestone.percentage,
    0,
  );
  return {
    total,
    valid:
      total === 100 &&
      milestones.every(
        ({ percentage }) =>
          Number.isFinite(percentage) &&
          Number.isInteger(percentage) &&
          percentage >= 1 &&
          percentage <= 99,
      ),
  };
}

export function milestoneAmount(
  state: Pick<SimulatorState, "fund">,
  milestone: Pick<SimulatorMilestone, "percentage">,
): number {
  return Math.round((state.fund * milestone.percentage) / 100);
}

export function calculateReleased(state: SimulatorState): number {
  return state.milestones
    .filter(({ status }) => status === "released")
    .reduce((sum, milestone) => sum + milestoneAmount(state, milestone), 0);
}

export function calculateLocked(state: SimulatorState): number {
  return state.fund - calculateReleased(state);
}

function milestoneAt(state: SimulatorState, id: number): SimulatorMilestone {
  const milestone = state.milestones.find((item) => item.id === id);
  if (!milestone) throw new Error(`Unknown milestone ${id}.`);
  return milestone;
}

export function updateMilestonePercentage(
  state: SimulatorState,
  id: number,
  percentage: number,
): SimulatorState {
  const milestone = milestoneAt(state, id);
  if (milestone.status !== "locked") {
    throw new Error("Only locked milestones can be edited.");
  }
  const normalized = Math.max(1, Math.min(99, Math.round(percentage || 1)));
  return {
    ...state,
    milestones: state.milestones.map((item) =>
      item.id === id ? { ...item, percentage: normalized } : item,
    ),
  };
}

export function updateMilestoneCondition(
  state: SimulatorState,
  id: number,
  condition: string,
): SimulatorState {
  const milestone = milestoneAt(state, id);
  if (milestone.status !== "locked") {
    throw new Error("Only locked milestones can be edited.");
  }
  return {
    ...state,
    milestones: state.milestones.map((item) =>
      item.id === id ? { ...item, condition } : item,
    ),
  };
}

export function updateFund(
  state: SimulatorState,
  fund: number,
): SimulatorState {
  if (state.milestones.some(({ status }) => status !== "locked")) {
    throw new Error("Reset milestone progress before editing the fund.");
  }
  return {
    ...state,
    fund: Math.max(10_000, Math.round(fund || 10_000)),
  };
}

export function beginValidation(
  state: SimulatorState,
  id: number,
  context: TransitionContext = {},
): SimulatorState {
  const allocation = validatePercentages(state.milestones);
  if (!allocation.valid) {
    throw new Error(
      `Milestone percentages must total 100 before validation (current total: ${allocation.total}).`,
    );
  }

  const milestone = milestoneAt(state, id);
  if (milestone.status !== "locked") {
    throw new Error("Only a locked milestone can begin validation.");
  }

  const index = state.milestones.findIndex((item) => item.id === id);
  if (index > 0 && state.milestones[index - 1]?.status !== "released") {
    throw new Error("Complete the previous milestone first.");
  }

  const event = createEvent(
    "validate",
    `Validator proof submitted for ${milestone.label} — “${milestone.condition}”`,
    null,
    context,
  );

  return {
    ...state,
    milestones: state.milestones.map((item) =>
      item.id === id ? { ...item, status: "validating" } : item,
    ),
    events: [...state.events, event],
  };
}

export function releaseMilestone(
  state: SimulatorState,
  id: number,
  context: TransitionContext = {},
): SimulatorState {
  const milestone = milestoneAt(state, id);
  if (milestone.status !== "validating") {
    throw new Error(
      "A milestone must be validating before it can be released.",
    );
  }

  const hash = context.hash ?? createDemoHash();
  const time = context.time ?? timestamp();
  const amount = milestoneAmount(state, milestone);
  const event = createEvent(
    "release",
    `MilestoneReleased(${id}) — ${amount.toLocaleString("en-US")} demo USDC marked transferred`,
    amount,
    { hash, time },
  );

  return {
    ...state,
    milestones: state.milestones.map((item) =>
      item.id === id ? { ...item, status: "released", hash, time } : item,
    ),
    events: [...state.events, event],
  };
}

export function resetSimulator(
  _state?: SimulatorState,
  context: TransitionContext = {},
): SimulatorState {
  return createInitialSimulatorState(context);
}

export function renderContractPreview(state: SimulatorState): string {
  const milestones = state.milestones
    .map(
      (milestone) => `    // ${milestone.condition}
    milestones[${milestone.id}] = Milestone({
      amount: ${milestoneAmount(state, milestone)},
      released: ${milestone.status === "released" ? "true" : "false"}
    });`,
    )
    .join("\n\n");

  return `// DEMO ONLY — illustrative preview, not compiled or deployed
pragma solidity ^0.8.20;

contract KoriSPV {
  uint public totalFund = ${state.fund};

  struct Milestone {
    uint amount;
    bool released;
  }

  Milestone[${state.milestones.length}] public milestones;

  constructor() {
${milestones}
  }

  function validateAndRelease(uint milestoneId) external {
    // A real implementation would enforce validator and multisig controls.
    milestones[milestoneId].released = true;
  }
}`;
}

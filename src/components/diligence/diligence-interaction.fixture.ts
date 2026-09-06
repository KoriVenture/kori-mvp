// Executed only by diligence-interaction-contract.test.ts through the TSX test loader.
import assert from "node:assert/strict";
import test from "node:test";
import { DILIGENCE_VISUAL_ROOM, VISUAL_REFERENCE_TIME } from "../../lib/diligence/visual-fixture.ts";

import type { ReactElement, ReactNode } from "react";

import type { DiligenceRoomDTO } from "../../lib/diligence/types.ts";
import {
  beginDiligenceRender,
  diligenceStateSnapshot,
  resetDiligenceState,
} from "./diligence-state-harness.ts";

const room: DiligenceRoomDTO = {
  id: "8f14e45f-ea67-4f21-9ba0-23c80b3e6a3e",
  code: "KV-024",
  status: "active_review",
  closesAt: null,
  readinessScore: 68,
  viewer: {
    userId: "610b32ba-8f87-4d26-94fb-6fbe18bd96f9",
    displayName: "Adaeze Okafor",
    initials: "AO",
    role: "reviewer",
    photoUrl: null,
  },
  deal: {
    id: "f5279d15-ab4e-40b7-bc6e-833bf745c69d",
    startupId: "9212af34-1380-4dc3-b79c-5ccbfad12f5f",
    companyName: "Terranova Mobility",
    companyInitials: "TM",
    descriptor: "Electric logistics · Kigali, Rwanda",
    round: "Seed",
    targetAmount: 2_400_000,
    currency: "USD",
    leadName: "Baobab Capital",
  },
  workstreams: [],
  evidenceSummary: { resolved: 0, total: 0 },
  evidence: [],
  risks: [],
  signals: [],
  discussion: [],
  activity: {
    reviewerCount: 1,
    activeTodayCount: 1,
    marketCount: 1,
    avatars: [{ initials: "AO", displayName: "Adaeze Okafor" }],
  },
  latestRecommendation: null,
};

const { DueDiligenceRoom } = await import("./DueDiligenceRoom.tsx");

type ElementProps = {
  children?: ReactNode;
  className?: string;
  "aria-label"?: string;
  onClick?: () => void;
  onChange?: (event: { target: { value: string } }) => void;
  onSubmit?: (event: { preventDefault: () => void }) => void;
  disabled?: boolean;
  checked?: boolean;
  defaultValue?: string;
  value?: string;
};

function isElement(node: ReactNode): node is ReactElement<ElementProps> {
  return Boolean(
    node &&
    typeof node === "object" &&
    "type" in node &&
    "props" in node,
  );
}

function children(node: ReactNode): ReactNode[] {
  if (!isElement(node)) return [];
  const value = node.props.children;
  return Array.isArray(value) ? value.flat(Infinity) : [value];
}

function expand(node: ReactNode): ReactNode {
  if (Array.isArray(node)) return node.map(expand);
  if (!isElement(node)) return node;
  if (typeof node.type === "function") {
    return expand((node.type as (props: ElementProps) => ReactNode)(node.props));
  }
  return { ...node, props: { ...node.props, children: children(node).map(expand) } };
}

function descendants(node: ReactNode): Array<ReactElement<ElementProps>> {
  if (!isElement(node)) return [];
  return [node, ...children(node).flatMap(descendants)];
}

function text(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  return children(node).map(text).join("");
}

function renderRoom(data: DiligenceRoomDTO = room) {
  beginDiligenceRender();
  return expand(DueDiligenceRoom({ initialRoom: data, referenceTime: VISUAL_REFERENCE_TIME })) as ReactElement<ElementProps>;
}

test("renders the exact initial shell, navigation state and state defaults", () => {
  resetDiligenceState();
  const root = renderRoom();

  assert.equal(root.type, "main");
  assert.equal(root.props.className, "dd-app");

  const directChildren = children(root).filter(isElement);
  assert.deepEqual(
    directChildren.map((element) => [element.type, element.props.className]),
    [["aside", "dd-rail"], ["section", "dd-main"]],
  );

  const all = descendants(root);
  const tabs = all.find(
    (element) => element.type === "nav" && element.props["aria-label"] === "Diligence sections",
  );
  assert.ok(tabs);
  assert.deepEqual(children(tabs).filter(isElement).map(text), [
    "Overview",
    "Evidence",
    "Risks0",
    "Discussion",
    "Decision",
  ]);

  const productNav = all.find(
    (element) => element.type === "nav" && element.props["aria-label"] === "Product navigation",
  );
  assert.ok(productNav);
  const diligence = children(productNav).filter(isElement).find((button) =>
    children(button).some((child) => child === "Diligence"));
  assert.ok(diligence);
  assert.equal(diligence.props.className, "active");

  const heading = all.find((element) => element.type === "h2");
  assert.ok(heading);
  assert.equal(text(heading), "Conviction is building.One legal dependency remains.");
  assert.deepEqual(diligenceStateSnapshot(), [
    "Overview",
    "Proceed with conditions",
    "",
    "",
  ]);
});

test("the actual Record decision handler transitions the rendered view", () => {
  resetDiligenceState();
  const initial = renderRoom();
  const recordDecision = descendants(initial).find(
    (element) => element.type === "button" && text(element) === "Record decision",
  );
  assert.ok(recordDecision?.props.onClick);

  recordDecision.props.onClick();
  const updated = renderRoom();
  const heading = descendants(updated).find((element) => element.type === "h2");
  assert.ok(heading);
  assert.equal(text(heading), "State the decision and preserve the reasoning.");
});

function button(root: ReactNode, label: string) {
  const found = descendants(root).find((node) => node.type === "button" && text(node) === label);
  assert.ok(found, `button ${label}`);
  return found;
}

test("overview mapping and shortcuts, risk counts, and empty production values stay live", () => {
  resetDiligenceState();
  const initial = renderRoom();
  assert.ok(text(initial).includes("0 of 0 evidence requests resolved"));
  assert.ok(text(initial).includes("1 reviewers"));
  assert.ok(text(initial).includes("Room closes—"));
  button(initial, "View all evidence").props.onClick?.();
  assert.ok(text(renderRoom()).includes("Trace every claim to its source."));
  button(renderRoom(), "Overview").props.onClick?.();
  button(renderRoom(), "Open discussion").props.onClick?.();
  assert.ok(text(renderRoom()).includes("Make the reasoning visible."));
  const note = button(renderRoom(), "Post note");
  assert.equal(note.props.disabled, true);
});

test("recommendation default text stays empty, stored values render, and no fake success is shown", () => {
  resetDiligenceState();
  button(renderRoom(), "Record decision").props.onClick?.();
  const decision = renderRoom();
  assert.deepEqual(descendants(decision).filter((node) => node.type === "textarea").map((node) => node.props.defaultValue), ["", ""]);
  button(decision, "Submit recommendation").props.onClick?.();
  assert.ok(!text(renderRoom()).includes("Recommendation recorded for the investment committee"));
  const radios = descendants(renderRoom()).filter((node) => node.type === "input");
  assert.equal(radios[1].props.checked, true);
  radios[3].props.onChange?.({ target: { value: "Decline" } });
  assert.equal(descendants(renderRoom()).filter((node) => node.type === "input")[3].props.checked, true);
  resetDiligenceState();
  const stored = { ...room, latestRecommendation: { id: "rec", decision: "Pause diligence" as const, rationale: "Pending review", conditions: "", submittedAt: "2026-09-01" } };
  button(renderRoom(stored), "Record decision").props.onClick?.();
  assert.deepEqual(descendants(renderRoom(stored)).filter((node) => node.type === "textarea").map((node) => node.props.defaultValue), ["Pending review", ""]);
  assert.equal(descendants(renderRoom(stored)).filter((node) => node.type === "input")[2].props.checked, true);
});

test("all canonical views render exact fixture copy, classes, order and deterministic timestamps", () => {
  resetDiligenceState();
  const render = () => renderRoom(DILIGENCE_VISUAL_ROOM);
  const initial = render();
  const main = children(initial).filter(isElement)[1];
  assert.deepEqual(children(main).filter(isElement).map((node) => [node.type, node.props.className]), [["header", "dd-topbar"], ["div", "dd-deal-strip"], ["nav", "dd-tabs"], ["div", "dd-content dd-overview"]]);
  for (const copy of ["Diligence room / KV-024", "Terranova Mobility", "Electric logistics · Kigali, Rwanda", "RoundSeedTarget$2.4MLeadBaobab CapitalRoom closes18 Sep 2026", "Collective assessment", "Conviction is building.One legal dependency remains.", "Reviewers see strong customer retention and capital efficiency. The Rwanda operating licence needs independent confirmation before the room can advance.", "Readiness68/100", "12 of 17 evidence requests resolved", "Review coverage", "Workstreams", "Material signals", "What changed", "Room activity", "14 reviewers", "7 active today across 4 markets", "AOKAMRCN+10"])
    assert.ok(text(initial).includes(copy), copy);
  const classes = descendants(initial).map((node) => node.props.className);
  for (const name of ["dd-app", "dd-rail", "dd-person", "dd-main", "dd-topbar", "dd-top-actions", "dd-deal-strip", "dd-company", "dd-mark active-review", "dd-tabs", "dd-content dd-overview", "dd-summary", "dd-kicker", "dd-score", "dd-section-head", "dd-workstreams", "dd-progress", "dd-lower", "dd-signal", "dd-avatar-row", "dd-mark clear", "dd-mark review", "dd-mark blocked", "dd-mark positive", "dd-mark watch", "dd-mark critical"])
    assert.ok(classes.includes(name), name);
  assert.ok(text(initial).includes("01Market & customer evidenceClearOwned by Adaeze O.86% reviewed"));
  assert.ok(text(initial).includes("02Product & technologyReviewOwned by Kwame A.72% reviewed"));
  assert.ok(text(initial).includes("03Financial modelReviewOwned by Maya R.64% reviewed"));
  assert.ok(text(initial).includes("04Legal & governanceBlockedOwned by Chidi N.45% reviewed"));
  assert.ok(text(initial).includes("PositiveEnterprise retention confirmed at 91% across the latest two cohorts."));
  assert.ok(text(initial).includes("WatchGross margin assumptions rely on a supplier rebate not yet contracted."));
  assert.ok(text(initial).includes("CriticalOperating licence evidence is incomplete for the proposed expansion."));
  button(initial, "Evidence").props.onClick?.();
  const evidence = render();
  assert.ok(text(evidence).includes("Evidence registerTrace every claim to its source.Documents, reviewer notes, and founder responses remain connected to the decision record."));
  const table = descendants(evidence).find((node) => node.props.className === "dd-table");
  assert.ok(table);
  assert.deepEqual(children(table).filter(isElement).map(text), ["EvidenceWorkstreamStatusOwnerUpdated", "Customer cohort exportMarketVerifiedAdaeze O.2h ago", "Payments architecture reviewTechnologyNeeds responseKwame A.Yesterday", "Three-year operating modelFinanceVerifiedMaya R.Yesterday", "Nigeria operating licenceLegalMissingChidi N.3 days ago"]);
  const input = descendants(evidence).find((node) => node.type === "input");
  assert.ok(input?.props.onChange);
  input.props.onChange({ target: { value: "KWAME" } });
  assert.ok(text(render()).includes("Payments architecture review"));
  assert.ok(!text(render()).includes("Customer cohort export"));
  input.props.onChange({ target: { value: "not-found" } });
  assert.ok(text(render()).includes("No evidence foundTry a broader search or request a new document."));
  button(render(), "Risks3").props.onClick?.();
  const riskView = render();
  assert.ok(text(riskView).includes("Risk registerResolve what could change the outcome."));
  assert.deepEqual(descendants(riskView).filter((node) => node.type === "article").map(text), ["R-01CriticalRegulatoryRwanda operating licence scopeExpansion revenue cannot be underwritten until the licence scope is independently verified.Review", "R-02HighFinancialSupplier rebate concentrationBase-case gross margin includes an unsigned volume rebate from a single battery supplier.Review", "R-03MediumCommercialEnterprise customer concentrationThe top three accounts contribute 41% of annual recurring revenue.Review"]);
  button(riskView, "Discussion").props.onClick?.();
  const discussion = render();
  assert.ok(text(discussion).includes("Reviewer discussionMake the reasoning visible."));
  assert.deepEqual(descendants(discussion).filter((node) => node.type === "article").map(text), ["AOAdaeze Okafor ReviewerThe retention analysis holds up. I checked the raw cohort export against the investor memo.Reply", "KAKwame Asante ReviewerAgree on retention. I still need the founder to reconcile the telemetry volume with the infrastructure invoice.Reply", "CNChidi Nwosu ReviewerLicence counsel confirmed receipt. Independent scope opinion is expected Thursday.Reply"]);
  const textarea = descendants(discussion).find((node) => node.type === "textarea");
  textarea?.props.onChange?.({ target: { value: "   " } });
  assert.equal(button(render(), "Post note").props.disabled, true);
  textarea?.props.onChange?.({ target: { value: "Keep this unsubmitted draft" } });
  assert.equal(button(render(), "Post note").props.disabled, false);
  descendants(render()).find((node) => node.type === "form")?.props.onSubmit?.({ preventDefault() {} });
  assert.equal(descendants(render()).find((node) => node.type === "textarea")?.props.value, "Keep this unsubmitted draft");
  button(render(), "Decision").props.onClick?.();
  const decision = render();
  assert.ok(text(decision).includes("Investment recommendationState the decision and preserve the reasoning.Your recommendation will be visible to the investment committee with the evidence snapshot used today."));
  assert.deepEqual(descendants(decision).filter((node) => node.type === "textarea").map((node) => node.props.defaultValue), ["Customer retention and unit economics support continued conviction. Proceed subject to independent confirmation that the Rwanda operating licence covers the planned fleet expansion.", "Receive counsel opinion on licence scope; execute the supplier rebate agreement before funds are released."]);
  assert.ok(text(decision).includes("Proceed with conditionsAdvance after named dependencies are resolved."));
});

test("room data controls risk badge, nullable owner fields and the three signal limit", () => {
  resetDiligenceState();
  const data: DiligenceRoomDTO = { ...DILIGENCE_VISUAL_ROOM, status: "paused", deal: { ...DILIGENCE_VISUAL_ROOM.deal, round: null, leadName: null }, workstreams: [{ ...DILIGENCE_VISUAL_ROOM.workstreams[0], ownerName: null }], signals: [...DILIGENCE_VISUAL_ROOM.signals, { kind: "Watch", message: "Fourth signal must not render" }], risks: DILIGENCE_VISUAL_ROOM.risks.map((risk, index) => ({ ...risk, status: index === 0 ? "closed" : index === 1 ? "under_review" : "open" })) };
  const initial = renderRoom(data);
  assert.ok(text(initial).includes("Risks2"));
  assert.ok(text(initial).includes("Owned by —"));
  assert.ok(text(initial).includes("Round—Target$2.4MLead—"));
  assert.ok(text(initial).includes("Paused"));
  assert.ok(!text(initial).includes("Fourth signal must not render"));
});

test("the actual visual route refuses production and supplies deterministic fixture props in development", async () => {
  const { default: VisualPage } = await import("../../app/visual-tests/diligence/page.tsx");
  const environment = process.env as { NODE_ENV?: string };
  const previous = environment.NODE_ENV;
  try {
    environment.NODE_ENV = "production";
    assert.throws(() => VisualPage(), /NEXT_HTTP_ERROR_FALLBACK;404/);
    environment.NODE_ENV = "development";
    const page = VisualPage();
    assert.deepEqual(page.props, { initialRoom: DILIGENCE_VISUAL_ROOM, referenceTime: "2026-09-06T12:00:00.000Z" });
    assert.equal(page.type, DueDiligenceRoom);
  } finally {
    if (previous === undefined) delete environment.NODE_ENV;
    else environment.NODE_ENV = previous;
  }
});

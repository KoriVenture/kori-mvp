"use client";

import { Button } from "@kori/ui/components/button";
import { Input } from "@kori/ui/components/input";
import { Label } from "@kori/ui/components/label";
import { toast } from "@kori/ui/components/sonner";
import { Panel } from "@kori/ui/patterns/panel";
import { StatCard } from "@kori/ui/patterns/stat-card";
import {
  ArrowDown,
  Check,
  Clock3,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import {
  beginValidation,
  calculateLocked,
  calculateReleased,
  createInitialSimulatorState,
  milestoneAmount,
  releaseMilestone,
  renderContractPreview,
  resetSimulator,
  updateFund,
  updateMilestoneCondition,
  updateMilestonePercentage,
  validatePercentages,
  type SimulatorState,
} from "@/lib/simulator/model";

function formatAmount(locale: string, value: number) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusClasses(status: "locked" | "released" | "validating") {
  if (status === "released") return "border-success bg-success/8";
  if (status === "validating") return "border-primary bg-primary/8";
  return "border-border bg-secondary";
}

export function SimulatorClient() {
  const t = useTranslations("simulator");
  const locale = useLocale();
  const [state, setState] = useState<SimulatorState>(
    createInitialSimulatorState,
  );
  const [percentageDrafts, setPercentageDrafts] = useState<
    Record<number, string>
  >({});
  const released = calculateReleased(state);
  const locked = calculateLocked(state);
  const allocation = validatePercentages(state.milestones);
  const releasedCount = state.milestones.filter(
    ({ status }) => status === "released",
  ).length;
  const preview = useMemo(() => renderContractPreview(state), [state]);

  function changePercentage(id: number, value: string) {
    setPercentageDrafts((current) => ({ ...current, [id]: value }));
    if (value === "") return;
    setState((current) =>
      updateMilestonePercentage(current, id, Number(value)),
    );
  }

  function startValidation(id: number) {
    try {
      setState((current) => beginValidation(current, id));
      toast.success(t("feedback.validation"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  }

  function executeRelease(id: number) {
    try {
      setState((current) => releaseMilestone(current, id));
      toast.success(t("feedback.release"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  }

  function reset() {
    setState((current) => resetSimulator(current));
    setPercentageDrafts({});
    toast.success(t("feedback.reset"));
  }

  return (
    <div className="grid min-w-0 max-w-full gap-6">
      <div className="border border-primary/30 bg-primary/8 px-4 py-3 text-center font-interface text-[0.625rem] tracking-[0.12em] text-primary uppercase">
        {t("demoLabel")}
      </div>

      <div className="grid min-w-0 gap-px border border-border bg-border sm:grid-cols-3">
        <StatCard
          className="rounded-none border-0"
          label={t("summary.fund")}
          value={formatAmount(locale, state.fund)}
        />
        <StatCard
          className="rounded-none border-0"
          label={t("summary.deployed")}
          value={`${Math.round((released / state.fund) * 100)}%`}
        />
        <StatCard
          className="rounded-none border-0"
          label={t("summary.milestones")}
          value={`${releasedCount} / ${state.milestones.length}`}
        />
      </div>

      <div className="grid min-w-0 gap-5 min-[880px]:grid-cols-[minmax(15rem,0.8fr)_minmax(22rem,1.15fr)_minmax(20rem,1fr)]">
        <div className="grid min-w-0 content-start gap-5">
          <Panel title={t("wallets.title")} className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center border border-primary/40 bg-primary/10 text-primary">
                <WalletCards aria-hidden="true" className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  {t("wallets.multisig")}
                </span>
                <span className="block truncate text-[0.625rem] text-muted-foreground">
                  {t("wallets.multisigDetail")}
                </span>
              </span>
              <span className="text-right font-data text-xs text-primary">
                {formatAmount(locale, locked)} {t("wallets.locked")}
              </span>
            </div>
            <div className="my-4 flex items-center justify-center gap-2 font-interface text-[0.5625rem] tracking-[0.08em] text-muted-foreground uppercase">
              <ArrowDown aria-hidden="true" className="size-3" />
              {t("wallets.flow")}
            </div>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center border border-success/40 bg-success/10 text-success">
                <ShieldCheck aria-hidden="true" className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  {t("wallets.startup")}
                </span>
                <span className="block truncate text-[0.625rem] text-muted-foreground">
                  {t("wallets.startupDetail")}
                </span>
              </span>
              <span className="text-right">
                <span className="block font-data text-xs text-success">
                  {formatAmount(locale, released)}
                </span>
                <span className="block text-[0.5625rem] text-muted-foreground">
                  {t("wallets.received")}
                </span>
              </span>
            </div>
          </Panel>

          <Panel title={t("configuration.title")} className="min-w-0">
            <div className="mb-5 grid gap-2">
              <Label htmlFor="simulator-fund">
                {t("configuration.fundLabel")}
              </Label>
              <Input
                id="simulator-fund"
                type="number"
                min={10000}
                step={10000}
                value={state.fund}
                disabled={state.milestones.some(
                  ({ status }) => status !== "locked",
                )}
                onChange={(event) =>
                  setState((current) =>
                    updateFund(current, Number(event.currentTarget.value)),
                  )
                }
                className="h-10 rounded-[2px] font-data"
              />
            </div>

            <div className="space-y-5">
              {state.milestones.map((milestone) => {
                const editable = milestone.status === "locked";
                return (
                  <fieldset
                    key={milestone.id}
                    disabled={!editable}
                    className="grid gap-2 border-t border-border pt-4"
                  >
                    <legend className="sr-only">{milestone.label}</legend>
                    <div className="grid grid-cols-[5rem_1fr] gap-2">
                      <div>
                        <Label
                          htmlFor={`percentage-${milestone.id}`}
                          className="sr-only"
                        >
                          {t("configuration.percentageLabel", {
                            name: milestone.label,
                          })}
                        </Label>
                        <Input
                          id={`percentage-${milestone.id}`}
                          type="number"
                          min={1}
                          max={99}
                          value={
                            percentageDrafts[milestone.id] ??
                            String(milestone.percentage)
                          }
                          onChange={(event) =>
                            changePercentage(
                              milestone.id,
                              event.currentTarget.value,
                            )
                          }
                          aria-label={t("configuration.percentageLabel", {
                            name: milestone.label,
                          })}
                          className="h-9 rounded-[2px] font-data"
                        />
                      </div>
                      <p className="self-center font-data text-xs text-muted-foreground">
                        % ={" "}
                        {formatAmount(
                          locale,
                          milestoneAmount(state, milestone),
                        )}
                      </p>
                    </div>
                    <Label
                      htmlFor={`condition-${milestone.id}`}
                      className="sr-only"
                    >
                      {t("configuration.conditionLabel", {
                        name: milestone.label,
                      })}
                    </Label>
                    <Input
                      id={`condition-${milestone.id}`}
                      value={milestone.condition}
                      onChange={(event) =>
                        setState((current) =>
                          updateMilestoneCondition(
                            current,
                            milestone.id,
                            event.currentTarget.value,
                          ),
                        )
                      }
                      aria-label={t("configuration.conditionLabel", {
                        name: milestone.label,
                      })}
                      className="h-9 rounded-[2px] text-xs"
                    />
                  </fieldset>
                );
              })}
            </div>

            <p
              role={allocation.valid ? "status" : "alert"}
              className={`mt-5 text-xs ${
                allocation.valid ? "text-success" : "text-destructive"
              }`}
            >
              {allocation.valid
                ? t("configuration.valid")
                : t("configuration.invalid", { total: allocation.total })}
            </p>
          </Panel>
        </div>

        <Panel title={t("milestones.title")} className="min-w-0 h-fit">
          <ol className="space-y-4">
            {state.milestones.map((milestone, index) => {
              const previousReleased =
                index === 0 ||
                state.milestones[index - 1]?.status === "released";
              const canValidate =
                milestone.status === "locked" && previousReleased;
              const amount = milestoneAmount(state, milestone);

              return (
                <li
                  key={milestone.id}
                  className={`border p-4 ${statusClasses(milestone.status)}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-full border font-data text-xs ${
                        milestone.status === "released"
                          ? "border-success text-success"
                          : milestone.status === "validating"
                            ? "border-primary text-primary"
                            : "border-border text-muted-foreground"
                      }`}
                    >
                      {milestone.status === "released" ? (
                        <Check aria-hidden="true" className="size-4" />
                      ) : milestone.status === "validating" ? (
                        <Clock3 aria-hidden="true" className="size-4" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-medium">
                            {milestone.label}
                          </h3>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                            {milestone.condition}
                          </p>
                        </div>
                        <span className="text-right">
                          <span className="block font-data text-sm text-primary">
                            {formatAmount(locale, amount)}
                          </span>
                          <span className="block text-[0.5625rem] text-muted-foreground">
                            {t("milestones.amount", {
                              percentage: milestone.percentage,
                            })}
                          </span>
                        </span>
                      </div>

                      <div className="mt-4 border-t border-border pt-3">
                        {milestone.status === "released" ? (
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="font-data text-[0.625rem] text-success">
                              {t("milestones.releasedAt", {
                                time: milestone.time ?? "",
                              })}
                              <span className="mt-1 block break-all text-muted-foreground">
                                {milestone.hash}
                              </span>
                            </p>
                            <Button
                              type="button"
                              size="sm"
                              variant="teal"
                              disabled
                            >
                              <Check aria-hidden="true" />
                              {t("milestones.released")}
                            </Button>
                          </div>
                        ) : milestone.status === "validating" ? (
                          <div className="grid gap-3">
                            <p className="text-xs leading-relaxed text-primary">
                              {t("milestones.validating")}
                            </p>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => executeRelease(milestone.id)}
                            >
                              {t("milestones.release")}
                            </Button>
                          </div>
                        ) : canValidate ? (
                          <div className="grid gap-3">
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              {t("milestones.validator")}
                            </p>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={!allocation.valid}
                              onClick={() => startValidation(milestone.id)}
                            >
                              {t("milestones.validate")}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            disabled
                            className="w-full"
                          >
                            <LockKeyhole aria-hidden="true" />
                            {t("milestones.locked")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </Panel>

        <div className="grid min-w-0 content-start gap-5">
          <Panel title={t("contract.title")} className="min-w-0">
            <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
              {t("contract.notice")}
            </p>
            <pre className="w-full min-w-0 max-w-full overflow-auto border border-border bg-[var(--kori-bg-primary)] p-4 font-data text-[0.625rem] leading-[1.7] text-muted-foreground min-[880px]:max-h-[34rem]">
              <code>{preview}</code>
            </pre>
          </Panel>

          <Panel title={t("log.title")} className="min-w-0">
            {state.events.length ? (
              <ol className="space-y-4">
                {[...state.events].reverse().map((event) => (
                  <li key={event.id} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 size-2 shrink-0 rounded-full ${
                        event.type === "release"
                          ? "bg-success"
                          : event.type === "validate"
                            ? "bg-primary"
                            : "bg-muted-foreground"
                      }`}
                    />
                    <span className="min-w-0">
                      <span className="block text-xs leading-relaxed">
                        {event.message}
                      </span>
                      <span className="mt-1 block break-all font-data text-[0.5625rem] text-muted-foreground">
                        {event.hash} · {event.time}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-muted-foreground">{t("log.empty")}</p>
            )}
          </Panel>
        </div>
      </div>

      <div className="flex justify-center border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={reset}>
          <RotateCcw aria-hidden="true" />
          {t("reset")}
        </Button>
      </div>
    </div>
  );
}

import { Button } from "@kori/ui/components/button";
import { Progress } from "@kori/ui/components/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kori/ui/components/table";
import { MilestoneBar } from "@kori/ui/patterns/milestone-bar";
import { Panel } from "@kori/ui/patterns/panel";
import { StatCard } from "@kori/ui/patterns/stat-card";
import { Tag } from "@kori/ui/patterns/tag";
import { ArrowUpRight, Check, Clock3, FileText } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { angelInvestorData } from "@/content/dashboards/angel-investor";
import { fundManagerData } from "@/content/dashboards/fund-manager";
import {
  type BusinessStatus,
  dashboardRoleConfigs,
  transactionNotice,
  type ActivityRecord,
  type DashboardRoleId,
  type DashboardView,
  type MetricRecord,
  type MilestoneRecord,
} from "@/content/dashboards/shared";
import { startupFounderData } from "@/content/dashboards/startup-founder";

import {
  DemoActionDialog,
  EvidenceDialog,
  InvestmentDialog,
} from "./demo-dialogs";

type DashboardPageProps = {
  role: DashboardRoleId;
  view: DashboardView;
};

type Translator = Awaited<ReturnType<typeof getTranslations>>;
type LocalizedMilestoneRecord = Omit<MilestoneRecord, "amountState"> & {
  amountState: string;
  description: string;
  title: string;
};

function MetricsGrid({
  metrics,
  t,
}: {
  metrics: readonly MetricRecord[];
  t: Translator;
}) {
  return (
    <div className="grid gap-px border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <StatCard
          key={metric.labelKey}
          label={t(`metrics.${metric.labelKey}.label`)}
          value={metric.value}
          delta={t(`metrics.${metric.labelKey}.detail`)}
          className="rounded-none border-0 bg-secondary"
        />
      ))}
    </div>
  );
}

function definedTranslationValues(
  values?: Record<string, number | string | undefined>,
): Record<string, number | string> | undefined {
  if (!values) return undefined;

  return Object.fromEntries(
    Object.entries(values).filter(
      (entry): entry is [string, number | string] => entry[1] !== undefined,
    ),
  );
}

function formatDemoDate(
  value: string,
  locale: string,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  },
) {
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function ActivityList({
  activities,
  t,
}: {
  activities: readonly ActivityRecord[];
  t: Translator;
}) {
  return (
    <ul className="divide-y divide-border">
      {activities.map((activity) => (
        <li key={activity.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
          <span
            aria-hidden="true"
            className={`mt-1.5 size-2 shrink-0 rounded-full ${
              activity.tone === "teal"
                ? "bg-success"
                : activity.tone === "gold"
                  ? "bg-primary"
                  : "bg-muted-foreground"
            }`}
          />
          <span>
            <span className="block text-sm leading-relaxed">
              {t(
                `data.activities.${activity.id}.text`,
                definedTranslationValues(activity.textValues),
              )}
            </span>
            <span className="mt-1 block font-data text-[0.625rem] text-muted-foreground">
              {t(
                `data.activities.${activity.id}.time`,
                definedTranslationValues(activity.timeValues),
              )}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function MilestoneGroup({
  label,
  milestones,
  progressLabel,
  statusLabel,
}: {
  label: string;
  milestones: readonly LocalizedMilestoneRecord[];
  progressLabel: string;
  statusLabel: string;
}) {
  return (
    <Panel className="rounded-[3px] p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="font-display text-lg">{label}</h2>
        <Tag tone="teal">{statusLabel}</Tag>
      </div>
      <MilestoneBar
        ariaLabel={progressLabel}
        segments={milestones.map((milestone) => ({
          id: `${label}-${milestone.id}`,
          label: milestone.title,
          status:
            milestone.status === "complete"
              ? "done"
              : milestone.status === "current"
                ? "current"
                : "pending",
        }))}
      />
      <ol className="mt-6 space-y-5">
        {milestones.map((milestone, index) => (
          <li key={milestone.id} className="flex gap-4">
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full border font-data text-[0.625rem] ${
                milestone.status === "complete"
                  ? "border-success bg-success/15 text-success"
                  : milestone.status === "current"
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border text-muted-foreground"
              }`}
            >
              {milestone.status === "complete" ? (
                <Check aria-hidden="true" className="size-3.5" />
              ) : milestone.status === "current" ? (
                <Clock3 aria-hidden="true" className="size-3.5" />
              ) : (
                index + 1
              )}
            </span>
            <span className="min-w-0">
              <span className="block font-medium">{milestone.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                {milestone.description}
              </span>
              <span className="mt-1.5 block font-data text-xs text-primary">
                {milestone.amount} {milestone.amountState}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

function TablePanel({
  headers,
  rows,
}: {
  headers: readonly string[];
  rows: readonly (readonly ReactNode[])[];
}) {
  return (
    <Panel className="rounded-[3px] p-0">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {headers.map((header) => (
              <TableHead
                key={header}
                className="h-12 px-5 font-interface text-[0.5625rem] tracking-[0.12em] text-muted-foreground uppercase"
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((cells, rowIndex) => (
            <TableRow key={rowIndex} className="h-14">
              {cells.map((cell, cellIndex) => (
                <TableCell
                  key={cellIndex}
                  className="px-5 text-xs text-muted-foreground first:font-medium first:text-foreground"
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Panel>
  );
}

function DemoNotice({ children }: { children: ReactNode }) {
  return (
    <p className="border-l-2 border-primary bg-primary/8 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

function toneForStatus(value: BusinessStatus): "gold" | "grey" | "teal" {
  return [
    "active",
    "signed",
    "released",
    "confirmed",
    "executed",
    "verified",
    "approved",
    "accepted",
  ].includes(value)
    ? "teal"
    : [
          "fundraising",
          "pending",
          "invited",
          "in_review",
          "shared",
          "drafting",
          "open",
        ].includes(value)
      ? "gold"
      : "grey";
}

function StatusTag({ status, t }: { status: BusinessStatus; t: Translator }) {
  return <Tag tone={toneForStatus(status)}>{t(`status.${status}`)}</Tag>;
}

function localizeMilestones(
  milestones: readonly MilestoneRecord[],
  tContent: Translator,
  contentPrefix: string,
  tCommon: Translator,
): LocalizedMilestoneRecord[] {
  return milestones.map((milestone) => ({
    ...milestone,
    title: tContent(`${contentPrefix}.${milestone.id}.title`),
    description: tContent(`${contentPrefix}.${milestone.id}.description`),
    amountState: tCommon(`amountState.${milestone.amountState}`),
  }));
}

function dialogLabels(tCommon: Translator) {
  return {
    cancel: tCommon("dialogs.cancel"),
    close: tCommon("dialogs.close"),
    demoNotice: tCommon("dialogs.demoNotice"),
    submit: tCommon("dialogs.submit"),
    success: tCommon("dialogs.success"),
  };
}

async function FundManagerView({
  t,
  tCommon,
  view,
}: {
  t: Translator;
  tCommon: Translator;
  view: DashboardView;
}) {
  if (view === "overview") {
    return (
      <>
        <MetricsGrid metrics={fundManagerData.metrics} t={t} />
        <div className="grid gap-5 xl:grid-cols-2">
          <Panel title={t("sections.recentActivity")}>
            <ActivityList activities={fundManagerData.activities} t={t} />
          </Panel>
          <Panel title={t("sections.topInvestors")}>
            <ul className="divide-y divide-border">
              {fundManagerData.topInvestors.map((investor) => (
                <li
                  key={investor.name}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="grid size-9 place-items-center rounded-full bg-primary/10 font-data text-xs text-primary">
                    {investor.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">
                      {investor.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {investor.detail}
                    </span>
                  </span>
                  <span className="font-data text-xs text-primary">
                    {investor.amount}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </>
    );
  }

  if (view === "spvs") {
    return (
      <TablePanel
        headers={[
          t("tables.spv"),
          t("tables.target"),
          t("tables.committed"),
          t("tables.investors"),
          t("tables.status"),
          t("tables.sector"),
        ]}
        rows={fundManagerData.spvs.map((spv) => [
          spv.name,
          <span key="target" className="font-data">
            {spv.target}
          </span>,
          <span key="committed" className="font-data text-primary">
            {spv.committed}
          </span>,
          spv.investors,
          <StatusTag key="status" status={spv.status} t={tCommon} />,
          <Tag key="sector" tone={spv.tone === "neutral" ? "grey" : spv.tone}>
            {tCommon(`sectors.${spv.sector}`)}
          </Tag>,
        ])}
      />
    );
  }

  if (view === "pipeline") {
    return (
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        {fundManagerData.pipeline.map((column) => (
          <section
            key={column.id}
            className="min-w-0 border border-border bg-secondary p-4"
          >
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-interface text-[0.625rem] tracking-[0.1em] uppercase">
                {t(`pipeline.${column.id}`)}
              </h2>
              <span className="grid size-5 place-items-center rounded-full bg-muted font-data text-[0.5625rem]">
                {column.deals.length}
              </span>
            </div>
            <div className="space-y-3">
              {column.deals.map((deal) => (
                <article
                  key={deal.name}
                  className="border border-border bg-background p-4"
                >
                  <h3 className="font-medium">{deal.name}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {t(`data.pipeline.${deal.id}.description`)}
                  </p>
                  <p className="mt-4 font-data text-sm text-primary">
                    {t(`pipeline.amount.${deal.amountKind}`, {
                      amount: deal.amount,
                    })}
                  </p>
                  <Tag
                    className="mt-3"
                    tone={
                      column.id === "deployed"
                        ? "teal"
                        : column.id === "sourcing"
                          ? "grey"
                          : "gold"
                    }
                  >
                    {tCommon(`sectors.${deal.sector}`)}
                  </Tag>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  if (view === "milestones") {
    return (
      <div className="grid gap-5 xl:grid-cols-2">
        {fundManagerData.milestoneGroups.map((group) => (
          <MilestoneGroup
            key={group.name}
            label={group.name}
            milestones={localizeMilestones(
              group.milestones,
              tCommon,
              "milestones",
              tCommon,
            )}
            progressLabel={tCommon("milestoneProgress", { name: group.name })}
            statusLabel={tCommon("status.active")}
          />
        ))}
      </div>
    );
  }

  return (
    <TablePanel
      headers={[
        t("tables.name"),
        t("tables.location"),
        t("tables.committed"),
        t("tables.spvs"),
        t("tables.status"),
        t("tables.joined"),
      ]}
      rows={fundManagerData.investors.map((investor) => [
        investor.name,
        investor.location,
        <span key="committed" className="font-data text-primary">
          {investor.committed}
        </span>,
        investor.spvs,
        <StatusTag key="status" status={investor.status} t={tCommon} />,
        investor.joined,
      ])}
    />
  );
}

async function AngelInvestorView({
  locale,
  t,
  tCommon,
  view,
}: {
  locale: string;
  t: Translator;
  tCommon: Translator;
  view: DashboardView;
}) {
  const dialog = dialogLabels(tCommon);

  if (view === "overview") {
    return (
      <>
        <MetricsGrid metrics={angelInvestorData.metrics} t={t} />
        <div className="grid gap-5 xl:grid-cols-2">
          <Panel title={t("sections.recentActivity")}>
            <ActivityList activities={angelInvestorData.activities} t={t} />
          </Panel>
          <Panel title={t("sections.allocation")}>
            <ul className="space-y-5">
              {angelInvestorData.allocation.map((item) => (
                <li key={item.name}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-xs">
                    <span>{item.name}</span>
                    <span className="font-data text-primary">
                      {item.amount}
                    </span>
                  </div>
                  <Progress
                    value={item.percentage}
                    className="h-1 rounded-none"
                  />
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </>
    );
  }

  if (view === "deals") {
    return (
      <div className="grid gap-5 xl:grid-cols-2">
        {angelInvestorData.deals.map((deal) => (
          <Panel key={deal.name} className={deal.open ? "" : "opacity-70"}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl">{deal.name}</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {t(`data.deals.${deal.id}.description`)}
                </p>
              </div>
              <StatusTag status={deal.open ? "open" : "closed"} t={tCommon} />
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
              {[
                [t("deal.target"), deal.target],
                [t("deal.minimum"), deal.minimum],
                [
                  t("deal.instrument"),
                  tCommon(`instruments.${deal.instrument}`),
                ],
                [t("deal.investors"), deal.investors],
              ].map(([label, value]) => (
                <div key={label} className="bg-background p-3">
                  <dt className="text-[0.5625rem] tracking-[0.08em] text-muted-foreground uppercase">
                    {label}
                  </dt>
                  <dd className="mt-1 font-data text-xs">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5">
              <Progress value={deal.progress} className="h-1 rounded-none" />
              <div className="mt-2 flex justify-between font-data text-[0.625rem] text-muted-foreground">
                <span>{t("deal.committed", { amount: deal.committed })}</span>
                <span>{deal.progress}%</span>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">
                {t("deal.ledBy", { name: deal.lead })}
              </span>
              <InvestmentDialog
                {...dialog}
                agreement={t("dialogs.investAgreement")}
                amountLabel={t("dialogs.amount")}
                dealName={deal.name}
                open={deal.open}
                closedLabel={t("actions.closed")}
                trigger={t("actions.invest")}
              />
            </div>
          </Panel>
        ))}
      </div>
    );
  }

  if (view === "portfolio") {
    return (
      <TablePanel
        headers={[
          t("tables.spv"),
          t("tables.invested"),
          t("tables.released"),
          t("tables.milestones"),
          t("tables.status"),
        ]}
        rows={angelInvestorData.portfolio.map((item) => [
          <span key="spv">
            {item.name}
            <span className="mt-1 block text-[0.625rem] text-muted-foreground">
              {tCommon(`sectors.${item.sector}`)} ·{" "}
              {tCommon(`countries.${item.country}`)}
            </span>
          </span>,
          <span key="invested" className="font-data text-primary">
            {item.invested}
          </span>,
          <span key="released" className="font-data text-success">
            {item.released}
          </span>,
          item.milestones,
          <StatusTag key="status" status={item.status} t={tCommon} />,
        ])}
      />
    );
  }

  if (view === "milestones") {
    return (
      <div className="grid gap-5 xl:grid-cols-2">
        {angelInvestorData.milestoneGroups.map((group) => (
          <MilestoneGroup
            key={group.name}
            label={group.name}
            milestones={localizeMilestones(
              group.milestones,
              tCommon,
              "milestones",
              tCommon,
            )}
            progressLabel={tCommon("milestoneProgress", { name: group.name })}
            statusLabel={tCommon("status.active")}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <TablePanel
        headers={[
          t("tables.date"),
          t("tables.spv"),
          t("tables.type"),
          t("tables.milestone"),
          t("tables.amount"),
          t("tables.status"),
          t("tables.hash"),
        ]}
        rows={angelInvestorData.transactions.map((transaction) => [
          formatDemoDate(transaction.date, locale),
          transaction.spv,
          tCommon(`transactionTypes.${transaction.type}`),
          tCommon(`milestones.${transaction.milestone}.title`),
          <span key="amount" className="font-data text-success">
            {transaction.amount}
          </span>,
          <StatusTag key="status" status={transaction.status} t={tCommon} />,
          <span key="hash" className="font-data">
            {transaction.hash}
          </span>,
        ])}
      />
      <DemoNotice>{tCommon("transactionNotice")}</DemoNotice>
    </>
  );
}

async function StartupFounderView({
  locale,
  t,
  tCommon,
  view,
}: {
  locale: string;
  t: Translator;
  tCommon: Translator;
  view: DashboardView;
}) {
  const dialog = dialogLabels(tCommon);

  if (view === "overview") {
    return (
      <>
        <MetricsGrid metrics={startupFounderData.metrics} t={t} />
        <div className="grid gap-5 xl:grid-cols-2">
          <Panel title={t("sections.recentActivity")}>
            <ActivityList activities={startupFounderData.activities} t={t} />
          </Panel>
          <MilestoneGroup
            label={t("sections.currentMilestone")}
            milestones={localizeMilestones(
              [startupFounderData.milestones[2]],
              t,
              "data.milestones",
              tCommon,
            )}
            progressLabel={tCommon("milestoneProgress", {
              name: startupFounderData.raise.company,
            })}
            statusLabel={tCommon("status.inProgress")}
          />
        </div>
      </>
    );
  }

  if (view === "raise") {
    const raise = startupFounderData.raise;
    return (
      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Tag tone="teal">{tCommon("status.active")}</Tag>
              <h2 className="mt-4 font-display text-3xl">{raise.company}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {t("data.raiseSummary")}
              </p>
            </div>
            <span className="font-data text-2xl text-primary">
              {raise.committed}
            </span>
          </div>
          <Progress
            value={raise.percentage}
            className="mt-8 h-2 rounded-none"
          />
          <div className="mt-3 flex justify-between font-data text-xs text-muted-foreground">
            <span>
              {t("raise.progress", {
                committed: raise.committed,
                target: raise.target,
              })}
            </span>
            <span>{raise.percentage}%</span>
          </div>
        </Panel>
        <Panel title={t("sections.raiseDetails")}>
          <dl className="divide-y divide-border">
            {[
              [
                t("raise.instrument"),
                tCommon(`instruments.${raise.instrument}`),
              ],
              [t("raise.minimum"), raise.minimum],
              [t("raise.closeDate"), formatDemoDate(raise.closeDate, locale)],
              [t("raise.lead"), raise.lead],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-3">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="font-data text-xs">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    );
  }

  if (view === "investors") {
    return (
      <TablePanel
        headers={[
          t("tables.investor"),
          t("tables.location"),
          t("tables.committed"),
          t("tables.share"),
          t("tables.status"),
        ]}
        rows={startupFounderData.investors.map((investor) => [
          <span key="investor">
            {investor.name}
            {"role" in investor ? (
              <span className="mt-1 block text-[0.5625rem] tracking-[0.06em] text-primary uppercase">
                {t(`data.roles.${investor.role}`)}
              </span>
            ) : null}
          </span>,
          investor.location,
          <span key="committed" className="font-data text-primary">
            {investor.committed}
          </span>,
          investor.share,
          <StatusTag key="status" status={investor.status} t={tCommon} />,
        ])}
      />
    );
  }

  if (view === "milestones") {
    return (
      <>
        <MilestoneGroup
          label={startupFounderData.raise.company}
          milestones={localizeMilestones(
            startupFounderData.milestones,
            t,
            "data.milestones",
            tCommon,
          )}
          progressLabel={tCommon("milestoneProgress", {
            name: startupFounderData.raise.company,
          })}
          statusLabel={tCommon("status.inProgress")}
        />
        <div className="flex justify-end">
          <EvidenceDialog
            {...dialog}
            fileLabel={t("dialogs.supportingDocuments")}
            notesLabel={t("dialogs.evidenceNotes")}
            title={t("dialogs.evidenceTitle")}
            trigger={t("actions.submitEvidence")}
          />
        </div>
      </>
    );
  }

  if (view === "disbursements") {
    return (
      <>
        <MetricsGrid metrics={startupFounderData.disbursementMetrics} t={t} />
        <TablePanel
          headers={[
            t("tables.date"),
            t("tables.milestone"),
            t("tables.amount"),
            t("tables.status"),
            t("tables.hash"),
          ]}
          rows={startupFounderData.disbursements.map((item) => [
            item.date
              ? formatDemoDate(item.date, locale)
              : tCommon("date.pending"),
            t(`data.milestones.${item.milestone}.title`),
            <span key="amount" className="font-data text-success">
              {item.amount}
            </span>,
            <StatusTag key="status" status={item.status} t={tCommon} />,
            <span key="hash" className="font-data">
              {item.hash}
            </span>,
          ])}
        />
        <DemoNotice>{tCommon("transactionNotice")}</DemoNotice>
      </>
    );
  }

  return (
    <div className="grid gap-5">
      <Panel className="p-0">
        <ul className="divide-y divide-border">
          {startupFounderData.documents.map((document) => {
            const documentName = t(`data.documents.${document.id}.name`);

            return (
              <li
                key={document.id}
                className="flex flex-wrap items-center gap-4 px-5 py-4"
              >
                <span className="grid size-9 place-items-center border border-border bg-muted">
                  <FileText
                    aria-hidden="true"
                    className="size-4 text-primary"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {documentName}
                  </span>
                  <span className="mt-1 block text-[0.625rem] text-muted-foreground">
                    {tCommon(`documentCategories.${document.category}`)} ·{" "}
                    {document.date
                      ? formatDemoDate(document.date, locale)
                      : tCommon("date.inProgress")}
                  </span>
                </span>
                <StatusTag status={document.status} t={tCommon} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled
                  aria-label={t("actions.previewUnavailable", {
                    name: documentName,
                  })}
                >
                  <ArrowUpRight aria-hidden="true" />
                </Button>
              </li>
            );
          })}
        </ul>
      </Panel>
      <div className="flex justify-end">
        <EvidenceDialog
          {...dialog}
          fileLabel={t("dialogs.documentFile")}
          notesLabel={t("dialogs.documentNotes")}
          title={t("dialogs.uploadTitle")}
          trigger={t("actions.uploadDocument")}
        />
      </div>
    </div>
  );
}

function PageAction({
  role,
  t,
  tCommon,
  view,
}: {
  role: DashboardRoleId;
  t: Translator;
  tCommon: Translator;
  view: DashboardView;
}) {
  const dialog = dialogLabels(tCommon);

  if (role !== "fund-manager") return null;

  if (view === "overview" || view === "spvs") {
    return (
      <div className="flex flex-wrap gap-2">
        {view === "overview" ? (
          <DemoActionDialog
            {...dialog}
            trigger={t("actions.inviteInvestor")}
            title={t("dialogs.inviteTitle")}
            fieldLabel={t("dialogs.investorEmail")}
            fieldPlaceholder="investor@example.com"
            variant="outline"
          />
        ) : null}
        <DemoActionDialog
          {...dialog}
          trigger={t("actions.newSpv")}
          title={t("dialogs.spvTitle")}
          fieldLabel={t("dialogs.spvName")}
          fieldPlaceholder="SolarGrid Kenya SPV"
        />
      </div>
    );
  }

  if (view === "pipeline") {
    return (
      <DemoActionDialog
        {...dialog}
        trigger={t("actions.addDeal")}
        title={t("dialogs.dealTitle")}
        fieldLabel={t("dialogs.companyName")}
        fieldPlaceholder="MediTrack Nigeria"
      />
    );
  }

  if (view === "investors") {
    return (
      <DemoActionDialog
        {...dialog}
        trigger={t("actions.inviteInvestor")}
        title={t("dialogs.inviteTitle")}
        fieldLabel={t("dialogs.investorEmail")}
        fieldPlaceholder="investor@example.com"
      />
    );
  }

  return null;
}

export async function DashboardPage({ role, view }: DashboardPageProps) {
  const config = dashboardRoleConfigs[role];
  const locale = await getLocale();
  const t = await getTranslations(config.namespace);
  const tCommon = await getTranslations("dashboard-common");

  return (
    <div className="mx-auto grid w-full max-w-[92rem] gap-6">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-6">
        <div>
          <p className="font-interface text-[0.5625rem] tracking-[0.16em] text-primary uppercase">
            {t("title")}
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-[-0.02em] sm:text-4xl">
            {t(`pages.${view}.title`)}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t(`pages.${view}.description`)}
          </p>
        </div>
        <PageAction role={role} t={t} tCommon={tCommon} view={view} />
      </header>

      <DemoNotice>{tCommon("demoNotice")}</DemoNotice>

      {role === "fund-manager" ? (
        <FundManagerView t={t} tCommon={tCommon} view={view} />
      ) : role === "angel-investor" ? (
        <AngelInvestorView
          locale={locale}
          t={t}
          tCommon={tCommon}
          view={view}
        />
      ) : (
        <StartupFounderView
          locale={locale}
          t={t}
          tCommon={tCommon}
          view={view}
        />
      )}

      <p className="sr-only">{transactionNotice}</p>
    </div>
  );
}

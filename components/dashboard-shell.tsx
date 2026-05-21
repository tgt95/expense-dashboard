"use client";

import { useMemo, useState, useTransition } from "react";
import { Tabs } from "@base-ui/react/tabs";
import { motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BudgetBars } from "@/components/budget-bars";
import { CategoryPieChart, DailyColumnChart } from "@/components/charts";
import { InsightsPanel } from "@/components/insights-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { TransactionExplorer } from "@/components/transaction-list";
import type { DashboardData, DateRange, RangePreset } from "@/lib/types";

const numberFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });

const presets: Array<{ value: Exclude<RangePreset, "custom">; label: string }> = [
  { value: "last-3-days", label: "Last 3 days" },
  { value: "last-week", label: "Last week" },
];

const easeOut = [0.16, 1, 0.3, 1] as [number, number, number, number];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

export function DashboardShell({ data }: { data: DashboardData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const applyRange = (nextRange: DateRange) => {
    const params = new URLSearchParams(searchParams);
    params.set("preset", nextRange.preset);

    if (nextRange.preset === "custom") {
      params.set("start", nextRange.start);
      params.set("end", nextRange.end);
    } else {
      params.delete("start");
      params.delete("end");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const topCategory = data.categorySpend[0]?.category ?? "None";
  const average = data.transactionCount > 0 ? data.total / data.transactionCount : 0;

  const statusText = useMemo(() => {
    if (!data.notion.categoryPropertyReady) {
      return "Category property could not be prepared in Notion.";
    }
    if (data.ai.warning) return data.ai.warning;
    if (data.ai.classifiedCount > 0) {
      return `AI classified ${data.ai.classifiedCount} new transactions.`;
    }
    return data.ai.configured ? "AI classification is connected." : "AI key not configured.";
  }, [data.ai, data.notion.categoryPropertyReady]);

  const statusActive = data.ai.classifiedCount > 0 || data.ai.configured;

  return (
    <motion.main
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="mx-auto min-h-[100dvh] max-w-6xl px-4 py-16 sm:px-8 md:py-24 lg:px-12"
    >
      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="flex flex-col gap-6 border-b border-(--border) pb-8 md:flex-row md:items-end md:justify-between"
      >
        <div className="max-w-2xl">
          <h1 className="mt-3 text-5xl tracking-tight leading-tight text-(--text) sm:text-6xl">
            Dashboard
          </h1>
          <div className="flex items-baseline gap-1">
            {/* <span className="text-xs font-normal tracking-wide text-(--accent) uppercase">
              {data.notion.dataSourceName}
            </span>
            <span className="h-px w-6 bg-(--border)" /> */}
            <p className="mt-2 text-sm text-(--text-secondary)">
              Data from {data.notion.databaseName}
            </p>
             · 
            <span className="font-mono text-xs tabular-nums text-(--text-muted)">
              {data.range.start} — {data.range.end}
            </span>
          </div>
          {/* <p className="mt-2 text-sm text-(--text-secondary)">
            Data from {data.notion.databaseName}
          </p> */}
        </div>
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </motion.header>

      {/* Filter Toolbar */}
      <motion.div variants={itemVariants} className="mt-8">
        <FilterToolbar
          currentRange={data.range}
          isPending={isPending}
          onApply={applyRange}
        />
      </motion.div>

      {/* Status row: Ready + AI Status */}
      <motion.section
        variants={itemVariants}
        className="mt-2 flex flex-row items-center gap-2"
      >
        {/* Load status */}
        <div className="inline-flex items-center gap-3 border border-(--border) bg-(--surface) px-4 py-2 text-xs text-(--text-muted)">
          <span
            className={`h-2 w-2 ${
              isPending ? "animate-pulse bg-(--accent)" : "bg-(--tag-green-text)"
            }`}
          />
          <span className="font-medium text-(--text-secondary)">Data:</span>{" "}
          {isPending ? "Loading…" : "Ready"}
        </div>

        {/* AI Status */}
        <div className="w-full inline-flex items-center gap-3 border border-(--border) bg-(--surface) px-4 py-2 text-xs text-(--text-muted)">
          <span
            className={`h-2 w-2 ${
              statusActive ? "bg-(--tag-green-text)" : "bg-(--text-muted)"
            }`}
          />
          <span className="font-medium text-(--text-secondary)">AI status:</span>{" "}
          {statusText}
        </div>
      </motion.section>

      {/* Metrics — asymmetric bento */}
      <motion.section variants={itemVariants} className="mt-8 grid gap-4 md:grid-cols-[1.5fr_1fr]">
        <MetricLarge label="Total spend" value={numberFormatter.format(Math.round(data.total))} />
        <div className="flex flex-col gap-4">
          <MetricSmall label="Transactions" value={numberFormatter.format(data.transactionCount)} />
          <MetricSmall label="Average" value={numberFormatter.format(Math.round(average))} />
        </div>
      </motion.section>

      {/* AI Insights */}
      {data.insights.length > 0 && (
        <motion.section variants={itemVariants} className="mt-8">
          <InsightsPanel insights={data.insights} />
        </motion.section>
      )}

      {/* Daily Spend */}
      <motion.section
        variants={itemVariants}
        className="mt-8 border border-(--border) bg-(--surface) p-1"
      >
        <div className="flex flex-col gap-3 p-5 pb-2 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:pb-3">
          <div>
            <h2 className="text-xl font-normal tracking-tight text-(--text)">
              Daily spend
            </h2>
            <p className="mt-1 text-sm text-(--text-secondary)">
              Each day represented as one column.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 bg-(--tag-green-bg) px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-(--tag-green-text)">
            Top: {topCategory}
          </span>
        </div>
        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          <DailyColumnChart data={data.dailySpend} />
        </div>
      </motion.section>

      {/* Bottom Grid: Budgets + Category | Transactions */}
      <motion.section
        variants={itemVariants}
        className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-stretch"
      >
        <div className="flex flex-col gap-8">
          {/* Budgets */}
          {data.budgets.some((b) => b.budget > 0) && (
            <div className="border border-(--border) bg-(--surface) p-5 sm:p-6 h-full">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-normal tracking-tight text-(--text)">
                    Budgets
                  </h2>
                  <p className="mt-1 text-sm text-(--text-secondary)">
                    Spend against monthly limits.
                  </p>
                </div>
              </div>
              <div className="mt-5">
                <BudgetBars budgets={data.budgets} />
              </div>
            </div>
          )}

          {/* Category split */}
          <div className="border border-(--border) bg-(--surface) p-5 sm:p-6">
            <h2 className="text-xl font-normal tracking-tight text-(--text)">
              Category split
            </h2>
            <p className="mt-1 text-sm text-(--text-secondary)">
              Breakdown based on the Notion{" "}
              <code className="bg-(--accent-dim) px-1.5 py-0.5 font-mono text-xs text-(--accent)">
                Category
              </code>{" "}
              property.
            </p>
            <div className="mt-5">
              <CategoryPieChart data={data.categorySpend} />
            </div>
          </div>
        </div>

        {/* Transaction Explorer */}
        <aside className="flex h-full flex-col border border-(--border) bg-(--surface) p-5 sm:p-6">
          <h2 className="text-xl font-normal tracking-tight text-(--text)">
            Transactions
          </h2>
          <div className="mt-5 min-h-0 flex-1">
            <TransactionExplorer transactions={data.allTransactions} />
          </div>
        </aside>
      </motion.section>
    </motion.main>
  );
}

function FilterToolbar({
  currentRange,
  isPending,
  onApply,
}: {
  currentRange: DateRange;
  isPending: boolean;
  onApply: (range: DateRange) => void;
}) {
  const [draft, setDraft] = useState<DateRange>(currentRange);

  const isCustom = draft.preset === "custom";

  const setPreset = (preset: RangePreset) => {
    setDraft({ preset, start: currentRange.start, end: currentRange.end });
  };

  const handleApply = () => {
    onApply(draft);
  };

  const handleReset = () => {
    setDraft(currentRange);
  };

  const hasChanges =
    draft.preset !== currentRange.preset ||
    draft.start !== currentRange.start ||
    draft.end !== currentRange.end;

  return (
    <div className="border border-(--border) bg-(--surface) p-2 sm:p-3">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        {/* Left: presets + dates */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          {/* Presets */}
          <div className="inline-flex items-center gap-1 border border-(--border) bg-(--bg) p-0.5">
            <Tabs.Root
              onValueChange={(value) => setPreset(value as RangePreset)}
              value={draft.preset}
            >
              <Tabs.List className="flex gap-1">
                {presets.map((preset) => (
                  <Tabs.Tab
                    className="px-3 py-1.75 text-[11px] font-medium tracking-wider text-(--text-muted) transition-colors hover:text-(--text-secondary) data-active:bg-(--accent) data-active:text-white"
                    key={preset.value}
                    value={preset.value}
                  >
                    {preset.label}
                  </Tabs.Tab>
                ))}
                <Tabs.Tab
                  className="px-3 py-1.75 text-[11px] font-medium tracking-wider text-(--text-muted) transition-colors hover:text-(--text-secondary) data-active:bg-(--accent) data-active:text-white"
                  value="custom"
                >
                  Custom
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.Root>
          </div>

          {/* Date inputs — shown only in Custom mode */}
          {isCustom && (
            <div className="flex items-end gap-2">
              <input
                className="h-11 appearance-none border border-(--border) bg-(--bg) px-3 text-sm text-(--text) outline-none transition-colors focus:border-(--accent)"
                onChange={(event) =>
                  setDraft({ preset: "custom", start: event.target.value, end: draft.end })
                }
                type="date"
                value={draft.start}
              />
              <input
                className="h-11 appearance-none border border-(--border) bg-(--bg) px-3 text-sm text-(--text) outline-none transition-colors focus:border-(--accent) -ml-px"
                onChange={(event) =>
                  setDraft({ preset: "custom", start: draft.start, end: event.target.value })
                }
                type="date"
                value={draft.end}
              />
            </div>
          )}
        </div>

        {/* Right: CTAs */}
        <div className="flex items-center gap-3">
          {/* Reset */}
          <button
            onClick={handleReset}
            disabled={!hasChanges || isPending}
            className="h-11 border border-(--border) px-4 text-[11px] font-medium uppercase tracking-wider text-(--text-muted) transition-colors hover:bg-(--surface-hover) hover:text-(--text-secondary) disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-(--text-muted) active:scale-[0.96]"
            type="button"
          >
            Reset
          </button>

          {/* Apply */}
          <button
            onClick={handleApply}
            disabled={!hasChanges || isPending}
            className="h-11 bg-(--accent) px-5 text-[11px] font-medium uppercase tracking-wider text-white transition-colors hover:bg-(--accent)/90 disabled:opacity-40 active:scale-[0.96]"
            type="button"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricLarge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col justify-between border border-(--border) bg-(--surface) p-6 sm:p-8">
      <p className="text-[11px] font-medium uppercase tracking-wider text-(--text-muted)">
        {label}
      </p>
      <p className="mt-8 font-mono text-5xl font-normal tracking-tight leading-none text-(--text) sm:text-6xl md:text-7xl">
        {value}
      </p>
    </div>
  );
}

function MetricSmall({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col justify-center border border-(--border) bg-(--surface) p-6 sm:p-8">
      <p className="text-[11px] font-medium uppercase tracking-wider text-(--text-muted)">
        {label}
      </p>
      <p className="mt-4 font-mono text-4xl font-normal tracking-tight leading-tight text-(--text) sm:text-5xl">
        {value}
      </p>
    </div>
  );
}

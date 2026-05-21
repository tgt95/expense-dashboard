"use client";

import { useMemo, useState, useTransition } from "react";
import { Tabs } from "@base-ui/react/tabs";
import { motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CategoryPieChart, DailyColumnChart } from "@/components/charts";
import { ThemeToggle } from "@/components/theme-toggle";
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
      className="mx-auto min-h-[100dvh] max-w-6xl px-6 py-12 sm:px-8 lg:px-12"
    >
      {/* Header */}
      <motion.header
        variants={itemVariants}
        className="flex flex-col gap-6 border-b border-[var(--border)] pb-8 md:flex-row md:items-end md:justify-between"
      >
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium tracking-[0.1em] text-[var(--accent)] uppercase">
              {data.notion.dataSourceName}
            </span>
            <span className="h-px w-6 bg-[var(--border)]" />
            <span className="font-mono text-xs text-[var(--text-muted)]">
              {data.range.start} — {data.range.end}
            </span>
          </div>
          <h1 className="mt-3 font-serif text-5xl font-light tracking-tight leading-[1.1] text-[var(--text)] sm:text-6xl">
            Expense Dashboard
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Data from {data.notion.databaseName}
          </p>
        </div>
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </motion.header>

      {/* Filter Toolbar — card above metrics */}
      <motion.div variants={itemVariants} className="mt-8">
        <FilterToolbar
          currentRange={data.range}
          isPending={isPending}
          onApply={applyRange}
        />
      </motion.div>

      {/* Metrics — asymmetric bento */}
      <motion.section variants={itemVariants} className="mt-8 grid gap-4 md:grid-cols-[1.5fr_1fr]">
        <MetricLarge label="Total spend" value={numberFormatter.format(data.total)} />
        <div className="flex flex-col gap-4">
          <MetricSmall label="Transactions" value={numberFormatter.format(data.transactionCount)} />
          <MetricSmall label="Average" value={numberFormatter.format(average)} />
        </div>
      </motion.section>

      {/* Daily Spend */}
      <motion.section
        variants={itemVariants}
        className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1"
      >
        <div className="flex flex-col gap-3 p-5 pb-2 sm:flex-row sm:items-center sm:justify-between sm:p-6 sm:pb-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">
              Daily spend
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Each day represented as one column.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--tag-green-bg)] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[var(--tag-green-text)]">
            Top: {topCategory}
          </span>
        </div>
        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          <DailyColumnChart data={data.dailySpend} />
        </div>
      </motion.section>

      {/* Bottom Grid: Category + Transactions */}
      <motion.section
        variants={itemVariants}
        className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]"
      >
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">
            Category split
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Breakdown based on the Notion{" "}
            <code className="rounded bg-[var(--accent-dim)] px-1.5 py-0.5 font-mono text-xs text-[var(--accent)]">
              Category
            </code>{" "}
            property.
          </p>
          <div className="mt-5">
            <CategoryPieChart data={data.categorySpend} />
          </div>
        </div>

        <aside className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--text)]">
            Recent transactions
          </h2>
          <div className="mt-5">
            {data.recentTransactions.length > 0 ? (
              <dl className="flex flex-col">
                {data.recentTransactions.map((transaction, i) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 + i * 0.04, duration: 0.4, ease: easeOut }}
                    className="group flex items-start justify-between gap-3 border-b border-[var(--border)] py-3.5 transition-colors last:border-b-0 hover:bg-[var(--surface-hover)]"
                  >
                    <div className="min-w-0">
                      <dt className="truncate text-sm font-medium text-[var(--text)] transition-colors group-hover:text-[var(--accent)]">
                        {transaction.name}
                      </dt>
                      <dd className="mt-1 text-xs text-[var(--text-muted)]">
                        {transaction.date}
                        <span className="mx-1.5 text-[var(--border)]">·</span>
                        <span className="text-[var(--text-secondary)]">{transaction.category}</span>
                      </dd>
                    </div>
                    <data
                      value={Math.abs(transaction.amount)}
                      className="shrink-0 font-mono text-sm font-medium tabular-nums text-[var(--text)]"
                    >
                      {numberFormatter.format(Math.abs(transaction.amount))}
                    </data>
                  </motion.div>
                ))}
              </dl>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-[var(--border)]">
                <p className="text-sm text-[var(--text-muted)]">No transactions in this range.</p>
              </div>
            )}
          </div>
        </aside>
      </motion.section>

      {/* AI Status */}
      <motion.section
        variants={itemVariants}
        className="mt-8 inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs text-[var(--text-muted)]"
      >
        <span
          className={`h-2 w-2 rounded-full ${
            statusActive ? "bg-[var(--tag-green-text)]" : "bg-[var(--text-muted)]"
          }`}
        />
        <span className="font-medium text-[var(--text-secondary)]">AI status:</span>{" "}
        {statusText}
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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        {/* Left: presets + dates */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          {/* Presets */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-1">
            <Tabs.Root
              onValueChange={(value) => setPreset(value as RangePreset)}
              value={draft.preset}
            >
              <Tabs.List className="flex gap-1">
                {presets.map((preset) => (
                  <Tabs.Tab
                    className="rounded px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)] active:scale-[0.97] data-[active]:bg-[var(--surface)] data-[active]:text-[var(--text)]"
                    key={preset.value}
                    value={preset.value}
                  >
                    {preset.label}
                  </Tabs.Tab>
                ))}
                <Tabs.Tab
                  className="rounded px-3 py-2 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)] active:scale-[0.97] data-[active]:bg-[var(--surface)] data-[active]:text-[var(--text)]"
                  value="custom"
                >
                  Custom
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.Root>
          </div>

          {/* Date inputs */}
          <div className="flex items-end gap-3">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Start
              </label>
              <input
                className="mt-1 block h-10 w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)]"
                onChange={(event) =>
                  setDraft({ preset: "custom", start: event.target.value, end: draft.end })
                }
                type="date"
                value={draft.start}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                End
              </label>
              <input
                className="mt-1 block h-10 w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 text-sm text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)]"
                onChange={(event) =>
                  setDraft({ preset: "custom", start: draft.start, end: event.target.value })
                }
                type="date"
                value={draft.end}
              />
            </div>
          </div>
        </div>

        {/* Right: CTAs */}
        <div className="flex items-center gap-3">
          {/* Status indicator */}
          <div className="flex h-10 items-center rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 text-[11px] font-medium text-[var(--text-muted)]">
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
                Loading
              </span>
            ) : (
              "Ready"
            )}
          </div>

          {/* Reset */}
          <button
            onClick={handleReset}
            disabled={!hasChanges || isPending}
            className="h-10 rounded-lg border border-[var(--border)] px-4 text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-secondary)] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[var(--text-muted)] active:scale-[0.97]"
            type="button"
          >
            Reset
          </button>

          {/* Apply — primary CTA */}
          <button
            onClick={handleApply}
            disabled={!hasChanges || isPending}
            className="h-10 rounded-md bg-[var(--text)] px-5 text-[11px] font-medium uppercase tracking-wider text-[var(--bg)] transition-colors hover:bg-[var(--text-secondary)] disabled:opacity-40 active:scale-[0.97]"
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
    <div className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-colors hover:border-[var(--border-strong)] sm:p-8 md:p-10">
      <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-8 font-serif text-5xl font-light tracking-tight leading-[1.05] text-[var(--text)] sm:text-6xl md:text-7xl">
        {value}
      </p>
    </div>
  );
}

function MetricSmall({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-1 flex-col justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 transition-colors hover:border-[var(--border-strong)] sm:p-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--text-muted)]">
        {label}
      </p>
      <p className="mt-4 font-serif text-4xl font-light tracking-tight leading-[1.1] text-[var(--text)] sm:text-5xl">
        {value}
      </p>
    </div>
  );
}

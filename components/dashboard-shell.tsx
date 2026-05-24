"use client";

import { useMemo, useTransition } from "react";
import { motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  aggregateCategorySpend,
  aggregateDailySpend,
  filterTransactionsByRange,
} from "@/lib/aggregate";
import { BudgetBars } from "@/components/budget-bars";
import { CategoryPieChart, DailyColumnChart } from "@/components/charts";
import { DashboardPanel } from "@/components/dashboard/dashboard-panel";
import { DateRangeFilter } from "@/components/dashboard/date-range-filter";
import { MetricCard } from "@/components/dashboard/metric-card";
import { StatusIndicator } from "@/components/dashboard/status-indicator";
import { InsightsPanel } from "@/components/insights-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { TransactionExplorer } from "@/components/transaction-list";
import { parseRangeFromSearchParams } from "@/lib/date-range";
import type { BudgetItem, DashboardData, DateRange } from "@/lib/types";

const numberFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });

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

  const currentRange = useMemo(
    () => parseRangeFromSearchParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const visibleTransactions = useMemo(
    () => filterTransactionsByRange(data.allTransactions, currentRange),
    [currentRange, data.allTransactions],
  );

  const categorySpend = useMemo(
    () => aggregateCategorySpend(visibleTransactions),
    [visibleTransactions],
  );

  const dailySpend = useMemo(
    () => aggregateDailySpend(visibleTransactions, currentRange),
    [currentRange, visibleTransactions],
  );

  const total = useMemo(
    () => visibleTransactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
    [visibleTransactions],
  );

  const budgets = useMemo(
    () => deriveBudgets(data.budgets, categorySpend),
    [categorySpend, data.budgets],
  );

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

  const topCategory = categorySpend[0]?.category ?? "None";
  const average = visibleTransactions.length > 0 ? total / visibleTransactions.length : 0;
  const insights =
    currentRange.start === data.range.start && currentRange.end === data.range.end
      ? data.insights
      : [];

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
      className="mx-auto min-h-[100dvh] px-4 py-16 sm:px-8 md:py-24 lg:px-12" // max-w-6xl
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
              {currentRange.start} — {currentRange.end}
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
        <DateRangeFilter
          key={`${currentRange.preset}:${currentRange.start}:${currentRange.end}`}
          currentRange={currentRange}
          isPending={isPending}
          onApply={applyRange}
        />
      </motion.div>

      {/* Status row: Ready + AI Status */}
      <motion.section variants={itemVariants} className="mt-2 flex flex-row items-center gap-2">
        <StatusIndicator
          active={!isPending}
          label="Data"
          loading={isPending}
          value={isPending ? "Loading…" : "Ready"}
        />
        <StatusIndicator active={statusActive} fill label="AI status" value={statusText} />
      </motion.section>

      {/* Metrics — asymmetric bento */}
      <motion.section variants={itemVariants} className="mt-8 grid md:grid-cols-3 gap-8">
        <MetricCard
          label="Total spend"
          value={numberFormatter.format(Math.round(total))}
        />
        {/* <div className="flex flex-col gap-4">
        </div> */}
          <MetricCard
            label="Transactions"
            value={numberFormatter.format(visibleTransactions.length)}
            currency=""
          />
          <MetricCard label="Average" value={numberFormatter.format(Math.round(average))} />
      </motion.section>

      {/* AI Insights */}
      {insights.length > 0 && (
        <motion.section variants={itemVariants} className="mt-8">
          <InsightsPanel insights={insights} />
        </motion.section>
      )}

      {/* Daily Spend */}
      <motion.div variants={itemVariants} className="mt-8">
        <DashboardPanel
          action={
            <span className="inline-flex items-center gap-2 bg-(--tag-green-bg) px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-(--tag-green-text)">
              Top: {topCategory}
            </span>
          }
          description="Each day represented as one column."
          title="Daily spend"
        >
          <DailyColumnChart data={dailySpend} />
        </DashboardPanel>
      </motion.div>

      {/* Bottom Grid: Budgets + Category | Transactions */}
      <motion.section
        variants={itemVariants}
        className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_480px] lg:items-stretch"
      >
        <div className="flex flex-col gap-8">
          {/* Category split */}
          <DashboardPanel
            contentClassName="mt-5 p-0 sm:p-0"
            description={
              <>
                Breakdown based on the Notion{" "}
                <code className="bg-(--accent-dim) px-1.5 py-0.5 font-mono text-xs text-(--accent)">
                  Category
                </code>{" "}
                property.
              </>
            }
            headerClassName="p-0 sm:p-0"
            title="Category split"
          >
            <CategoryPieChart data={categorySpend} />
          </DashboardPanel>

          {/* Budgets */}
          {budgets.some((b) => b.budget > 0) && (
            <DashboardPanel
              className="h-full"
              contentClassName="mt-5 p-0 sm:p-0"
              description="Spend against monthly limits."
              headerClassName="p-0 sm:p-0"
              title="Budgets"
            >
              <BudgetBars budgets={budgets} />
            </DashboardPanel>
          )}
        </div>

        {/* Transaction Explorer */}
        <DashboardPanel
          as="aside"
          className="flex h-full flex-col"
          contentClassName="mt-5 min-h-0 flex-1 p-0 sm:p-0"
          headerClassName="p-0 sm:p-0"
          title="Transactions"
        >
          <TransactionExplorer transactions={visibleTransactions} />
        </DashboardPanel>
      </motion.section>
    </motion.main>
  );
}

function deriveBudgets(
  budgets: BudgetItem[],
  categorySpend: DashboardData["categorySpend"],
): BudgetItem[] {
  return budgets.map((budget) => {
    const spent = categorySpend.find((item) => item.category === budget.category)?.amount ?? 0;
    const { status, percent } = getClientBudgetStatus(spent, budget.budget);

    return {
      ...budget,
      spent,
      status,
      percent,
    };
  });
}

function getClientBudgetStatus(spent: number, budget: number) {
  if (budget <= 0) return { status: "none" as const, percent: 0 };

  const percent = Math.min(100, Math.round((spent / budget) * 100));
  if (spent > budget) return { status: "over" as const, percent };
  if (percent >= 80) return { status: "warning" as const, percent };
  return { status: "ok" as const, percent };
}

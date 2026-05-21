"use client";

import { useMemo, useTransition } from "react";
import { Tabs } from "@base-ui/react/tabs";
import { motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CategoryPieChart, DailyColumnChart } from "@/components/charts";
import type { DashboardData, DateRange, RangePreset } from "@/lib/types";

const numberFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 0,
});

const presets: Array<{ value: Exclude<RangePreset, "custom">; label: string }> = [
  { value: "last-3-days", label: "Last 3 days" },
  { value: "last-week", label: "Last week" },
];

export function DashboardShell({ data }: { data: DashboardData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateRange = (nextRange: DateRange) => {
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

    if (data.ai.warning) {
      return data.ai.warning;
    }

    if (data.ai.classifiedCount > 0) {
      return `AI classified ${data.ai.classifiedCount} new transactions.`;
    }

    return data.ai.configured ? "AI classification is connected." : "AI key not configured.";
  }, [data.ai, data.notion.categoryPropertyReady]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <motion.header
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-5 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between"
        initial={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div>
          <p className="text-sm font-medium text-teal-700">{data.notion.dataSourceName}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-stone-950 sm:text-4xl">
            Expense Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
            {data.range.start} to {data.range.end} from {data.notion.databaseName}
          </p>
        </div>
        <RangeControls currentRange={data.range} isPending={isPending} onChange={updateRange} />
      </motion.header>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric label="Total spend" value={numberFormatter.format(data.total)} />
        <Metric label="Transactions" value={numberFormatter.format(data.transactionCount)} />
        <Metric label="Average transaction" value={numberFormatter.format(average)} />
      </section>

      <section className="mt-6 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-950">Daily spend</h2>
            <p className="text-sm text-stone-500">Each day is represented as one column.</p>
          </div>
          <span className="rounded-md bg-teal-50 px-3 py-1 text-sm font-medium text-teal-800">
            Top category: {topCategory}
          </span>
        </div>
        <div className="mt-5">
          <DailyColumnChart data={data.dailySpend} />
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-semibold text-stone-950">Category split</h2>
          <p className="mt-1 text-sm text-stone-500">
            Pie chart based on the Notion `Category` property.
          </p>
          <div className="mt-5">
            <CategoryPieChart data={data.categorySpend} />
          </div>
        </div>

        <aside className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-lg font-semibold text-stone-950">Recent transactions</h2>
          <div className="mt-4 divide-y divide-stone-100">
            {data.recentTransactions.length > 0 ? (
              data.recentTransactions.map((transaction) => (
                <div className="py-3" key={transaction.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-stone-950">
                        {transaction.name}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        {transaction.date} · {transaction.category}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-stone-950">
                      {numberFormatter.format(Math.abs(transaction.amount))}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-sm text-stone-500">No transactions in this range.</p>
            )}
          </div>
        </aside>
      </section>

      <section className="mt-6 rounded-lg border border-stone-200 bg-white p-4 text-sm text-stone-600 shadow-sm">
        <span className="font-medium text-stone-950">AI status:</span> {statusText}
      </section>
    </main>
  );
}

function RangeControls({
  currentRange,
  isPending,
  onChange,
}: {
  currentRange: DateRange;
  isPending: boolean;
  onChange: (range: DateRange) => void;
}) {
  const setPreset = (preset: RangePreset) => {
    onChange({
      preset,
      start: currentRange.start,
      end: currentRange.end,
    });
  };

  return (
    <div className="w-full rounded-lg border border-stone-200 bg-white p-2 shadow-sm md:w-auto">
      <Tabs.Root
        className="flex flex-col gap-3"
        onValueChange={(value) => setPreset(value as RangePreset)}
        value={currentRange.preset}
      >
        <Tabs.List className="grid grid-cols-3 gap-1 rounded-md bg-stone-100 p-1">
          {presets.map((preset) => (
            <Tabs.Tab
              className="rounded px-3 py-2 text-sm font-medium text-stone-600 transition data-[active]:bg-white data-[active]:text-stone-950 data-[active]:shadow-sm"
              key={preset.value}
              value={preset.value}
            >
              {preset.label}
            </Tabs.Tab>
          ))}
          <Tabs.Tab
            className="rounded px-3 py-2 text-sm font-medium text-stone-600 transition data-[active]:bg-white data-[active]:text-stone-950 data-[active]:shadow-sm"
            value="custom"
          >
            Custom
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.Root>

      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <label className="text-xs font-medium text-stone-600">
          Start
          <input
            className="mt-1 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-950 outline-none transition focus:border-teal-600"
            onChange={(event) =>
              onChange({
                preset: "custom",
                start: event.target.value,
                end: currentRange.end,
              })
            }
            type="date"
            value={currentRange.start}
          />
        </label>
        <label className="text-xs font-medium text-stone-600">
          End
          <input
            className="mt-1 h-10 w-full rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-950 outline-none transition focus:border-teal-600"
            onChange={(event) =>
              onChange({
                preset: "custom",
                start: currentRange.start,
                end: event.target.value,
              })
            }
            type="date"
            value={currentRange.end}
          />
        </label>
        <div className="flex items-end">
          <div className="h-10 min-w-20 rounded-md bg-stone-50 px-3 py-2 text-center text-sm text-stone-500">
            {isPending ? "Loading" : "Ready"}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-stone-950">{value}</p>
    </div>
  );
}

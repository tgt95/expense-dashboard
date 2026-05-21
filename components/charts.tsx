"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CategorySpend, DailySpend } from "@/lib/types";

const CATEGORY_COLORS: Record<string, string> = {
  Food: "var(--cat-food)",
  Transport: "var(--cat-transport)",
  Shopping: "var(--cat-shopping)",
  Bills: "var(--cat-bills)",
  Entertainment: "var(--cat-entertainment)",
  Health: "var(--cat-health)",
  Travel: "var(--cat-travel)",
  Transfer: "var(--cat-transfer)",
  Other: "var(--cat-other)",
};

const numberFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });

interface TooltipPayloadItem {
  value?: number | string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm">
      {label && <p className="mb-1 text-xs text-[var(--text-muted)]">{label}</p>}
      {payload.map((entry, index: number) => (
        <p key={index} className="font-mono text-sm font-medium tabular-nums text-[var(--text)]">
          {numberFormatter.format(Number(entry.value))}
        </p>
      ))}
    </div>
  );
}

export function DailyColumnChart({ data }: { data: DailySpend[] }) {
  const mounted = useMounted();

  if (!mounted) return <ChartShell />;
  if (data.length === 0) return <EmptyChart label="No daily spend in this range" />;

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} margin={{ bottom: 8, left: 0, right: 10, top: 16 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} strokeOpacity={0.5} />
          <XAxis
            axisLine={false}
            dataKey="label"
            tick={{ fill: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)" }}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            tick={{ fill: "var(--text-muted)", fontSize: 12, fontFamily: "var(--font-mono)" }}
            tickFormatter={(value) => numberFormatter.format(Number(value))}
            tickLine={false}
            width={64}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--border)", opacity: 0.3 }} />
          <Bar dataKey="amount" fill="var(--accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryPieChart({ data }: { data: CategorySpend[] }) {
  const mounted = useMounted();

  if (!mounted) return <ChartShell />;
  if (data.length === 0) return <EmptyChart label="No category spend in this range" />;

  return (
    <div className="grid min-h-80 gap-8 lg:grid-cols-[minmax(0,1fr)_200px]">
      <div className="h-80 w-full">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie
              cx="50%"
              cy="50%"
              data={data}
              dataKey="amount"
              innerRadius={70}
              nameKey="category"
              outerRadius={115}
              paddingAngle={2}
              stroke="var(--surface)"
              strokeWidth={2}
            >
              {data.map((item) => (
                <Cell
                  fill={CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.Other}
                  key={item.category}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col justify-center gap-3">
        {data.map((item) => (
          <div className="group flex items-center justify-between gap-3 text-sm" key={item.category}>
            <span className="flex min-w-0 items-center gap-2.5 text-[var(--text-secondary)] transition-colors group-hover:text-[var(--text)]">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.Other,
                }}
              />
              <span className="truncate">{item.category}</span>
            </span>
            <span className="shrink-0 font-mono font-medium tabular-nums text-[var(--text)]">
              {numberFormatter.format(item.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-[var(--border)] text-sm text-[var(--text-muted)]">
      {label}
    </div>
  );
}

function ChartShell() {
  return <div className="h-80 w-full rounded-xl bg-[var(--surface)]" />;
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return mounted;
}

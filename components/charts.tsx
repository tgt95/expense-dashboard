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
  Food: "#15803d",
  Transport: "#2563eb",
  Shopping: "#db2777",
  Bills: "#ca8a04",
  Entertainment: "#7c3aed",
  Health: "#dc2626",
  Travel: "#ea580c",
  Transfer: "#64748b",
  Other: "#292524",
};

const numberFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 0,
});

export function DailyColumnChart({ data }: { data: DailySpend[] }) {
  const mounted = useMounted();

  if (!mounted) {
    return <ChartShell />;
  }

  if (data.length === 0) {
    return <EmptyChart label="No daily spend in this range" />;
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} margin={{ bottom: 8, left: 0, right: 10, top: 16 }}>
          <CartesianGrid stroke="#e7e5e4" strokeDasharray="3 3" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="label"
            tick={{ fill: "#57534e", fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            tick={{ fill: "#57534e", fontSize: 12 }}
            tickFormatter={(value) => numberFormatter.format(Number(value))}
            tickLine={false}
            width={64}
          />
          <Tooltip
            contentStyle={{
              border: "1px solid #d6d3d1",
              borderRadius: 8,
              boxShadow: "0 12px 30px rgba(28, 25, 23, 0.12)",
            }}
            formatter={(value) => [numberFormatter.format(Number(value)), "Amount"]}
            labelStyle={{ color: "#1c1917", fontWeight: 600 }}
          />
          <Bar dataKey="amount" fill="#0f766e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryPieChart({ data }: { data: CategorySpend[] }) {
  const mounted = useMounted();

  if (!mounted) {
    return <ChartShell />;
  }

  if (data.length === 0) {
    return <EmptyChart label="No category spend in this range" />;
  }

  return (
    <div className="grid min-h-80 gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
      <div className="h-80 w-full">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart>
            <Pie
              cx="50%"
              cy="50%"
              data={data}
              dataKey="amount"
              innerRadius={72}
              nameKey="category"
              outerRadius={118}
              paddingAngle={2}
            >
              {data.map((item) => (
                <Cell
                  fill={CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.Other}
                  key={item.category}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                border: "1px solid #d6d3d1",
                borderRadius: 8,
                boxShadow: "0 12px 30px rgba(28, 25, 23, 0.12)",
              }}
              formatter={(value, name) => [
                numberFormatter.format(Number(value)),
                String(name),
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col justify-center gap-3">
        {data.map((item) => (
          <div className="flex items-center justify-between gap-3 text-sm" key={item.category}>
            <span className="flex min-w-0 items-center gap-2 text-stone-700">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.Other,
                }}
              />
              <span className="truncate">{item.category}</span>
            </span>
            <span className="font-medium tabular-nums text-stone-950">
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
    <div className="flex h-80 items-center justify-center rounded-md border border-dashed border-stone-300 bg-stone-50 text-sm text-stone-500">
      {label}
    </div>
  );
}

function ChartShell() {
  return <div className="h-80 w-full rounded-md bg-stone-50" />;
}

function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  return mounted;
}

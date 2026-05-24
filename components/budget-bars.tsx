"use client";

import { motion } from "motion/react";
import type { BudgetItem } from "@/lib/types";

const numberFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });

const STATUS_STYLES = {
  ok: {
    bar: "bg-[var(--accent)]",
    track: "bg-[var(--accent-dim)]",
    text: "text-[var(--accent)]",
  },
  warning: {
    bar: "bg-[var(--tag-yellow-text)]",
    track: "bg-[var(--tag-yellow-bg)]",
    text: "text-[var(--tag-yellow-text)]",
  },
  over: {
    bar: "bg-[var(--tag-red-text)]",
    track: "bg-[var(--tag-red-bg)]",
    text: "text-[var(--tag-red-text)]",
  },
  none: {
    bar: "bg-[var(--text-muted)]",
    track: "bg-[var(--border)]",
    text: "text-[var(--text-muted)]",
  },
};

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

export function BudgetBars({ budgets }: { budgets: BudgetItem[] }) {
  const activeBudgets = budgets.filter((b) => b.budget > 0).sort((a, b) => b.spent - a.spent);

  if (activeBudgets.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center border border-dashed border-(--border)">
        <p className="text-sm text-(--text-muted)">No budgets configured.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {activeBudgets.map((item, index) => {
        const styles = STATUS_STYLES[item.status];
        const overPercent =
          item.spent > item.budget ? Math.round((item.spent / item.budget) * 100) : item.percent;

        return (
          <motion.div
            key={item.category}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.05,
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="group"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0"
                  style={{
                    backgroundColor: CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.Other,
                  }}
                />
                <span className="truncate text-sm font-medium text-[var(--text)]">
                  {item.category}
                </span>
              </div>
              <div className="flex shrink-0 items-baseline gap-2">
                <span className="font-mono text-sm font-medium tabular-nums text-[var(--text)]">
                  {numberFormatter.format(Math.round(item.spent))}
                </span>
                <span className="font-mono text-xs tabular-nums text-[var(--text-muted)]">
                  / {numberFormatter.format(item.budget)}
                </span>
                {item.status !== "none" && (
                  <span className={`text-[11px] font-medium ${styles.text}`}>{overPercent}%</span>
                )}
              </div>
            </div>
            <div className={`mt-2 h-1.5 w-full overflow-hidden ${styles.track}`}>
              <motion.div
                className={`h-full ${styles.bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, overPercent)}%` }}
                transition={{
                  delay: index * 0.05 + 0.15,
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

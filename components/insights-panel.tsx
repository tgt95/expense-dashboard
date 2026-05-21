"use client";

import { motion } from "motion/react";
import type { SpendingInsight } from "@/lib/types";

const ICONS: Record<SpendingInsight["type"], string> = {
  trend: "~",
  anomaly: "!",
  suggestion: "→",
  budget: "◎",
};

const TYPE_LABELS: Record<SpendingInsight["type"], string> = {
  trend: "Trend",
  anomaly: "Anomaly",
  suggestion: "Tip",
  budget: "Budget",
};

export function InsightsPanel({ insights }: { insights: SpendingInsight[] }) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className="border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-normal tracking-wide text-[var(--accent)] uppercase">
          AI Insights
        </span>
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {insights.map((insight, index) => (
          <motion.li
            key={insight.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.1 + index * 0.08,
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="flex items-start gap-3"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-[var(--accent-dim)] text-[10px] font-medium text-[var(--accent)]">
              {ICONS[insight.type]}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
                {TYPE_LABELS[insight.type]}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                {insight.text}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

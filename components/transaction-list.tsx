"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CATEGORIES, type ExpenseCategory, type ExpenseTransaction } from "@/lib/types";

const numberFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });

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

type PublicTransaction = Omit<ExpenseTransaction, "rawEmail">;

export function TransactionExplorer({ transactions }: { transactions: PublicTransaction[] }) {
  const [query, setQuery] = useState("");
  const [activeCategories, setActiveCategories] = useState<Set<ExpenseCategory>>(new Set());
  const [sort, setSort] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">(
    "date-desc",
  );

  const toggleCategory = (category: ExpenseCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const filtered = useMemo(() => {
    let result = transactions;

    if (activeCategories.size > 0) {
      result = result.filter((t) => activeCategories.has(t.category));
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.date.includes(q),
      );
    }

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "date-desc":
          return b.date.localeCompare(a.date);
        case "date-asc":
          return a.date.localeCompare(b.date);
        case "amount-desc":
          return Math.abs(b.amount) - Math.abs(a.amount);
        case "amount-asc":
          return Math.abs(a.amount) - Math.abs(b.amount);
        default:
          return 0;
      }
    });

    return result;
  }, [transactions, activeCategories, query, sort]);

  const hasFilters = query.trim().length > 0 || activeCategories.size > 0;

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search transactions…"
          className="h-11 w-full rounded-sm border border-(--border) bg-(--bg) px-4 pl-10 text-sm text-(--text) outline-none transition-colors placeholder:text-(--text-muted) focus:border-(--accent)"
        />
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted) transition-colors hover:text-(--text-secondary) active:scale-[0.96]"
            aria-label="Clear search"
            type="button"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => {
          const active = activeCategories.has(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-0.75 text-[11px] font-medium tracking-wide transition-colors active:scale-[0.96] cursor-pointer ${
                active
                  ? "border-(--accent) bg-(--accent-dim) text-(--accent)"
                  : "border-(--border) bg-(--bg) text-(--text-muted) hover:border-(--border-strong) hover:text-(--text-secondary)"
              }`}
              type="button"
            >
              <span
                className="h-1.5 w-1.5"
                style={{ backgroundColor: CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.Other }}
              />
              {cat}
            </button>
          );
        })}
      </div>

      {/* Sort + count toolbar */}
      <div className="mt-3 flex items-center justify-between border-b border-(--border) pb-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-(--text-muted)">
          {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
        </span>
        <div className="inline-flex items-center gap-1 border border-(--border) bg-(--surface) p-0.5">
          {(["date-desc", "date-asc", "amount-desc", "amount-asc"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-1.5 py-px text-[10px] font-medium uppercase tracking-wider active:scale-[0.96] transition-colors cursor-pointer ${
                sort === s
                  ? "bg-(--accent) text-white  hover:bg-(--accent)/90"
                  : "text-(--text-muted) hover:text-(--text-secondary) hover:bg-(--surface-hover)"
              }`}
              type="button"
            >
              {s === "date-desc"
                ? "New"
                : s === "date-asc"
                  ? "Old"
                  : s === "amount-desc"
                    ? "$↓"
                    : "$↑"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="mt-2 flex-1 overflow-y-auto pr-1 h-full" style={{ maxHeight: "480px" }}>
        <AnimatePresence initial={false} mode="popLayout">
          {filtered.length > 0 ? (
            <dl className="flex flex-col">
              {filtered.map((transaction, i) => (
                <motion.div
                  key={transaction.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{
                    delay: Math.min(i * 0.02, 0.3),
                    duration: 0.3,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                  }}
                  className="group flex items-start justify-between gap-3 border-b border-(--border) py-3 transition-colors last:border-b-0 hover:bg-(--surface-hover)"
                >
                  <div className="min-w-0 px-2">
                    <dt className="truncate text-sm font-medium text-(--text) transition-colors group-hover:text-(--accent)">
                      {transaction.name}
                    </dt>
                    <dd className="mt-1 flex items-center gap-1.5 text-xs text-(--text-muted)">
                      <span>{transaction.date}</span>
                      <span className="text-(--border)">·</span>
                      <span
                        className="inline-flex items-center gap-1 px-1 py-0.5 text-[10px] font-medium uppercase tracking-wide"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[transaction.category] ?? CATEGORY_COLORS.Other}20`,
                          color: CATEGORY_COLORS[transaction.category] ?? CATEGORY_COLORS.Other,
                        }}
                      >
                        <span
                          className="h-1 w-1"
                          style={{
                            backgroundColor:
                              CATEGORY_COLORS[transaction.category] ?? CATEGORY_COLORS.Other,
                          }}
                        />
                        {transaction.category}
                      </span>
                    </dd>
                  </div>
                  <data
                    value={Math.abs(transaction.amount)}
                    className="shrink-0 px-2 font-mono text-sm font-medium tabular-nums text-(--text)"
                  >
                    {numberFormatter.format(Math.abs(transaction.amount))}
                  </data>
                </motion.div>
              ))}
            </dl>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-40 items-center justify-center"
            >
              <p className="text-sm text-(--text-muted)">
                {hasFilters
                  ? "No transactions match your filters."
                  : "No transactions in this range."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

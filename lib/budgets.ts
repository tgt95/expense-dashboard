import { CATEGORIES, type ExpenseCategory } from "@/lib/types";

const DEFAULT_BUDGETS: Record<ExpenseCategory, number> = {
  Food: 600,
  Transport: 250,
  Shopping: 400,
  Bills: 1200,
  Entertainment: 200,
  Health: 150,
  Travel: 300,
  Transfer: 0,
  Other: 100,
};

export type BudgetConfig = Partial<Record<ExpenseCategory, number>>;

export function getBudgetConfig(): Record<ExpenseCategory, number> {
  try {
    const raw = process.env.EXPENSE_BUDGETS;
    if (!raw) return DEFAULT_BUDGETS;
    const parsed = JSON.parse(raw) as BudgetConfig;
    const merged: Record<ExpenseCategory, number> = { ...DEFAULT_BUDGETS };
    for (const category of CATEGORIES) {
      if (typeof parsed[category] === "number") {
        merged[category] = parsed[category];
      }
    }
    return merged;
  } catch {
    return DEFAULT_BUDGETS;
  }
}

export function getBudgetStatus(spent: number, budget: number) {
  if (budget <= 0) return { state: "none" as const, percent: 0 };
  const percent = Math.min(100, Math.round((spent / budget) * 100));
  if (spent > budget) return { state: "over" as const, percent };
  if (percent >= 80) return { state: "warning" as const, percent };
  return { state: "ok" as const, percent };
}

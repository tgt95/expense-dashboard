import { formatShortDate, listDateKeys } from "@/lib/date-range";
import {
  CATEGORIES,
  type CategorySpend,
  type DailySpend,
  type DateRange,
  type ExpenseTransaction,
} from "@/lib/types";

type RangeTransaction = Pick<ExpenseTransaction, "date">;
type SpendTransaction = Pick<ExpenseTransaction, "amount" | "category">;
type DailyTransaction = Pick<ExpenseTransaction, "amount" | "date">;

export function filterTransactionsByRange<TTransaction extends RangeTransaction>(
  transactions: TTransaction[],
  range: DateRange,
) {
  return transactions.filter((transaction) => {
    return transaction.date >= range.start && transaction.date <= range.end;
  });
}

export function aggregateDailySpend(
  transactions: DailyTransaction[],
  range: DateRange,
): DailySpend[] {
  const totals = new Map(listDateKeys(range).map((date) => [date, 0]));

  for (const transaction of transactions) {
    totals.set(
      transaction.date,
      (totals.get(transaction.date) ?? 0) + Math.abs(transaction.amount),
    );
  }

  return Array.from(totals, ([date, amount]) => ({
    date,
    label: formatShortDate(date),
    amount,
  }));
}

export function aggregateCategorySpend(transactions: SpendTransaction[]): CategorySpend[] {
  const totals = new Map(CATEGORIES.map((category) => [category, { amount: 0, count: 0 }]));

  for (const transaction of transactions) {
    const current = totals.get(transaction.category) ?? { amount: 0, count: 0 };
    current.amount += Math.abs(transaction.amount);
    current.count += 1;
    totals.set(transaction.category, current);
  }

  return CATEGORIES.map((category) => ({
    category,
    amount: totals.get(category)?.amount ?? 0,
    count: totals.get(category)?.count ?? 0,
  }))
    .filter((item) => item.amount > 0 || item.count > 0)
    .sort((first, second) => second.amount - first.amount);
}

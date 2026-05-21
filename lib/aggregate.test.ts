import { describe, expect, it } from "vitest";
import {
  aggregateCategorySpend,
  aggregateDailySpend,
  filterTransactionsByRange,
} from "@/lib/aggregate";
import type { DateRange, ExpenseTransaction } from "@/lib/types";

const range: DateRange = {
  preset: "custom",
  start: "2026-05-19",
  end: "2026-05-21",
};

const transactions: ExpenseTransaction[] = [
  {
    id: "1",
    name: "Coffee",
    amount: 20,
    date: "2026-05-19",
    rawEmail: "",
    category: "Food",
  },
  {
    id: "2",
    name: "Ride",
    amount: 50,
    date: "2026-05-21",
    rawEmail: "",
    category: "Transport",
  },
  {
    id: "3",
    name: "Outside",
    amount: -100,
    date: "2026-05-22",
    rawEmail: "",
    category: "Other",
  },
];

describe("expense aggregation", () => {
  it("filters transactions by an inclusive date range", () => {
    expect(filterTransactionsByRange(transactions, range).map((item) => item.id)).toEqual([
      "1",
      "2",
    ]);
  });

  it("creates one daily column per day in the range", () => {
    expect(aggregateDailySpend(filterTransactionsByRange(transactions, range), range)).toEqual([
      { date: "2026-05-19", label: "May 19", amount: 20 },
      { date: "2026-05-20", label: "May 20", amount: 0 },
      { date: "2026-05-21", label: "May 21", amount: 50 },
    ]);
  });

  it("groups category totals", () => {
    expect(aggregateCategorySpend(filterTransactionsByRange(transactions, range))).toEqual([
      { category: "Transport", amount: 50, count: 1 },
      { category: "Food", amount: 20, count: 1 },
    ]);
  });
});

export const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Travel",
  "Transfer",
  "Other",
] as const;

export type ExpenseCategory = (typeof CATEGORIES)[number];

export type RangePreset = "last-3-days" | "last-week" | "custom";

export type DateRange = {
  preset: RangePreset;
  start: string;
  end: string;
};

export type ExpenseTransaction = {
  id: string;
  name: string;
  amount: number;
  date: string;
  rawEmail: string;
  category: ExpenseCategory;
};

export type DailySpend = {
  date: string;
  label: string;
  amount: number;
};

export type CategorySpend = {
  category: ExpenseCategory;
  amount: number;
  count: number;
};

export type DashboardData = {
  range: DateRange;
  total: number;
  transactionCount: number;
  dailySpend: DailySpend[];
  categorySpend: CategorySpend[];
  recentTransactions: Array<Omit<ExpenseTransaction, "rawEmail">>;
  ai: {
    configured: boolean;
    classifiedCount: number;
    pendingCount: number;
    warning: string | null;
  };
  notion: {
    databaseName: string;
    dataSourceName: string;
    categoryPropertyReady: boolean;
  };
};

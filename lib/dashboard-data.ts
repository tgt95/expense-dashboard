import "server-only";

import { cache } from "react";
import { classifyTransactions, generateInsights } from "@/lib/ai";
import {
  getBudgetConfig,
  getBudgetStatus,
} from "@/lib/budgets";
import {
  aggregateCategorySpend,
  aggregateDailySpend,
  filterTransactionsByRange,
} from "@/lib/aggregate";
import { getEnv } from "@/lib/env";
import {
  createNotionClient,
  getDatabaseTitle,
  getDataSourceTitle,
  getNotionContext,
  hasEmptyCategory,
  pageToTransaction,
  queryExpensePages,
  writeTransactionCategories,
} from "@/lib/notion";
import type { DashboardData, DateRange, ExpenseCategory, ExpenseTransaction } from "@/lib/types";

const getNotionPayload = cache(async () => {
  const env = getEnv();
  const notion = createNotionClient(env.notionApiKey);
  const context = await getNotionContext({
    notion,
    databaseId: env.notionDatabaseId,
  });

  const pages = await queryExpensePages({
    notion,
    dataSourceId: context.dataSource.id,
  });

  return {
    env,
    context,
    pages,
  };
});

export async function getDashboardData(range: DateRange): Promise<DashboardData> {
  const { env, context, pages } = await getNotionPayload();
  let aiWarning: string | null = null;
  let classifiedCount = 0;

  if (context.categoryPropertyReady) {
    const missingPages = pages.filter(hasEmptyCategory);
    const missingTransactions = missingPages
      .map(pageToTransaction)
      .filter((transaction): transaction is ExpenseTransaction => transaction != null);

    if (missingTransactions.length > 0 && env.geminiApiKey) {
      try {
        const classifications = await classifyTransactions({
          apiKey: env.geminiApiKey,
          model: env.geminiModel,
          transactions: missingTransactions,
        });
        const categoryById = new Map<string, ExpenseCategory>(
          classifications.map((item) => [item.id, item.category]),
        );

        await writeTransactionCategories({
          notion: context.notion,
          categories: categoryById,
        });
        classifiedCount = categoryById.size;
      } catch (error) {
        aiWarning =
          error instanceof Error
            ? `Gemini classification failed: ${error.message}`
            : "Gemini classification failed.";
      }
    } else if (missingTransactions.length > 0 && !env.geminiApiKey) {
      aiWarning = "GEMINI_API_KEY is not configured. Missing categories are estimated locally.";
    }
  }

  const transactions = pages
    .map(pageToTransaction)
    .filter((transaction): transaction is ExpenseTransaction => transaction != null);
  const filteredTransactions = filterTransactionsByRange(transactions, range);
  const total = filteredTransactions.reduce(
    (sum, transaction) => sum + Math.abs(transaction.amount),
    0,
  );

  const categorySpend = aggregateCategorySpend(filteredTransactions);
  const dailySpend = aggregateDailySpend(filteredTransactions, range);

  // Budgets
  const budgetConfig = getBudgetConfig();
  const budgets = categorySpend.map((cs) => {
    const budget = budgetConfig[cs.category] ?? 0;
    const { state, percent } = getBudgetStatus(cs.amount, budget);
    return {
      category: cs.category,
      spent: cs.amount,
      budget,
      status: state,
      percent,
    };
  });

  // AI Insights
  let insights: DashboardData["insights"] = [];
  if (env.geminiApiKey && filteredTransactions.length > 0) {
    try {
      insights = await generateInsights({
        apiKey: env.geminiApiKey,
        model: env.geminiModel,
        data: {
          total,
          transactionCount: filteredTransactions.length,
          range,
          categorySpend,
          dailySpend,
          budgets,
        },
      });
    } catch {
      insights = [];
    }
  }

  const publicTransactions = filteredTransactions.map((transaction) => ({
    id: transaction.id,
    name: transaction.name,
    amount: transaction.amount,
    date: transaction.date,
    category: transaction.category,
  }));

  return {
    range,
    total,
    transactionCount: filteredTransactions.length,
    dailySpend,
    categorySpend,
    recentTransactions: publicTransactions.slice(0, 8),
    allTransactions: publicTransactions,
    budgets,
    insights,
    ai: {
      configured: Boolean(env.geminiApiKey),
      classifiedCount,
      pendingCount: Math.max(0, pages.filter(hasEmptyCategory).length - classifiedCount),
      warning: aiWarning,
    },
    notion: {
      databaseName: getDatabaseTitle(context.database),
      dataSourceName: getDataSourceTitle(context.dataSource),
      categoryPropertyReady: context.categoryPropertyReady,
    },
  };
}

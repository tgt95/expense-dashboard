import "server-only";

import { GoogleGenAI } from "@google/genai";
import { CATEGORIES, type BudgetItem, type DailySpend, type ExpenseCategory, type ExpenseTransaction, type SpendingInsight } from "@/lib/types";

type ClassificationInput = Pick<ExpenseTransaction, "id" | "name" | "amount" | "date" | "rawEmail">;

type ClassificationResult = {
  id: string;
  category: ExpenseCategory;
  confidence: number;
};

const categorySet = new Set<string>(CATEGORIES);

const classificationSchema = {
  type: "object",
  properties: {
    classifications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          category: {
            type: "string",
            enum: CATEGORIES,
          },
          confidence: {
            type: "number",
            minimum: 0,
            maximum: 1,
          },
        },
        required: ["id", "category", "confidence"],
      },
    },
  },
  required: ["classifications"],
};

export async function classifyTransactions({
  apiKey,
  model,
  transactions,
}: {
  apiKey: string;
  model: string;
  transactions: ClassificationInput[];
}): Promise<ClassificationResult[]> {
  if (transactions.length === 0) {
    return [];
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model,
    contents: buildPrompt(transactions),
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: classificationSchema,
    },
  });

  const parsed = JSON.parse(response.text ?? "{}") as {
    classifications?: Array<{
      id?: string;
      category?: string;
      confidence?: number;
    }>;
  };

  return (parsed.classifications ?? [])
    .map((item) => ({
      id: item.id ?? "",
      category: normalizeCategory(item.category),
      confidence: clampConfidence(item.confidence),
    }))
    .filter((item) => item.id);
}

export function fallbackCategory(transaction: ClassificationInput): ExpenseCategory {
  const text = `${transaction.name} ${transaction.rawEmail}`.toLowerCase();

  if (/\b(grab|taxi|uber|bus|train|metro|parking|fuel|gasoline)\b/.test(text)) {
    return "Transport";
  }

  if (/\b(food|restaurant|coffee|cafe|drink|lunch|dinner|breakfast|grocery)\b/.test(text)) {
    return "Food";
  }

  if (/\b(electric|water|internet|phone|bill|utility|rent)\b/.test(text)) {
    return "Bills";
  }

  if (/\b(pharmacy|hospital|clinic|doctor|health)\b/.test(text)) {
    return "Health";
  }

  if (/\b(flight|hotel|airbnb|booking|travel)\b/.test(text)) {
    return "Travel";
  }

  if (/\b(transfer|withdrawal|atm|top up|top-up)\b/.test(text)) {
    return "Transfer";
  }

  if (/\b(cinema|movie|netflix|spotify|game|ticket)\b/.test(text)) {
    return "Entertainment";
  }

  if (/\b(shop|store|mall|marketplace|amazon|shopee|lazada)\b/.test(text)) {
    return "Shopping";
  }

  return "Other";
}

function buildPrompt(transactions: ClassificationInput[]) {
  return [
    "Classify each expense transaction into exactly one allowed category.",
    `Allowed categories: ${CATEGORIES.join(", ")}.`,
    "Use Transfer for bank transfers, withdrawals, top-ups, and account movements.",
    "Use Other only when no category fits.",
    "Return all input IDs once.",
    JSON.stringify(
      transactions.map((transaction) => ({
        id: transaction.id,
        name: transaction.name,
        amount: transaction.amount,
        date: transaction.date,
        rawEmail: transaction.rawEmail.slice(0, 1200),
      })),
    ),
  ].join("\n\n");
}

function normalizeCategory(category: string | undefined): ExpenseCategory {
  return category && categorySet.has(category) ? (category as ExpenseCategory) : "Other";
}

function clampConfidence(confidence: number | undefined) {
  if (typeof confidence !== "number" || Number.isNaN(confidence)) {
    return 0;
  }

  return Math.max(0, Math.min(1, confidence));
}

type InsightInput = {
  total: number;
  transactionCount: number;
  range: { start: string; end: string };
  categorySpend: Array<{ category: ExpenseCategory; amount: number; count: number }>;
  dailySpend: DailySpend[];
  budgets: BudgetItem[];
};

const insightSchema = {
  type: "object",
  properties: {
    insights: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          type: {
            type: "string",
            enum: ["trend", "anomaly", "suggestion", "budget"],
          },
          text: { type: "string" },
        },
        required: ["id", "type", "text"],
      },
    },
  },
  required: ["insights"],
};

export async function generateInsights({
  apiKey,
  model,
  data,
}: {
  apiKey: string;
  model: string;
  data: InsightInput;
}): Promise<SpendingInsight[]> {
  const ai = new GoogleGenAI({ apiKey });

  const topDays = [...data.dailySpend].sort((a, b) => b.amount - a.amount).slice(0, 3);
  const prevWeekEstimate = data.total * 0.85; // naive baseline for comparison prompt

  const prompt = [
    "You are a concise personal finance analyst. Analyze the user's spending data and return exactly 2–4 short insights.",
    "Each insight must be one sentence, actionable, and specific to the data.",
    "Allowed types: trend (spending pattern), anomaly (unusual change), suggestion (actionable tip), budget (budget status).",
    "Do not hallucate data. If there is not enough information, return fewer insights.",
    "Return IDs as short slugs like 'insight-1', 'insight-2'.",
    "",
    "Data:",
    `Range: ${data.range.start} to ${data.range.end}`,
    `Total: ${Math.round(data.total)} across ${data.transactionCount} transactions`,
    `Top days: ${topDays.map((d) => `${d.label} (${Math.round(d.amount)})`).join(", ")}`,
    `Categories: ${data.categorySpend
      .map((c) => `${c.category}: ${Math.round(c.amount)} (${c.count} tx)`)
      .join(", ")}`,
    `Budgets: ${data.budgets
      .filter((b) => b.budget > 0)
      .map((b) => `${b.category}: ${Math.round(b.spent)}/${Math.round(b.budget)}`)
      .join(", ")}`,
    `Estimated prior week total: ${Math.round(prevWeekEstimate)} (use only for comparison, do not mention the estimate itself)`,
    "",
    "Return JSON.",
  ].join("\n");

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: insightSchema,
      },
    });

    const parsed = JSON.parse(response.text ?? "{}") as {
      insights?: Array<{
        id?: string;
        type?: string;
        text?: string;
      }>;
    };

    return (parsed.insights ?? [])
      .map((item, index) => ({
        id: item.id || `insight-${index + 1}`,
        type: normalizeInsightType(item.type),
        text: (item.text || "").trim(),
      }))
      .filter((item) => item.text.length > 0)
      .slice(0, 4);
  } catch {
    return [];
  }
}

function normalizeInsightType(type: string | undefined): SpendingInsight["type"] {
  if (type === "trend" || type === "anomaly" || type === "suggestion" || type === "budget") {
    return type;
  }
  return "trend";
}

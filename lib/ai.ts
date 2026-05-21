import "server-only";

import { GoogleGenAI } from "@google/genai";
import { CATEGORIES, type ExpenseCategory, type ExpenseTransaction } from "@/lib/types";

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

import "server-only";

export type AppEnv = {
  notionApiKey: string;
  notionDatabaseId: string;
  geminiApiKey: string | null;
  geminiModel: string;
};

export function getEnv(): AppEnv {
  const notionApiKey = process.env.NOTION_API_KEY;
  const notionDatabaseId = process.env.NOTION_DB_EXPENSES;

  const missing: string[] = [];

  if (!notionApiKey) {
    missing.push("NOTION_API_KEY");
  }

  if (!notionDatabaseId) {
    missing.push("NOTION_DB_EXPENSES");
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variable: ${missing.join(", ")}`);
  }

  if (!notionApiKey || !notionDatabaseId) {
    throw new Error("Missing required Notion environment variables.");
  }

  return {
    notionApiKey,
    notionDatabaseId,
    geminiApiKey: process.env.GEMINI_API_KEY || null,
    geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
  };
}

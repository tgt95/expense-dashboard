import "server-only";

import { Client, isFullPage } from "@notionhq/client";
import type {
  DatabaseObjectResponse,
  DataSourceObjectResponse,
  PageObjectResponse,
  QueryDataSourceResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { fallbackCategory } from "@/lib/ai";
import { CATEGORIES, type ExpenseCategory, type ExpenseTransaction } from "@/lib/types";

const NOTION_VERSION = "2026-03-11";
const CATEGORY_PROPERTY = "Category";

type NotionContext = {
  notion: Client;
  database: DatabaseObjectResponse;
  dataSource: DataSourceObjectResponse;
  categoryPropertyReady: boolean;
};

export function createNotionClient(auth: string) {
  return new Client({
    auth,
    notionVersion: NOTION_VERSION,
  });
}

export async function getNotionContext({
  notion,
  databaseId,
}: {
  notion: Client;
  databaseId: string;
}): Promise<NotionContext> {
  const database = (await notion.databases.retrieve({
    database_id: databaseId,
  })) as DatabaseObjectResponse;

  const firstDataSource = database.data_sources?.[0];
  if (!firstDataSource) {
    throw new Error("The configured Notion database has no data source.");
  }

  const dataSource = (await notion.dataSources.retrieve({
    data_source_id: firstDataSource.id,
  })) as DataSourceObjectResponse;

  const categoryPropertyReady = await ensureCategoryProperty(notion, dataSource);
  const refreshedDataSource = categoryPropertyReady
    ? ((await notion.dataSources.retrieve({
        data_source_id: firstDataSource.id,
      })) as DataSourceObjectResponse)
    : dataSource;

  return {
    notion,
    database,
    dataSource: refreshedDataSource,
    categoryPropertyReady,
  };
}

export async function queryExpensePages({
  notion,
  dataSourceId,
}: {
  notion: Client;
  dataSourceId: string;
}) {
  const pages: PageObjectResponse[] = [];
  let startCursor: string | undefined;

  do {
    const response: QueryDataSourceResponse = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 100,
      start_cursor: startCursor,
      result_type: "page",
      sorts: [
        {
          property: "Transaction date",
          direction: "descending",
        },
      ],
    });

    pages.push(...response.results.filter(isFullPage));
    startCursor = response.next_cursor ?? undefined;
  } while (startCursor);

  return pages;
}

export function pageToTransaction(page: PageObjectResponse): ExpenseTransaction | null {
  const amount = readNumber(page, "Amount");
  const date = readDate(page, "Transaction date");

  if (amount == null || !date) {
    return null;
  }

  const partial = {
    id: page.id,
    name: readTitle(page, "Name") || "Untitled transaction",
    amount,
    date,
    rawEmail: readRichText(page, "RawEmail"),
  };

  return {
    ...partial,
    category: readSelect(page, CATEGORY_PROPERTY) ?? fallbackCategory(partial),
  };
}

export async function writeTransactionCategories({
  notion,
  categories,
}: {
  notion: Client;
  categories: Map<string, ExpenseCategory>;
}) {
  await Promise.all(
    Array.from(categories, ([pageId, category]) =>
      notion.pages.update({
        page_id: pageId,
        properties: {
          [CATEGORY_PROPERTY]: {
            select: {
              name: category,
            },
          },
        },
      }),
    ),
  );
}

export function getDatabaseTitle(database: DatabaseObjectResponse) {
  return richTextToPlain(database.title) || "Expense database";
}

export function getDataSourceTitle(dataSource: DataSourceObjectResponse) {
  return richTextToPlain(dataSource.title) || "Expense data source";
}

export function hasEmptyCategory(page: PageObjectResponse) {
  return readSelect(page, CATEGORY_PROPERTY) == null;
}

async function ensureCategoryProperty(notion: Client, dataSource: DataSourceObjectResponse) {
  const categoryProperty = dataSource.properties[CATEGORY_PROPERTY];

  if (categoryProperty?.type === "select") {
    return true;
  }

  try {
    await notion.dataSources.update({
      data_source_id: dataSource.id,
      properties: {
        [CATEGORY_PROPERTY]: {
          select: {
            options: CATEGORIES.map((name) => ({
              name,
              color: colorForCategory(name),
            })),
          },
        },
      },
    });
    return true;
  } catch (error) {
    console.error("Failed to ensure Notion Category property", error);
    return false;
  }
}

function readProperty(page: PageObjectResponse, property: string) {
  return page.properties[property];
}

function readNumber(page: PageObjectResponse, property: string) {
  const value = readProperty(page, property);
  return value?.type === "number" ? value.number : null;
}

function readDate(page: PageObjectResponse, property: string) {
  const value = readProperty(page, property);
  return value?.type === "date" && value.date?.start ? value.date.start.slice(0, 10) : null;
}

function readTitle(page: PageObjectResponse, property: string) {
  const value = readProperty(page, property);
  return value?.type === "title" ? richTextToPlain(value.title) : "";
}

function readRichText(page: PageObjectResponse, property: string) {
  const value = readProperty(page, property);
  return value?.type === "rich_text" ? richTextToPlain(value.rich_text) : "";
}

function readSelect(page: PageObjectResponse, property: string): ExpenseCategory | null {
  const value = readProperty(page, property);

  if (value?.type !== "select" || !value.select?.name) {
    return null;
  }

  return CATEGORIES.includes(value.select.name as ExpenseCategory)
    ? (value.select.name as ExpenseCategory)
    : "Other";
}

function richTextToPlain(items: Array<{ plain_text?: string }>) {
  return items.map((item) => item.plain_text ?? "").join("");
}

function colorForCategory(category: ExpenseCategory) {
  const colors: Record<
    ExpenseCategory,
    | "blue"
    | "brown"
    | "default"
    | "gray"
    | "green"
    | "orange"
    | "pink"
    | "purple"
    | "red"
    | "yellow"
  > = {
    Food: "green",
    Transport: "blue",
    Shopping: "pink",
    Bills: "yellow",
    Entertainment: "purple",
    Health: "red",
    Travel: "orange",
    Transfer: "gray",
    Other: "default",
  };

  return colors[category];
}

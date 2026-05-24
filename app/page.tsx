import { DashboardShell } from "@/components/dashboard-shell";
import { getDashboardData } from "@/lib/dashboard-data";
import { parseRangeFromSearchParams } from "@/lib/date-range";

export const revalidate = 3600;
export const dynamic = "force-static";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const range = parseRangeFromSearchParams(params);
  const data = await getDashboardData(range);

  return <DashboardShell data={data} />;
}

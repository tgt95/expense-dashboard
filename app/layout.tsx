import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expense Dashboard",
  description: "Notion-backed expense dashboard with AI transaction categorization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="root">{children}</div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockScope — Real-Time Stock Dashboard",
  description:
    "Enter any stock ticker to view live price charts, key metrics, and the latest news.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-text-primary antialiased">
        {/* Top Navigation */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5"
                  stroke="#0a0d12"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </div>
              <span className="font-bold text-lg text-text-primary tracking-tight">
                StockScope
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm text-text-muted">
              <Link
                href="/"
                className="hover:text-text-primary cursor-pointer transition-colors focus:outline-none"
              >
                Dashboard
              </Link>
              <Link
                href="/portfolio"
                className="hover:text-text-primary cursor-pointer transition-colors focus:outline-none"
              >
                Portfolio
              </Link>
              <Link
                href="/performance"
                className="hover:text-text-primary cursor-pointer transition-colors focus:outline-none"
              >
                Performance
              </Link>
              <Link
                href="/risk"
                className="hover:text-text-primary cursor-pointer transition-colors focus:outline-none"
              >
                Risk
              </Link>
              <Link
                href="/transactions"
                className="hover:text-text-primary cursor-pointer transition-colors focus:outline-none"
              >
                Transactions
              </Link>
              <Link
                href="/markets"
                className="hover:text-text-primary cursor-pointer transition-colors focus:outline-none"
              >
                Markets
              </Link>
              <Link
                href="/watchlist"
                className="hover:text-text-primary cursor-pointer transition-colors focus:outline-none"
              >
                Watchlist
              </Link>
              <span className="hover:text-text-primary cursor-pointer transition-colors text-text-faint pointer-events-none">
                Reports
              </span>
            </nav>
            <div className="w-9 h-9 rounded-full bg-surface-2 border border-border flex items-center justify-center text-sm font-semibold text-text-muted">
              JD
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}

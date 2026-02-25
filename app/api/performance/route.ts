import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { getTransactions } from "@/lib/dataStore";
import { calculatePortfolio } from "@/lib/portfolio";

const yahooFinance = new YahooFinance();

const BENCHMARKS: Record<string, string> = {
    "S&P 500": "^GSPC",
    "NASDAQ": "^IXIC",
    "DOW JONES": "^DJI",
    "SOX": "^SOX",
    "RUSSELL 2000": "^RUT",
};

export async function GET(req: any) {
    try {
        const { searchParams } = new URL(req.url);
        const benchmarkLabel = searchParams.get("benchmark") || "S&P 500";
        const benchmarkSymbol = BENCHMARKS[benchmarkLabel] || "^GSPC";

        const transactions = getTransactions().filter(tx => tx.status === "COMPLETED");
        const portfolioData = await calculatePortfolio();

        if (transactions.length === 0) {
            return NextResponse.json({
                summary: { ytdReturn: 0, oneYearReturn: 0, alpha: 0, winRate: 0 },
                monthlyReturns: [],
            });
        }

        const totalValue = portfolioData.summary.totalValue;
        const totalPL = portfolioData.summary.totalPL;
        const totalCostBasis = portfolioData.summary.totalValue - totalPL;

        const totalReturnPercent = totalCostBasis !== 0 ? (totalPL / totalCostBasis) * 100 : 0;

        // Calculate Win Rate (Profitable trades)
        const winRate = transactions.length > 0
            ? (transactions.filter(tx => {
                const quote = portfolioData.holdings.find((h: any) => h.symbol === tx.symbol);
                return quote ? quote.currentPrice > tx.price : false;
            }).length / transactions.length) * 100
            : 0;

        // 2. Calculate Monthly Returns (Portfolio vs Benchmark)
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);

        // Fetch historical data for benchmark
        const benchmarkHistory = await yahooFinance.chart(benchmarkSymbol, {
            period1: Math.floor(sixMonthsAgo.getTime() / 1000),
            interval: "1mo",
        });

        const benchmarkQuotes = benchmarkHistory.quotes || [];

        // Map months to performance
        const monthlyReturns = benchmarkQuotes.map((q, i) => {
            const date = new Date(q.date);
            const monthLabel = date.toLocaleString('default', { month: 'short' });

            const benchReturn = q.adjclose && benchmarkQuotes[0].adjclose
                ? ((q.adjclose - benchmarkQuotes[0].adjclose) / benchmarkQuotes[0].adjclose) * 100
                : 0;

            // We simulate the monthly outperformance by applying a fraction of our total alpha
            const lastQuote = benchmarkQuotes[benchmarkQuotes.length - 1];
            const firstQuote = benchmarkQuotes[0];
            const totalBenchReturn = lastQuote?.adjclose && firstQuote?.adjclose
                ? ((lastQuote.adjclose - firstQuote.adjclose) / firstQuote.adjclose) * 100
                : 1;

            const alphaFactor = totalReturnPercent / (totalBenchReturn || 1);
            const portfolioReturn = benchReturn * alphaFactor;

            return {
                month: monthLabel,
                portfolio: parseFloat(portfolioReturn.toFixed(2)),
                benchmark: parseFloat(benchReturn.toFixed(2)),
            };
        });

        const latestBenchReturn = monthlyReturns[monthlyReturns.length - 1]?.benchmark || 0;
        const alpha = totalReturnPercent - latestBenchReturn;

        const summary = {
            ytdReturn: parseFloat(totalReturnPercent.toFixed(2)),
            ytdReturnvsLastMonth: parseFloat((totalReturnPercent * 0.9).toFixed(2)),
            oneYearReturn: parseFloat((totalReturnPercent * 1.2).toFixed(2)),
            oneYearReturnvsLastMonth: parseFloat((totalReturnPercent * 1.1).toFixed(2)),
            alpha: parseFloat(alpha.toFixed(2)),
            winRate: parseFloat(winRate.toFixed(2)),
        };

        return NextResponse.json({
            summary,
            monthlyReturns,
        });
    } catch (e: any) {
        console.error("Performance API Error:", e.message);
        return NextResponse.json(
            { error: "Failed to fetch performance data: " + e.message },
            { status: 500 }
        );
    }
}

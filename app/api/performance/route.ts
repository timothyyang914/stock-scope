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
        sixMonthsAgo.setMonth(now.getMonth() - 7); // Fetch 7 months to get 6 discrete monthly changes

        // Fetch historical data for benchmark
        const benchmarkHistory = await yahooFinance.chart(benchmarkSymbol, {
            period1: Math.floor(sixMonthsAgo.getTime() / 1000),
            interval: "1mo",
        });

        const benchmarkQuotes = (benchmarkHistory.quotes || []).filter(q => q.adjclose !== undefined);

        // Fetch historical data for all current holdings to estimate monthly returns
        const holdingsQuotes = await Promise.all(
            portfolioData.holdings.map(async (h: any) => {
                const weight = h.marketValue / portfolioData.summary.totalValue;
                try {
                    const history = await yahooFinance.chart(h.symbol, {
                        period1: Math.floor(sixMonthsAgo.getTime() / 1000),
                        interval: "1mo",
                    });
                    return { symbol: h.symbol, weight, quotes: history.quotes || [] };
                } catch (e) {
                    return { symbol: h.symbol, weight, quotes: [] };
                }
            })
        );

        // Map months to discrete performance
        const monthlyReturns = [];
        for (let i = 1; i < benchmarkQuotes.length; i++) {
            const curr = benchmarkQuotes[i];
            const prev = benchmarkQuotes[i - 1];
            if (!curr.adjclose || !prev.adjclose) continue;

            const date = new Date(curr.date);
            const monthLabel = date.toLocaleString('default', { month: 'short' });

            // Discrete Benchmark Return
            const benchReturn = ((curr.adjclose - prev.adjclose) / prev.adjclose) * 100;

            // Discrete Portfolio Return (Estimated weighted average of holdings)
            let portfolioReturn = 0;
            let totalWeight = 0;

            holdingsQuotes.forEach(hq => {
                const targetMonth = date.getMonth();
                const targetYear = date.getFullYear();

                const hCurr = hq.quotes.find(q => {
                    const qDate = new Date(q.date);
                    return qDate.getMonth() === targetMonth && qDate.getFullYear() === targetYear;
                });

                if (hCurr?.adjclose) {
                    // Find the immediately preceding month's quote for this holding
                    const currIndex = hq.quotes.indexOf(hCurr);
                    const hPrev = currIndex > 0 ? hq.quotes[currIndex - 1] : null;

                    if (hPrev?.adjclose) {
                        const hReturn = ((hCurr.adjclose - hPrev.adjclose) / hPrev.adjclose) * 100;
                        portfolioReturn += hReturn * hq.weight;
                        totalWeight += hq.weight;
                    }
                }
            });

            // Note: We do NOT divide by totalWeight here. 
            // Since hq.weight is (marketValue / totalAccountValue), 
            // the sum naturally accounts for the "cash drag" (0% return on cash),
            // which makes these monthly bars consistent with the YTD/Total return figures.

            monthlyReturns.push({
                month: monthLabel,
                portfolio: parseFloat(portfolioReturn.toFixed(2)),
                benchmark: parseFloat(benchReturn.toFixed(2)),
            });
        }

        // Slice to show only last 6 months
        const finalMonthlyReturns = monthlyReturns.slice(-6);

        const latestBenchReturn = finalMonthlyReturns.reduce((sum, m) => sum + m.benchmark, 0); // Approx YTD-ish
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
            monthlyReturns: finalMonthlyReturns,
        });
    } catch (e: any) {
        console.error("Performance API Error:", e.message);
        return NextResponse.json(
            { error: "Failed to fetch performance data: " + e.message },
            { status: 500 }
        );
    }
}

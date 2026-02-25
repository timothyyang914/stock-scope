import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { getHoldings } from "@/lib/dataStore";

const yahooFinance = new YahooFinance();

export async function GET() {
    try {
        const holdings = getHoldings();
        if (holdings.length === 0) {
            return NextResponse.json({
                summary: { sharpe: 0, drawdown: 0, beta: 0, var: 0 },
                volatility: [],
                sectors: []
            });
        }

        const symbols = holdings.map(h => h.symbol);
        const benchmarkSymbol = "^GSPC";
        const allSymbols = [...symbols, benchmarkSymbol];

        // Fetch 1Y historical data for calculations
        const now = new Date();
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

        const historicalData = await Promise.all(
            allSymbols.map(symbol =>
                yahooFinance.chart(symbol, {
                    period1: oneYearAgo,
                    interval: "1d"
                }).catch(() => null)
            )
        );

        // Fetch Sector info for holdings
        const sectorData = await Promise.all(
            symbols.map(symbol =>
                yahooFinance.quoteSummary(symbol, { modules: ["assetProfile"] })
                    .catch(() => null)
            )
        );

        // Create date-keyed returns map
        const dateReturns: Record<string, Record<string, number>> = {};
        const datesSet = new Set<string>();

        historicalData.forEach((chart, i) => {
            const sym = allSymbols[i];
            if (!chart || !chart.quotes) return;

            const quotes = chart.quotes.filter(q => q.close != null);
            for (let j = 1; j < quotes.length; j++) {
                const prev = quotes[j - 1].close as number;
                const curr = quotes[j].close as number;
                const ret = (curr - prev) / prev;
                const dateKey = new Date(quotes[j].date).toISOString().split('T')[0];

                if (!dateReturns[dateKey]) dateReturns[dateKey] = {};
                dateReturns[dateKey][sym] = ret;
                datesSet.add(dateKey);
            }
        });

        // Fetch current prices to get weights
        const currentQuotes = await yahooFinance.quote(symbols);
        const holdingsWithValue = holdings.map(h => {
            const quote = (currentQuotes as any[]).find(q => q.symbol === h.symbol) || {};
            const price = quote.regularMarketPrice || h.avgCost;
            return { ...h, currentPrice: price, value: h.shares * price };
        });

        const totalValue = holdingsWithValue.reduce((acc, h) => acc + h.value, 0);

        // Sector Exposure with fallbacks
        const FALLBACK_SECTORS: Record<string, string> = {
            'AAPL': 'Technology', 'MSFT': 'Technology', 'NVDA': 'Technology', 'GOOGL': 'Technology', 'GOOG': 'Technology',
            'AMZN': 'Consumer Cyclical', 'TSLA': 'Consumer Cyclical', 'META': 'Technology', 'V': 'Financial Services',
            'MA': 'Financial Services', 'JPM': 'Financial Services', 'LLY': 'Healthcare', 'JNJ': 'Healthcare',
            'BRK-B': 'Financial Services', 'WMT': 'Consumer Defensive', 'XOM': 'Energy', 'CVX': 'Energy',
            'PG': 'Consumer Defensive', 'AVGO': 'Technology', 'HD': 'Consumer Cyclical', 'COST': 'Consumer Defensive'
        };

        const sectorMap: Record<string, number> = {};
        holdingsWithValue.forEach((h, i) => {
            let sector = (sectorData[i] as any)?.assetProfile?.sector;
            if (!sector) sector = FALLBACK_SECTORS[h.symbol] || "Other";
            sectorMap[sector] = (sectorMap[sector] || 0) + (h.value / totalValue * 100);
        });

        const sortedSectors = Object.entries(sectorMap)
            .map(([name, value]) => ({ name, value: Math.round(value) }))
            .sort((a, b) => b.value - a.value);

        // Benchmark data serves as our master timeline for stock market metrics
        const benchmarkDates = Array.from(datesSet)
            .filter(d => dateReturns[d] && dateReturns[d][benchmarkSymbol] !== undefined)
            .sort();

        // Calculate Portfolio Daily Returns for each benchmark date
        const portfolioReturns: number[] = [];
        const benchmarkReturns: number[] = [];
        const alignedDates: string[] = [];

        benchmarkDates.forEach(date => {
            let totalAvailableValue = 0;
            symbols.forEach(sym => {
                if (dateReturns[date][sym] !== undefined) {
                    const h = holdingsWithValue.find(hv => hv.symbol === sym)!;
                    totalAvailableValue += h.value;
                }
            });

            if (totalAvailableValue === 0) return;

            let pRet = 0;
            symbols.forEach(sym => {
                if (dateReturns[date][sym] !== undefined) {
                    const h = holdingsWithValue.find(hv => hv.symbol === sym)!;
                    const weight = h.value / totalAvailableValue;
                    pRet += dateReturns[date][sym] * weight;
                }
            });

            portfolioReturns.push(pRet);
            benchmarkReturns.push(dateReturns[date][benchmarkSymbol]);
            alignedDates.push(date);
        });

        const numDataPoints = portfolioReturns.length;
        if (numDataPoints < 5) {
            return NextResponse.json({
                summary: { sharpe: 0, drawdown: 0, beta: 1, var: 0 },
                volatility: [],
                sectors: sortedSectors
            });
        }

        // Metrics Calculations
        const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
        const std = (arr: number[]) => {
            const m = mean(arr);
            const variance = arr.reduce((a, b) => a + Math.pow(b - m, 2), 0) / arr.length;
            return Math.sqrt(variance);
        };

        const riskFreeRate = 0.04 / 252; // Daily risk free rate (annual 4%)

        const pMean = mean(portfolioReturns);
        const pStd = std(portfolioReturns);
        const bMean = mean(benchmarkReturns);
        const bStd = std(benchmarkReturns);

        // Sharpe Ratio
        let sharpe = 0;
        if (pStd > 0.0001) {
            sharpe = (pMean - riskFreeRate) / pStd * Math.sqrt(252);
        }
        sharpe = Math.min(Math.max(sharpe, -10), 10);

        // Beta: Cov(p, b) / Var(b)
        let beta = 1;
        if (bStd > 0) {
            let covariance = 0;
            for (let i = 0; i < numDataPoints; i++) {
                covariance += (portfolioReturns[i] - pMean) * (benchmarkReturns[i] - bMean);
            }
            covariance /= numDataPoints;
            beta = covariance / Math.pow(bStd, 2);
        }

        // Max Drawdown
        let maxDD = 0;
        let peak = -1000000;
        let currentEquity = 1;
        portfolioReturns.forEach(r => {
            currentEquity *= (1 + r);
            if (currentEquity > peak) peak = currentEquity;
            const dd = (currentEquity - peak) / peak;
            if (dd < maxDD) maxDD = dd;
        });

        // VaR (95%) - Multiply by -100 to show as a positive loss magnitude
        const sortedReturns = [...portfolioReturns].sort((a, b) => a - b);
        const varIdx = Math.floor(sortedReturns.length * 0.05);
        const var95 = (sortedReturns[varIdx] || 0) * -100;

        // Volatility Comparison Data (Rolling Window)
        const volData = [];
        // Use a longer window for stability (20 trading days ~ 1 month)
        const window = Math.min(20, Math.floor(numDataPoints / 2));

        // We calculate rolling volatility for the entire aligned sequence
        for (let i = window; i < numDataPoints; i += Math.max(1, Math.floor(numDataPoints / 50))) {
            const pSlice = portfolioReturns.slice(i - window, i);
            const bSlice = benchmarkReturns.slice(i - window, i);

            volData.push({
                date: alignedDates[i],
                portfolio: parseFloat((std(pSlice) * Math.sqrt(252) * 100).toFixed(2)),
                market: parseFloat((std(bSlice) * Math.sqrt(252) * 100).toFixed(2))
            });
        }

        return NextResponse.json({
            summary: {
                sharpe: parseFloat(sharpe.toFixed(2)),
                drawdown: parseFloat((maxDD * 100).toFixed(1)),
                beta: parseFloat(beta.toFixed(2)),
                var: parseFloat(var95.toFixed(1))
            },
            volatility: volData,
            sectors: sortedSectors
        });

    } catch (e: any) {
        console.error("Risk API Error:", e);
        return NextResponse.json({ error: "Failed to calculate risk metrics" }, { status: 500 });
    }
}

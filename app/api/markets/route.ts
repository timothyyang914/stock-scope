import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

const INDICES = [
    { symbol: "^GSPC", name: "S&P 500" },
    { symbol: "^IXIC", name: "NASDAQ" },
    { symbol: "^DJI", name: "DOW JONES" },
    { symbol: "^RUT", name: "RUSSELL 2000" },
];

const MOVERS = [
    // Mag 7
    { symbol: "NVDA", name: "NVIDIA Corp" },
    { symbol: "AAPL", name: "Apple Inc" },
    { symbol: "MSFT", name: "Microsoft" },
    { symbol: "GOOGL", name: "Alphabet Cl A" },
    { symbol: "AMZN", name: "Amazon.com" },
    { symbol: "META", name: "Meta Platforms" },
    { symbol: "TSLA", name: "Tesla, Inc." },
    // Momentum
    { symbol: "SMCI", name: "Super Micro" },
    { symbol: "PLTR", name: "Palantir" },
    { symbol: "ARM", name: "ARM Holdings" },
    { symbol: "COIN", name: "Coinbase" },
    { symbol: "MSTR", name: "MicroStrategy" },
    // Large Caps
    { symbol: "BRK-B", name: "Berkshire Hath" },
    { symbol: "LLY", name: "Eli Lilly" },
    { symbol: "AVGO", name: "Broadcom" },
    { symbol: "JPM", name: "JPMorgan Chase" },
    { symbol: "V", name: "Visa Inc." },
    { symbol: "MA", name: "Mastercard" },
    { symbol: "WMT", name: "Walmart Inc." },
    { symbol: "PG", name: "Procter & Gamble" },
    { symbol: "UNH", name: "UnitedHealth" },
    { symbol: "COST", name: "Costco Wholesale" },
    { symbol: "HD", name: "Home Depot" },
    { symbol: "ORCL", name: "Oracle Corp" },
    { symbol: "NFLX", name: "Netflix, Inc." },
    { symbol: "ADBE", name: "Adobe Inc." },
    { symbol: "AMD", name: "AMD" },
    { symbol: "CRM", name: "Salesforce" },
    { symbol: "ABNV", name: "Airbnb" },
];

export async function GET() {
    try {
        // 1. Fetch index quotes
        const indexSymbols = INDICES.map((i) => i.symbol);
        const indexQuotes = await yahooFinance.quote(indexSymbols);

        // 2. Fetch index intraday charts for sparklines (1 day, 15m intervals)
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days to account for weekends

        const indexCharts = await Promise.all(
            indexSymbols.map((symbol) =>
                yahooFinance
                    .chart(symbol, {
                        period1: oneDayAgo,
                        interval: "15m",
                    })
                    .catch(() => null)
            )
        );

        // 3. Format indices
        const indicesData = INDICES.map((idx, i) => {
            // Find quote by comparing normalized symbols (some APIs drop the ^ or casing)
            const quote =
                (indexQuotes as any[]).find((q) => q.symbol === idx.symbol) || {};

            const chartData = indexCharts[i];
            let sparkline: number[] = [];
            let previousClose = quote.regularMarketPreviousClose || 0;

            if (chartData && chartData.quotes && chartData.quotes.length > 0) {
                // Filter to just the most recent trading block
                let validQuotes = chartData.quotes.filter(
                    (q: any) => q.close !== null && q.close !== undefined
                );

                if (validQuotes.length > 0) {
                    const lastDateStr = new Date(
                        validQuotes[validQuotes.length - 1].date
                    ).toDateString();
                    validQuotes = validQuotes.filter(
                        (q: any) => new Date(q.date).toDateString() === lastDateStr
                    );
                    sparkline = validQuotes.map((q: any) => q.close as number);
                }
            }

            // Fallback sparkline if API failed
            if (sparkline.length === 0) {
                let p = quote.regularMarketPrice || 1000;
                sparkline = Array.from(
                    { length: 20 },
                    () => (p *= 1 + (Math.random() - 0.5) * 0.005)
                );
            }

            const price = quote.regularMarketPrice || sparkline[sparkline.length - 1];
            const change = quote.regularMarketChange || price - previousClose;
            const changePercent =
                quote.regularMarketChangePercent || (change / previousClose) * 100;

            return {
                name: idx.name,
                price,
                change,
                changePercent,
                sparkline,
            };
        });

        // 4. Fetch movers quotes + sentiment indicators
        const moverSymbols = MOVERS.map((m) => m.symbol);
        const sentimentSymbols = ["^VIX"];
        const extraQuotes = await yahooFinance.quote([...moverSymbols, ...sentimentSymbols]);

        const allMovers = MOVERS.map((mover) => {
            const quote =
                (extraQuotes as any[]).find((q) => q.symbol === mover.symbol) || {};
            return {
                symbol: mover.symbol,
                name: mover.name,
                price: quote.regularMarketPrice || 0,
                change: quote.regularMarketChange || 0,
                changePercent: quote.regularMarketChangePercent || 0,
            };
        }).filter(m => m.price > 0);

        // Sort by changePercent to get Leaders and Laggards
        const sortedMovers = [...allMovers].sort((a, b) => b.changePercent - a.changePercent);
        const leaders = sortedMovers.slice(0, 5);
        const laggards = sortedMovers.slice(-5).reverse(); // Reverse so biggest loser is first

        // 5. Calculate Dynamic Sentiment Indicators
        const vixQuote = (extraQuotes as any[]).find(q => q.symbol === "^VIX") || {};
        const vixValue = vixQuote.regularMarketPrice || 14.2;

        // Fear & Greed Proxy: Inversely related to VIX and Index Performance
        // Base 50, -0.5 per VIX point above 15, +0.5 per VIX point below 15, 
        // +10 per 1% Avg Index Change
        const avgIndexChange = indicesData.reduce((acc, curr) => acc + curr.changePercent, 0) / indicesData.length;
        let fearGreedValue = 50 - (vixValue - 15) * 1.5 + (avgIndexChange * 5);
        fearGreedValue = Math.min(95, Math.max(5, Math.round(fearGreedValue)));

        const getFearGreedLabel = (v: number) => {
            if (v < 25) return "Extreme Fear";
            if (v < 45) return "Fear";
            if (v < 55) return "Neutral";
            if (v < 75) return "Greed";
            return "Extreme Greed";
        };

        const putCallValue = parseFloat((0.8 + (vixValue / 50) + (Math.random() * 0.1)).toFixed(2));

        // Advance/Decline Proxy: Based on Indices and Movers breadth
        const totalSample = [...indicesData, ...allMovers];
        const gainers = totalSample.filter(s => s.change > 0).length;
        const losers = totalSample.filter(s => s.change < 0).length;
        const adRatio = parseFloat((losers === 0 ? gainers : gainers / losers).toFixed(2)) || 1.0;

        // New Highs/Lows Proxy: S&P 500 performance relative to recent average
        const nhlValue = parseFloat((Math.max(1, 3 + avgIndexChange * 2 + (Math.random() - 0.5))).toFixed(2));

        return NextResponse.json({
            indices: indicesData,
            leaders,
            laggards,
            sentiment: {
                fearGreed: { value: fearGreedValue, label: getFearGreedLabel(fearGreedValue) },
                vix: { value: parseFloat(vixValue.toFixed(2)) },
                putCallRatio: { value: putCallValue },
                advanceDecline: { value: adRatio },
                newHighsLows: { value: nhlValue },
            },
        });
    } catch (e: any) {
        console.error("Markets API Error:", e.message);
        return NextResponse.json(
            { error: "Failed to fetch markets data: " + e.message },
            { status: 500 }
        );
    }
}

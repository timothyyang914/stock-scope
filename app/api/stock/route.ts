import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance();

export async function GET(req: NextRequest) {
    const ticker = req.nextUrl.searchParams.get("ticker")?.toUpperCase();
    const range = req.nextUrl.searchParams.get("range") || "1M";
    const apiKey = process.env.ALPHA_VANTAGE_KEY;

    if (!ticker) {
        return NextResponse.json({ error: "ticker is required" }, { status: 400 });
    }

    try {
        // 1. Fetch Global Quote for header stats (Alpha Vantage)
        let quote: any = {};
        if (apiKey && apiKey !== "your_alpha_vantage_key_here") {
            try {
                const quoteRes = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`);
                const quoteData = await quoteRes.json();
                quote = quoteData["Global Quote"] || {};
            } catch (e) {
                console.error("Alpha Vantage Global Quote error:", e);
            }
        }

        // 2. Fetch Time Series
        let processedPoints: any[] = [];

        // Use Yahoo Finance for 1D/1W since AV free tier blocks intraday for US stocks
        if (range === "1D" || range === "1W") {
            const interval = range === "1D" ? "5m" : "60m";
            const now = new Date();
            // Fetch significantly more history to ensure SMA 60 (60 points) is fully populated
            // 1D (5m): Needs 60 * 5m = 5h buffer. Fetching 10 days ensures it.
            // 1W (1h): Needs 60 * 4h = 240h buffer (~35 trading days). Fetching 90 days ensures it.
            const period1 = range === "1D" ? new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) : new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

            const chartRes = await yahooFinance.chart(ticker, { interval, period1 });
            const quotes = (chartRes?.quotes || []) as any[];

            // Formatter for New York time
            const nyFormatter = new Intl.DateTimeFormat("en-US", {
                timeZone: "America/New_York",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });

            processedPoints = quotes.filter(q => q.close !== null && q.close !== undefined).map(q => {
                const parts = nyFormatter.formatToParts(new Date(q.date));
                const d: any = {};
                parts.forEach(p => d[p.type] = p.value);
                const localDate = `${d.year}-${d.month}-${d.day} ${d.hour}:${d.minute}`;

                return {
                    date: localDate,
                    open: q.open || q.close,
                    high: q.high || q.close,
                    low: q.low || q.close,
                    close: q.close,
                    volume: q.volume || 0
                };
            });

            if (range === "1W") {
                // Aggregate to 4h
                const aggregated = [];
                for (let i = 0; i < processedPoints.length; i += 4) {
                    const chunk = processedPoints.slice(i, i + 4);
                    if (chunk.length > 0) {
                        aggregated.push({
                            date: chunk[chunk.length - 1].date,
                            open: chunk[0].open,
                            high: Math.max(...chunk.map(p => p.high)),
                            low: Math.min(...chunk.map(p => p.low)),
                            close: chunk[chunk.length - 1].close,
                            volume: chunk.reduce((sum, p) => sum + p.volume, 0),
                        });
                    }
                }
                processedPoints = aggregated;
            }

            // Note: We will filter to the visible range AFTER SMA calculation
        }
        // Use Alpha Vantage for 1M+ (DAILY is free) if key is available
        else {
            let success = false;

            if (apiKey && apiKey !== "your_alpha_vantage_key_here") {
                try {
                    const dailyRes = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${ticker}&outputsize=full&apikey=${apiKey}`);
                    const dailyData = await dailyRes.json();
                    const timeSeriesData = dailyData["Time Series (Daily)"];

                    if (timeSeriesData) {
                        processedPoints = Object.entries(timeSeriesData).map(([date, values]: [string, any]) => ({
                            date,
                            open: parseFloat(values["1. open"]),
                            high: parseFloat(values["2. high"]),
                            low: parseFloat(values["3. low"]),
                            close: parseFloat(values["4. close"]),
                            volume: parseInt(values["5. volume"]),
                        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                        success = true;
                    }
                } catch (e) {
                    console.warn("Alpha Vantage Daily failed, falling back to Yahoo Finance:", e);
                }
            }

            if (!success) {
                // Primary fallback: Yahoo Finance
                const chartRes = await yahooFinance.chart(ticker, {
                    interval: "1d",
                    period1: new Date(new Date().getTime() - 2 * 365 * 24 * 60 * 60 * 1000) // 2 year buffer
                });

                processedPoints = (chartRes?.quotes || [])
                    .filter(q => q.close !== null && q.close !== undefined)
                    .map(q => ({
                        date: new Date(q.date).toISOString().split("T")[0],
                        open: q.open || q.close,
                        high: q.high || q.close,
                        low: q.low || q.close,
                        close: q.close,
                        volume: q.volume || 0
                    }));
            }
        }

        // 3. Calculate SMAs on the FULL buffered data
        const calcSMA = (data: number[], period: number) => {
            const results: (number | null)[] = [];
            for (let i = 0; i < data.length; i++) {
                if (i < period - 1) {
                    results.push(null);
                } else {
                    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
                    results.push(sum / period);
                }
            }
            return results;
        };

        const closesBuffer = processedPoints.map(p => p.close);
        const sma5Full = calcSMA(closesBuffer, 5);
        const sma10Full = calcSMA(closesBuffer, 10);
        const sma20Full = calcSMA(closesBuffer, 20);
        const sma60Full = calcSMA(closesBuffer, 60);

        // 4. Now filter to the VISIBLE requested range
        let finalPoints: any[] = [];
        let finalSMA5: (number | null)[] = [];
        let finalSMA10: (number | null)[] = [];
        let finalSMA20: (number | null)[] = [];
        let finalSMA60: (number | null)[] = [];

        if (range === "1D") {
            const lastDateStr = processedPoints[processedPoints.length - 1].date.split(" ")[0];
            processedPoints.forEach((p, i) => {
                const time = p.date.split(" ")[1];
                if (p.date.startsWith(lastDateStr) && time >= "09:30" && time <= "16:00") {
                    finalPoints.push(p);
                    finalSMA5.push(sma5Full[i]);
                    finalSMA10.push(sma10Full[i]);
                    finalSMA20.push(sma20Full[i]);
                    finalSMA60.push(sma60Full[i]);
                }
            });
        } else if (range === "1W") {
            const now = new Date();
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            processedPoints.forEach((p, i) => {
                const pDate = new Date(p.date.replace(" ", "T"));
                if (pDate >= oneWeekAgo) {
                    finalPoints.push(p);
                    finalSMA5.push(sma5Full[i]);
                    finalSMA10.push(sma10Full[i]);
                    finalSMA20.push(sma20Full[i]);
                    finalSMA60.push(sma60Full[i]);
                }
            });
        } else {
            const cutOffPeriods = { "1M": 30, "3M": 90, "1Y": 365 };
            const daysVisible = cutOffPeriods[range as keyof typeof cutOffPeriods] || 365;
            const cutOffDate = new Date();
            cutOffDate.setDate(cutOffDate.getDate() - daysVisible);

            processedPoints.forEach((p, i) => {
                if (new Date(p.date) >= cutOffDate) {
                    finalPoints.push(p);
                    finalSMA5.push(sma5Full[i]);
                    finalSMA10.push(sma10Full[i]);
                    finalSMA20.push(sma20Full[i]);
                    finalSMA60.push(sma60Full[i]);
                }
            });
        }

        const lastPoint = finalPoints[finalPoints.length - 1];
        const prevPoint = finalPoints[finalPoints.length - 2];
        const currentPrice = parseFloat(quote["05. price"]) || lastPoint?.close || 0;
        const previousClose = parseFloat(quote["08. previous close"]) || prevPoint?.close || lastPoint?.open || 0;
        const currentChange = parseFloat(quote["09. change"]) || (currentPrice - previousClose);
        const currentChangePercent = parseFloat(quote["10. change percent"]?.replace("%", "")) || (previousClose !== 0 ? (currentChange / previousClose) * 100 : 0);

        return NextResponse.json({
            ticker,
            price: currentPrice,
            change: currentChange,
            changePercent: currentChangePercent,
            volume: parseInt(quote["06. volume"]) || lastPoint?.volume || 0,
            prevClose: previousClose,
            high: parseFloat(quote["03. high"]) || Math.max(...finalPoints.slice(-5).map(p => p.high)) || lastPoint?.high || 0,
            low: parseFloat(quote["04. low"]) || Math.min(...finalPoints.slice(-5).map(p => p.low)) || lastPoint?.low || 0,
            dates: finalPoints.map(p => p.date),
            prices: finalPoints.map(p => p.close),
            opens: finalPoints.map(p => p.open),
            highs: finalPoints.map(p => p.high),
            lows: finalPoints.map(p => p.low),
            volumes: finalPoints.map(p => p.volume),
            sma5: finalSMA5,
            sma10: finalSMA10,
            sma20: finalSMA20,
            sma60: finalSMA60,
        });
    } catch (e: any) {
        console.error("Data Fetch Error:", e.message);
        return NextResponse.json(
            { error: e.message || "Failed to fetch stock data" },
            { status: 500 }
        );
    }
}

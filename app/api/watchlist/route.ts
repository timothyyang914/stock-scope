import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { getWatchlist, deleteFromWatchlist, getWatchlists, WatchlistItem, Watchlist, addToWatchlist, createWatchlist, deleteWatchlist, renameWatchlist } from "@/lib/dataStore";

const yahooFinance = new YahooFinance();

export async function GET(req: NextRequest) {
    try {
        const listId = req.nextUrl.searchParams.get("id") || "default";
        const allWatchlists: Watchlist[] = await getWatchlists();
        const activeWatchlist: Watchlist = allWatchlists.find(l => l.id === listId) || allWatchlists[0];

        const symbols = activeWatchlist.items.map((w: WatchlistItem) => w.symbol);

        if (symbols.length === 0) {
            return NextResponse.json({
                summary: { itemsCount: 0, avgChangePercent: 0, topGainer: "", topGainerPercent: 0, topLoser: "", topLoserPercent: 0 },
                assets: [],
                metadata: { watchlists: allWatchlists.map((l: Watchlist) => ({ id: l.id, name: l.name })), activeId: activeWatchlist.id }
            });
        }

        // ... rest of GET remains same (fetch quotes, etc.)
        const quotes = await yahooFinance.quote(symbols);
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        const charts = await Promise.all(
            symbols.map((symbol) =>
                yahooFinance
                    .chart(symbol, {
                        period1: oneDayAgo,
                        interval: "15m",
                    })
                    .catch(() => null)
            )
        );

        let totalChangePercent = 0;
        let topGainer = { symbol: "", changePercent: -Infinity };
        let topLoser = { symbol: "", changePercent: Infinity };

        const assets = activeWatchlist.items.map((asset: WatchlistItem, i: number) => {
            const quote = (quotes as any[]).find((q: any) => q.symbol === asset.symbol) || {};
            const chartData = charts[i];
            let sparkline: number[] = [];
            let previousClose = quote.regularMarketPreviousClose || 0;

            if (chartData && chartData.quotes && chartData.quotes.length > 0) {
                let validQuotes = chartData.quotes.filter((q: any) => q.close !== null && q.close !== undefined);
                if (validQuotes.length > 0) {
                    const lastDateStr = new Date(validQuotes[validQuotes.length - 1].date).toDateString();
                    validQuotes = validQuotes.filter((q: any) => new Date(q.date).toDateString() === lastDateStr);
                    sparkline = validQuotes.map((q: any) => q.close as number);
                }
            }

            if (sparkline.length === 0) {
                let p = quote.regularMarketPrice || 100;
                sparkline = Array.from({ length: 20 }, () => (p *= 1 + (Math.random() - 0.5) * 0.005));
            }

            const price = quote.regularMarketPrice || sparkline[sparkline.length - 1];
            const change = quote.regularMarketChange || price - previousClose;
            const changePercent = quote.regularMarketChangePercent || previousClose !== 0 ? (change / previousClose) * 100 : 0;

            totalChangePercent += changePercent;
            if (changePercent > topGainer.changePercent) topGainer = { symbol: asset.symbol, changePercent };
            if (changePercent < topLoser.changePercent) topLoser = { symbol: asset.symbol, changePercent };

            return {
                symbol: asset.symbol,
                name: asset.name,
                price,
                change,
                changePercent,
                volume: quote.regularMarketVolume || 0,
                pe: quote.trailingPE || quote.forwardPE || 0,
                marketCap: quote.marketCap || 0,
                sparkline,
            };
        });

        const avgChangePercent = assets.length > 0 ? totalChangePercent / assets.length : 0;

        return NextResponse.json({
            summary: {
                itemsCount: assets.length,
                avgChangePercent,
                topGainer: topGainer.symbol,
                topGainerPercent: topGainer.changePercent,
                topLoser: topLoser.symbol,
                topLoserPercent: topLoser.changePercent,
            },
            assets,
            metadata: {
                watchlists: allWatchlists.map((l: Watchlist) => ({ id: l.id, name: l.name })),
                activeId: activeWatchlist.id
            }
        });
    } catch (e: any) {
        console.error("Watchlist API Error:", e.message);
        return NextResponse.json({ error: "Failed to fetch watchlist data: " + e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { name } = await req.json();
        if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
        const newList = await createWatchlist(name);
        return NextResponse.json({ success: true, list: newList });
    } catch (e: any) {
        return NextResponse.json({ error: "Failed to create watchlist: " + e.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { ticker, listId } = await req.json();
        if (!ticker) return NextResponse.json({ error: "ticker is required" }, { status: 400 });
        const id = listId || "default";
        let name = ticker;
        try {
            const quote: any = await yahooFinance.quote(ticker);
            name = quote.shortName || quote.longName || ticker;
        } catch (e) { }
        await addToWatchlist(ticker.toUpperCase(), id, name);
        return NextResponse.json({ success: true, ticker });
    } catch (e: any) {
        return NextResponse.json({ error: "Failed to add to watchlist: " + e.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { id, newName } = await req.json();
        if (!id || !newName) return NextResponse.json({ error: "id and newName are required" }, { status: 400 });
        await renameWatchlist(id, newName);
        return NextResponse.json({ success: true, id, newName });
    } catch (e: any) {
        return NextResponse.json({ error: "Failed to rename: " + e.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const ticker = req.nextUrl.searchParams.get("ticker");
        const listId = req.nextUrl.searchParams.get("id") || "default";
        if (ticker) {
            await deleteFromWatchlist(ticker.toUpperCase(), listId);
            return NextResponse.json({ success: true, ticker });
        } else {
            await deleteWatchlist(listId);
            return NextResponse.json({ success: true, listId });
        }
    } catch (e: any) {
        return NextResponse.json({ error: "Failed to delete: " + e.message }, { status: 500 });
    }
}

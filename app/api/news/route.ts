import { NextRequest, NextResponse } from "next/server";

const NEWS_KEY = process.env.NEWS_API_KEY || "";

export async function GET(req: NextRequest) {
    const ticker = req.nextUrl.searchParams.get("ticker")?.toUpperCase();
    const company = req.nextUrl.searchParams.get("company") || ticker;

    if (!ticker) {
        return NextResponse.json({ error: "ticker is required" }, { status: 400 });
    }

    try {
        if (!NEWS_KEY) {
            // Return mock news if no key provided
            return NextResponse.json({ articles: getMockNews(ticker) });
        }

        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
            company || ticker
        )}&language=en&sortBy=publishedAt&pageSize=9&apiKey=${NEWS_KEY}`;

        const res = await fetch(url, { next: { revalidate: 300 } });
        const data = await res.json();

        if (data.status !== "ok") {
            return NextResponse.json({ articles: getMockNews(ticker) });
        }

        const articles = (data.articles || []).map(
            (a: {
                title: string;
                description: string;
                url: string;
                urlToImage: string;
                publishedAt: string;
                source: { name: string };
            }) => ({
                title: a.title,
                description: a.description,
                url: a.url,
                urlToImage: a.urlToImage,
                publishedAt: a.publishedAt,
                source: a.source.name,
            })
        );

        return NextResponse.json({ articles });
    } catch {
        return NextResponse.json({ articles: getMockNews(ticker) });
    }
}

function getMockNews(ticker: string) {
    return [
        {
            title: `${ticker} Reports Strong Quarterly Earnings, Beats Analyst Expectations`,
            description: `Shares of ${ticker} jumped after the company reported earnings that significantly surpassed Wall Street forecasts, driven by robust revenue growth and margin expansion.`,
            url: "#",
            urlToImage: null,
            publishedAt: new Date().toISOString(),
            source: "Financial Times",
        },
        {
            title: `Analysts Upgrade ${ticker} to 'Buy' on New Product Pipeline`,
            description: `Major investment banks raised their price targets for ${ticker} citing a strong product roadmap and growing market share in key segments.`,
            url: "#",
            urlToImage: null,
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            source: "Bloomberg",
        },
        {
            title: `${ticker} Expands into New Markets with Strategic Partnership`,
            description: `The company announced a landmark deal that is expected to unlock significant revenue opportunities in emerging markets over the next three years.`,
            url: "#",
            urlToImage: null,
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            source: "Reuters",
        },
        {
            title: `${ticker} CFO Discusses Outlook at Industry Conference`,
            description: `The chief financial officer outlined the company's capital allocation strategy and reiterated full-year guidance amid macroeconomic uncertainty.`,
            url: "#",
            urlToImage: null,
            publishedAt: new Date(Date.now() - 10800000).toISOString(),
            source: "CNBC",
        },
        {
            title: `Institutional Investors Increase Stakes in ${ticker}`,
            description: `SEC filings reveal that several large institutional investors have substantially increased their positions in ${ticker} during the latest quarter.`,
            url: "#",
            urlToImage: null,
            publishedAt: new Date(Date.now() - 14400000).toISOString(),
            source: "MarketWatch",
        },
        {
            title: `${ticker} Announces Share Buyback Program Worth $5 Billion`,
            description: `The board approved a new buyback program as part of its ongoing commitment to returning capital to shareholders and expressing confidence in future growth.`,
            url: "#",
            urlToImage: null,
            publishedAt: new Date(Date.now() - 18000000).toISOString(),
            source: "Wall Street Journal",
        },
    ];
}

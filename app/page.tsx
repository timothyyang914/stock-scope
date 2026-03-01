"use client";

import { useState, useCallback } from "react";
import TickerSearch from "@/components/TickerSearch";
import StockHeader from "@/components/StockHeader";
import PriceChart from "@/components/PriceChart";
import NewsFeed from "@/components/NewsFeed";

interface StockData {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  prevClose: number;
  dates: string[];
  prices: number[];
  opens?: number[];
  highs?: number[];
  lows?: number[];
  volumes?: number[];
  changes?: number[];
  sma5?: (number | null)[];
  sma10?: (number | null)[];
  sma20?: (number | null)[];
  sma60?: (number | null)[];
}

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: string;
}

type Status = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [currentRange, setCurrentRange] = useState("1M");
  const [currentTicker, setCurrentTicker] = useState("");

  const fetchData = useCallback(async (ticker: string, range: string) => {
    setStatus("loading");
    setError(null);

    try {
      const [stockRes, newsRes] = await Promise.all([
        fetch(`/api/stock?ticker=${ticker}&range=${range}`),
        fetch(`/api/news?ticker=${ticker}`),
      ]);

      if (!stockRes.ok) {
        throw new Error("Failed to fetch stock data");
      }

      const stock = await stockRes.json();
      const news = await newsRes.json();

      if (stock.error) throw new Error(stock.error);

      setStockData({ ...stock, ticker });
      setNewsArticles(news.articles || []);
      setStatus("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStatus("error");
    }
  }, []);

  const handleSearch = useCallback(
    (ticker: string) => {
      setCurrentTicker(ticker);
      setCurrentRange("1D");
      fetchData(ticker, "1D");
    },
    [fetchData]
  );

  const handleRangeChange = useCallback(
    (range: string) => {
      setCurrentRange(range);
      if (currentTicker) fetchData(currentTicker, range);
    },
    [currentTicker, fetchData]
  );

  return (
    <div className="flex flex-col gap-10">
      {/* Search section */}
      <section className="pt-6">
        <TickerSearch
          onSearch={handleSearch}
          isLoading={status === "loading"}
        />
      </section>

      {/* Error state */}
      {status === "error" && (
        <div className="card p-6 border-negative/30 bg-negative/5 text-negative text-sm text-center animate-fade-in">
          ⚠ {error || "Could not load data. Please check the ticker and try again."}
        </div>
      )}

      {/* Loading skeleton */}
      {status === "loading" && (
        <div className="flex flex-col gap-6 animate-fade-in">
          <div className="card h-28 bg-surface/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
          </div>
          <div className="card h-80 bg-surface/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-36 bg-surface/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard content */}
      {status === "success" && stockData && (
        <div className="flex flex-col gap-6">
          <StockHeader
            ticker={stockData.ticker}
            price={stockData.price}
            change={stockData.change}
            changePercent={stockData.changePercent}
            volume={stockData.volume}
            high={stockData.high}
            low={stockData.low}
            prevClose={stockData.prevClose}
          />

          <PriceChart
            ticker={stockData.ticker}
            dates={stockData.dates}
            prices={stockData.prices}
            opens={stockData.opens}
            highs={stockData.highs}
            lows={stockData.lows}
            volumes={stockData.volumes}
            changes={stockData.changes}
            sma5={stockData.sma5}
            sma10={stockData.sma10}
            sma20={stockData.sma20}
            sma60={stockData.sma60}
            change={stockData.change}
            changePercent={stockData.changePercent}
            onRangeChange={handleRangeChange}
            currentRange={currentRange}
          />

          <div className="animate-slide-up-delay-2">
            <NewsFeed ticker={stockData.ticker} articles={newsArticles} />
          </div>
        </div>
      )}

      {/* Empty idle state */}
      {status === "idle" && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-8 h-8"
              stroke="#00d084"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <p className="text-text-muted text-sm max-w-xs">
            Search for any publicly traded stock to view its price history and the latest news.
          </p>
        </div>
      )}
    </div>
  );
}

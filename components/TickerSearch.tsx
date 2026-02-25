"use client";

import { useState, useRef } from "react";
import { Search } from "lucide-react";

interface TickerSearchProps {
    onSearch: (ticker: string) => void;
    isLoading: boolean;
}

const POPULAR = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META"];

export default function TickerSearch({ onSearch, isLoading }: TickerSearchProps) {
    const [value, setValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = value.trim().toUpperCase();
        if (trimmed) onSearch(trimmed);
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-text-primary mb-2 tracking-tight">
                    Stock <span className="text-accent">Intelligence</span>
                </h1>
                <p className="text-text-muted text-base">
                    Enter a ticker symbol to explore price charts and latest news
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-xl flex gap-3"
            >
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                    <input
                        ref={inputRef}
                        id="ticker-input"
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value.toUpperCase())}
                        placeholder="e.g. AAPL, TSLA, GOOGL"
                        maxLength={10}
                        autoComplete="off"
                        aria-label="Stock ticker symbol"
                        className="w-full bg-surface border border-border rounded-xl pl-12 pr-4 py-3.5 text-text-primary placeholder-text-muted text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200"
                    />
                </div>
                <button
                    id="search-submit"
                    type="submit"
                    disabled={isLoading || !value.trim()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
                >
                    {isLoading ? (
                        <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                    ) : (
                        <>
                            <Search className="w-4 h-4" />
                            Search
                        </>
                    )}
                </button>
            </form>

            {/* Popular tickers */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="text-text-faint text-xs font-medium uppercase tracking-wider">
                    Popular:
                </span>
                {POPULAR.map((t) => (
                    <button
                        key={t}
                        id={`popular-${t}`}
                        onClick={() => {
                            setValue(t);
                            onSearch(t);
                        }}
                        className="px-3 py-1 text-xs font-semibold text-text-muted bg-surface border border-border rounded-lg hover:border-accent/50 hover:text-accent transition-all duration-200"
                    >
                        {t}
                    </button>
                ))}
            </div>
        </div>
    );
}

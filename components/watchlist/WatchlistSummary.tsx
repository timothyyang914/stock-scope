"use client";

import { Eye, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface WatchlistSummaryProps {
    summary: {
        itemsCount: number;
        avgChangePercent: number;
        topGainer: string;
        topGainerPercent: number;
        topLoser: string;
        topLoserPercent: number;
    };
}

export default function WatchlistSummary({ summary }: WatchlistSummaryProps) {
    if (!summary) return null;

    const isAvgPositive = summary.avgChangePercent >= 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
            {/* 1. Watchlist Items Count */}
            <div className="card p-5 relative overflow-hidden group hover:border-accent/30 transition-colors">
                <div className="flex flex-col relative z-10">
                    <span className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">
                        Watchlist Items
                    </span>
                    <div className="text-3xl font-bold text-text-primary tracking-tight mt-1">
                        {summary.itemsCount}
                    </div>
                </div>
                <Eye className="absolute -right-4 -bottom-4 w-24 h-24 text-surface-2 transition-transform group-hover:scale-110" />
            </div>

            {/* 2. Avg Change */}
            <div className="card p-5 relative overflow-hidden group hover:border-accent/30 transition-colors">
                <div className="flex flex-col relative z-10">
                    <span className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">
                        Avg. Change
                    </span>
                    <div className="text-3xl font-bold text-text-primary tracking-tight mt-1">
                        {summary.avgChangePercent.toFixed(2)}%
                    </div>
                    <div className="mt-2 text-xs flex items-center gap-1.5 font-medium">
                        <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${isAvgPositive ? "bg-positive/20 text-positive" : "bg-negative/20 text-negative"
                                }`}
                        >
                            {isAvgPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isAvgPositive ? "+" : ""}
                            {summary.avgChangePercent.toFixed(2)}%
                        </span>
                        <span className="text-text-faint">vs last month</span>
                    </div>
                </div>
                <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-surface-2 transition-transform group-hover:scale-110" />
            </div>

            {/* 3. Top Gainer */}
            <div className="card p-5 relative overflow-hidden group hover:border-accent/30 transition-colors">
                <div className="flex flex-col relative z-10">
                    <span className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">
                        Top Gainer
                    </span>
                    <div className="text-3xl font-bold text-text-primary tracking-tight mt-1">
                        {summary.topGainer}
                    </div>
                </div>
                <ArrowUpRight className="absolute -right-4 -bottom-4 w-24 h-24 text-surface-2 transition-transform group-hover:scale-110" />
            </div>

            {/* 4. Top Loser */}
            <div className="card p-5 relative overflow-hidden group hover:border-accent/30 transition-colors">
                <div className="flex flex-col relative z-10">
                    <span className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">
                        Top Loser
                    </span>
                    <div className="text-3xl font-bold text-text-primary tracking-tight mt-1">
                        {summary.topLoser}
                    </div>
                </div>
                <ArrowDownRight className="absolute -right-4 -bottom-4 w-24 h-24 text-surface-2 transition-transform group-hover:scale-110" />
            </div>
        </div>
    );
}

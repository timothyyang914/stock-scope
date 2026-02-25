"use client";

import { TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react";

interface StockHeaderProps {
    ticker: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    prevClose: number;
}

function formatNumber(n: number): string {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
}

export default function StockHeader({
    ticker,
    price,
    change,
    changePercent,
    volume,
    high,
    low,
    prevClose,
}: StockHeaderProps) {
    const isPositive = change >= 0;

    return (
        <div className="animate-slide-up">
            <div className="card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* Left: Price block */}
                    <div className="flex items-start gap-5">
                        {/* Ticker avatar */}
                        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-accent font-bold text-sm">{ticker.slice(0, 4)}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-3xl font-bold text-text-primary tracking-tight">
                                    ${price.toFixed(2)}
                                </h2>
                                <div
                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${isPositive
                                            ? "bg-positive/10 text-positive"
                                            : "bg-negative/10 text-negative"
                                        }`}
                                >
                                    {isPositive ? (
                                        <TrendingUp className="w-4 h-4" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4" />
                                    )}
                                    {isPositive ? "+" : ""}
                                    {change.toFixed(2)} ({isPositive ? "+" : ""}
                                    {changePercent.toFixed(2)}%)
                                </div>
                            </div>
                            <p className="text-text-muted text-sm font-medium">{ticker} · Real-time</p>
                        </div>
                    </div>

                    {/* Right: key stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border">
                        {[
                            {
                                label: "Volume",
                                value: formatNumber(volume),
                                icon: <Activity className="w-3.5 h-3.5" />,
                            },
                            {
                                label: "Prev Close",
                                value: `$${prevClose.toFixed(2)}`,
                                icon: <DollarSign className="w-3.5 h-3.5" />,
                            },
                            {
                                label: "Day High",
                                value: `$${high.toFixed(2)}`,
                                icon: <TrendingUp className="w-3.5 h-3.5 text-positive" />,
                            },
                            {
                                label: "Day Low",
                                value: `$${low.toFixed(2)}`,
                                icon: <TrendingDown className="w-3.5 h-3.5 text-negative" />,
                            },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="bg-surface-2 px-4 py-3 flex flex-col gap-1"
                            >
                                <div className="flex items-center gap-1.5 text-text-muted text-xs font-medium">
                                    {stat.icon}
                                    {stat.label}
                                </div>
                                <span className="text-text-primary font-semibold text-sm">
                                    {stat.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

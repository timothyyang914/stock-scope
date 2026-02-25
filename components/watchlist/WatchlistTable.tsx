"use client";

import { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import { Plus, Trash2 } from "lucide-react";

interface WatchlistAsset {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    pe: number;
    marketCap: number;
    sparkline: number[];
}

// Re-using the same Sparkline component from IndexCards for consistency
function SparklineChart({
    data,
    isPositive,
}: {
    data: number[];
    isPositive: boolean;
}) {
    const chartData = useMemo(() => data.map((val, i) => ({ i, val })), [data]);

    if (chartData.length === 0) return null;

    const color = isPositive ? "#00d084" : "#ef4444";

    return (
        <div className="h-10 w-24">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                    <defs>
                        <linearGradient id={`gradient-tbl-${isPositive}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="val"
                        stroke={color}
                        strokeWidth={2}
                        fill={`url(#gradient-tbl-${isPositive})`}
                        isAnimationActive={false}
                        dot={false}
                        activeDot={false}
                    />
                    {/* @ts-ignore */}
                    <YAxis domain={["dataMin", "dataMax"]} hide />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

function formatNumber(num: number) {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
    return num.toLocaleString();
}

export default function WatchlistTable({
    assets,
    title = "Your Watchlist",
    onDelete,
    onAdd
}: {
    assets: WatchlistAsset[];
    title?: string;
    onDelete?: (symbol: string) => void;
    onAdd?: () => void;
}) {

    return (
        <div className="card flex flex-col mt-6 animate-slide-up-delay">
            {/* Header section with Add Asset button */}
            <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-text-primary text-xl font-bold">{title}</h2>
                    <p className="text-text-muted text-sm mt-1">Track your favorite assets</p>
                </div>
                <button
                    onClick={onAdd}
                    className="inline-flex items-center gap-2 bg-transparent hover:bg-positive/10 text-positive border border-positive/20 px-4 py-2 rounded-full font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-positive/50"
                >
                    <Plus className="w-4 h-4" />
                    Add Asset
                </button>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
                {(!assets || assets.length === 0) ? (
                    <div className="p-12 text-center text-text-muted animate-fade-in">
                        <p className="text-sm">No assets in this watchlist yet.</p>
                        <p className="text-xs mt-1">Click "Add Asset" to start tracking.</p>
                    </div>
                ) : (
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="text-text-muted text-xs font-semibold tracking-wider uppercase border-b border-border/50">
                                <th className="px-6 py-4 font-semibold">Asset</th>
                                <th className="px-6 py-4 font-semibold text-right">Price</th>
                                <th className="px-6 py-4 font-semibold text-center">Change</th>
                                <th className="px-6 py-4 font-semibold text-right">Volume</th>
                                <th className="px-6 py-4 font-semibold text-right">P/E</th>
                                <th className="px-6 py-4 font-semibold text-right">Mkt Cap</th>
                                <th className="px-6 py-4 font-semibold text-right">Trend</th>
                                {onDelete && <th className="px-6 py-4 font-semibold text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {assets.map((asset) => {
                                const isPositive = asset.change >= 0;

                                return (
                                    <tr
                                        key={asset.symbol}
                                        className="hover:bg-surface-2/40 transition-colors group cursor-pointer"
                                        onClick={() => (window.location.href = `/?ticker=${asset.symbol}`)}
                                    >
                                        {/* Asset Avatar & Info */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center flex-shrink-0 group-hover:border-accent/40 transition-colors text-text-primary font-bold text-xs uppercase">
                                                    {asset.symbol.substring(0, 2)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-text-primary font-bold text-sm">
                                                        {asset.symbol}
                                                    </span>
                                                    <span className="text-text-muted text-xs truncate max-w-[120px]">
                                                        {asset.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Price */}
                                        <td className="px-6 py-4 text-right text-text-primary font-bold text-sm">
                                            ${asset.price.toLocaleString("en-US", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </td>

                                        {/* Change % Badge */}
                                        <td className="px-6 py-4 text-center">
                                            <div
                                                className={`inline-flex items-center justify-center gap-1 text-xs font-semibold px-2 py-1 rounded-md min-w-[70px] ${isPositive ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"
                                                    }`}
                                            >
                                                {isPositive ? "↗" : "↘"} {asset.changePercent.toFixed(2)}%
                                            </div>
                                        </td>

                                        {/* Volume */}
                                        <td className="px-6 py-4 text-right text-text-muted text-sm">
                                            {formatNumber(asset.volume)}
                                        </td>

                                        {/* P/E Ratio */}
                                        <td className="px-6 py-4 text-right text-text-muted text-sm">
                                            {asset.pe ? asset.pe.toFixed(1) : "—"}
                                        </td>

                                        {/* Market Cap */}
                                        <td className="px-6 py-4 text-right text-text-muted text-sm">
                                            {formatNumber(asset.marketCap)}
                                        </td>

                                        {/* Sparkline Trend */}
                                        <td className="px-6 py-2">
                                            <div className="flex justify-end min-h-[72px] items-center">
                                                <SparklineChart data={asset.sparkline} isPositive={isPositive} />
                                            </div>
                                        </td>

                                        {/* Delete Action */}
                                        {onDelete && (
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDelete(asset.symbol);
                                                    }}
                                                    className="p-2 text-text-muted hover:text-negative hover:bg-negative/10 rounded-lg transition-colors"
                                                    title="Remove from watchlist"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

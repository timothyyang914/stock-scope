"use client";

import { useMemo } from "react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

interface IndexData {
    name: string;
    price: number;
    change: number;
    changePercent: number;
    sparkline: number[];
}

function SparklineChart({
    data,
    isPositive,
}: {
    data: number[];
    isPositive: boolean;
}) {
    const chartData = useMemo(() => data.map((val, i) => ({ i, val })), [data]);

    if (chartData.length === 0) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const color = isPositive ? "#00d084" : "#ef4444";

    return (
        <div className="h-16 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`gradient-${isPositive}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="val"
                        stroke={color}
                        strokeWidth={2}
                        fill={`url(#gradient-${isPositive})`}
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

export default function IndexCards({ indices }: { indices: IndexData[] }) {
    if (!indices || indices.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
            {indices.map((idx, i) => {
                const isPositive = idx.change >= 0;

                return (
                    <div key={idx.name} className="card p-5 hover:border-accent/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">
                                {idx.name}
                            </span>
                            <div
                                className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md ${isPositive
                                    ? "bg-positive/10 text-positive"
                                    : "bg-negative/10 text-negative"
                                    }`}
                            >
                                {isPositive ? (
                                    <TrendingUp className="w-3 h-3" />
                                ) : (
                                    <TrendingDown className="w-3 h-3" />
                                )}
                                {isPositive ? "+" : ""}
                                {idx.changePercent.toFixed(2)}%
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-text-primary tracking-tight">
                            {idx.price.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </div>
                        <SparklineChart data={idx.sparkline} isPositive={isPositive} />
                    </div>
                );
            })}
        </div>
    );
}

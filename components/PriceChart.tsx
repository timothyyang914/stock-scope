"use client";

import { useState } from "react";
import {
    ComposedChart,
    Area,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Cell
} from "recharts";
import { TrendingUp, Activity } from "lucide-react";

interface PriceChartProps {
    ticker: string;
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
    change: number;
    changePercent: number;
    onRangeChange: (range: string) => void;
    currentRange: string;
}

const RANGES = ["1D", "1W", "1M", "3M", "1Y"];

const SMA_CONFIG = [
    { key: 'sma5', color: '#6366f1', label: 'SMA 5' },
    { key: 'sma10', color: '#8b5cf6', label: 'SMA 10' },
    { key: 'sma20', color: '#ec4899', label: 'SMA 20' },
    { key: 'sma60', color: '#f59e0b', label: 'SMA 60' },
];

function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="glass-card px-4 py-3 shadow-xl border border-white/10 min-w-[140px]">
                <p className="text-text-muted text-[10px] uppercase tracking-tighter mb-2 font-bold">{data.fullDate}</p>
                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">Open</span>
                        <span className="text-text-primary font-mono font-bold">${data.open?.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">High</span>
                        <span className="text-text-primary font-mono font-bold">${data.high?.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">Low</span>
                        <span className="text-text-primary font-mono font-bold">${data.low?.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-b border-white/5 pb-1.5">
                        <span className="text-text-muted">Close</span>
                        <span className="text-text-primary font-mono font-bold">${data.price?.toFixed(2)}</span>
                    </div>
                    {payload.filter((p: any) => p.name && p.name.includes("SMA")).map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-[10px]">
                            <span style={{ color: entry.color }} className="font-bold">{entry.name}</span>
                            <span className="text-text-primary font-mono">${Number(entry.value).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
}

const Candlestick = (props: any) => {
    const { x, y, width, height, payload, minPrice, maxPrice } = props;

    if (!payload) return null;

    const { open, price: close, high, low } = payload;

    // Fallback: use y and height to derive the scale
    // y is the coordinate for payload.price
    // height is the distance to the baseline (minPrice)
    // We expect minPrice to be passed as a prop
    const range = payload.price - minPrice;
    const factor = range !== 0 ? height / range : 0;
    const getY = (v: number) => y + (payload.price - v) * factor;

    const isBullish = close >= open;
    const color = isBullish ? "#00d084" : "#ef4444";

    const yOpen = getY(open);
    const yClose = getY(close);
    const yHigh = getY(high);
    const yLow = getY(low);

    const centerX = x + width / 2;
    const candleWidth = Math.max(width * 0.7, 2);
    const bodyTop = Math.min(yOpen, yClose);
    const bodyHeight = Math.max(Math.abs(yOpen - yClose), 1);

    return (
        <g>
            <line
                x1={centerX}
                y1={yHigh}
                x2={centerX}
                y2={yLow}
                stroke={color}
                strokeWidth={1.5}
            />
            <rect
                x={centerX - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={color}
                stroke={color}
                strokeOpacity={0.8}
                strokeWidth={1}
                rx={1}
            />
        </g>
    );
};

export default function PriceChart({
    ticker,
    dates,
    prices,
    opens = [],
    highs = [],
    lows = [],
    volumes = [],
    changes = [],
    sma5 = [],
    sma10 = [],
    sma20 = [],
    sma60 = [],
    change,
    changePercent,
    onRangeChange,
    currentRange,
}: PriceChartProps) {
    const [activeSMAs, setActiveSMAs] = useState<string[]>(SMA_CONFIG.map(s => s.key));
    const isPositive = change >= 0;

    const data = dates.map((date, i) => {
        let label = date;
        if (date.length > 10) {
            // Intraday format: YYYY-MM-DD HH:mm
            if (currentRange === "1D") {
                label = date.slice(11, 16); // HH:mm
            } else if (currentRange === "1W") {
                label = `${date.slice(5, 10)} ${date.slice(11, 16)}`; // MM-DD HH:mm
            }
        } else {
            // Daily format: YYYY-MM-DD
            label = date.slice(5); // MM-DD
        }

        return {
            date: label,
            fullDate: date,
            price: prices[i],
            open: opens[i] || prices[i],
            high: highs[i] || prices[i],
            low: lows[i] || prices[i],
            change: changes[i] || 0,
            sma5: sma5[i],
            sma10: sma10[i],
            sma20: sma20[i],
            sma60: sma60[i],
        };
    });

    const allPrices = [...highs, ...lows, ...prices].filter(v => typeof v === 'number');
    const minPrice = Math.min(...allPrices, ...(sma60.filter(v => v !== null) as number[])) * 0.995;
    const maxPrice = Math.max(...allPrices, ...(sma60.filter(v => v !== null) as number[])) * 1.005;

    const toggleSMA = (key: string) => {
        setActiveSMAs(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    return (
        <div className="card p-6 animate-slide-up-delay relative overflow-hidden group">
            {/* Chart header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-text-primary font-bold text-lg tracking-tight">
                            Advanced Analysis
                        </h3>
                        <p className="text-text-muted text-xs font-medium uppercase tracking-widest">{ticker} · Global Market</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 ${isPositive ? "bg-positive/10 text-positive" : "bg-negative/10 text-negative"
                        }`}>
                        <TrendingUp className={`w-3.5 h-3.5 ${!isPositive && "rotate-180"}`} />
                        {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
                    </div>
                    <div className="flex gap-1 bg-surface-2 p-1 rounded-xl border border-white/5">
                        {RANGES.map((r) => (
                            <button
                                key={r}
                                onClick={() => onRangeChange(r)}
                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${currentRange === r
                                    ? "bg-accent text-background shadow-lg shadow-accent/20"
                                    : "text-text-muted hover:text-text-primary hover:bg-white/5"
                                    }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* SMA Selectors */}
            <div className="flex flex-wrap gap-2 mb-6">
                {SMA_CONFIG.map(sma => (
                    <button
                        key={sma.key}
                        onClick={() => toggleSMA(sma.key)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeSMAs.includes(sma.key)
                            ? `border-[${sma.color}] bg-[${sma.color}]/10`
                            : "border-white/5 bg-white/[0.02] text-text-muted grayscale"
                            }`}
                        style={{
                            borderColor: activeSMAs.includes(sma.key) ? sma.color : '',
                            color: activeSMAs.includes(sma.key) ? sma.color : ''
                        }}
                    >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sma.color }} />
                        {sma.label}
                    </button>
                ))}
            </div>

            {/* Chart Area */}
            <div className="h-[350px] w-full relative">
                {data.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-text-muted text-sm font-medium">
                        No chart data available
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data}>
                            <defs>
                                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={isPositive ? "#00d084" : "#ef4444"} stopOpacity={0.2} />
                                    <stop offset="100%" stopColor={isPositive ? "#00d084" : "#ef4444"} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fill: "#6b7280", fontSize: 10, fontWeight: 600 }}
                                tickLine={false}
                                axisLine={false}
                                interval="preserveStartEnd"
                                dy={10}
                            />
                            <YAxis
                                yAxisId="price"
                                domain={[minPrice, maxPrice]}
                                tick={{ fill: "#6b7280", fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(v) => `$${v.toLocaleString()}`}
                                width={55}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#374151', strokeWidth: 1 }} />

                            <Bar
                                yAxisId="price"
                                dataKey="price"
                                shape={<Candlestick minPrice={minPrice} maxPrice={maxPrice} />}
                                isAnimationActive={false}
                            />

                            {SMA_CONFIG.map(sma => activeSMAs.includes(sma.key) && (
                                <Line
                                    key={sma.key}
                                    yAxisId="price"
                                    type="monotone"
                                    name={sma.label}
                                    dataKey={sma.key}
                                    stroke={sma.color}
                                    strokeWidth={2}
                                    dot={false}
                                    animationDuration={300}
                                />
                            ))}
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}

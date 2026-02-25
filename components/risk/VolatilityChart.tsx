"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
} from "recharts";

interface VolData {
    date: string;
    portfolio: number;
    market: number;
}

export default function VolatilityChart({ data }: { data: VolData[] }) {
    return (
        <div className="card p-6 h-[400px] flex flex-col">
            <div className="mb-6">
                <h3 className="text-text-primary font-bold text-base tracking-tight">Volatility Comparison</h3>
                <p className="text-text-muted text-xs mt-0.5 font-medium">Portfolio vs Market (annualized)</p>
            </div>

            <div className="w-full h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <defs>
                            <linearGradient id="volGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="rgba(255,255,255,0.05)"
                        />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 10, fontWeight: 500 }}
                            dy={10}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleString('default', { month: 'short' });
                            }}
                            minTickGap={30}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 10, fontWeight: 500 }}
                            tickFormatter={(value) => `${value}%`}
                            domain={[0, 'auto']}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#0f172a",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "12px",
                                fontSize: "12px",
                                padding: "12px",
                                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)"
                            }}
                            itemStyle={{ fontWeight: 600 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="portfolio"
                            stroke="#0ea5e9"
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0, fill: "#0ea5e9" }}
                            name="Portfolio"
                        />
                        <Line
                            type="monotone"
                            dataKey="market"
                            stroke="#ef4444"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            dot={false}
                            activeDot={{ r: 4, strokeWidth: 0, fill: "#ef4444" }}
                            name="Market"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

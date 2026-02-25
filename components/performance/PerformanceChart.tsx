"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

interface MonthlyReturn {
    month: string;
    portfolio: number;
    benchmark: number;
}

export default function PerformanceChart({ data, benchmarkName = "Benchmark" }: { data: MonthlyReturn[], benchmarkName?: string }) {
    if (!data || data.length === 0) return null;

    return (
        <div className="card p-6 flex flex-col animate-slide-up-delay mt-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-text-primary text-xl font-bold">Monthly Returns vs Benchmark</h2>
                    <p className="text-text-muted text-sm mt-1">Portfolio outperformance by month</p>
                </div>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        barGap={8}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#111827",
                                border: "1px solid #1f2937",
                                borderRadius: "12px",
                                color: "#f9fafb",
                            }}
                            itemStyle={{ color: "#f9fafb" }}
                            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                        />
                        <Legend
                            verticalAlign="top"
                            align="right"
                            iconType="circle"
                            wrapperStyle={{ paddingTop: '0px', paddingBottom: '30px' }}
                        />
                        <Bar
                            name="Portfolio"
                            dataKey="portfolio"
                            radius={[4, 4, 0, 0]}
                            fill="#00d084"
                            barSize={24}
                        />
                        <Bar
                            name={benchmarkName}
                            dataKey="benchmark"
                            radius={[4, 4, 0, 0]}
                            fill="#6b7280"
                            barSize={24}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

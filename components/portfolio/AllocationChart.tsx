"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface AllocationItem {
    name: string;
    value: number;
    percent: number;
}

const COLORS = ["#00d084", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];

export default function AllocationChart({ data }: { data: AllocationItem[] }) {
    if (!data || data.length === 0) return null;

    return (
        <div className="card flex flex-col h-full animate-slide-up-delay-2 p-6">
            <h3 className="text-text-primary font-bold text-base">Asset Allocation</h3>
            <p className="text-text-muted text-xs mt-0.5">Distribution by symbol & cash</p>

            <div className="flex-1 w-full min-h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="transparent"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#111827",
                                border: "1px solid #1f2937",
                                borderRadius: "12px",
                                color: "#f9fafb",
                            }}
                            itemStyle={{ color: "#f9fafb" }}
                            formatter={(value: number | any) => `$${(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            content={({ payload }) => (
                                <ul className="flex flex-wrap justify-center gap-4 mt-6">
                                    {payload?.map((entry: any, index: number) => {
                                        const item = data.find(d => d.name === entry.value);
                                        return (
                                            <li key={`item-${index}`} className="flex items-center gap-2 text-xs font-medium text-text-muted">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }} />
                                                <span>{entry.value}: {item ? item.percent.toFixed(1) : 0}%</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

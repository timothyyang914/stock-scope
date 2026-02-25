"use client";

import {
    RadialBarChart,
    RadialBar,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

interface SectorData {
    name: string;
    value: number;
}

export default function SectorExposureChart({ data }: { data: SectorData[] }) {
    // Top 4 sectors with specific colors to match the reference
    const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#f43f5e"];

    // Sort data: largest value stays in the innermost ring for the "rainbow" look
    const chartData = [...data]
        .sort((a, b) => b.value - a.value)
        .slice(0, 4)
        .map((item, index) => ({
            ...item,
            fill: COLORS[index % COLORS.length],
        }));

    return (
        <div className="card p-6 h-[400px] flex flex-col justify-between">
            <div>
                <h3 className="text-text-primary font-bold text-base tracking-tight">Sector Exposure</h3>
                <p className="text-text-muted text-xs mt-0.5 font-medium">Concentration risk by sector</p>
            </div>

            <div className="flex-1 relative flex items-center justify-center -mb-8">
                <ResponsiveContainer width="100%" height="160%">
                    <RadialBarChart
                        innerRadius="40%"
                        outerRadius="100%"
                        data={chartData}
                        startAngle={180}
                        endAngle={0}
                        cy="65%"
                    >
                        <RadialBar
                            background={{ fill: 'rgba(255,255,255,0.03)' }}
                            dataKey="value"
                            cornerRadius={20}
                        />
                        <Tooltip
                            cursor={false}
                            contentStyle={{
                                backgroundColor: "#0f172a",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "12px",
                                fontSize: "12px"
                            }}
                        />
                    </RadialBarChart>
                </ResponsiveContainer>
            </div>

            {/* Horizontal Legend */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-2">
                {chartData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span className="text-text-muted text-[11px] font-bold">{item.name}</span>
                        <span className="text-text-primary text-[11px] font-extrabold">{item.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

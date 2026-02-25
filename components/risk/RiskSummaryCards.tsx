"use client";

interface RiskSummary {
    sharpe: number;
    drawdown: number;
    beta: number;
    var: number;
}

function RiskCard({
    title,
    value,
    unit = "",
    status = "good",
    icon: Icon
}: {
    title: string;
    value: string | number;
    unit?: string;
    status?: "good" | "warning" | "error";
    icon?: any;
}) {
    const statusColors = {
        good: "bg-positive",
        warning: "bg-accent",
        error: "bg-negative"
    };

    return (
        <div className="card p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{title}</span>
                <div className={`w-3 h-3 rounded-full ${statusColors[status]} shadow-[0_0_8px_rgba(0,0,0,0.2)] animate-pulse-slow`} />
            </div>
            <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold text-text-primary tracking-tight">{value}</span>
                <span className="text-sm font-medium text-text-muted">{unit}</span>
            </div>

            {/* Background Icon/Watermark */}
            <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                {Icon && <Icon size={80} />}
            </div>
        </div>
    );
}

import { Shield, TrendingDown, Target, Zap } from "lucide-react";

export default function RiskSummaryCards({ summary }: { summary: RiskSummary }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <RiskCard
                title="Sharpe Ratio"
                value={summary.sharpe}
                status={summary.sharpe > 2.0 ? "good" : summary.sharpe > 1.0 ? "warning" : "error"}
                icon={Zap}
            />
            <RiskCard
                title="Max Drawdown"
                value={summary.drawdown}
                unit="%"
                status={Math.abs(summary.drawdown) < 5 ? "good" : Math.abs(summary.drawdown) < 15 ? "warning" : "error"}
                icon={TrendingDown}
            />
            <RiskCard
                title="Beta"
                value={summary.beta}
                status={summary.beta < 1.1 ? "good" : summary.beta < 1.4 ? "warning" : "error"}
                icon={Target}
            />
            <RiskCard
                title="1-Day VaR (95%)"
                value={summary.var}
                unit="%"
                status={summary.var < 1.5 ? "good" : summary.var < 3.0 ? "warning" : "error"}
                icon={Shield}
            />
        </div>
    );
}

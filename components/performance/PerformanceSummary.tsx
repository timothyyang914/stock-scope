"use client";

import { TrendingUp, Award, Target, Percent } from "lucide-react";

interface PerformanceSummaryProps {
    summary: {
        ytdReturn: number;
        ytdReturnvsLastMonth: number;
        oneYearReturn: number;
        oneYearReturnvsLastMonth: number;
        alpha: number;
        winRate: number;
    };
}

export default function PerformanceSummary({ summary }: PerformanceSummaryProps) {
    if (!summary) return null;

    const cards = [
        {
            label: "YTD Return",
            value: `${summary.ytdReturn}%`,
            change: `+${summary.ytdReturnvsLastMonth}%`,
            icon: TrendingUp,
        },
        {
            label: "1Y Return",
            value: `${summary.oneYearReturn}%`,
            change: `+${summary.oneYearReturnvsLastMonth}%`,
            icon: Percent,
        },
        {
            label: "Alpha",
            value: `${summary.alpha}%`,
            icon: Award,
        },
        {
            label: "Win Rate",
            value: `${summary.winRate}%`,
            icon: Target,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
            {cards.map((card, idx) => (
                <div key={card.label} className="card p-5 relative overflow-hidden group hover:border-accent/30 transition-colors">
                    <div className="flex flex-col relative z-10">
                        <span className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">
                            {card.label}
                        </span>
                        <div className="text-3xl font-bold text-text-primary tracking-tight mt-1">
                            {card.value}
                        </div>
                        {card.change && (
                            <div className="mt-2 text-xs flex items-center gap-1.5 font-medium">
                                <span className="bg-positive/20 text-positive px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    {card.change}
                                </span>
                                <span className="text-text-faint">vs last month</span>
                            </div>
                        )}
                    </div>
                    <card.icon className="absolute -right-4 -bottom-4 w-24 h-24 text-surface-2 transition-transform group-hover:scale-110 opacity-50" />
                </div>
            ))}
        </div>
    );
}

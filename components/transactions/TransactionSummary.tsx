"use client";

import { ArrowUpLeft, ArrowDownRight, CreditCard, Receipt } from "lucide-react";

interface TransactionSummaryProps {
    summary: {
        totalBought: number;
        totalSold: number;
        totalFees: number;
        netInvestment: number;
    };
}

export default function TransactionSummary({ summary }: TransactionSummaryProps) {
    if (!summary) return null;

    const cards = [
        {
            label: "Total Bought",
            value: summary.totalBought,
            icon: ArrowUpLeft,
            color: "text-negative",
            bg: "bg-negative/10",
        },
        {
            label: "Total Sold",
            value: summary.totalSold,
            icon: ArrowDownRight,
            color: "text-positive",
            bg: "bg-positive/10",
        },
        {
            label: "Net Investment",
            value: summary.netInvestment,
            icon: CreditCard,
            color: "text-accent",
            bg: "bg-accent/10",
        },
        {
            label: "Total Fees",
            value: summary.totalFees,
            icon: Receipt,
            color: "text-text-muted",
            bg: "bg-surface-2",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
            {cards.map((card) => (
                <div key={card.label} className="card p-5 relative overflow-hidden group hover:border-accent/30 transition-colors">
                    <div className="flex flex-col relative z-10">
                        <span className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">
                            {card.label}
                        </span>
                        <div className="text-2xl font-bold text-text-primary tracking-tight">
                            ${card.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                    <card.icon className={`absolute -right-4 -bottom-4 w-24 h-24 ${card.color} opacity-10 transition-transform group-hover:scale-110`} />
                </div>
            ))}
        </div>
    );
}

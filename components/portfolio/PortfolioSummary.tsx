"use client";

import { useState } from "react";
import { Wallet, TrendingUp, DollarSign, Edit2 } from "lucide-react";
import EditCashModal from "./EditCashModal";

interface PortfolioSummaryProps {
    summary: {
        totalValue: number;
        dayPL: number;
        dayPLPercent: number;
        totalPL: number;
        totalPLPercent: number;
        cashBalance: number;
    };
    onCashUpdate: () => void;
}

export default function PortfolioSummary({ summary, onCashUpdate }: PortfolioSummaryProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    if (!summary) return null;

    const isDayPositive = summary.dayPL >= 0;
    const isTotalPositive = summary.totalPL >= 0;

    const cards = [
        {
            label: "Total Value",
            value: summary.totalValue,
            icon: Wallet,
            subtitle: "Includes assets & cash",
        },
        {
            label: "Day P&L",
            value: summary.dayPL,
            percent: summary.dayPLPercent,
            isPositive: isDayPositive,
            icon: TrendingUp,
        },
        {
            label: "Total P&L",
            value: summary.totalPL,
            percent: summary.totalPLPercent,
            isPositive: isTotalPositive,
            icon: TrendingUp,
        },
        {
            label: "Cash Balance",
            value: summary.cashBalance,
            icon: DollarSign,
            subtitle: "Available for trading",
            isEditable: true,
        },
    ];

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
                {cards.map((card, idx) => (
                    <div key={card.label} className="card p-5 relative overflow-hidden group hover:border-accent/30 transition-colors">
                        <div className="flex flex-col relative z-10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-text-muted text-xs font-semibold uppercase tracking-wider">
                                    {card.label}
                                </span>
                                {card.isEditable && (
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="p-1.5 rounded-lg bg-white/5 text-text-muted hover:text-accent hover:bg-accent/10 transition-all opacity-0 group-hover:opacity-100"
                                        title="Edit Cash Balance"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                            <div className="text-2xl font-bold text-text-primary tracking-tight">
                                ${card.value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            {card.percent !== undefined ? (
                                <div
                                    className={`mt-2 text-xs flex items-center gap-1 font-semibold ${card.isPositive ? "text-positive" : "text-negative"
                                        }`}
                                >
                                    {card.isPositive ? "+" : ""}
                                    {card.percent.toFixed(2)}% (${Math.abs(card.value).toLocaleString()})
                                </div>
                            ) : (
                                <div className="mt-2 text-xs text-text-faint font-medium">
                                    {card.subtitle}
                                </div>
                            )}
                        </div>
                        <card.icon className="absolute -right-4 -bottom-4 w-24 h-24 text-surface-2 transition-transform group-hover:scale-110 opacity-50" />
                    </div>
                ))}
            </div>

            <EditCashModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentBalance={summary.cashBalance}
                onSave={onCashUpdate}
            />
        </>
    );
}

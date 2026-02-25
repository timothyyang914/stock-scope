"use client";

interface Holding {
    symbol: string;
    name: string;
    shares: number;
    avgCost: number;
    currentPrice: number;
    marketValue: number;
    totalPL: number;
    totalPLPercent: number;
    dayPL: number;
    dayPLPercent: number;
    sector: string;
}

export default function PortfolioHoldings({
    holdings,
    cashBalance = 0
}: {
    holdings: Holding[],
    cashBalance?: number
}) {
    if (!holdings || holdings.length === 0) {
        if (cashBalance === 0) return null;
    }

    return (
        <div className="card flex flex-col animate-slide-up-delay">
            <div className="p-6 border-b border-border/50">
                <h2 className="text-text-primary text-xl font-bold">Holdings</h2>
                <p className="text-text-muted text-sm mt-1">Detailed view of your current positions</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead>
                        <tr className="text-text-muted text-xs font-semibold tracking-wider uppercase border-b border-border/50">
                            <th className="px-6 py-4 font-semibold">Ticker</th>
                            <th className="px-6 py-4 font-semibold text-right">Shares</th>
                            <th className="px-6 py-4 font-semibold text-right">Avg. Cost</th>
                            <th className="px-6 py-4 font-semibold text-right">Mkt Price</th>
                            <th className="px-6 py-4 font-semibold text-right">Value</th>
                            <th className="px-6 py-4 font-semibold text-right">Day P&L</th>
                            <th className="px-6 py-4 font-semibold text-right">Total P&L</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {holdings.map((holding) => {
                            const isDayPositive = holding.dayPL >= 0;
                            const isTotalPositive = holding.totalPL >= 0;

                            return (
                                <tr
                                    key={holding.symbol}
                                    className="hover:bg-surface-2/40 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center flex-shrink-0 group-hover:border-accent/40 transition-colors text-text-primary font-bold text-[10px] uppercase">
                                                {holding.symbol.substring(0, 2)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-text-primary font-bold text-sm">
                                                    {holding.symbol}
                                                </span>
                                                <span className="text-text-muted text-xs">
                                                    {holding.sector}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 text-right text-text-primary text-sm">
                                        {holding.shares}
                                    </td>

                                    <td className="px-6 py-4 text-right text-text-muted text-sm">
                                        ${holding.avgCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>

                                    <td className="px-6 py-4 text-right text-text-primary font-medium text-sm">
                                        ${holding.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>

                                    <td className="px-6 py-4 text-right text-text-primary font-bold text-sm">
                                        ${holding.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>

                                    <td className={`px-6 py-4 text-right text-sm font-semibold ${isDayPositive ? "text-positive" : "text-negative"}`}>
                                        <div className="flex flex-col">
                                            <span>{isDayPositive ? "+" : ""}{holding.dayPLPercent.toFixed(2)}%</span>
                                            <span className="text-[10px] opacity-80">${Math.abs(holding.dayPL).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </td>

                                    <td className={`px-6 py-4 text-right text-sm font-semibold ${isTotalPositive ? "text-positive" : "text-negative"}`}>
                                        <div className="flex flex-col">
                                            <span>{isTotalPositive ? "+" : ""}{holding.totalPLPercent.toFixed(2)}%</span>
                                            <span className="text-[10px] opacity-80">${Math.abs(holding.totalPL).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {/* Cash Row */}
                        <tr className="bg-surface-2/20 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 text-accent font-bold text-[10px] uppercase">
                                        $$
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-text-primary font-bold text-sm">
                                            CASH
                                        </span>
                                        <span className="text-text-muted text-xs">
                                            Liquid Capital
                                        </span>
                                    </div>
                                </div>
                            </td>

                            <td className="px-6 py-4 text-right text-text-muted text-sm italic">
                                —
                            </td>

                            <td className="px-6 py-4 text-right text-text-muted text-sm italic">
                                —
                            </td>

                            <td className="px-6 py-4 text-right text-text-muted text-sm italic">
                                —
                            </td>

                            <td className="px-6 py-4 text-right text-text-primary font-bold text-sm">
                                ${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>

                            <td className="px-6 py-4 text-right text-text-muted text-sm italic">
                                0.00%
                            </td>

                            <td className="px-6 py-4 text-right text-text-muted text-sm italic">
                                0.00%
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

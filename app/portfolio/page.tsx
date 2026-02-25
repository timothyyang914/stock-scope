"use client";

import { useState, useEffect } from "react";
import PortfolioSummary from "@/components/portfolio/PortfolioSummary";
import PortfolioHoldings from "@/components/portfolio/PortfolioHoldings";
import AllocationChart from "@/components/portfolio/AllocationChart";

interface PortfolioData {
    summary: any;
    holdings: any[];
    allocation: any[];
}

export default function PortfolioPage() {
    const [data, setData] = useState<PortfolioData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPortfolio = async () => {
        try {
            const res = await fetch("/api/portfolio");
            if (!res.ok) throw new Error("Failed to fetch portfolio data");
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            setData(json);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolio();
    }, []);

    if (error) {
        return (
            <div className="card p-6 border-negative/30 bg-negative/5 text-negative text-sm text-center animate-fade-in mt-6">
                ⚠ {error}
            </div>
        );
    }

    if (isLoading || !data) {
        return (
            <div className="flex flex-col gap-6 animate-fade-in mt-6 max-w-[1400px] mx-auto">
                {/* Summary skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="card h-28 bg-surface/50 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="card h-96 lg:col-span-1 bg-surface/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
                    </div>
                    <div className="card h-96 lg:col-span-2 bg-surface/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
            {/* 4 Summary Cards Row */}
            <section>
                <PortfolioSummary summary={data.summary} onCashUpdate={fetchPortfolio} />
            </section>

            {/* Middle Row: Allocation and Holdings */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <aside className="lg:col-span-1 h-full">
                    <AllocationChart data={data.allocation} />
                </aside>

                <section className="lg:col-span-3">
                    <PortfolioHoldings
                        holdings={data.holdings}
                        cashBalance={data.summary.cashBalance}
                    />
                </section>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import IndexCards from "@/components/markets/IndexCards";
import TopMovers from "@/components/markets/TopMovers";
import MarketSentiment from "@/components/markets/MarketSentiment";

interface MarketsData {
    indices: any[];
    leaders: any[];
    laggards: any[];
    sentiment: any;
}

export default function MarketsPage() {
    const [data, setData] = useState<MarketsData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchMarkets() {
            try {
                const res = await fetch("/api/markets");
                if (!res.ok) throw new Error("Failed to fetch market data");
                const json = await res.json();
                if (json.error) throw new Error(json.error);
                setData(json);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchMarkets();
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
            <div className="flex flex-col gap-6 animate-fade-in mt-6">
                {/* Indices skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="card h-40 bg-surface/50 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
                        </div>
                    ))}
                </div>
                {/* Grid skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 card h-72 bg-surface/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
                    </div>
                    <div className="lg:col-span-2 card h-72 bg-surface/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
            {/* 4 Cards Row */}
            <section>
                <IndexCards indices={data.indices} />
            </section>

            {/* 2 Column Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6">
                <div className="xl:col-span-2">
                    <TopMovers leaders={data.leaders} laggards={data.laggards} />
                </div>
                <div className="xl:col-span-3">
                    <MarketSentiment sentiment={data.sentiment} />
                </div>
            </section>
        </div>
    );
}

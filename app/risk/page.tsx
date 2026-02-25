"use client";

import { useState, useEffect } from "react";
import RiskSummaryCards from "@/components/risk/RiskSummaryCards";
import VolatilityChart from "@/components/risk/VolatilityChart";
import SectorExposureChart from "@/components/risk/SectorExposureChart";

interface RiskData {
    summary: any;
    volatility: any[];
    sectors: any[];
}

export default function RiskPage() {
    const [data, setData] = useState<RiskData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchRiskData() {
            try {
                const res = await fetch("/api/risk");
                if (!res.ok) throw new Error("Failed to fetch risk analysis");
                const json = await res.json();
                if (json.error) throw new Error(json.error);
                setData(json);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchRiskData();
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
                {/* Summary cards skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="card h-32 bg-surface/50 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
                        </div>
                    ))}
                </div>
                {/* Charts skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="card h-[400px] bg-surface/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
                    </div>
                    <div className="card h-[400px] bg-surface/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-10">
            {/* Header + Summary Cards */}
            <section className="flex flex-col gap-4">
                <RiskSummaryCards summary={data.summary} />
            </section>

            {/* Charts Grid */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="lg:col-span-1">
                    <VolatilityChart data={data.volatility} />
                </div>
                <div className="lg:col-span-1">
                    <SectorExposureChart data={data.sectors} />
                </div>
            </section>
        </div>
    );
}

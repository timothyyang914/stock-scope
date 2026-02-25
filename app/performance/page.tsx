"use client";

import { useState, useEffect } from "react";
import PerformanceSummary from "@/components/performance/PerformanceSummary";
import PerformanceChart from "@/components/performance/PerformanceChart";

interface PerformanceData {
    summary: any;
    monthlyReturns: any[];
}

export default function PerformancePage() {
    const [benchmark, setBenchmark] = useState("S&P 500");
    const [data, setData] = useState<PerformanceData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPerformance = async (selectedBenchmark: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/performance?benchmark=${encodeURIComponent(selectedBenchmark)}`);
            if (!res.ok) throw new Error("Failed to fetch performance data");
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
        fetchPerformance(benchmark);
    }, [benchmark]);

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
                {/* Chart skeleton */}
                <div className="card h-[450px] bg-surface/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
                </div>
            </div>
        );
    }

    const benchmarks = ["S&P 500", "NASDAQ", "DOW JONES", "SOX", "RUSSELL 2000"];

    return (
        <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
            {/* Header with Benchmark Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary tracking-tight">Portfolio Performance</h1>
                    <p className="text-text-muted mt-1">Track your returns and alpha against major indices</p>
                </div>
                <div className="flex items-center gap-3 bg-surface/50 border border-white/5 p-1.5 rounded-xl backdrop-blur-sm self-start">
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wider ml-2">Benchmark:</span>
                    <select
                        value={benchmark}
                        onChange={(e) => setBenchmark(e.target.value)}
                        className="bg-surface-2 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all cursor-pointer min-w-[140px]"
                    >
                        {benchmarks.map((b) => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 4 Summary Cards Row */}
            <section>
                <PerformanceSummary summary={data.summary} />
            </section>

            {/* Main Bar Chart Section */}
            <section>
                <PerformanceChart data={data.monthlyReturns} benchmarkName={benchmark} />
            </section>
        </div>
    );
}

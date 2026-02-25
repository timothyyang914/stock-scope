"use client";

interface SentimentData {
    fearGreed: { value: number; label: string };
    vix: { value: number };
    putCallRatio: { value: number };
    advanceDecline: { value: number };
    newHighsLows: { value: number };
}

function ProgressBar({
    label,
    value,
    max = 100,
    text,
    colorClass = "bg-accent",
}: {
    label: string;
    value: number;
    max?: number;
    text: string;
    colorClass?: string;
}) {
    const percent = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className="flex flex-col gap-2 mt-4">
            <div className="flex justify-between items-end text-sm">
                <span className="text-text-muted font-medium">{label}</span>
                <span className="text-text-primary font-mono tracking-tight">{text}</span>
            </div>
            <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                <div
                    className={`h-full ${colorClass} rounded-full`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}

export default function MarketSentiment({
    sentiment,
}: {
    sentiment: SentimentData;
}) {
    if (!sentiment) return null;

    return (
        <div className="card h-full flex flex-col animate-slide-up-delay-2 p-5">
            <h3 className="text-text-primary font-bold text-base">Market Sentiment</h3>
            <p className="text-text-muted text-xs mt-0.5">Aggregated indicators</p>

            <div className="flex flex-col flex-1 justify-center gap-2 mt-4">
                <ProgressBar
                    label="Fear & Greed Index"
                    value={sentiment.fearGreed.value}
                    max={100}
                    text={`${sentiment.fearGreed.value} — ${sentiment.fearGreed.label}`}
                    colorClass="bg-[#00d084]"
                />

                <ProgressBar
                    label="VIX (Volatility)"
                    value={sentiment.vix.value}
                    max={40}
                    text={sentiment.vix.value.toString()}
                    colorClass="bg-[#f59e0b]" // amber
                />

                <ProgressBar
                    label="Put/Call Ratio"
                    value={sentiment.putCallRatio.value}
                    max={2}
                    text={sentiment.putCallRatio.value.toString()}
                    colorClass="bg-[#3b82f6]" // blue
                />

                <ProgressBar
                    label="Advance/Decline"
                    value={sentiment.advanceDecline.value}
                    max={4}
                    text={sentiment.advanceDecline.value.toString()}
                    colorClass="bg-[#06b6d4]" // cyan
                />

                <ProgressBar
                    label="New Highs/Lows"
                    value={sentiment.newHighsLows.value}
                    max={10}
                    text={sentiment.newHighsLows.value.toString()}
                    colorClass="bg-[#f59e0b]" // amber
                />
            </div>
        </div>
    );
}

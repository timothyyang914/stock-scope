"use client";

interface MoverData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
}

function MoverItem({ mover, isPositive }: { mover: MoverData; isPositive: boolean }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-2 border border-border flex items-center justify-center flex-shrink-0 group-hover:border-accent/40 transition-colors">
                    <span className="text-text-primary font-bold text-xs">
                        {mover.symbol.substring(0, 2)}
                    </span>
                </div>
                <div>
                    <h4 className="text-text-primary font-bold text-sm">
                        {mover.symbol}
                    </h4>
                    <p className="text-text-muted text-xs line-clamp-1">{mover.name}</p>
                </div>
            </div>

            <div className="text-right">
                <div className="text-text-primary font-bold text-sm">
                    ${mover.price.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </div>
                <div className={`text-xs font-semibold ${isPositive ? "text-positive" : "text-negative"}`}>
                    {isPositive ? "+" : ""}
                    {mover.changePercent.toFixed(2)}%
                </div>
            </div>
        </div>
    );
}

export default function TopMovers({
    leaders = [],
    laggards = [],
}: {
    leaders: MoverData[];
    laggards: MoverData[];
}) {
    return (
        <div className="flex flex-col gap-6 animate-slide-up-delay">
            {/* Leaders Section */}
            <div className="card flex flex-col">
                <div className="p-5 border-b border-border/50 flex justify-between items-center bg-positive/5">
                    <div>
                        <h3 className="text-text-primary font-bold text-base">Top 5 Leaders</h3>
                        <p className="text-text-muted text-xs mt-0.5">Biggest gainers today</p>
                    </div>
                </div>
                <div className="flex flex-col p-2">
                    {leaders.length > 0 ? (
                        leaders.map((m) => <MoverItem key={m.symbol} mover={m} isPositive={true} />)
                    ) : (
                        <p className="p-4 text-sm text-text-muted italic">No gainers found</p>
                    )}
                </div>
            </div>

            {/* Laggards Section */}
            <div className="card flex flex-col">
                <div className="p-5 border-b border-border/50 flex justify-between items-center bg-negative/5">
                    <div>
                        <h3 className="text-text-primary font-bold text-base">Top 5 Laggards</h3>
                        <p className="text-text-muted text-xs mt-0.5">Biggest losers today</p>
                    </div>
                </div>
                <div className="flex flex-col p-2">
                    {laggards.length > 0 ? (
                        laggards.map((m) => <MoverItem key={m.symbol} mover={m} isPositive={false} />)
                    ) : (
                        <p className="p-4 text-sm text-text-muted italic">No laggards found</p>
                    )}
                </div>
            </div>
        </div>
    );
}

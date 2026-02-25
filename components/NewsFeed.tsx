"use client";

import { ExternalLink, Clock } from "lucide-react";

interface Article {
    title: string;
    description: string;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    source: string;
}

interface NewsFeedProps {
    ticker: string;
    articles: Article[];
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
}

function getSourceColor(source: string): string {
    const colors: Record<string, string> = {
        "financial times": "text-pink-400",
        bloomberg: "text-blue-400",
        reuters: "text-orange-400",
        cnbc: "text-yellow-400",
        marketwatch: "text-green-400",
        "wall street journal": "text-purple-400",
    };
    return colors[source.toLowerCase()] || "text-accent";
}

function NewsCard({ article, index }: { article: Article; index: number }) {
    const delays = [
        "animate-slide-up",
        "animate-slide-up-delay",
        "animate-slide-up-delay-2",
    ];
    const animClass = delays[index % 3] || "animate-slide-up";

    return (
        <a
            href={article.url === "#" ? undefined : article.url}
            target="_blank"
            rel="noopener noreferrer"
            id={`news-card-${index}`}
            className={`card p-5 flex flex-col gap-3 hover:border-accent/30 hover:bg-surface-2 transition-all duration-300 group cursor-pointer ${animClass} opacity-0`}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span
                            className={`text-xs font-semibold ${getSourceColor(article.source)}`}
                        >
                            {article.source}
                        </span>
                        <span className="text-text-faint">·</span>
                        <span className="flex items-center gap-1 text-text-muted text-xs">
                            <Clock className="w-3 h-3" />
                            {timeAgo(article.publishedAt)}
                        </span>
                    </div>
                    <h4 className="text-text-primary font-semibold text-sm leading-snug group-hover:text-accent transition-colors line-clamp-2">
                        {article.title}
                    </h4>
                </div>
                <ExternalLink className="w-4 h-4 text-text-faint group-hover:text-accent transition-colors flex-shrink-0 mt-1" />
            </div>
            {article.description && (
                <p className="text-text-muted text-xs leading-relaxed line-clamp-2">
                    {article.description}
                </p>
            )}
        </a>
    );
}

export default function NewsFeed({ ticker, articles }: NewsFeedProps) {
    if (!articles || articles.length === 0) {
        return (
            <div className="card p-8 text-center text-text-muted text-sm">
                No news found for {ticker}.
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-text-primary font-semibold text-base">
                        Latest News
                    </h3>
                    <p className="text-text-muted text-xs mt-0.5">
                        {articles.length} articles for {ticker}
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {articles.map((article, i) => (
                    <NewsCard key={i} article={article} index={i} />
                ))}
            </div>
        </div>
    );
}

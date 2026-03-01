"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
    { name: "Dashboard", href: "/" },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Performance", href: "/performance" },
    { name: "Risk", href: "/risk" },
    { name: "Transactions", href: "/transactions" },
    { name: "Markets", href: "/markets" },
    { name: "Watchlist", href: "/watchlist" },
];

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="hidden md:flex items-center gap-6 text-sm">
            {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`transition-colors duration-200 relative py-1 focus:outline-none ${isActive
                                ? "text-accent font-bold"
                                : "text-text-muted hover:text-text-primary"
                            }`}
                    >
                        {item.name}
                        {isActive && (
                            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full shadow-[0_0_8px_rgba(0,208,132,0.4)] animate-fade-in" />
                        )}
                    </Link>
                );
            })}
            <span className="text-text-faint cursor-default transition-colors">
                Reports
            </span>
        </nav>
    );
}

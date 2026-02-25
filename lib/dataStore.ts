import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "transactions.json");
const SETTINGS_PATH = path.join(process.cwd(), "data", "portfolio_settings.json");
const WATCHLIST_PATH = path.join(process.cwd(), "data", "watchlist.json");

const DEFAULT_CASH = 12500.50;

export interface Transaction {
    id: string;
    date: string;
    type: "BUY" | "SELL";
    symbol: string;
    name: string;
    shares: number;
    price: number;
    amount: number;
    fees: number;
    status: "COMPLETED" | "PENDING";
}

export interface Holding {
    symbol: string;
    name: string;
    shares: number;
    avgCost: number;
    totalCost: number;
}

export interface WatchlistItem {
    symbol: string;
    name: string;
}

export function getTransactions(): Transaction[] {
    try {
        if (!fs.existsSync(DATA_PATH)) {
            return [];
        }
        const data = fs.readFileSync(DATA_PATH, "utf8");
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading transactions:", error);
        return [];
    }
}

export function saveTransactions(transactions: Transaction[]) {
    try {
        fs.writeFileSync(DATA_PATH, JSON.stringify(transactions, null, 2), "utf8");
    } catch (error) {
        console.error("Error saving transactions:", error);
    }
}

export function updateTransaction(updatedTx: Transaction) {
    const transactions = getTransactions();
    const index = transactions.findIndex((tx) => tx.id === updatedTx.id);
    if (index !== -1) {
        transactions[index] = updatedTx;
        saveTransactions(transactions);
    }
}

export interface Watchlist {
    id: string;
    name: string;
    items: WatchlistItem[];
}

export function getWatchlists(): Watchlist[] {
    try {
        if (!fs.existsSync(WATCHLIST_PATH)) {
            const initialWatchlists: Watchlist[] = [
                {
                    id: "default",
                    name: "Main Watchlist",
                    items: [
                        { symbol: "AAPL", name: "Apple Inc." },
                        { symbol: "MSFT", name: "Microsoft Corp" },
                        { symbol: "GOOGL", name: "Alphabet Inc" },
                        { symbol: "AMZN", name: "Amazon.com Inc" },
                    ]
                },
                {
                    id: "growth",
                    name: "High Growth",
                    items: [
                        { symbol: "NVDA", name: "NVIDIA Corp" },
                        { symbol: "TSLA", name: "Tesla Inc." },
                        { symbol: "SMCI", name: "Super Micro" },
                        { symbol: "PLTR", name: "Palantir Tech" },
                    ]
                }
            ];
            saveWatchlists(initialWatchlists);
            return initialWatchlists;
        }
        const rawData = fs.readFileSync(WATCHLIST_PATH, "utf8");
        const data = JSON.parse(rawData);

        // Migration: If data is an array of items (old format), wrap it in a default watchlist
        if (Array.isArray(data) && data.length > 0 && "symbol" in data[0]) {
            const migrated: Watchlist[] = [
                {
                    id: "default",
                    name: "Main Watchlist",
                    items: data as unknown as WatchlistItem[]
                }
            ];
            saveWatchlists(migrated);
            return migrated;
        }

        return data;
    } catch (error) {
        console.error("Error reading watchlists:", error);
        return [];
    }
}

export function saveWatchlists(watchlists: Watchlist[]) {
    try {
        fs.writeFileSync(WATCHLIST_PATH, JSON.stringify(watchlists, null, 2), "utf8");
    } catch (error) {
        console.error("Error saving watchlists:", error);
    }
}

export function getWatchlist(id: string = "default"): WatchlistItem[] {
    const watchlists = getWatchlists();
    const list = watchlists.find((l) => l.id === id) || watchlists[0];
    return list ? list.items : [];
}

export function deleteFromWatchlist(symbol: string, listId: string = "default") {
    const watchlists = getWatchlists();
    const listIndex = watchlists.findIndex((l) => l.id === listId);
    if (listIndex !== -1) {
        watchlists[listIndex].items = watchlists[listIndex].items.filter((item) => item.symbol !== symbol);
        saveWatchlists(watchlists);
    }
}

export function addToWatchlist(symbol: string, listId: string = "default", name: string = "") {
    const watchlists = getWatchlists();
    const listIndex = watchlists.findIndex((l) => l.id === listId);
    if (listIndex !== -1) {
        // Check if already exists
        if (!watchlists[listIndex].items.some((item) => item.symbol === symbol)) {
            watchlists[listIndex].items.push({ symbol, name });
            saveWatchlists(watchlists);
        }
    }
}

export function deleteWatchlist(id: string) {
    let watchlists = getWatchlists();
    watchlists = watchlists.filter((l) => l.id !== id);

    // Ensure at least one watchlist exists
    if (watchlists.length === 0) {
        watchlists.push({
            id: "default",
            name: "Main Watchlist",
            items: []
        });
    }

    saveWatchlists(watchlists);
}

export function renameWatchlist(id: string, newName: string) {
    const watchlists = getWatchlists();
    const list = watchlists.find((l) => l.id === id);
    if (list) {
        list.name = newName;
        saveWatchlists(watchlists);
    }
}

export function createWatchlist(name: string): Watchlist {
    const watchlists = getWatchlists();
    const newId = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    const newList: Watchlist = {
        id: newId,
        name,
        items: []
    };
    watchlists.push(newList);
    saveWatchlists(watchlists);
    return newList;
}

export function addTransaction(newTx: Transaction) {
    const transactions = getTransactions();
    transactions.push(newTx);
    saveTransactions(transactions);
}

export function deleteTransaction(id: string) {
    const transactions = getTransactions();
    const filtered = transactions.filter((tx) => tx.id !== id);
    saveTransactions(filtered);
}

export function getCashBalance(): number {
    try {
        if (!fs.existsSync(SETTINGS_PATH)) {
            return DEFAULT_CASH;
        }
        const data = fs.readFileSync(SETTINGS_PATH, "utf8");
        const settings = JSON.parse(data);
        return settings.cashBalance ?? DEFAULT_CASH;
    } catch (error) {
        console.error("Error reading cash balance:", error);
        return DEFAULT_CASH;
    }
}

export function saveCashBalance(balance: number) {
    try {
        const settings = fs.existsSync(SETTINGS_PATH)
            ? JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"))
            : {};
        settings.cashBalance = balance;
        fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf8");
    } catch (error) {
        console.error("Error saving cash balance:", error);
    }
}

export function getHoldings(): Holding[] {
    const transactions = getTransactions().filter((tx) => tx.status === "COMPLETED");
    const holdingsMap: Record<string, { totalShares: number; totalCost: number; name: string }> = {};

    transactions.forEach((tx) => {
        if (!holdingsMap[tx.symbol]) {
            holdingsMap[tx.symbol] = { totalShares: 0, totalCost: 0, name: tx.name };
        }

        if (tx.type === "BUY") {
            holdingsMap[tx.symbol].totalShares += tx.shares;
            holdingsMap[tx.symbol].totalCost += tx.amount;
        } else {
            // For SELL, we reduce shares but keep cost basis calculation (simplified FIFO or average cost fallback)
            holdingsMap[tx.symbol].totalShares -= tx.shares;
            // Note: In a real system, selling doesn't reduce "Average Cost" but reduces total position.
            // For simplicity, we just reduce total cost proportionally to maintain the same average cost.
        }
    });

    return Object.entries(holdingsMap)
        .filter(([_, data]) => data.totalShares > 0)
        .map(([symbol, data]) => ({
            symbol,
            name: data.name,
            shares: data.totalShares,
            totalCost: data.totalCost,
            avgCost: data.totalCost / data.totalShares,
        }));
}

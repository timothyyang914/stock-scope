import { supabase } from "./supabase";

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

export interface Watchlist {
    id: string;
    name: string;
    items: WatchlistItem[];
}

const DEFAULT_CASH = 12500.50;

// Transactions
export async function getTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

    if (error) {
        console.error("Error fetching transactions:", error);
        return [];
    }
    return data || [];
}

export async function addTransaction(newTx: Transaction) {
    const { error } = await supabase
        .from('transactions')
        .insert([newTx]);

    if (error) console.error("Error adding transaction:", error);
}

export async function updateTransaction(updatedTx: Transaction) {
    const { error } = await supabase
        .from('transactions')
        .update(updatedTx)
        .eq('id', updatedTx.id);

    if (error) console.error("Error updating transaction:", error);
}

export async function deleteTransaction(id: string) {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) console.error("Error deleting transaction:", error);
}

// Cash Balance (Settings)
export async function getCashBalance(): Promise<number> {
    const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('id', 'portfolio')
        .single();

    if (error) {
        if (error.code !== 'PGRST116') { // Not found
            console.error("Error fetching cash balance:", error);
        }
        return DEFAULT_CASH;
    }
    return data?.value?.cashBalance ?? DEFAULT_CASH;
}

export async function saveCashBalance(balance: number) {
    const { error } = await supabase
        .from('settings')
        .upsert({ id: 'portfolio', value: { cashBalance: balance } });

    if (error) console.error("Error saving cash balance:", error);
}

// Watchlists
export async function getWatchlists(): Promise<Watchlist[]> {
    const { data: watchlists, error: wlError } = await supabase
        .from('watchlists')
        .select('*');

    if (wlError) {
        console.error("Error fetching watchlists:", wlError);
        return [];
    }

    const { data: items, error: iError } = await supabase
        .from('watchlist_items')
        .select('*');

    if (iError) {
        console.error("Error fetching watchlist items:", iError);
        return [];
    }

    return watchlists.map(wl => ({
        ...wl,
        items: items.filter(i => i.watchlist_id === wl.id).map(i => ({ symbol: i.symbol, name: i.name }))
    }));
}

export async function saveWatchlists(watchlists: Watchlist[]) {
    // This is more complex because of the relational structure.
    // For simplicity in this migration, we'll focus on the core functionality.
    // In a real app, you'd update specific watchlists.
    for (const wl of watchlists) {
        await supabase.from('watchlists').upsert({ id: wl.id, name: wl.name });
        // Clear and re-insert items for simplicity (not efficient but works for small lists)
        await supabase.from('watchlist_items').delete().eq('watchlist_id', wl.id);
        const items = wl.items.map(i => ({ watchlist_id: wl.id, symbol: i.symbol, name: i.name }));
        if (items.length > 0) {
            await supabase.from('watchlist_items').insert(items);
        }
    }
}

export async function getWatchlist(id: string = "default"): Promise<WatchlistItem[]> {
    const { data, error } = await supabase
        .from('watchlist_items')
        .select('symbol, name')
        .eq('watchlist_id', id);

    if (error) {
        console.error("Error fetching watchlist:", error);
        return [];
    }
    return data || [];
}

export async function deleteFromWatchlist(symbol: string, listId: string = "default") {
    const { error } = await supabase
        .from('watchlist_items')
        .delete()
        .eq('watchlist_id', listId)
        .eq('symbol', symbol);

    if (error) console.error("Error deleting from watchlist:", error);
}

export async function addToWatchlist(symbol: string, listId: string = "default", name: string = "") {
    const { error } = await supabase
        .from('watchlist_items')
        .insert([{ watchlist_id: listId, symbol, name }]);

    if (error) console.error("Error adding to watchlist:", error);
}

export async function deleteWatchlist(id: string) {
    const { error } = await supabase
        .from('watchlists')
        .delete()
        .eq('id', id);

    if (error) console.error("Error deleting watchlist:", error);
}

export async function renameWatchlist(id: string, newName: string) {
    const { error } = await supabase
        .from('watchlists')
        .update({ name: newName })
        .eq('id', id);

    if (error) console.error("Error renaming watchlist:", error);
}

export async function createWatchlist(name: string): Promise<Watchlist> {
    const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    const { error } = await supabase
        .from('watchlists')
        .insert([{ id, name }]);

    if (error) console.error("Error creating watchlist:", error);
    return { id, name, items: [] };
}

// Holdings Logic (Deriving from Transactions)
export async function getHoldings(): Promise<Holding[]> {
    const transactions = (await getTransactions()).filter((tx) => tx.status === "COMPLETED");
    const holdingsMap: Record<string, { totalShares: number; totalCost: number; name: string }> = {};

    transactions.forEach((tx) => {
        if (!holdingsMap[tx.symbol]) {
            holdingsMap[tx.symbol] = { totalShares: 0, totalCost: 0, name: tx.name };
        }

        if (tx.type === "BUY") {
            holdingsMap[tx.symbol].totalShares += tx.shares;
            holdingsMap[tx.symbol].totalCost += tx.amount;
        } else {
            holdingsMap[tx.symbol].totalShares -= tx.shares;
            // Simplified cost basis reduction
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

"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Plus, Trash2, Pencil } from "lucide-react";
import WatchlistSummary from "@/components/watchlist/WatchlistSummary";
import WatchlistTable from "@/components/watchlist/WatchlistTable";
import AddAssetModal from "@/components/watchlist/AddAssetModal";
import NewWatchlistModal from "@/components/watchlist/NewWatchlistModal";
import RenameWatchlistModal from "@/components/watchlist/RenameWatchlistModal";
import DeleteConfirmModal from "@/components/transactions/DeleteConfirmModal";

interface WatchlistData {
    summary: any;
    assets: any[];
    metadata: {
        watchlists: { id: string; name: string }[];
        activeId: string;
    };
}

export default function WatchlistPage() {
    const [data, setData] = useState<WatchlistData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeListId, setActiveListId] = useState("default");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const fetchWatchlist = async (id: string = activeListId) => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/watchlist?id=${id}`);
            if (!res.ok) throw new Error("Failed to fetch watchlist data");
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            setData(json);
            setActiveListId(json.metadata.activeId);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWatchlist();
    }, []);

    const handleDelete = async (symbol: string) => {
        try {
            const res = await fetch(`/api/watchlist?ticker=${symbol}&id=${activeListId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete item");
            // Refresh data to update summaries and list
            fetchWatchlist(activeListId);
        } catch (err: any) {
            alert("Error deleting item: " + err.message);
        }
    };

    const handleCreateList = async (name: string) => {
        try {
            const res = await fetch("/api/watchlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });
            if (!res.ok) throw new Error("Failed to create watchlist");
            const json = await res.json();
            if (json.error) throw new Error(json.error);

            // Refresh and switch to the new list
            await fetchWatchlist(json.list.id);
        } catch (err: any) {
            alert("Error creating watchlist: " + err.message);
        }
    };

    const handleAddAsset = async (ticker: string) => {
        try {
            const res = await fetch("/api/watchlist", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ticker: ticker.toUpperCase(), listId: activeListId }),
            });
            if (!res.ok) throw new Error("Failed to add asset");
            const json = await res.json();
            if (json.error) throw new Error(json.error);

            // Refresh the list
            await fetchWatchlist(activeListId);
        } catch (err: any) {
            alert("Error adding asset: " + err.message);
        }
    };

    const handleDeleteWatchlist = async () => {
        try {
            const res = await fetch(`/api/watchlist?id=${activeListId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete watchlist");

            // Refresh and let the backend/frontend logic pick a new default
            const updatedWatchlists = data?.metadata.watchlists.filter(l => l.id !== activeListId) || [];
            const nextId = updatedWatchlists.length > 0 ? updatedWatchlists[0].id : "default";

            setIsDeleteModalOpen(false);
            await fetchWatchlist(nextId);
        } catch (err: any) {
            alert("Error deleting watchlist: " + err.message);
        }
    };

    const handleRenameWatchlist = async (newName: string) => {
        try {
            const res = await fetch("/api/watchlist", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: activeListId, newName }),
            });
            if (!res.ok) throw new Error("Failed to rename watchlist");

            // Refresh data
            await fetchWatchlist(activeListId);
        } catch (err: any) {
            alert("Error renaming watchlist: " + err.message);
        }
    };

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
                {/* Summary Cards skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="card h-32 bg-surface/50 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
                        </div>
                    ))}
                </div>
                {/* Table skeleton */}
                <div className="card h-96 bg-surface/50 relative overflow-hidden mt-2">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
                </div>
            </div>
        );
    }


    return (
        <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
            {/* Watchlist Selector Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-text-primary text-2xl font-bold tracking-tight">Market Intelligence</h1>
                    <p className="text-text-muted text-sm mt-1">Real-time market insights and watchlist management</p>
                </div>

                <div className="flex items-end gap-2">
                    <div className="relative group">
                        <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1 block">Active Watchlist</label>
                        <div className="relative">
                            <select
                                value={activeListId}
                                onChange={(e) => {
                                    const newId = e.target.value;
                                    setActiveListId(newId);
                                    fetchWatchlist(newId);
                                }}
                                className="bg-surface border border-border/50 text-text-primary text-sm rounded-lg focus:ring-accent focus:border-accent block w-full pl-4 pr-10 py-2 appearance-none cursor-pointer transition-all hover:bg-surface-2"
                            >
                                {data.metadata.watchlists.map(list => (
                                    <option key={list.id} value={list.id}>{list.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none group-hover:text-accent transition-colors" />
                        </div>
                    </div>
                    <button
                        onClick={() => setIsNewListModalOpen(true)}
                        className="bg-surface border border-border/50 text-text-muted hover:text-accent hover:border-accent/50 p-2.5 rounded-lg transition-all group"
                        title="Create New Watchlist"
                    >
                        <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
                    </button>
                    <button
                        onClick={() => setIsRenameModalOpen(true)}
                        className="bg-surface border border-border/50 text-text-muted hover:text-accent hover:border-accent/50 p-2.5 rounded-lg transition-all group"
                        title="Rename Current Watchlist"
                    >
                        <Pencil className="w-4 h-4 transition-transform group-hover:scale-110" />
                    </button>
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        disabled={data.metadata.watchlists.length <= 1}
                        className="bg-surface border border-border/50 text-text-muted hover:text-negative hover:border-negative/50 p-2.5 rounded-lg transition-all group disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Delete Current Watchlist"
                    >
                        <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                    </button>
                </div>
            </div>

            {/* 4 Summary Cards Row */}
            <section>
                <WatchlistSummary summary={data.summary} />
            </section>

            {/* Main Table Section */}
            <section>
                <WatchlistTable
                    assets={data.assets}
                    title={data.metadata.watchlists.find(l => l.id === activeListId)?.name || "Your Watchlist"}
                    onDelete={handleDelete}
                    onAdd={() => setIsAddModalOpen(true)}
                />
            </section>

            <AddAssetModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddAsset}
                watchlistName={data.metadata.watchlists.find(l => l.id === activeListId)?.name}
            />

            <NewWatchlistModal
                isOpen={isNewListModalOpen}
                onClose={() => setIsNewListModalOpen(false)}
                onCreate={handleCreateList}
            />

            <RenameWatchlistModal
                isOpen={isRenameModalOpen}
                onClose={() => setIsRenameModalOpen(false)}
                onRename={handleRenameWatchlist}
                currentName={data.metadata.watchlists.find(l => l.id === activeListId)?.name || ""}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteWatchlist}
                title="Delete Watchlist"
                message={`Are you sure you want to delete "${data.metadata.watchlists.find(l => l.id === activeListId)?.name}"? This will remove all symbols tracked within it.`}
                itemName={data.metadata.watchlists.find(l => l.id === activeListId)?.name}
            />
        </div>
    );
}

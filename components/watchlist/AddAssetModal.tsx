"use client";

import { useState } from "react";
import { X, Plus, Search } from "lucide-react";

interface AddAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (ticker: string) => void;
    watchlistName?: string;
}

export default function AddAssetModal({
    isOpen,
    onClose,
    onAdd,
    watchlistName,
}: AddAssetModalProps) {
    const [ticker, setTicker] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (ticker.trim()) {
            onAdd(ticker.trim().toUpperCase());
            setTicker("");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="card w-full max-w-sm p-0 relative z-10 animate-scale-in overflow-hidden shadow-2xl border-accent/20 bg-surface">
                <div className="p-6 border-b border-border/50 flex items-center justify-between bg-accent/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                            <Plus className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary">Add New Asset</h3>
                            {watchlistName && (
                                <p className="text-xs text-accent font-medium uppercase tracking-wider mt-0.5">
                                    To {watchlistName}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-surface-2 text-text-muted transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1.5 block">Stock Ticker</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="e.g. MSFT, NVDA, AAPL"
                                    value={ticker}
                                    onChange={(e) => setTicker(e.target.value)}
                                    className="w-full bg-surface-2 border border-border/50 rounded-xl pl-10 pr-4 py-3 text-text-primary text-sm focus:ring-2 focus:ring-accent/50 outline-none transition-all placeholder:text-text-muted/50"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl border border-border hover:bg-surface-2 text-text-primary font-semibold text-sm transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!ticker.trim()}
                                className="flex-1 py-3 rounded-xl bg-accent hover:bg-accent-hover text-surface font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20"
                            >
                                <Plus className="w-4 h-4" />
                                Add Ticker
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { X, Pencil, Type } from "lucide-react";

interface RenameWatchlistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRename: (newName: string) => void;
    currentName: string;
}

export default function RenameWatchlistModal({
    isOpen,
    onClose,
    onRename,
    currentName,
}: RenameWatchlistModalProps) {
    const [name, setName] = useState(currentName);

    useEffect(() => {
        if (isOpen) {
            setName(currentName);
        }
    }, [isOpen, currentName]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && name.trim() !== currentName) {
            onRename(name.trim());
            onClose();
        } else if (name.trim() === currentName) {
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
                            <Pencil className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary">Rename Watchlist</h3>
                            <p className="text-xs text-text-muted mt-0.5">Change the collection name</p>
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
                            <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold mb-1.5 block">New Name</label>
                            <div className="relative">
                                <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Enter new name..."
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
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
                                disabled={!name.trim() || name.trim() === currentName}
                                className="flex-1 py-3 rounded-xl bg-accent hover:bg-accent-hover text-surface font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

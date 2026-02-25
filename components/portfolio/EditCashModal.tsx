"use client";

import { useState, useEffect } from "react";
import { X, DollarSign, Save } from "lucide-react";

interface EditCashModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newBalance: number) => void;
    currentBalance: number;
}

export default function EditCashModal({
    isOpen,
    onClose,
    onSave,
    currentBalance,
}: EditCashModalProps) {
    const [balance, setBalance] = useState(currentBalance);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setBalance(currentBalance);
        }
    }, [isOpen, currentBalance]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch("/api/portfolio/cash", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cashBalance: balance }),
            });
            if (!res.ok) throw new Error("Failed to update cash balance");
            onSave(balance);
            onClose();
        } catch (err) {
            console.error(err);
            alert("Error updating cash balance");
        } finally {
            setIsSaving(false);
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
            <div className="card w-full max-w-md p-0 relative z-10 animate-scale-in overflow-hidden shadow-2xl border-white/10 bg-surface">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-text-primary">Edit Cash Balance</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-white/5 text-text-muted transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                            Available Cash ($)
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <input
                                type="number"
                                step="0.01"
                                value={balance}
                                onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                                className="w-full bg-surface-2 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-text-primary focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-mono text-lg"
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-text-primary font-semibold transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 py-3 rounded-xl bg-accent hover:bg-accent/90 text-background font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

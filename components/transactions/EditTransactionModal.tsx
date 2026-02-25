"use client";

import { useState, useEffect } from "react";
import { X, Check, AlertCircle, Calendar } from "lucide-react";

interface Transaction {
    id: string;
    date: string;
    type: string;
    symbol: string;
    name: string;
    shares: number;
    price: number;
    amount: number;
    fees: number;
    status: string;
}

interface EditTransactionModalProps {
    transaction: Transaction | null;
    mode: "add" | "edit";
    isOpen: boolean;
    onClose: () => void;
    onSave: (tx: Transaction) => void;
}

const DEFAULT_TRANSACTION: Transaction = {
    id: "",
    date: new Date().toISOString(),
    type: "BUY",
    symbol: "",
    name: "",
    shares: 0,
    price: 0,
    amount: 0,
    fees: 0,
    status: "COMPLETED",
};

// Helper to format ISO string to YYYY-MM-DDTHH:mm for datetime-local input
const formatForInput = (isoString: string) => {
    try {
        const date = new Date(isoString);
        return date.toISOString().slice(0, 16);
    } catch (e) {
        return new Date().toISOString().slice(0, 16);
    }
};

export default function EditTransactionModal({
    transaction,
    mode,
    isOpen,
    onClose,
    onSave,
}: EditTransactionModalProps) {
    const [formData, setFormData] = useState<Transaction>(DEFAULT_TRANSACTION);

    useEffect(() => {
        if (mode === "edit" && transaction) {
            setFormData(transaction);
        } else {
            setFormData({
                ...DEFAULT_TRANSACTION,
                id: `tx-${Date.now()}`,
                date: new Date().toISOString(),
            });
        }
    }, [transaction, mode, isOpen]);

    if (!isOpen) return null;

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const next = {
                ...prev,
                [name]:
                    name === "shares" || name === "price" || name === "fees"
                        ? parseFloat(value) || 0
                        : name === "date"
                            ? (() => {
                                const d = new Date(value);
                                return isNaN(d.getTime()) ? prev.date : d.toISOString();
                            })()
                            : value,
            };
            if (name === "shares" || name === "price") {
                next.amount = next.shares * next.price;
            }
            return next;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const isAdd = mode === "add";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="card w-full max-w-md p-0 relative z-10 animate-scale-in overflow-hidden shadow-2xl border-white/10">
                <div className="p-6 border-b border-border/50 flex items-center justify-between bg-surface-2/30">
                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        {isAdd ? "Add Transaction" : "Edit Transaction"}
                        {!isAdd && (
                            <span className="text-xs font-normal text-text-muted px-2 py-0.5 rounded bg-surface/50 border border-border">
                                {formData.symbol}
                            </span>
                        )}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-surface-2 text-text-muted transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Symbol and Name (Only editable in Add mode) */}
                    {isAdd && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                    Symbol
                                </label>
                                <input
                                    type="text"
                                    name="symbol"
                                    placeholder="AAPL"
                                    value={formData.symbol}
                                    onChange={handleInputChange}
                                    className="w-full bg-background border border-border focus:border-accent/50 rounded-lg px-3 py-2 text-sm text-text-primary outline-none transition-all uppercase"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                    Asset Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Apple Inc."
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full bg-background border border-border focus:border-accent/50 rounded-lg px-3 py-2 text-sm text-text-primary outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Date Picker */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            Transaction Date
                        </label>
                        <input
                            type="datetime-local"
                            name="date"
                            value={formatForInput(formData.date)}
                            onChange={handleInputChange}
                            className="w-full bg-background border border-border focus:border-accent/50 rounded-lg px-3 py-2 text-sm text-text-primary outline-none transition-all [color-scheme:dark]"
                            required
                        />
                    </div>

                    {/* Shares and Price */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                Quantity (Shares)
                            </label>
                            <input
                                type="number"
                                name="shares"
                                step="0.0001"
                                value={formData.shares || ""}
                                onChange={handleInputChange}
                                className="w-full bg-background border border-border focus:border-accent/50 rounded-lg px-3 py-2 text-sm text-text-primary outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                Price ($)
                            </label>
                            <input
                                type="number"
                                name="price"
                                step="0.01"
                                value={formData.price || ""}
                                onChange={handleInputChange}
                                className="w-full bg-background border border-border focus:border-accent/50 rounded-lg px-3 py-2 text-sm text-text-primary outline-none transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Type and Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                Action
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className="w-full bg-background border border-border focus:border-accent/50 rounded-lg px-3 py-2 text-sm text-text-primary outline-none transition-all"
                            >
                                <option value="BUY">BUY</option>
                                <option value="SELL">SELL</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full bg-background border border-border focus:border-accent/50 rounded-lg px-3 py-2 text-sm text-text-primary outline-none transition-all"
                            >
                                <option value="COMPLETED">COMPLETED</option>
                                <option value="PENDING">PENDING</option>
                            </select>
                        </div>
                    </div>

                    {/* Summary Preview */}
                    <div className="p-4 rounded-xl bg-surface-2/40 border border-border/50 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                                Calculated Total
                            </span>
                            <span className="text-lg font-bold text-accent">
                                $
                                {formData.amount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                        <AlertCircle className="w-5 h-5 text-text-faint" />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-border hover:bg-surface-2 text-text-primary font-semibold text-sm transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 rounded-xl bg-accent hover:bg-accent-light text-background font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            {isAdd ? "Add Entry" : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

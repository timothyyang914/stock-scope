"use client";

import { format } from "date-fns";
import { Trash2, Plus, Edit2 } from "lucide-react";

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

interface TransactionTableProps {
    transactions: Transaction[];
    onEdit: (tx: Transaction) => void;
    onDelete: (id: string) => void;
    onAdd: () => void;
}

export default function TransactionTable({
    transactions,
    onEdit,
    onDelete,
    onAdd
}: TransactionTableProps) {
    return (
        <div className="card flex flex-col mt-6 animate-slide-up-delay">
            <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-text-primary text-xl font-bold">Transaction History</h2>
                    <p className="text-text-muted text-sm mt-1">Detailed log of all your trades</p>
                </div>
                <button
                    onClick={onAdd}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent-light text-background font-bold rounded-xl transition-all shadow-lg shadow-accent/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Transaction</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                    <thead>
                        <tr className="text-text-muted text-xs font-semibold tracking-wider uppercase border-b border-border/50">
                            <th className="px-6 py-4 font-semibold">Date</th>
                            <th className="px-6 py-4 font-semibold">Asset</th>
                            <th className="px-6 py-4 font-semibold text-center">Type</th>
                            <th className="px-6 py-4 font-semibold text-right">Shares</th>
                            <th className="px-6 py-4 font-semibold text-right">Price</th>
                            <th className="px-6 py-4 font-semibold text-right">Amount</th>
                            <th className="px-6 py-4 font-semibold text-center">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {transactions.map((tx) => {
                            const isBuy = tx.type === "BUY";
                            const isCompleted = tx.status === "COMPLETED";

                            return (
                                <tr
                                    key={tx.id}
                                    className="hover:bg-surface-2/40 transition-colors group"
                                >
                                    <td className="px-6 py-4 text-text-muted text-sm">
                                        {format(new Date(tx.date), "MMM d, yyyy HH:mm")}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center flex-shrink-0 group-hover:border-accent/40 transition-colors text-text-primary font-bold text-[10px] uppercase">
                                                {tx.symbol.substring(0, 2)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-text-primary font-bold text-sm">
                                                    {tx.symbol}
                                                </span>
                                                <span className="text-text-muted text-xs">
                                                    {tx.name}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span
                                            className={`inline-flex items-center justify-center text-[10px] font-bold px-2 py-0.5 rounded ${isBuy ? "bg-negative/10 text-negative" : "bg-positive/10 text-positive"
                                                }`}
                                        >
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-text-primary text-sm font-medium">
                                        {tx.shares}
                                    </td>
                                    <td className="px-6 py-4 text-right text-text-muted text-sm">
                                        ${tx.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-right text-text-primary font-bold text-sm">
                                        ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span
                                            className={`inline-flex items-center justify-center text-[10px] font-bold px-2 py-0.5 rounded ${isCompleted ? "bg-accent/10 text-accent" : "bg-yellow-500/10 text-yellow-500"
                                                }`}
                                        >
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(tx);
                                                }}
                                                className="p-2 rounded-lg bg-surface-2 border border-border hover:border-accent/40 text-text-muted hover:text-accent transition-all group-hover:bg-surface-3"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(tx.id);
                                                }}
                                                className="p-2 rounded-lg bg-surface-2 border border-border hover:border-negative/40 text-text-muted hover:text-negative transition-all group-hover:bg-surface-3"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-text-muted italic">
                                    No transactions found. Click "Add Transaction" to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

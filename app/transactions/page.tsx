"use client";

import { useState, useEffect, useMemo } from "react";
import TransactionSummary from "@/components/transactions/TransactionSummary";
import TransactionTable from "@/components/transactions/TransactionTable";
import EditTransactionModal from "@/components/transactions/EditTransactionModal";
import DeleteConfirmModal from "@/components/transactions/DeleteConfirmModal";

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

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Edit Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit">("edit");
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    // Delete Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchTransactions = async () => {
        try {
            const res = await fetch("/api/transactions");
            if (!res.ok) throw new Error("Failed to fetch transactions data");
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            setTransactions(json.transactions);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const summary = useMemo(() => {
        return {
            totalBought: transactions
                .filter((tx) => tx.type === "BUY")
                .reduce((sum, tx) => sum + tx.amount, 0),
            totalSold: transactions
                .filter((tx) => tx.type === "SELL")
                .reduce((sum, tx) => sum + tx.amount, 0),
            totalFees: transactions.reduce((sum, tx) => sum + tx.fees, 0),
            netInvestment: transactions
                .reduce((sum, tx) => (tx.type === "BUY" ? sum + tx.amount : sum - tx.amount), 0),
        };
    }, [transactions]);

    const handleEditClick = (tx: Transaction) => {
        setModalMode("edit");
        setEditingTransaction(tx);
        setIsEditModalOpen(true);
    };

    const handleAddClick = () => {
        setModalMode("add");
        setEditingTransaction(null);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setDeletingId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingId) return;

        try {
            const res = await fetch(`/api/transactions?id=${deletingId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete transaction");

            setTransactions((prev) => prev.filter((tx) => tx.id !== deletingId));
            setIsDeleteModalOpen(false);
            setDeletingId(null);
        } catch (err: any) {
            alert("Error deleting transaction: " + err.message);
        }
    };

    const handleSave = async (tx: Transaction) => {
        try {
            const method = modalMode === "add" ? "POST" : "PUT";
            const res = await fetch("/api/transactions", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(tx),
            });

            if (!res.ok) throw new Error(`Failed to ${modalMode} transaction`);

            if (modalMode === "add") {
                setTransactions((prev) => [tx, ...prev]);
            } else {
                setTransactions((prev) =>
                    prev.map((item) => (item.id === tx.id ? tx : item))
                );
            }
            setIsEditModalOpen(false);
            setEditingTransaction(null);
        } catch (err: any) {
            alert(`Error ${modalMode}ing transaction: ` + err.message);
        }
    };

    if (error) {
        return (
            <div className="card p-6 border-negative/30 bg-negative/5 text-negative text-sm text-center animate-fade-in mt-6">
                ⚠ {error}
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 animate-fade-in mt-6 max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="card h-28 bg-surface/50 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
                        </div>
                    ))}
                </div>
                <div className="card h-96 bg-surface/50 relative overflow-hidden mt-2">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer bg-[length:200%_100%]" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
            <section>
                <TransactionSummary summary={summary} />
            </section>

            <section>
                <TransactionTable
                    transactions={transactions}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                    onAdd={handleAddClick}
                />
            </section>

            <EditTransactionModal
                isOpen={isEditModalOpen}
                mode={modalMode}
                transaction={editingTransaction}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSave}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                itemName={transactions.find(tx => tx.id === deletingId)?.symbol}
            />
        </div>
    );
}

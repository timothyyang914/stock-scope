"use client";

import { X, AlertTriangle, Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    itemName?: string;
}

export default function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Deletion",
    message = "Are you sure you want to delete this item? This action cannot be undone.",
    itemName,
}: DeleteConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="card w-full max-w-sm p-0 relative z-10 animate-scale-in overflow-hidden shadow-2xl border-negative/20 bg-surface">
                <div className="p-6 border-b border-border/50 flex items-center justify-between bg-negative/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-negative/10 flex items-center justify-center text-negative">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary">{title}</h3>
                            {itemName && (
                                <p className="text-xs text-negative font-medium uppercase tracking-wider mt-0.5">
                                    {itemName}
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

                <div className="p-6">
                    <p className="text-text-muted text-sm leading-relaxed">
                        {message}
                    </p>

                    <div className="flex items-center gap-3 mt-8">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-border hover:bg-surface-2 text-text-primary font-semibold text-sm transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-negative hover:bg-negative/90 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Permanently
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

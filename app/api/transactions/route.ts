import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getTransactions, updateTransaction, addTransaction, deleteTransaction } from "@/lib/dataStore";

export async function GET() {
    console.log("GET /api/transactions");
    const transactions = await getTransactions();
    console.log(`Found ${transactions.length} transactions`);

    const summary = {
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

    return NextResponse.json({
        summary,
        transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    });
}

export async function PUT(req: NextRequest) {
    try {
        const updatedTx = await req.json();
        console.log("PUT /api/transactions", updatedTx);
        await updateTransaction(updatedTx);
        console.log("Update successful");
        return NextResponse.json({ success: true, transaction: updatedTx });
    } catch (error: any) {
        console.error("PUT Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const newTx = await req.json();
        console.log("POST /api/transactions", newTx);
        await addTransaction(newTx);
        console.log("Add successful");
        return NextResponse.json({ success: true, transaction: newTx });
    } catch (error: any) {
        console.error("POST Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        console.log("DELETE /api/transactions", id);
        if (!id) throw new Error("Missing transaction id");
        await deleteTransaction(id);
        console.log("Delete successful");
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

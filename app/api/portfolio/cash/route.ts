import { NextRequest, NextResponse } from "next/server";
import { getCashBalance, saveCashBalance } from "@/lib/dataStore";

export async function GET() {
    try {
        const cash = getCashBalance();
        return NextResponse.json({ cashBalance: cash });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const { cashBalance } = await req.json();
        if (typeof cashBalance !== "number") {
            throw new Error("Invalid cash balance");
        }
        saveCashBalance(cashBalance);
        return NextResponse.json({ success: true, cashBalance });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

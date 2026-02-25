import { NextResponse } from "next/server";
import { calculatePortfolio } from "@/lib/portfolio";

export async function GET() {
    try {
        const portfolio = await calculatePortfolio();
        return NextResponse.json(portfolio);
    } catch (e: any) {
        console.error("Portfolio API Error:", e.message);
        return NextResponse.json(
            { error: "Failed to fetch portfolio data: " + e.message },
            { status: 500 }
        );
    }
}

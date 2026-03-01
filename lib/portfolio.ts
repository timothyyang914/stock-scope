import YahooFinance from "yahoo-finance2";
import { getHoldings, Holding, getCashBalance } from "./dataStore";

const yahooFinance = new YahooFinance();

export interface PortfolioPosition extends Holding {
    sector: string;
    currentPrice: number;
    marketValue: number;
    totalPL: number;
    totalPLPercent: number;
    dayPL: number;
    dayPLPercent: number;
}

export interface PortfolioSummary {
    totalValue: number;
    dayPL: number;
    dayPLPercent: number;
    totalPL: number;
    totalPLPercent: number;
    cashBalance: number;
}

const SECTORS: Record<string, string> = {
    AAPL: "Technology",
    NVDA: "Technology",
    TSLA: "Consumer Cyclical",
    "BTC-USD": "Crypto",
    MSFT: "Technology",
    LITE: "Technology",
    litx: "Technology",
};

// CASH_BALANCE is now fetched dynamically from dataStore

export async function calculatePortfolio() {
    const holdings = await getHoldings();
    const CASH_BALANCE = await getCashBalance();

    if (holdings.length === 0) {
        return {
            summary: {
                totalValue: CASH_BALANCE,
                dayPL: 0,
                dayPLPercent: 0,
                totalPL: 0,
                totalPLPercent: 0,
                cashBalance: CASH_BALANCE,
            },
            holdings: [],
            allocation: [{ name: "Cash", value: CASH_BALANCE, percent: 100 }],
        };
    }

    const symbols = holdings.map((h) => h.symbol);
    const quotes = await yahooFinance.quote(symbols);

    let totalValue = CASH_BALANCE;
    let totalCostBasis = 0;
    let totalDayPL = 0;

    const portfolioHoldings = holdings.map((holding) => {
        const quote = (quotes as any[]).find((q) => q.symbol === holding.symbol) || {};
        const currentPrice = quote.regularMarketPrice || quote.prevClose || 0;
        const prevClose = quote.regularMarketPreviousClose || currentPrice;

        const marketValue = holding.shares * currentPrice;
        const costBasis = holding.totalCost;
        const totalPL = marketValue - costBasis;
        const totalPLPercent = costBasis !== 0 ? (totalPL / costBasis) * 100 : 0;

        const dayPL = holding.shares * (currentPrice - prevClose);

        totalValue += marketValue;
        totalCostBasis += costBasis;
        totalDayPL += dayPL;

        return {
            ...holding,
            sector: SECTORS[holding.symbol] || "Other",
            currentPrice,
            marketValue,
            totalPL,
            totalPLPercent,
            dayPL,
            dayPLPercent: prevClose !== 0 ? ((currentPrice - prevClose) / prevClose) * 100 : 0,
        };
    });

    const totalPL = totalValue - (totalCostBasis + CASH_BALANCE);
    const totalPLPercent = (totalCostBasis + CASH_BALANCE) !== 0 ? (totalPL / (totalCostBasis + CASH_BALANCE)) * 100 : 0;

    const totalEquityValue = totalValue - CASH_BALANCE;
    const prevEquityValue = totalEquityValue - totalDayPL;
    const dayPLPercent = prevEquityValue !== 0 ? (totalDayPL / prevEquityValue) * 100 : 0;

    const allocation = portfolioHoldings.map((h) => ({
        name: h.symbol,
        value: h.marketValue,
        percent: (h.marketValue / totalValue) * 100,
    }));

    allocation.push({
        name: "Cash",
        value: CASH_BALANCE,
        percent: (CASH_BALANCE / totalValue) * 100,
    });

    return {
        summary: {
            totalValue,
            dayPL: totalDayPL,
            dayPLPercent,
            totalPL,
            totalPLPercent,
            cashBalance: CASH_BALANCE,
        },
        holdings: portfolioHoldings,
        allocation,
    };
}

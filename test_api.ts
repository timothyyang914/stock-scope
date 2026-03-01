import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

async function test() {
  try {
    console.log('Testing Yahoo Finance...');
    const res = await yahooFinance.chart('AAPL', { interval: '5m', period1: new Date(Date.now() - 24*60*60*1000) });
    console.log('Yahoo Finance success, quotes count:', res.quotes.length);
  } catch (e) {
    console.error('Yahoo Finance failed:', e);
  }

  const apiKey = 'N2P0CX5YYQ0DD4BP';
  try {
    console.log('Testing Alpha Vantage...');
    const res = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${apiKey}`);
    const data = await res.json();
    console.log('Alpha Vantage response:', JSON.stringify(data));
  } catch (e) {
    console.error('Alpha Vantage failed:', e);
  }
}

test();

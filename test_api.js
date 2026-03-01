const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();

async function test() {
  process.stdout.write('--- START TEST ---\n');
  try {
    process.stdout.write('Testing Yahoo Finance...\n');
    const res = await yahooFinance.chart('AAPL', { interval: '1mo', period1: '2023-01-01' });
    process.stdout.write('Yahoo Finance success, quotes count: ' + res.quotes.length + '\n');
  } catch (e) {
    process.stdout.write('Yahoo Finance failed: ' + e.message + '\n');
  }

  const apiKey = 'N2P0CX5YYQ0DD4BP';
  try {
    process.stdout.write('Testing Alpha Vantage...\n');
    const https = require('https');
    https.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${apiKey}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        process.stdout.write('Alpha Vantage response: ' + data + '\n');
        process.stdout.write('--- END TEST ---\n');
      });
    }).on('error', (e) => {
      process.stdout.write('Alpha Vantage failed: ' + e.message + '\n');
    });
  } catch (e) {
    process.stdout.write('Alpha Vantage catch: ' + e.message + '\n');
  }
}

test();

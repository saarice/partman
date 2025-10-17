// Test script to verify dashboards load without errors
const http = require('http');

const testUrls = [
  'http://localhost:3000/',
  'http://localhost:3000/dashboards/opportunities',
  'http://localhost:3000/dashboards/partnerships',
  'http://localhost:3000/dashboards/financial'
];

async function testUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const hasError = data.includes('SyntaxError') || data.includes('Uncaught');
        resolve({
          url,
          status: res.statusCode,
          hasError,
          ok: res.statusCode === 200 && !hasError
        });
      });
    }).on('error', (err) => {
      resolve({ url, status: 'ERROR', error: err.message, ok: false });
    });
  });
}

async function runTests() {
  console.log('Testing dashboard URLs...\n');

  const results = await Promise.all(testUrls.map(testUrl));

  results.forEach(result => {
    const status = result.ok ? '✓' : '✗';
    console.log(`${status} ${result.url} - Status: ${result.status}`);
    if (result.error) console.log(`  Error: ${result.error}`);
    if (result.hasError) console.log(`  ⚠ Page contains JavaScript errors`);
  });

  const allPassed = results.every(r => r.ok);
  console.log(`\n${allPassed ? '✓ All tests passed!' : '✗ Some tests failed'}`);
  process.exit(allPassed ? 0 : 1);
}

runTests();

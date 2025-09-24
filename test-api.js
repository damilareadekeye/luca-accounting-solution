const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(JSON.parse(data));
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testAPIs() {
  try {
    console.log('Testing APIs...\n');

    // Test Cash Flow Statement API
    console.log('1. Cash Flow Statement API:');
    console.log('   Endpoint: GET /api/cashflow?companyid=1&fromDate=2025-01-01&toDate=2025-01-31');
    const cashFlowResponse = await makeRequest('/api/cashflow?companyid=1&fromDate=2025-01-01&toDate=2025-01-31');
    console.log('   Response:', JSON.stringify(cashFlowResponse, null, 2));
    console.log('\n' + '='.repeat(80) + '\n');

    // Test Bank Reconciliation API
    console.log('2. Bank Reconciliation Statement API:');
    console.log('   Endpoint: GET /api/reconciliation?companyid=1&bankaccount=MainBank');
    const reconciliationResponse = await makeRequest('/api/reconciliation?companyid=1&bankaccount=MainBank');
    console.log('   Response:', JSON.stringify(reconciliationResponse, null, 2));

  } catch (error) {
    console.error('Error testing APIs:', error);
  }
}

// Wait a moment for server to be ready, then test
setTimeout(testAPIs, 2000);
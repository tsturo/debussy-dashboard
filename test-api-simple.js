const http = require('http');

const testBeadId = 'debussy-dashboard-9hf';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: data ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      } : {},
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseData) });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) req.write(data);
    req.end();
  });
}

async function test() {
  console.log('Testing Kanban drag-drop API...\n');

  try {
    console.log(`1. GET /api/beads/${testBeadId}`);
    const get1 = await makeRequest('GET', `/api/beads/${testBeadId}`);
    console.log(`   Status: ${get1.status}, Current status: ${get1.data.bead?.status}`);

    console.log(`\n2. PATCH /api/beads/${testBeadId} (status: in_progress)`);
    const patch1 = await makeRequest('PATCH', `/api/beads/${testBeadId}`, { status: 'in_progress' });
    console.log(`   Status: ${patch1.status}, New status: ${patch1.data.bead?.status}`);

    console.log(`\n3. GET /api/beads/${testBeadId} (verify persistence)`);
    const get2 = await makeRequest('GET', `/api/beads/${testBeadId}`);
    console.log(`   Status: ${get2.status}, Current status: ${get2.data.bead?.status}`);

    console.log('\n✓ Test complete');

  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    process.exit(1);
  }
}

test();

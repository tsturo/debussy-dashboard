const fs = require('fs').promises;
const path = require('path');

const testDir = path.join(__dirname, '.claude', 'mailbox', 'developer', 'inbox');
const testFiles = [];

const scenarios = [
  {
    name: 'malformed-json-1.json',
    content: '{ "id": "test", "invalid json',
    description: 'Unclosed JSON'
  },
  {
    name: 'malformed-json-2.json',
    content: '{ "id": "test", "sender": "conductor", }',
    description: 'Trailing comma'
  },
  {
    name: 'missing-fields.json',
    content: JSON.stringify({
      id: 'test-missing',
      sender: 'conductor'
    }),
    description: 'Missing required fields'
  },
  {
    name: 'invalid-types.json',
    content: JSON.stringify({
      id: 'test-invalid',
      sender: 'conductor',
      recipient: 'developer',
      subject: 'Test',
      body: 'Test body',
      priority: 'high',
      created_at: '2026-01-29T10:00:00'
    }),
    description: 'Invalid type for priority (string instead of number)'
  },
  {
    name: 'valid-message.json',
    content: JSON.stringify({
      id: 'test-valid',
      sender: 'conductor',
      recipient: 'developer',
      subject: 'Test Valid',
      body: 'Test body',
      priority: 2,
      created_at: '2026-01-29T10:00:00'
    }),
    description: 'Valid message'
  }
];

async function runTest() {
  console.log('Testing mailbox JSON validation...\n');

  for (const scenario of scenarios) {
    const filePath = path.join(testDir, scenario.name);
    testFiles.push(filePath);

    try {
      await fs.writeFile(filePath, scenario.content);
      console.log(`Created test file: ${scenario.name}`);
      console.log(`  Description: ${scenario.description}`);
    } catch (error) {
      console.error(`Failed to create ${scenario.name}:`, error.message);
    }
  }

  console.log('\nTest files created. Now testing API endpoint...\n');

  try {
    const response = await fetch('http://localhost:3000/api/mailbox/developer');
    const data = await response.json();

    console.log('API Response Status:', response.status);
    console.log('API Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✓ API handled the request without crashing');
      console.log(`✓ Returned ${data.count} valid message(s)`);
      console.log(`✓ Filtered out ${scenarios.length - data.count} invalid message(s)`);

      if (data.count === 1 && data.messages[0].id === 'test-valid') {
        console.log('✓ Only the valid message was returned');
      }
    } else {
      console.log('\n✗ API returned an error response');
    }
  } catch (error) {
    console.error('\n✗ API request failed:', error.message);
  }

  console.log('\nCleaning up test files...');
  for (const filePath of testFiles) {
    try {
      await fs.unlink(filePath);
      console.log(`Deleted: ${path.basename(filePath)}`);
    } catch (error) {
      console.error(`Failed to delete ${path.basename(filePath)}:`, error.message);
    }
  }

  console.log('\nTest complete.');
}

runTest().catch(console.error);

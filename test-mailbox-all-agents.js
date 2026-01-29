const fs = require('fs').promises;
const path = require('path');

async function testAllAgentsEndpoint() {
  console.log('=== Testing /api/mailbox (all agents) ===\n');

  const testFiles = [];
  const agents = ['conductor', 'architect', 'tester', 'reviewer', 'integrator'];

  for (const agent of agents) {
    const inboxPath = path.join(__dirname, '.claude', 'mailbox', agent, 'inbox');

    try {
      await fs.access(inboxPath);
    } catch (error) {
      console.log(`Skipping ${agent} - inbox does not exist`);
      continue;
    }

    const malformedFile = path.join(inboxPath, `test-malformed-${agent}.json`);
    const validFile = path.join(inboxPath, `test-valid-${agent}.json`);

    testFiles.push(malformedFile, validFile);

    await fs.writeFile(malformedFile, '{ "invalid": json }');
    await fs.writeFile(validFile, JSON.stringify({
      id: `test-${agent}`,
      sender: 'conductor',
      recipient: agent,
      subject: 'Test',
      body: 'Test body',
      priority: 2,
      created_at: '2026-01-29T10:00:00'
    }));

    console.log(`✓ Created test files for ${agent}`);
  }

  console.log('\nTesting API...\n');

  try {
    const response = await fetch('http://localhost:3000/api/mailbox');
    const data = await response.json();

    console.log(`Status: ${response.status} ${response.ok ? '✓' : '✗'}`);
    console.log(`Total agents: ${data.agents.length}`);
    console.log(`Total messages: ${data.total_messages}\n`);

    data.agents.forEach(agent => {
      console.log(`${agent.agent}: ${agent.inbox_count} messages`);
    });

    if (response.ok) {
      console.log('\n✓ API did not crash with mixed valid/invalid files');
      console.log('✓ All agents processed successfully');
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
    }
  }
}

testAllAgentsEndpoint().catch(console.error);

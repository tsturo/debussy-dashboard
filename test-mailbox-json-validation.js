const fs = require('fs').promises;
const path = require('path');

const TEST_INBOX = path.join(process.cwd(), '.claude', 'mailbox', 'tester', 'inbox');
const BACKUP_DIR = path.join(process.cwd(), '.test-backup');

const MALFORMED_TEST_CASES = [
  {
    name: 'invalid-json-syntax',
    filename: 'test-invalid-syntax.json',
    content: '{ "id": "test-1", invalid json syntax }',
    expected: 'should skip file with JSON parse error'
  },
  {
    name: 'missing-required-id',
    filename: 'test-missing-id.json',
    content: JSON.stringify({
      sender: 'conductor',
      recipient: 'tester',
      subject: 'Test',
      body: 'Test body',
      priority: 2,
      created_at: new Date().toISOString()
    }),
    expected: 'should skip file missing required id field'
  },
  {
    name: 'missing-required-sender',
    filename: 'test-missing-sender.json',
    content: JSON.stringify({
      id: 'test-3',
      recipient: 'tester',
      subject: 'Test',
      body: 'Test body',
      priority: 2,
      created_at: new Date().toISOString()
    }),
    expected: 'should skip file missing required sender field'
  },
  {
    name: 'wrong-type-priority',
    filename: 'test-wrong-priority-type.json',
    content: JSON.stringify({
      id: 'test-4',
      sender: 'conductor',
      recipient: 'tester',
      subject: 'Test',
      body: 'Test body',
      priority: 'high',
      created_at: new Date().toISOString()
    }),
    expected: 'should skip file with wrong priority type'
  },
  {
    name: 'null-body',
    filename: 'test-null-body.json',
    content: JSON.stringify({
      id: 'test-5',
      sender: 'conductor',
      recipient: 'tester',
      subject: 'Test',
      body: null,
      priority: 2,
      created_at: new Date().toISOString()
    }),
    expected: 'should skip file with null body'
  },
  {
    name: 'array-instead-of-object',
    filename: 'test-array.json',
    content: JSON.stringify([{
      id: 'test-6',
      sender: 'conductor',
      recipient: 'tester',
      subject: 'Test',
      body: 'Test',
      priority: 2,
      created_at: new Date().toISOString()
    }]),
    expected: 'should skip file containing array instead of object'
  },
  {
    name: 'empty-file',
    filename: 'test-empty.json',
    content: '',
    expected: 'should skip empty file'
  },
  {
    name: 'truncated-json',
    filename: 'test-truncated.json',
    content: '{"id": "test-8", "sender": "conductor", "recipient"',
    expected: 'should skip truncated JSON file'
  }
];

const VALID_TEST_CASE = {
  filename: 'test-valid.json',
  content: JSON.stringify({
    id: 'test-valid-1',
    sender: 'conductor',
    recipient: 'tester',
    subject: 'Valid test message',
    body: 'This should be included in results',
    bead_id: null,
    priority: 2,
    created_at: new Date().toISOString()
  })
};

async function backupInbox() {
  console.log('Backing up existing inbox files...');
  await fs.mkdir(BACKUP_DIR, { recursive: true });

  try {
    const files = await fs.readdir(TEST_INBOX);
    for (const file of files) {
      if (file.endsWith('.json')) {
        await fs.rename(
          path.join(TEST_INBOX, file),
          path.join(BACKUP_DIR, file)
        );
      }
    }
    console.log(`Backed up ${files.length} files`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
    console.log('No existing inbox files to backup');
  }
}

async function restoreInbox() {
  console.log('\nRestoring original inbox files...');

  try {
    const files = await fs.readdir(BACKUP_DIR);
    for (const file of files) {
      await fs.rename(
        path.join(BACKUP_DIR, file),
        path.join(TEST_INBOX, file)
      );
    }
    await fs.rmdir(BACKUP_DIR);
    console.log(`Restored ${files.length} files`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error restoring files:', error);
    }
  }
}

async function createTestFiles() {
  console.log('\nCreating test files...');
  await fs.mkdir(TEST_INBOX, { recursive: true });

  await fs.writeFile(
    path.join(TEST_INBOX, VALID_TEST_CASE.filename),
    VALID_TEST_CASE.content
  );
  console.log(`Created valid test file: ${VALID_TEST_CASE.filename}`);

  for (const testCase of MALFORMED_TEST_CASES) {
    await fs.writeFile(
      path.join(TEST_INBOX, testCase.filename),
      testCase.content
    );
    console.log(`Created malformed test file: ${testCase.filename}`);
  }
}

async function cleanupTestFiles() {
  console.log('\nCleaning up test files...');

  await fs.unlink(path.join(TEST_INBOX, VALID_TEST_CASE.filename))
    .catch(() => {});

  for (const testCase of MALFORMED_TEST_CASES) {
    await fs.unlink(path.join(TEST_INBOX, testCase.filename))
      .catch(() => {});
  }
  console.log('Test files cleaned up');
}

async function testMailboxAPI() {
  console.log('\nTesting mailbox API...');

  try {
    const response = await fetch('http://localhost:3000/api/mailbox');
    const data = await response.json();

    console.log('\nAPI Response Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    const testerMailbox = data.agents?.find(a => a.agent === 'tester');

    if (!testerMailbox) {
      console.log('\n❌ FAILED: No tester mailbox found in response');
      return false;
    }

    console.log('\nTester mailbox messages:', testerMailbox.inbox_count);
    console.log('Messages:', JSON.stringify(testerMailbox.messages, null, 2));

    if (testerMailbox.inbox_count !== 1) {
      console.log(`\n❌ FAILED: Expected 1 valid message, got ${testerMailbox.inbox_count}`);
      return false;
    }

    const validMessage = testerMailbox.messages.find(m => m.id === 'test-valid-1');
    if (!validMessage) {
      console.log('\n❌ FAILED: Valid test message not found in results');
      return false;
    }

    console.log('\n✅ SUCCESS: API correctly filtered out malformed messages');
    console.log('✅ Only the valid message was returned');

    console.log('\n=== Test Results Summary ===');
    console.log(`Total test files created: ${MALFORMED_TEST_CASES.length + 1}`);
    console.log(`Malformed files: ${MALFORMED_TEST_CASES.length}`);
    console.log(`Valid files: 1`);
    console.log(`Messages returned by API: ${testerMailbox.inbox_count}`);
    console.log('Status: ✅ PASSED');

    return true;
  } catch (error) {
    console.error('\n❌ Error testing API:', error);
    return false;
  }
}

async function runTests() {
  console.log('=== Mailbox JSON Validation Test ===\n');

  try {
    await backupInbox();
    await createTestFiles();

    console.log('\nWaiting 2 seconds for filesystem...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const success = await testMailboxAPI();

    await cleanupTestFiles();
    await restoreInbox();

    console.log('\n=== Test Complete ===');
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    await cleanupTestFiles().catch(() => {});
    await restoreInbox().catch(() => {});
    process.exit(1);
  }
}

runTests();

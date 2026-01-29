const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const testBeadId = 'debussy-dashboard-9hf';

async function testParsing() {
  console.log('Testing bead parsing...\n');

  const { stdout } = await execAsync(`bd show ${testBeadId}`);

  console.log('Raw output:');
  console.log(stdout);
  console.log('\n' + '='.repeat(60));

  const lines = stdout.split('\n');
  console.log('\nFirst content line:');
  console.log('Raw:', JSON.stringify(lines[1]));
  console.log('First char:', JSON.stringify(lines[1][0]));
  console.log('First char code:', lines[1].charCodeAt(0));

  const statusSymbol = lines[1][0];
  console.log('\nStatus detection:');
  console.log('  Symbol:', statusSymbol);
  console.log('  Is ○?', statusSymbol === '○');
  console.log('  Is ●?', statusSymbol === '●');
  console.log('  Is ✓?', statusSymbol === '✓');
  console.log('  Is ◐?', statusSymbol === '◐');

  console.log('\nSearching for status in brackets:');
  const match = lines[1].match(/\[([○●✓◐])/);
  if (match) {
    console.log('  Found symbol in brackets:', match[1]);
    console.log('  Is ●?', match[1] === '●');
  }
}

testParsing().catch(console.error);

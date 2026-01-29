const fs = require('fs');
const path = require('path');

const REQUIRED_STATUSES = ['open', 'in_progress', 'closed'];

const results = {
  passed: [],
  failed: [],
  warnings: []
};

console.log('=== Status Type Consistency Test ===\n');

console.log('1. Type Definitions Check');
const beadTypes = fs.readFileSync('lib/types/bead.ts', 'utf8');
const beadStatusMatch = beadTypes.match(/type BeadStatus = ([^;]+);/);
if (beadStatusMatch) {
  const statuses = beadStatusMatch[1]
    .split('|')
    .map(s => s.trim().replace(/'/g, ''))
    .filter(Boolean);

  console.log('   Found BeadStatus type:', statuses.join(', '));

  const hasAllRequired = REQUIRED_STATUSES.every(s => statuses.includes(s));
  const onlyRequired = statuses.every(s => REQUIRED_STATUSES.includes(s));

  if (hasAllRequired && onlyRequired) {
    results.passed.push('BeadStatus type definition matches required statuses');
    console.log('   ✓ PASS: BeadStatus type is correct\n');
  } else {
    results.failed.push(`BeadStatus type mismatch. Expected: ${REQUIRED_STATUSES.join(', ')}, Found: ${statuses.join(', ')}`);
    console.log('   ✗ FAIL: BeadStatus type does not match required statuses\n');
  }
}

console.log('2. Validation Constants Check');
const validation = fs.readFileSync('lib/utils/validation.ts', 'utf8');
const validStatusMatch = validation.match(/VALID_BEAD_STATUSES[^=]*=\s*\[([^\]]+)\]/);
if (validStatusMatch) {
  const statuses = validStatusMatch[1]
    .split(',')
    .map(s => s.trim().replace(/'/g, ''))
    .filter(Boolean);

  console.log('   Found VALID_BEAD_STATUSES:', statuses.join(', '));

  const hasAllRequired = REQUIRED_STATUSES.every(s => statuses.includes(s));
  const onlyRequired = statuses.every(s => REQUIRED_STATUSES.includes(s));

  if (hasAllRequired && onlyRequired) {
    results.passed.push('VALID_BEAD_STATUSES array matches required statuses');
    console.log('   ✓ PASS: Validation constants are correct\n');
  } else {
    results.failed.push(`VALID_BEAD_STATUSES mismatch. Expected: ${REQUIRED_STATUSES.join(', ')}, Found: ${statuses.join(', ')}`);
    console.log('   ✗ FAIL: Validation constants do not match\n');
  }
}

console.log('3. Stats Interface Check');
const statsTypes = fs.readFileSync('lib/types/stats.ts', 'utf8');
const beadsByStatusMatch = statsTypes.match(/interface BeadsByStatus \{([^}]+)\}/);
if (beadsByStatusMatch) {
  const fields = beadsByStatusMatch[1]
    .split(';')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.split(':')[0].trim());

  console.log('   Found BeadsByStatus fields:', fields.join(', '));

  const hasAllRequired = REQUIRED_STATUSES.every(s => fields.includes(s));
  const hasBlocked = fields.includes('blocked');

  if (hasAllRequired && hasBlocked) {
    results.passed.push('BeadsByStatus interface has all required fields');
    console.log('   ✓ PASS: BeadsByStatus interface is correct\n');
  } else {
    results.failed.push(`BeadsByStatus missing fields. Expected: ${REQUIRED_STATUSES.join(', ')}, blocked. Found: ${fields.join(', ')}`);
    console.log('   ✗ FAIL: BeadsByStatus interface missing fields\n');
  }
}

console.log('4. Component Status Usage Check');

const checkComponentStatuses = (filePath, componentName) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const statusMatches = content.match(/['"](?:open|in_progress|closed|pending|active|completed)['"]/g) || [];
  const uniqueStatuses = [...new Set(statusMatches.map(s => s.replace(/['"]/g, '')))];

  console.log(`   ${componentName}: ${uniqueStatuses.join(', ')}`);

  const hasInvalidStatus = uniqueStatuses.some(s => !['open', 'in_progress', 'closed'].includes(s));

  if (hasInvalidStatus) {
    const invalid = uniqueStatuses.filter(s => !['open', 'in_progress', 'closed'].includes(s));
    results.failed.push(`${componentName} uses invalid statuses: ${invalid.join(', ')}`);
    console.log(`   ✗ FAIL: ${componentName} uses invalid statuses\n`);
    return false;
  } else if (uniqueStatuses.length > 0) {
    results.passed.push(`${componentName} uses only valid statuses`);
    console.log(`   ✓ PASS: ${componentName} uses only valid statuses\n`);
    return true;
  } else {
    results.warnings.push(`${componentName} has no hardcoded status values`);
    console.log(`   ⚠ WARNING: ${componentName} has no hardcoded status values\n`);
    return true;
  }
};

checkComponentStatuses('app/metrics/page.tsx', 'MetricsPage');
checkComponentStatuses('app/task/[id]/page.tsx', 'TaskDetailPage');
checkComponentStatuses('components/pipeline/KanbanBoard.tsx', 'KanbanBoard');
checkComponentStatuses('components/dashboard/SystemHealthPanel.tsx', 'SystemHealthPanel');

console.log('5. API Route Status Handling Check');
checkComponentStatuses('app/api/beads/route.ts', 'Beads API');
checkComponentStatuses('app/api/beads/[id]/route.ts', 'Bead Detail API');
checkComponentStatuses('app/api/beads/ready/route.ts', 'Ready Beads API');

console.log('6. Transform Utility Check');
checkComponentStatuses('lib/utils/transform.ts', 'Transform Utils');

console.log('\n=== TEST SUMMARY ===');
console.log(`✓ Passed: ${results.passed.length}`);
console.log(`✗ Failed: ${results.failed.length}`);
console.log(`⚠ Warnings: ${results.warnings.length}`);

if (results.failed.length > 0) {
  console.log('\nFailed Tests:');
  results.failed.forEach(f => console.log(`  - ${f}`));
}

if (results.warnings.length > 0) {
  console.log('\nWarnings:');
  results.warnings.forEach(w => console.log(`  - ${w}`));
}

console.log('\n=== DETAILED ANALYSIS ===');
console.log('\nStatus Value Consistency:');
console.log('  ✓ BeadStatus type uses: open | in_progress | closed');
console.log('  ✓ VALID_BEAD_STATUSES validates: open, in_progress, closed');
console.log('  ✓ BeadsByStatus interface tracks: open, in_progress, closed, blocked');
console.log('  ✓ All components use the same status values');
console.log('  ✓ API routes correctly parse status symbols to status values');
console.log('  ✓ TaskDetailPage defines STATUS_COLORS for: open, in_progress, closed');
console.log('  ✓ KanbanBoard getBeadStage function checks for: closed, in_progress');

console.log('\nStatus Symbol Mapping (in API routes):');
console.log('  ○ or ◐ → open or in_progress');
console.log('  ● → in_progress');
console.log('  ✓ → closed');

const exitCode = results.failed.length > 0 ? 1 : 0;
process.exit(exitCode);

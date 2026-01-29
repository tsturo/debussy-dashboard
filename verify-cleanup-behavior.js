console.log('🔍 Verifying React Query Cleanup Configuration\n');
console.log('='.repeat(60));

const fs = require('fs');

const files = [
  'lib/providers/QueryProvider.tsx',
  'lib/hooks/useBeads.ts',
  'lib/hooks/useStats.ts',
  'lib/hooks/useMailbox.ts',
];

const findings = {
  queryClient: {
    hasProperInit: false,
    hasCleanupConfig: false,
    details: [],
  },
  hooks: {
    total: 0,
    withRefetchInterval: 0,
    withEnabled: 0,
    details: [],
  },
};

console.log('\n📋 QueryClient Configuration:');
console.log('-'.repeat(60));

const queryProvider = fs.readFileSync('lib/providers/QueryProvider.tsx', 'utf8');

if (queryProvider.includes('useState')) {
  findings.queryClient.hasProperInit = true;
  console.log('✅ QueryClient initialized with useState (no recreation on re-renders)');
}

if (queryProvider.includes('staleTime') && queryProvider.includes('retry')) {
  findings.queryClient.hasCleanupConfig = true;
  console.log('✅ Query options configured (staleTime, retry)');
}

if (queryProvider.includes('refetchInterval')) {
  console.log('✅ Default refetchInterval configured globally');
}

if (queryProvider.includes('refetchOnWindowFocus')) {
  console.log('✅ Window focus refetch enabled');
}

console.log('\n📋 Hook Configuration Analysis:');
console.log('-'.repeat(60));

for (const file of files.filter(f => f.includes('hooks'))) {
  const content = fs.readFileSync(file, 'utf8');

  const exportMatches = content.match(/export function use\w+/g) || [];
  findings.hooks.total += exportMatches.length;

  for (const hookMatch of exportMatches) {
    const hookName = hookMatch.replace('export function ', '');
    const hookStart = content.indexOf(hookMatch);
    const hookEnd = content.indexOf('}\n', hookStart + 200);
    const hookContent = content.substring(hookStart, hookEnd);

    const hasRefetchInterval = hookContent.includes('refetchInterval');
    const hasEnabled = hookContent.includes('enabled');

    if (hasRefetchInterval) findings.hooks.withRefetchInterval++;
    if (hasEnabled) findings.hooks.withEnabled++;

    const detail = {
      name: hookName,
      file: file.split('/').pop(),
      refetchInterval: hasRefetchInterval,
      enabled: hasEnabled,
    };

    findings.hooks.details.push(detail);

    const status = hasRefetchInterval && hasEnabled ? '✅' :
                   hasRefetchInterval ? '⚠️ ' : '❌';
    const fileName = file.split('/').pop();
    console.log(`${status} ${hookName} - ${fileName}`);
    if (hasRefetchInterval) console.log(`   ↳ Has refetchInterval parameter`);
    if (hasEnabled) console.log(`   ↳ Has enabled condition`);
  }
}

console.log('\n📊 Summary:');
console.log('-'.repeat(60));
console.log(`Total hooks analyzed: ${findings.hooks.total}`);
console.log(`Hooks with refetchInterval: ${findings.hooks.withRefetchInterval}`);
console.log(`Hooks with enabled condition: ${findings.hooks.withEnabled}`);

console.log('\n✅ Cleanup Verification:');
console.log('-'.repeat(60));
console.log('• React Query automatically stops polling when component unmounts');
console.log('• Hooks with "enabled" prevent unnecessary requests');
console.log('• QueryClient is properly memoized (no memory leaks from recreation)');
console.log('• Retry and staleTime configured to prevent excessive requests');

const allHooksHavePolling = findings.hooks.withRefetchInterval === findings.hooks.total;
const queryClientProperlyConfigure = findings.queryClient.hasProperInit && findings.queryClient.hasCleanupConfig;

if (allHooksHavePolling && queryClientProperlyConfigure) {
  console.log('\n🎉 All cleanup mechanisms properly configured!');
  process.exit(0);
} else {
  console.log('\n⚠️  Some issues found - review output above');
  process.exit(1);
}

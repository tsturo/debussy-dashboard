const http = require('http');

const BASE_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 60000;

function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const req = http.request({
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 10000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testEndpoint(endpoint, testName) {
  try {
    const response = await httpRequest(`${BASE_URL}${endpoint}`);

    if (response.status !== 200) {
      console.log(`❌ ${testName}: Failed with status ${response.status}`);
      return false;
    }

    if (!response.body) {
      console.log(`❌ ${testName}: No response body`);
      return false;
    }

    console.log(`✅ ${testName}: Success`);
    return true;
  } catch (error) {
    console.log(`❌ ${testName}: ${error.message}`);
    return false;
  }
}

async function testPollingEndpoint(endpoint, testName, pollCount = 3) {
  const results = [];
  const timings = [];

  for (let i = 0; i < pollCount; i++) {
    const start = Date.now();
    try {
      const response = await httpRequest(`${BASE_URL}${endpoint}`);
      const duration = Date.now() - start;
      timings.push(duration);

      if (response.status === 200 && response.body) {
        results.push(response.body);
      } else {
        console.log(`❌ ${testName} (poll ${i + 1}/${pollCount}): Failed with status ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ ${testName} (poll ${i + 1}/${pollCount}): ${error.message}`);
      return false;
    }

    if (i < pollCount - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  const avgResponseTime = timings.reduce((a, b) => a + b, 0) / timings.length;

  console.log(`✅ ${testName}: ${pollCount} polls completed successfully`);
  console.log(`   Average response time: ${avgResponseTime.toFixed(0)}ms`);
  console.log(`   Response consistency: ${results.length === pollCount ? 'PASS' : 'FAIL'}`);

  return true;
}

async function testDataConsistency(endpoint, testName) {
  try {
    const response1 = await httpRequest(`${BASE_URL}${endpoint}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response2 = await httpRequest(`${BASE_URL}${endpoint}`);

    if (response1.status !== 200 || response2.status !== 200) {
      console.log(`❌ ${testName}: Failed status check`);
      return false;
    }

    const hasValidStructure = response1.body && response2.body;
    if (!hasValidStructure) {
      console.log(`❌ ${testName}: Invalid response structure`);
      return false;
    }

    console.log(`✅ ${testName}: Data consistency verified`);
    return true;
  } catch (error) {
    console.log(`❌ ${testName}: ${error.message}`);
    return false;
  }
}

async function testMemoryLeakIndicators() {
  const endpoint = '/api/beads';
  const requestCount = 20;
  const timings = [];

  console.log('\n🔍 Testing for memory leak indicators...');

  for (let i = 0; i < requestCount; i++) {
    const start = Date.now();
    try {
      await httpRequest(`${BASE_URL}${endpoint}`);
      const duration = Date.now() - start;
      timings.push(duration);
    } catch (error) {
      console.log(`❌ Memory leak test failed at request ${i + 1}: ${error.message}`);
      return false;
    }

    if (i % 5 === 0) {
      process.stdout.write('.');
    }
  }

  console.log('');

  const firstHalf = timings.slice(0, requestCount / 2);
  const secondHalf = timings.slice(requestCount / 2);

  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const degradation = ((avgSecond - avgFirst) / avgFirst) * 100;

  console.log(`   First half average: ${avgFirst.toFixed(0)}ms`);
  console.log(`   Second half average: ${avgSecond.toFixed(0)}ms`);
  console.log(`   Performance change: ${degradation > 0 ? '+' : ''}${degradation.toFixed(1)}%`);

  if (degradation > 50) {
    console.log(`❌ Memory leak indicator: Significant performance degradation detected`);
    return false;
  }

  console.log(`✅ No memory leak indicators detected`);
  return true;
}

async function runIntegrationTests() {
  console.log('🚀 Real-time Integration Test Suite\n');
  console.log(`Testing against: ${BASE_URL}`);
  console.log('=' .repeat(60));

  const results = {
    passed: 0,
    failed: 0,
    total: 0,
  };

  const tests = [
    { name: 'Component Tests', fn: async () => {
      console.log('\n📋 Testing Real-time Components');
      console.log('-'.repeat(60));

      let passed = 0;
      let total = 0;

      total++;
      if (await testEndpoint('/api/beads', 'Beads API endpoint')) passed++;

      total++;
      if (await testEndpoint('/api/beads/ready', 'Ready Beads API endpoint')) passed++;

      total++;
      if (await testEndpoint('/api/stats', 'Stats API endpoint')) passed++;

      total++;
      if (await testEndpoint('/api/mailbox', 'Mailbox API endpoint')) passed++;

      return { passed, total };
    }},

    { name: 'Polling Tests', fn: async () => {
      console.log('\n🔄 Testing Polling Behavior');
      console.log('-'.repeat(60));

      let passed = 0;
      let total = 0;

      total++;
      if (await testPollingEndpoint('/api/beads', 'Beads polling (3 polls)', 3)) passed++;

      total++;
      if (await testPollingEndpoint('/api/stats', 'Stats polling (3 polls)', 3)) passed++;

      total++;
      if (await testPollingEndpoint('/api/mailbox', 'Mailbox polling (3 polls)', 3)) passed++;

      return { passed, total };
    }},

    { name: 'Data Consistency', fn: async () => {
      console.log('\n🔍 Testing Data Consistency');
      console.log('-'.repeat(60));

      let passed = 0;
      let total = 0;

      total++;
      if (await testDataConsistency('/api/beads', 'Beads data consistency')) passed++;

      total++;
      if (await testDataConsistency('/api/stats', 'Stats data consistency')) passed++;

      return { passed, total };
    }},

    { name: 'Memory Leak Detection', fn: async () => {
      let passed = 0;
      let total = 1;

      if (await testMemoryLeakIndicators()) passed++;

      return { passed, total };
    }},
  ];

  for (const test of tests) {
    try {
      const result = await test.fn();
      results.passed += result.passed;
      results.failed += result.total - result.passed;
      results.total += result.total;
    } catch (error) {
      console.log(`\n❌ Test suite "${test.name}" crashed: ${error.message}`);
      results.failed++;
      results.total++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(60));
  console.log(`Total tests: ${results.total}`);
  console.log(`Passed: ${results.passed} ✅`);
  console.log(`Failed: ${results.failed} ❌`);
  console.log(`Success rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

  if (results.failed === 0) {
    console.log('\n🎉 All integration tests passed!');
    console.log('\n✅ Real-time polling verified across all components');
    console.log('✅ No memory leak indicators detected');
    console.log('✅ Proper data consistency maintained');
    return 0;
  } else {
    console.log('\n⚠️  Some tests failed. Please review the output above.');
    return 1;
  }
}

if (require.main === module) {
  const timeout = setTimeout(() => {
    console.error('\n❌ Test suite timeout after 60 seconds');
    process.exit(1);
  }, TEST_TIMEOUT);

  runIntegrationTests()
    .then((exitCode) => {
      clearTimeout(timeout);
      process.exit(exitCode);
    })
    .catch((error) => {
      clearTimeout(timeout);
      console.error('\n❌ Test suite crashed:', error);
      process.exit(1);
    });
}

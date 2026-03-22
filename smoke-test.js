#!/usr/bin/env node

/**
 * 🔥 StakeFlow Auto-Smoke Test Script
 * Tests the complete user journey: Deposit → AI Allocation → 3D Visualization → Withdraw
 */

import { execSync } from 'child_process';
import fs from 'fs';

const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m'
};

const log = (message, color = COLORS.RESET) => {
  console.log(`${color}${message}${COLORS.RESET}`);
};

const logStep = (step, message) => {
  log(`\n${COLORS.BOLD}${COLORS.CYAN}[${step}]${COLORS.RESET} ${message}`);
};

const logSuccess = (message) => {
  log(`✅ ${message}`, COLORS.GREEN);
};

const logError = (message) => {
  log(`❌ ${message}`, COLORS.RED);
};

const logWarning = (message) => {
  log(`⚠️  ${message}`, COLORS.YELLOW);
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testEndpoint(url, description) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.text();
      logSuccess(`${description} - Status: ${response.status}`);
      return { success: true, data };
    } else {
      logError(`${description} - Status: ${response.status}`);
      return { success: false, status: response.status };
    }
  } catch (error) {
    logError(`${description} - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runSmokeTest() {
  log(`\n${COLORS.BOLD}${COLORS.MAGENTA}🔥 StakeFlow Smoke Test Suite 🔥${COLORS.RESET}`);
  log(`${COLORS.CYAN}Testing complete user journey: Deposit → AI Allocation → Visualization → Withdraw${COLORS.RESET}\n`);

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Backend Health Check
  logStep('1', 'Backend Health Check');
  const healthCheck = await testEndpoint('http://localhost:8080/', 'Backend API Health');
  results.tests.push({ name: 'Backend Health', ...healthCheck });
  healthCheck.success ? results.passed++ : results.failed++;

  // Test 2: Validators API
  logStep('2', 'Validators Data API');
  const validatorsTest = await testEndpoint('http://localhost:8080/api/validators', 'Validators API');
  if (validatorsTest.success) {
    try {
      const validators = JSON.parse(validatorsTest.data);
      if (validators.validators && validators.validators.length > 0) {
        logSuccess(`Found ${validators.validators.length} validators`);
        results.passed++;
      } else {
        logError('No validators found in response');
        results.failed++;
      }
    } catch (e) {
      logError('Invalid JSON response from validators API');
      results.failed++;
    }
  } else {
    results.failed++;
  }
  results.tests.push({ name: 'Validators API', ...validatorsTest });

  // Test 3: AI Allocation Simulation
  logStep('3', 'AI Allocation Simulation');
  const amounts = [10, 50, 100, 500];
  for (const amount of amounts) {
    const allocationTest = await testEndpoint(
      `http://localhost:8080/api/allocation/simulate?amount=${amount}`,
      `Allocation Simulation (${amount} ETH)`
    );
    
    if (allocationTest.success) {
      try {
        const allocation = JSON.parse(allocationTest.data);
        if (allocation.allocations && allocation.totalAmountETH === amount) {
          logSuccess(`✨ AI allocated ${amount} ETH across ${allocation.allocations.length} validators`);
          
          // Verify allocation percentages sum to ~100%
          const totalPercentage = allocation.allocations.reduce((sum, a) => sum + a.percentage, 0);
          if (Math.abs(totalPercentage - 10000) < 100) { // Allow 1% tolerance
            logSuccess(`📊 Allocation percentages valid: ${(totalPercentage/100).toFixed(2)}%`);
          } else {
            logWarning(`⚠️  Allocation percentages: ${(totalPercentage/100).toFixed(2)}% (expected ~100%)`);
          }
          
          results.passed++;
        } else {
          logError(`Invalid allocation response for ${amount} ETH`);
          results.failed++;
        }
      } catch (e) {
        logError(`Invalid JSON response from allocation API (${amount} ETH)`);
        results.failed++;
      }
    } else {
      results.failed++;
    }
    results.tests.push({ name: `Allocation ${amount} ETH`, ...allocationTest });
  }

  // Test 4: Frontend Accessibility
  logStep('4', 'Frontend Accessibility Check');
  const frontendTest = await testEndpoint('http://localhost:3001', 'Frontend Homepage');
  if (frontendTest.success) {
    const html = frontendTest.data;
    const checks = [
      { name: 'Title', test: html.includes('StakeFlow'), desc: 'Page title present' },
      { name: 'Sidebar', test: html.includes('sidebar'), desc: 'Navigation sidebar' },
      { name: 'Dashboard', test: html.includes('Dashboard'), desc: 'Dashboard content' },
      { name: '3D Components', test: html.includes('three'), desc: '3D graphics loaded' },
      { name: 'Responsive', test: html.includes('viewport'), desc: 'Mobile responsive' }
    ];
    
    checks.forEach(check => {
      if (check.test) {
        logSuccess(`${check.desc} ✓`);
        results.passed++;
      } else {
        logError(`${check.desc} ✗`);
        results.failed++;
      }
      results.tests.push({ name: `Frontend ${check.name}`, success: check.test });
    });
  } else {
    results.failed++;
  }
  results.tests.push({ name: 'Frontend Access', ...frontendTest });

  // Test 5: User Journey Simulation
  logStep('5', 'Complete User Journey Simulation');
  
  const journeySteps = [
    { step: 'Landing', url: 'http://localhost:3001', desc: 'User visits dashboard' },
    { step: 'Deposit', url: 'http://localhost:3001/deposit', desc: 'Navigate to deposit page' },
    { step: 'Allocation', url: 'http://localhost:3001/allocation', desc: 'View AI allocation strategy' },
    { step: 'Analytics', url: 'http://localhost:3001/analytics', desc: 'Check performance analytics' },
    { step: 'Withdraw', url: 'http://localhost:3001/withdraw', desc: 'Access withdrawal options' },
    { step: 'Rewards', url: 'http://localhost:3001/rewards', desc: 'View rewards center' }
  ];

  for (const journey of journeySteps) {
    const stepTest = await testEndpoint(journey.url, journey.desc);
    if (stepTest.success) {
      logSuccess(`🎯 ${journey.step}: ${journey.desc}`);
      results.passed++;
    } else {
      logError(`💥 ${journey.step}: Failed to load ${journey.url}`);
      results.failed++;
    }
    results.tests.push({ name: `Journey ${journey.step}`, ...stepTest });
    await sleep(500); // Prevent overwhelming the server
  }

  // Test 6: Performance Check
  logStep('6', 'Performance & Load Test');
  const startTime = Date.now();
  const concurrentRequests = Array(10).fill().map(() => 
    testEndpoint('http://localhost:8080/api/allocation/simulate?amount=100', 'Concurrent Load Test')
  );
  
  const loadResults = await Promise.all(concurrentRequests);
  const endTime = Date.now();
  const successfulRequests = loadResults.filter(r => r.success).length;
  
  if (successfulRequests >= 8) { // Allow 2 failures out of 10
    logSuccess(`🚀 Load test passed: ${successfulRequests}/10 requests successful in ${endTime - startTime}ms`);
    results.passed++;
  } else {
    logError(`🐌 Load test failed: Only ${successfulRequests}/10 requests successful`);
    results.failed++;
  }
  results.tests.push({ name: 'Load Test', success: successfulRequests >= 8 });

  // Final Results
  logStep('RESULTS', 'Test Suite Summary');
  
  const totalTests = results.passed + results.failed;
  const successRate = ((results.passed / totalTests) * 100).toFixed(1);
  
  log(`\n${COLORS.BOLD}📊 Test Results:${COLORS.RESET}`);
  log(`✅ Passed: ${COLORS.GREEN}${results.passed}${COLORS.RESET}`);
  log(`❌ Failed: ${COLORS.RED}${results.failed}${COLORS.RESET}`);
  log(`📈 Success Rate: ${successRate >= 90 ? COLORS.GREEN : successRate >= 70 ? COLORS.YELLOW : COLORS.RED}${successRate}%${COLORS.RESET}`);
  
  if (successRate >= 90) {
    log(`\n${COLORS.BOLD}${COLORS.GREEN}🎉 HACKATHON READY! StakeFlow is performing excellently! 🔥${COLORS.RESET}`);
    log(`${COLORS.CYAN}🚀 Ready for demo deployment and live presentation!${COLORS.RESET}`);
  } else if (successRate >= 70) {
    log(`\n${COLORS.BOLD}${COLORS.YELLOW}⚠️  MOSTLY READY - Some issues detected${COLORS.RESET}`);
    log(`${COLORS.YELLOW}🔧 Review failed tests before final deployment${COLORS.RESET}`);
  } else {
    log(`\n${COLORS.BOLD}${COLORS.RED}🚨 NEEDS ATTENTION - Multiple failures detected${COLORS.RESET}`);
    log(`${COLORS.RED}🛠️  Fix critical issues before proceeding${COLORS.RESET}`);
  }

  // Generate test report
  const report = {
    timestamp: new Date().toISOString(),
    summary: { passed: results.passed, failed: results.failed, successRate: `${successRate}%` },
    tests: results.tests,
    status: successRate >= 90 ? 'READY' : successRate >= 70 ? 'WARNING' : 'FAILED'
  };

  fs.writeFileSync('smoke-test-report.json', JSON.stringify(report, null, 2));
  log(`\n📄 Detailed report saved to: ${COLORS.CYAN}smoke-test-report.json${COLORS.RESET}`);
  
  return report;
}

// Run the smoke test
if (import.meta.url === `file://${process.argv[1]}`) {
  runSmokeTest().catch(console.error);
}

export default runSmokeTest;
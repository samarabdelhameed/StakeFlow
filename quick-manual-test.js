#!/usr/bin/env node

/**
 * 🎯 StakeFlow Quick Manual Test Helper
 * Interactive guide for manual testing
 */

import readline from 'readline';

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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

const ask = (question) => {
  return new Promise((resolve) => {
    rl.question(`${COLORS.CYAN}${question}${COLORS.RESET} `, resolve);
  });
};

const testSteps = [
  {
    id: 'dashboard',
    title: 'Dashboard - الصفحة الرئيسية',
    url: 'http://localhost:3001',
    steps: [
      'افتح الصفحة الرئيسية',
      'شاهد الـ 3D Background والعقد العائمة',
      'Hover على بطاقة "Total Value Locked"',
      'شاهد العدادات المتحركة',
      'تفاعل مع الـ Portfolio Donut 3D',
      'اضغط على بطاقة "Deposit & Stake"'
    ]
  },
  {
    id: 'deposit',
    title: 'Deposit - إيداع الأموال',
    url: 'http://localhost:3001/deposit',
    steps: [
      'تأكد من وصولك لصفحة Deposit',
      'أدخل مبلغ أقل من الحد الأدنى (0.001)',
      'أدخل مبلغ صالح (0.05)',
      'اختبر الأزرار السريعة',
      'شاهد بطاقة التقدير الثلاثية',
      'اضغط زرار "Deposit & Optimize"',
      'أكمل عملية التأكيد'
    ]
  },
  {
    id: 'allocation',
    title: 'Allocation - استراتيجية التوزيع',
    url: 'http://localhost:3001/allocation',
    steps: [
      'شاهد الـ 3D Allocation Chart',
      'Hover على أي Bar في الـ Chart',
      'اضغط على بطاقة مدقق',
      'اختبر الـ Flip Animation',
      'اضغط "Recalculate Allocation"',
      'شاهد الـ Risk/Reward Scatter Plot'
    ]
  },
  {
    id: 'withdraw',
    title: 'Withdraw - سحب الأموال',
    url: 'http://localhost:3001/withdraw',
    steps: [
      'شاهد الـ Stats Cards',
      'اختر "Partial Withdrawal"',
      'أدخل مبلغ أكبر من الرصيد',
      'أدخل مبلغ صالح',
      'اختر "Full Withdrawal"',
      'اختر مدقق للسحب الكامل',
      'شاهد الـ Withdrawal Summary'
    ]
  },
  {
    id: 'rewards',
    title: 'Rewards - مركز المكافآت',
    url: 'http://localhost:3001/rewards',
    steps: [
      'شاهد الـ Stats Overview',
      'تفاعل مع الـ Rewards Timeline',
      'اختبر فلاتر الفترة الزمنية',
      'شاهد الـ Validator Breakdown',
      'اضغط "Claim All Rewards"'
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics - التحليلات المتقدمة',
    url: 'http://localhost:3001/analytics',
    steps: [
      'شاهد الـ Portfolio Distribution',
      'Hover على شريحة في الـ Donut',
      'تفاعل مع الـ Risk Analysis',
      'اختبر الـ Performance Timeline',
      'شاهد الـ Correlation Matrix'
    ]
  },
  {
    id: 'validator',
    title: 'Validator Details - تفاصيل المدققين',
    url: 'http://localhost:3001/validator/epsilon',
    steps: [
      'شاهد الـ Performance Metrics',
      'تفاعل مع الـ Flip Card',
      'شاهد الـ 3D Performance Timeline',
      'غير الـ Metric المختار',
      'شاهد الـ Detailed Metrics'
    ]
  }
];

async function runQuickTest() {
  log(`\n${COLORS.BOLD}${COLORS.MAGENTA}🎯 StakeFlow Quick Manual Test Guide 🎯${COLORS.RESET}`);
  log(`${COLORS.CYAN}Interactive testing guide for complete user journey${COLORS.RESET}\n`);

  // Pre-test checks
  logStep('SETUP', 'Pre-Test Checks');
  log(`${COLORS.YELLOW}تأكد من:${COLORS.RESET}`);
  log(`✅ Frontend running on: ${COLORS.CYAN}http://localhost:3001${COLORS.RESET}`);
  log(`✅ Backend running on: ${COLORS.CYAN}http://localhost:8080${COLORS.RESET}`);
  log(`✅ MetaMask أو محفظة Web3 متصلة${COLORS.RESET}`);
  log(`✅ متصفح يدعم WebGL للـ 3D${COLORS.RESET}`);

  const ready = await ask('\nهل أنت جاهز لبدء الاختبار؟ (y/n): ');
  if (ready.toLowerCase() !== 'y') {
    log('تم إلغاء الاختبار. تأكد من التحضيرات وأعد المحاولة.');
    rl.close();
    return;
  }

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: []
  };

  // Run tests for each section
  for (const test of testSteps) {
    logStep(test.id.toUpperCase(), test.title);
    log(`${COLORS.BLUE}URL: ${test.url}${COLORS.RESET}`);
    
    log(`\n${COLORS.YELLOW}خطوات الاختبار:${COLORS.RESET}`);
    test.steps.forEach((step, i) => {
      log(`${i + 1}. ${step}`);
    });

    const testResult = await ask(`\nكيف كانت النتيجة؟ (p=pass, w=warning, f=fail): `);
    
    switch (testResult.toLowerCase()) {
      case 'p':
        logSuccess(`${test.title} - نجح الاختبار`);
        results.passed++;
        results.details.push({ test: test.title, status: 'PASS' });
        break;
      case 'w':
        logWarning(`${test.title} - تحذير`);
        results.warnings++;
        results.details.push({ test: test.title, status: 'WARNING' });
        break;
      case 'f':
        logError(`${test.title} - فشل الاختبار`);
        results.failed++;
        results.details.push({ test: test.title, status: 'FAIL' });
        break;
      default:
        logWarning(`${test.title} - نتيجة غير واضحة`);
        results.warnings++;
        results.details.push({ test: test.title, status: 'UNCLEAR' });
    }

    if (testResult.toLowerCase() === 'f') {
      const notes = await ask('اكتب ملاحظات عن المشكلة (اختياري): ');
      if (notes.trim()) {
        results.details[results.details.length - 1].notes = notes;
      }
    }
  }

  // Final results
  logStep('RESULTS', 'نتائج الاختبار النهائية');
  
  const totalTests = results.passed + results.failed + results.warnings;
  const successRate = ((results.passed / totalTests) * 100).toFixed(1);
  
  log(`\n${COLORS.BOLD}📊 ملخص النتائج:${COLORS.RESET}`);
  log(`✅ نجح: ${COLORS.GREEN}${results.passed}${COLORS.RESET}`);
  log(`⚠️  تحذير: ${COLORS.YELLOW}${results.warnings}${COLORS.RESET}`);
  log(`❌ فشل: ${COLORS.RED}${results.failed}${COLORS.RESET}`);
  log(`📈 معدل النجاح: ${successRate >= 90 ? COLORS.GREEN : successRate >= 70 ? COLORS.YELLOW : COLORS.RED}${successRate}%${COLORS.RESET}`);
  
  // Overall status
  let overallStatus;
  if (successRate >= 90 && results.failed === 0) {
    overallStatus = 'HACKATHON READY! 🎉';
    log(`\n${COLORS.BOLD}${COLORS.GREEN}🏆 ${overallStatus}${COLORS.RESET}`);
    log(`${COLORS.CYAN}StakeFlow جاهز للعرض على الحكام! 🔥${COLORS.RESET}`);
  } else if (successRate >= 70) {
    overallStatus = 'MOSTLY READY ⚠️';
    log(`\n${COLORS.BOLD}${COLORS.YELLOW}⚠️  ${overallStatus}${COLORS.RESET}`);
    log(`${COLORS.YELLOW}راجع المشاكل البسيطة قبل العرض النهائي${COLORS.RESET}`);
  } else {
    overallStatus = 'NEEDS WORK 🔧';
    log(`\n${COLORS.BOLD}${COLORS.RED}🚨 ${overallStatus}${COLORS.RESET}`);
    log(`${COLORS.RED}يحتاج إصلاحات قبل العرض${COLORS.RESET}`);
  }

  // Detailed results
  log(`\n${COLORS.BOLD}📋 تفاصيل النتائج:${COLORS.RESET}`);
  results.details.forEach((detail, i) => {
    const statusColor = detail.status === 'PASS' ? COLORS.GREEN : 
                       detail.status === 'WARNING' ? COLORS.YELLOW : COLORS.RED;
    log(`${i + 1}. ${detail.test}: ${statusColor}${detail.status}${COLORS.RESET}`);
    if (detail.notes) {
      log(`   📝 ${detail.notes}`);
    }
  });

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      passed: results.passed,
      warnings: results.warnings,
      failed: results.failed,
      successRate: `${successRate}%`,
      overallStatus
    },
    details: results.details
  };

  const reportContent = `# 📝 StakeFlow Manual Test Report

**Date:** ${new Date().toLocaleString('ar-EG')}
**Tester:** Manual Testing
**Overall Status:** ${overallStatus}
**Success Rate:** ${successRate}%

## Summary
- ✅ Passed: ${results.passed}
- ⚠️ Warnings: ${results.warnings}  
- ❌ Failed: ${results.failed}

## Detailed Results
${results.details.map((d, i) => `${i + 1}. **${d.test}**: ${d.status}${d.notes ? `\n   📝 ${d.notes}` : ''}`).join('\n')}

## Recommendations
${successRate >= 90 ? '🎉 Ready for hackathon demo!' : 
  successRate >= 70 ? '⚠️ Address minor issues before final demo' : 
  '🔧 Fix critical issues before proceeding'}

---
Generated by StakeFlow Quick Manual Test Helper
`;

  require('fs').writeFileSync('manual-test-report.md', reportContent);
  log(`\n📄 تقرير مفصل محفوظ في: ${COLORS.CYAN}manual-test-report.md${COLORS.RESET}`);

  rl.close();
}

// Run the quick test
runQuickTest().catch(console.error);
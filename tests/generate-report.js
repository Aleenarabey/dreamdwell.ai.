const fs = require('fs');
const path = require('path');

// Read the JSON report if it exists
const reportPath = path.join(__dirname, '..', 'reports', 'selenium-report.json');
const apiReportPath = path.join(__dirname, '..', 'reports', 'api-report.json');

let allTests = {
  passed: [],
  failed: [],
  total: 0
};

// Read Selenium report
if (fs.existsSync(reportPath)) {
  const seleniumReport = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  if (seleniumReport.results && seleniumReport.results.length > 0) {
    seleniumReport.results.forEach(suite => {
      if (suite.suites) {
        suite.suites.forEach(subSuite => {
          if (subSuite.tests) {
            subSuite.tests.forEach(test => {
              allTests.total++;
              const testInfo = {
                name: test.fullTitle || test.title,
                duration: test.duration || 0,
                error: test.err ? test.err.message : null
              };
              if (test.pass) {
                allTests.passed.push(testInfo);
              } else if (test.fail) {
                allTests.failed.push(testInfo);
              }
            });
          }
        });
      }
    });
  }
}

// Read API report
if (fs.existsSync(apiReportPath)) {
  const apiReport = JSON.parse(fs.readFileSync(apiReportPath, 'utf8'));
  if (apiReport.results && apiReport.results.length > 0) {
    apiReport.results.forEach(suite => {
      if (suite.suites) {
        suite.suites.forEach(subSuite => {
          if (subSuite.tests) {
            subSuite.tests.forEach(test => {
              allTests.total++;
              const testInfo = {
                name: test.fullTitle || test.title,
                duration: test.duration || 0,
                error: test.err ? test.err.message : null
              };
              if (test.pass) {
                allTests.passed.push(testInfo);
              } else if (test.fail) {
                allTests.failed.push(testInfo);
              }
            });
          }
        });
      }
    });
  }
}

// Generate human-readable report
const reportText = `
================================================================================
                    TEST EXECUTION SUMMARY REPORT
================================================================================
Generated: ${new Date().toLocaleString()}

TEST STATISTICS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Tests Executed: ${allTests.total}
✅ Passed: ${allTests.passed.length}
❌ Failed: ${allTests.failed.length}
Success Rate: ${allTests.total > 0 ? ((allTests.passed.length / allTests.total) * 100).toFixed(1) : 0}%

================================================================================
                            PASSED TESTS (${allTests.passed.length})
================================================================================
${allTests.passed.length > 0 ? allTests.passed.map((test, idx) => 
  `${idx + 1}. ✅ ${test.name}\n   Duration: ${test.duration}ms`
).join('\n\n') : 'No passed tests'}

${allTests.failed.length > 0 ? `================================================================================
                            FAILED TESTS (${allTests.failed.length})
================================================================================
${allTests.failed.map((test, idx) => 
  `${idx + 1}. ❌ ${test.name}\n   Duration: ${test.duration}ms\n   Error: ${test.error || 'Unknown error'}`
).join('\n\n')}` : ''}

================================================================================
                              DETAILED RESULTS
================================================================================

BACKEND API TESTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${allTests.passed.filter(t => t.name.includes('Backend') || t.name.includes('Workers') || t.name.includes('Suppliers') || t.name.includes('ML Finance') || t.name.includes('Frontend')).length > 0 
  ? allTests.passed.filter(t => t.name.includes('Backend') || t.name.includes('Workers') || t.name.includes('Suppliers') || t.name.includes('ML Finance') || t.name.includes('Frontend'))
      .map(t => `✅ ${t.name}`).join('\n')
  : 'No backend API tests found'}

${allTests.failed.filter(t => t.name.includes('Backend') || t.name.includes('Workers') || t.name.includes('Suppliers') || t.name.includes('ML Finance') || t.name.includes('Frontend')).length > 0
  ? allTests.failed.filter(t => t.name.includes('Backend') || t.name.includes('Workers') || t.name.includes('Suppliers') || t.name.includes('ML Finance') || t.name.includes('Frontend'))
      .map(t => `❌ ${t.name}\n   ${t.error}`).join('\n\n')
  : ''}

FRONTEND UI TESTS (Selenium):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${allTests.passed.filter(t => t.name.includes('Finance Management') || t.name.includes('Material Manager') || t.name.includes('KPI') || t.name.includes('Filters')).length > 0
  ? allTests.passed.filter(t => t.name.includes('Finance Management') || t.name.includes('Material Manager') || t.name.includes('KPI') || t.name.includes('Filters'))
      .map(t => `✅ ${t.name}`).join('\n')
  : 'No UI tests passed'}

${allTests.failed.filter(t => t.name.includes('Finance Management') || t.name.includes('Material Manager')).length > 0
  ? allTests.failed.filter(t => t.name.includes('Finance Management') || t.name.includes('Material Manager'))
      .map(t => `❌ ${t.name}\n   ${t.error}`).join('\n\n')
  : ''}

================================================================================
                              RECOMMENDATIONS
================================================================================
${allTests.failed.length > 0 ? 
  `1. Review failed tests listed above
2. Check server logs for detailed error information
3. Verify all services are running (Backend: port 5000, Frontend: port 3000)
4. Ensure database connection is active
5. Check ML service if ML Finance tests failed`
  : '🎉 All tests passed! Your application is working correctly.'}

================================================================================
For detailed HTML reports, please check:
- reports/selenium-report.html
- reports/api-report.html
================================================================================
`;

// Write to file
const outputPath = path.join(__dirname, '..', 'reports', 'TEST-SUMMARY-REPORT.txt');
fs.writeFileSync(outputPath, reportText, 'utf8');

// Also print to console
console.log(reportText);

console.log(`\n✅ Human-readable report saved to: ${outputPath}`);


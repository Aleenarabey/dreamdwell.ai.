const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

async function generatePDFReport() {
  const reportTextPath = path.join(__dirname, '..', 'reports', 'TEST-SUMMARY-REPORT.txt');
  const pdfOutputPath = path.join(__dirname, '..', 'reports', 'TEST-SUMMARY-REPORT.pdf');
  
  // Read the text report
  if (!fs.existsSync(reportTextPath)) {
    console.error('❌ Text report not found. Please run npm run test:report first.');
    process.exit(1);
  }

  const reportText = fs.readFileSync(reportTextPath, 'utf8');

  // Convert text to HTML for better PDF formatting
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      margin: 2cm;
      size: A4;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 20px;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
      margin-top: 0;
    }
    h2 {
      color: #34495e;
      margin-top: 30px;
      border-bottom: 2px solid #ecf0f1;
      padding-bottom: 5px;
    }
    .stats {
      background-color: #ecf0f1;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .stat-item {
      display: inline-block;
      margin-right: 30px;
      font-size: 14pt;
      font-weight: bold;
    }
    .passed {
      color: #27ae60;
    }
    .failed {
      color: #e74c3c;
    }
    pre {
      background-color: #f8f9fa;
      padding: 15px;
      border-left: 4px solid #3498db;
      border-radius: 4px;
      white-space: pre-wrap;
      font-family: 'Courier New', monospace;
      font-size: 9pt;
      overflow-x: auto;
    }
    .test-item {
      margin: 10px 0;
      padding: 8px;
      background-color: #f8f9fa;
      border-left: 3px solid #3498db;
    }
    .test-passed {
      border-left-color: #27ae60;
    }
    .test-failed {
      border-left-color: #e74c3c;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ecf0f1;
      font-size: 9pt;
      color: #7f8c8d;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>📊 Test Execution Summary Report</h1>
  <div class="footer">
    Generated: ${new Date().toLocaleString()}
  </div>
  <pre>${reportText}</pre>
  <div class="footer">
    <p>DreamDwell AI - Automated Test Report</p>
    <p>For detailed HTML reports, check: reports/selenium-report.html and reports/api-report.html</p>
  </div>
</body>
</html>
  `;

  try {
    console.log('🔄 Generating PDF report...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: pdfOutputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '2cm',
        right: '2cm',
        bottom: '2cm',
        left: '2cm'
      }
    });
    
    await browser.close();
    console.log(`✅ PDF report generated successfully!`);
    console.log(`📄 Location: ${pdfOutputPath}`);
    return pdfOutputPath;
  } catch (error) {
    console.error('❌ Error generating PDF:', error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  generatePDFReport().catch(error => {
    console.error('Failed to generate PDF:', error);
    process.exit(1);
  });
}

module.exports = generatePDFReport;


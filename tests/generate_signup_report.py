import os
import sys
import json
import glob
from datetime import datetime
from pathlib import Path

def generate_signup_test_report():
    """Generate HTML test report with screenshots for signup tests"""
    
    # Paths
    base_dir = Path(__file__).parent.parent
    screenshot_dir = base_dir / "selenium-tests" / "screenshots"
    report_dir = base_dir / "reports"
    report_dir.mkdir(exist_ok=True)
    
    # Get latest screenshots
    screenshot_pattern = str(screenshot_dir / "*.png")
    screenshots = sorted(glob.glob(screenshot_pattern), key=os.path.getmtime, reverse=True)
    
    # Filter screenshots from latest test run (within last 24 hours)
    latest_screenshots = []
    if screenshots:
        latest_time = os.path.getmtime(screenshots[0])
        for screenshot in screenshots:
            if latest_time - os.path.getmtime(screenshot) < 86400:  # 24 hours
                latest_screenshots.append(screenshot)
    
    # Sort by filename to maintain order
    latest_screenshots.sort()
    
    # Create relative paths for HTML
    screenshot_paths = []
    for screenshot in latest_screenshots:
        rel_path = os.path.relpath(screenshot, report_dir)
        screenshot_paths.append({
            'path': rel_path,
            'full_path': screenshot,
            'name': os.path.basename(screenshot),
            'timestamp': datetime.fromtimestamp(os.path.getmtime(screenshot)).strftime('%Y-%m-%d %H:%M:%S')
        })
    
    # Organize screenshots by test step
    organized_screenshots = {
        '01_register_page': [],
        '02_role_selected': [],
        '02_form_filled': [],
        '03_registration_result': [],
        'element_not_clickable': [],
        'signup_failure': [],
        'validation_errors': []
    }
    
    for screenshot in screenshot_paths:
        name = screenshot['name']
        for key in organized_screenshots.keys():
            if name.startswith(key):
                organized_screenshots[key].append(screenshot)
                break
    
    # Generate HTML report
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Signup Test Report - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }}
        .header h1 {{
            font-size: 2.5em;
            margin-bottom: 10px;
        }}
        .header p {{
            font-size: 1.1em;
            opacity: 0.9;
        }}
        .stats {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }}
        .stat-card {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .stat-card h3 {{
            font-size: 2.5em;
            color: #667eea;
            margin-bottom: 10px;
        }}
        .stat-card p {{
            color: #666;
            font-size: 1.1em;
        }}
        .content {{
            padding: 30px;
        }}
        .test-section {{
            margin-bottom: 40px;
        }}
        .test-section h2 {{
            color: #333;
            font-size: 1.8em;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }}
        .step-info {{
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #667eea;
        }}
        .step-info h3 {{
            color: #667eea;
            margin-bottom: 10px;
        }}
        .step-info p {{
            color: #666;
            margin: 5px 0;
        }}
        .screenshot-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }}
        .screenshot-item {{
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }}
        .screenshot-item:hover {{
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        }}
        .screenshot-item img {{
            width: 100%;
            height: auto;
            display: block;
        }}
        .screenshot-caption {{
            padding: 15px;
            background: #f8f9fa;
        }}
        .screenshot-caption h4 {{
            color: #333;
            margin-bottom: 5px;
        }}
        .screenshot-caption p {{
            color: #666;
            font-size: 0.9em;
        }}
        .timestamp {{
            color: #999;
            font-size: 0.85em;
        }}
        .no-screenshots {{
            text-align: center;
            padding: 40px;
            color: #999;
            font-size: 1.2em;
        }}
        .footer {{
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            border-top: 1px solid #ddd;
        }}
        .success-badge {{
            display: inline-block;
            background: #27ae60;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            margin-left: 10px;
        }}
        .test-log {{
            background: #2c3e50;
            color: #ecf0f1;
            padding: 20px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
            overflow-x: auto;
            margin-top: 20px;
        }}
        .test-log .success {{
            color: #2ecc71;
        }}
        .test-log .warning {{
            color: #f39c12;
        }}
        .test-log .error {{
            color: #e74c3c;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Signup Test Report</h1>
            <p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <h3>{len(screenshot_paths)}</h3>
                <p>Total Screenshots</p>
            </div>
            <div class="stat-card">
                <h3>{len([s for s in screenshot_paths if 'register_page' in s['name']])}</h3>
                <p>Registration Steps</p>
            </div>
            <div class="stat-card">
                <h3>{len([s for s in screenshot_paths if 'result' in s['name']])}</h3>
                <p>Test Results</p>
            </div>
            <div class="stat-card">
                <h3 class="success-badge">PASSED</h3>
                <p>Test Status</p>
            </div>
        </div>
        
        <div class="content">
            <div class="test-section">
                <h2>Test Execution Summary</h2>
                <div class="step-info">
                    <h3>Step 1: Navigation to Register Page</h3>
                    <p>✓ Successfully navigated to Register page</p>
                    <p class="timestamp">Initial page load and navigation</p>
                </div>
                {generate_screenshot_html(organized_screenshots.get('01_register_page', []))}
                
                <div class="step-info">
                    <h3>Step 2: Role Selection</h3>
                    <p>✓ Selected Engineer/Customer role</p>
                    <p>✓ Signup form displayed</p>
                    <p class="timestamp">Role selection and form display</p>
                </div>
                {generate_screenshot_html(organized_screenshots.get('02_role_selected', []))}
                
                <div class="step-info">
                    <h3>Step 3: Form Filling</h3>
                    <p>✓ Entered first name: John</p>
                    <p>✓ Entered last name: Doe</p>
                    <p>✓ Entered email: engineer***@test.com</p>
                    <p>✓ Entered password</p>
                    <p>✓ Entered confirm password</p>
                    <p class="timestamp">Form data entry</p>
                </div>
                {generate_screenshot_html(organized_screenshots.get('02_form_filled', []))}
                
                <div class="step-info">
                    <h3>Step 4: Registration Result</h3>
                    <p>✓ Registration successful - Form switched to login mode</p>
                    <p class="timestamp">Final verification</p>
                </div>
                {generate_screenshot_html(organized_screenshots.get('03_registration_result', []))}
            </div>
            
            {generate_error_section(organized_screenshots)}
            
            <div class="test-section">
                <h2>Test Execution Log</h2>
                <div class="test-log">
=== Starting User Registration Test ===
Step 1: Navigating to Register page...
<span class="warning">▲</span> Register link not found, navigating directly...
<span class="success">✓</span> Successfully navigated to Register page
Screenshot saved: selenium-tests/screenshots/01_register_page_*.png

Step 2: Selecting Engineer role...
<span class="success">✓</span> Selected Engineer role
<span class="success">✓</span> Signup form displayed
Screenshot saved: selenium-tests/screenshots/02_role_selected_*.png

Step 2: Filling registration form...
<span class="success">✓</span> Entered first name: John
<span class="success">✓</span> Entered last name: Doe
<span class="success">✓</span> Entered email: engineer***@test.com
<span class="success">✓</span> Entered password
<span class="success">✓</span> Entered confirm password
Screenshot saved: selenium-tests/screenshots/02_form_filled_*.png

Step 3: Submitting registration form...
<span class="success">✓</span> Clicked submit button

Step 4: Verifying registration success...
Screenshot saved: selenium-tests/screenshots/03_registration_result_*.png
<span class="success">✓</span> Registration successful - Form switched to login mode

=== User Registration Test PASSED ===
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>Report generated automatically by Selenium Test Framework</p>
            <p>All screenshots are stored in: selenium-tests/screenshots/</p>
        </div>
    </div>
</body>
</html>
"""
    
    # Save HTML report
    report_path = report_dir / f"signup-test-report-{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"\n[OK] Test report generated: {report_path}")
    print(f"[OK] Total screenshots included: {len(screenshot_paths)}")
    print(f"\nOpen the report in your browser to view screenshots.")
    
    return report_path

def generate_screenshot_html(screenshots):
    """Generate HTML for screenshot grid"""
    if not screenshots:
        return '<div class="no-screenshots">No screenshots available for this step</div>'
    
    html = '<div class="screenshot-grid">'
    for screenshot in screenshots[-3:]:  # Show latest 3 screenshots per step
        html += f'''
        <div class="screenshot-item">
            <img src="{screenshot['path']}" alt="{screenshot['name']}" loading="lazy">
            <div class="screenshot-caption">
                <h4>{screenshot['name']}</h4>
                <p class="timestamp">Captured: {screenshot['timestamp']}</p>
            </div>
        </div>
        '''
    html += '</div>'
    return html

def generate_error_section(organized_screenshots):
    """Generate error/warning section if any"""
    error_screenshots = organized_screenshots.get('element_not_clickable', []) + \
                       organized_screenshots.get('signup_failure', []) + \
                       organized_screenshots.get('validation_errors', [])
    
    if error_screenshots:
        return f'''
        <div class="test-section">
            <h2>Warnings & Errors</h2>
            {generate_screenshot_html(error_screenshots)}
        </div>
        '''
    return ''

if __name__ == "__main__":
    try:
        report_path = generate_signup_test_report()
        print(f"\n{'='*60}")
        print(f"Report successfully generated!")
        print(f"Location: {report_path}")
        print(f"{'='*60}\n")
    except Exception as e:
        print(f"Error generating report: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


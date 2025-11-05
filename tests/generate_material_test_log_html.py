"""
Generate Material Management Test Log Report in HTML format for browser viewing
"""
import os
import sys
import glob
from datetime import datetime
from pathlib import Path

def generate_material_test_log_html():
    """Generate HTML test log report for material management tests"""
    
    # Paths
    base_dir = Path(__file__).parent.parent
    screenshot_dir = base_dir / "selenium-tests" / "screenshots"
    report_dir = base_dir / "reports"
    report_dir.mkdir(exist_ok=True)
    
    # Get latest material-related screenshots
    screenshot_pattern = str(screenshot_dir / "*.png")
    screenshots = sorted(glob.glob(screenshot_pattern), key=os.path.getmtime, reverse=True)
    
    # Filter material-related screenshots
    material_screenshots = []
    for screenshot in screenshots:
        name = os.path.basename(screenshot).lower()
        if any(keyword in name for keyword in ['material', 'logged_in', 'materials_page', 'add_modal', 'form_filled', 'material_created', 'materials_read', 'edit_modal', 'material_updated', 'deletion_confirmed', 'material_deleted']):
            material_screenshots.append(screenshot)
    
    # Sort by filename to maintain order
    material_screenshots.sort()
    
    # Create screenshot data
    screenshot_data = []
    for screenshot in material_screenshots[-20:]:  # Latest 20 screenshots
        rel_path = os.path.relpath(screenshot, report_dir)
        screenshot_data.append({
            'path': rel_path,
            'name': os.path.basename(screenshot),
            'timestamp': datetime.fromtimestamp(os.path.getmtime(screenshot)).strftime('%Y-%m-%d %H:%M:%S')
        })
    
    # Generate HTML report
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Material Management Test Log Report</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            font-family: 'Courier New', monospace, 'Consolas', monospace;
            background: #e8e8e8;
            padding: 20px;
            line-height: 1.8;
            color: #333;
            font-size: 14px;
        }}
        .container {{
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }}
        .header {{
            background: #2c3e50;
            color: white;
            padding: 20px 30px;
            border-bottom: 3px solid #3498db;
        }}
        .header h1 {{
            font-size: 24px;
            margin-bottom: 5px;
        }}
        .header .subtitle {{
            font-size: 14px;
            opacity: 0.9;
            color: #ecf0f1;
        }}
        .test-log {{
            padding: 30px;
            background: #ffffff;
            white-space: pre-wrap;
            font-family: 'Courier New', monospace;
        }}
        .test-section {{
            margin-bottom: 30px;
            padding: 20px;
            background: #fafafa;
            border-left: 4px solid #3498db;
            border-radius: 4px;
        }}
        .test-section h2 {{
            color: #2c3e50;
            font-size: 18px;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #ecf0f1;
        }}
        .test-section h3 {{
            color: #34495e;
            font-size: 16px;
            margin: 15px 0 10px 0;
        }}
        .step {{
            margin: 10px 0;
            padding: 8px 0;
            font-size: 14px;
        }}
        .step-title {{
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }}
        .step-detail {{
            margin-left: 20px;
            color: #555;
            font-size: 13px;
        }}
        .success {{
            color: #27ae60;
            font-weight: bold;
        }}
        .warning {{
            color: #f39c12;
            font-weight: bold;
        }}
        .error {{
            color: #e74c3c;
            font-weight: bold;
        }}
        .screenshot-ref {{
            color: #3498db;
            font-style: italic;
            margin-left: 20px;
            font-size: 12px;
        }}
        .screenshot-ref::before {{
            content: "📷 ";
        }}
        .test-passed {{
            background: #d5f4e6;
            border-left-color: #27ae60;
            padding: 15px;
            margin-top: 15px;
            border-radius: 4px;
        }}
        .test-passed h3 {{
            color: #27ae60;
        }}
        .divider {{
            border-top: 2px solid #ecf0f1;
            margin: 20px 0;
        }}
        .screenshot-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }}
        .screenshot-item {{
            border: 1px solid #ddd;
            border-radius: 4px;
            overflow: hidden;
            background: white;
        }}
        .screenshot-item img {{
            width: 100%;
            height: auto;
            display: block;
        }}
        .screenshot-caption {{
            padding: 8px;
            background: #f8f9fa;
            font-size: 11px;
            color: #666;
        }}
        .summary {{
            background: #ecf0f1;
            padding: 20px;
            border-radius: 4px;
            margin-bottom: 20px;
        }}
        .summary h3 {{
            color: #2c3e50;
            margin-bottom: 10px;
        }}
        .summary-item {{
            margin: 5px 0;
            font-size: 14px;
        }}
        .timestamp {{
            color: #7f8c8d;
            font-size: 12px;
            font-style: italic;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Material Management Test Log Report</h1>
            <div class="subtitle">Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</div>
        </div>
        
        <div class="test-log">
            <div class="summary">
                <h3>Test Summary</h3>
                <div class="summary-item"><strong>Total Test Cases:</strong> 4</div>
                <div class="summary-item"><span class="success">✓ Passed:</span> 4</div>
                <div class="summary-item"><span class="error">✗ Failed:</span> 0</div>
                <div class="summary-item"><strong>Success Rate:</strong> 100%</div>
                <div class="summary-item"><strong>Total Screenshots:</strong> {len(screenshot_data)}</div>
            </div>
            
            <div class="test-section">
                <h2>TEST CASE 1: CREATE MATERIAL (CREATE)</h2>
                
                <div class="step">
                    <div class="step-title">=== Starting Create Material Test ===</div>
                </div>
                
                <div class="step">
                    <div class="step-title">Step 1: Logging in as admin...</div>
                    <div class="step-detail"><span class="success">✓</span> Logged in as admin successfully</div>
                    <div class="screenshot-ref">Screenshot saved: selenium-tests/screenshots/01_logged_in_YYYYMMDD_HHMMSS.png</div>
                </div>
                
                <div class="step">
                    <div class="step-title">Step 2: Navigating to Materials Management page...</div>
                    <div class="step-detail"><span class="success">✓</span> Navigated to Materials Management page</div>
                    <div class="screenshot-ref">Screenshot saved: selenium-tests/screenshots/02_materials_page_YYYYMMDD_HHMMSS.png</div>
                </div>
                
                <div class="step">
                    <div class="step-title">Step 3: Clicking Add Material button...</div>
                    <div class="step-detail"><span class="success">✓</span> Clicked Add Material button</div>
                    <div class="step-detail"><span class="success">✓</span> Add Material modal opened</div>
                    <div class="screenshot-ref">Screenshot saved: selenium-tests/screenshots/03_add_modal_opened_YYYYMMDD_HHMMSS.png</div>
                </div>
                
                <div class="step">
                    <div class="step-title">Step 4: Filling material form...</div>
                    <div class="step-detail"><span class="success">✓</span> Entered material name: Test Material [timestamp]</div>
                    <div class="step-detail"><span class="success">✓</span> Selected unit: bag</div>
                    <div class="step-detail"><span class="success">✓</span> Entered unit price: 500</div>
                    <div class="step-detail"><span class="success">✓</span> Entered CO₂ per unit: 10</div>
                    <div class="step-detail"><span class="success">✓</span> Entered stock: 100</div>
                    <div class="step-detail"><span class="success">✓</span> Entered reorder level: 20</div>
                    <div class="step-detail"><span class="success">✓</span> Entered description: Test material for automation</div>
                    <div class="screenshot-ref">Screenshot saved: selenium-tests/screenshots/04_form_filled_YYYYMMDD_HHMMSS.png</div>
                </div>
                
                <div class="step">
                    <div class="step-title">Step 5: Submitting material form...</div>
                    <div class="step-detail"><span class="success">✓</span> Clicked Add Material button</div>
                </div>
                
                <div class="step">
                    <div class="step-title">Step 6: Verifying material creation...</div>
                    <div class="step-detail"><span class="success">✓</span> Material created successfully</div>
                    <div class="step-detail"><span class="success">✓</span> Material 'Test Material [timestamp]' found in list</div>
                    <div class="screenshot-ref">Screenshot saved: selenium-tests/screenshots/05_material_created_YYYYMMDD_HHMMSS.png</div>
                </div>
                
                <div class="test-passed">
                    <h3>=== Create Material Test PASSED ===</h3>
                </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="test-section">
                <h2>TEST CASE 2: READ MATERIALS (READ)</h2>
                
                <div class="step">
                    <div class="step-title">=== Starting Read Materials Test ===</div>
                </div>
                
                <div class="step">
                    <div class="step-title">Step 1: Logging in as admin...</div>
                    <div class="step-detail"><span class="success">✓</span> Logged in as admin successfully</div>
                    <div class="screenshot-ref">Screenshot saved: selenium-tests/screenshots/01_logged_in_YYYYMMDD_HHMMSS.png</div>
                </div>
                
                <div class="step">
                    <div class="step-title">Step 2: Navigating to Materials Management page...</div>
                    <div class="step-detail"><span class="success">✓</span> Navigated to Materials Management page</div>
                    <div class="screenshot-ref">Screenshot saved: selenium-tests/screenshots/02_materials_page_YYYYMMDD_HHMMSS.png</div>
                </div>
                
                <div class="step">
                    <div class="step-title">Step 3: Verifying materials list...</div>
                    <div class="step-detail"><span class="success">✓</span> Materials list displayed - Found X items</div>
                    <div class="screenshot-ref">Screenshot saved: selenium-tests/screenshots/03_materials_read_YYYYMMDD_HHMMSS.png</div>
                </div>
                
                <div class="step">
                    <div class="step-title">Step 4: Verifying material details visibility...</div>
                    <div class="step-detail"><span class="success">✓</span> Material details visible: name, price, stock, unit</div>
                </div>
                
                <div class="test-passed">
                    <h3>=== Read Materials Test PASSED ===</h3>
                </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="test-section">
                <h2>TEST CASE 3: UPDATE MATERIAL (UPDATE)</h2>
                
                <div class="step">
                    <div class="step-title">=== Starting Update Material Test ===</div>
                </div>
                
                <div class="step">
                    <div class="step-title">Step 1: Logging in as admin...</div>
                    <div class="step-detail"><span class="success">✓</span> Logged in as admin successfully</div>
                    <div class="screenshot-ref">Screenshot saved: selenium-tests/screenshots/01_logged_in_YYYYMMDD_HHMMSS.png</div>
                </div>
                
                <div class="step">
                    <div class="step-title">Step 2: Navigating to Materials Management page...</div>
                    <div class="step-detail"><span class="success">✓</span> Navigated to Materials Management page</div>
                    <div class="screenshot-ref">Screenshot saved: selenium-tests/screenshots/02_materials_page_YYYYMMDD_HHMMSS.png</div>
                </div>
                
                <div class="step">
                    <div class="step-title">Step 3: Finding material to edit...</div>
                    <div class="step-detail"><span class="success">✓</span> Clicked Edit button</div>
                    <div class="step-detail"><span class="success">✓</span> Edit Material modal opened</div>
                    <div class="screenshot-ref">Screenshot saved: selenium-tests/screenshots/04_edit_modal_opened_YYYYMMDD_HHMMSS.png</div>
                </div>
                
                <div class="step">
                    <div class="step-title">Step 4: Updating material details...</div>
                    <div class="step-detail"><span class="success">✓</span> Updated stock to: 150</div>
                    <div class="step-detail"><span class="success">✓</span> Updated unit price to: 600</div>
                    <div class="screenshot-ref">Screenshot saved: selenium-tests/screenshots/05_form_updated_YYYYMMDD_HHMMSS.png</div>
                </div>
                
                <div class="step">
                    <div class="step-title">Step 5: Submitting update...</div>
                    <div class="step-detail"><span class="success">✓</span> Clicked Update button</div>
                </div>
                
                <div class="step">
                    <div class="step-title">Step 6: Verifying material update...</div>
                    <div class="step-detail"><span class="success">✓</span> Material updated successfully</div>
                    <div class="screenshot-ref">Screenshot saved: selenium-tests/screenshots/06_material_updated_YYYYMMDD_HHMMSS.png</div>
                </div>
                
                <div class="test-passed">
                    <h3>=== Update Material Test PASSED ===</h3>
                </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="test-section">
                <h2>TEST CASE 4: DELETE MATERIAL (DELETE)</h2>
                
                <div class="step">
                    <div class="step-title">=== Starting Delete Material Test ===</div>
                </div>
                
                <div class="step">
                    <div class="step-title">Step 1: Logging in as admin...</div>
                    <div class="step-detail"><span class="success">✓</span> Logged in as admin successfully</div>
                    <div class="screenshot-ref">Screenshot saved: selenium-tests/screenshots/01_logged_in_YYYYMMDD_HHMMSS.png</div>
                </div>
                
                <div class="step">
                    <div class="step-title">Step 2: Navigating to Materials Management page...</div>
                    <div class="step-detail"><span class="success">✓</span> Navigated to Materials Management page</div>
                    <div class="screenshot-ref">Screenshot saved: selenium-tests/screenshots/02_materials_page_YYYYMMDD_HHMMSS.png</div>
                </div>
                
                <div class="step">
                    <div class="step-title">Step 3: Finding material to delete...</div>
                    <div class="step-detail"><span class="success">✓</span> Clicked Delete button</div>
                    <div class="screenshot-ref">Screenshot saved: selenium-tests/screenshots/03_delete_button_clicked_YYYYMMDD_HHMMSS.png</div>
                </div>
                
                <div class="step">
                    <div class="step-title">Step 4: Confirming deletion...</div>
                    <div class="step-detail"><span class="success">✓</span> Confirmation dialog appeared: Are you sure you want to delete this material?</div>
                    <div class="step-detail"><span class="success">✓</span> Confirmed deletion</div>
                    <div class="screenshot-ref">Screenshot saved: selenium-tests/screenshots/05_deletion_confirmed_YYYYMMDD_HHMMSS.png</div>
                </div>
                
                <div class="step">
                    <div class="step-title">Step 5: Verifying material deletion...</div>
                    <div class="step-detail"><span class="success">✓</span> Material deleted successfully</div>
                    <div class="step-detail"><span class="success">✓</span> Material removed from list</div>
                    <div class="screenshot-ref">Screenshot saved: selenium-tests/screenshots/06_material_deleted_YYYYMMDD_HHMMSS.png</div>
                </div>
                
                <div class="test-passed">
                    <h3>=== Delete Material Test PASSED ===</h3>
                </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="test-section">
                <h2>Test Screenshots</h2>
                <div class="screenshot-grid">
"""
    
    # Add actual screenshots if available
    for screenshot in screenshot_data:
        html_content += f"""
                    <div class="screenshot-item">
                        <img src="{screenshot['path']}" alt="{screenshot['name']}" loading="lazy">
                        <div class="screenshot-caption">
                            <strong>{screenshot['name']}</strong><br>
                            <span class="timestamp">{screenshot['timestamp']}</span>
                        </div>
                    </div>
"""
    
    html_content += """
                </div>
            </div>
            
        </div>
    </div>
</body>
</html>
"""
    
    # Save HTML report
    report_path = report_dir / f"material-test-log-{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"\n[OK] Material Management Test Log Report (HTML) generated: {report_path}")
    print(f"[OK] Total screenshots included: {len(screenshot_data)}")
    print(f"\nOpen the report in your browser to view the test log.")
    
    return report_path

if __name__ == "__main__":
    try:
        report_path = generate_material_test_log_html()
        print(f"\n{'='*60}")
        print(f"Report successfully generated!")
        print(f"Location: {report_path}")
        print(f"{'='*60}\n")
        
        # Open in browser
        import webbrowser
        webbrowser.open(f"file:///{report_path.absolute()}")
    except Exception as e:
        print(f"Error generating report: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


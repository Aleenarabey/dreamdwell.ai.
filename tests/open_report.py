"""
Quick script to open the latest test report in browser
"""
import os
import glob
import webbrowser
from pathlib import Path

def open_latest_report(report_type="all"):
    """Open the latest test report in default browser"""
    base_dir = Path(__file__).parent.parent
    reports_dir = base_dir / "reports"
    
    # Find latest test report
    if report_type == "all":
        report_pattern = str(reports_dir / "test-report-*.html")
    elif report_type == "signup":
        report_pattern = str(reports_dir / "*signup*.html")
    elif report_type == "login":
        report_pattern = str(reports_dir / "*login*.html")
    else:
        report_pattern = str(reports_dir / "*.html")
    
    reports = glob.glob(report_pattern)
    
    if not reports:
        print("No test reports found. Please run the tests first.")
        return
    
    # Get the latest report
    latest_report = max(reports, key=os.path.getmtime)
    report_path = os.path.abspath(latest_report)
    
    print(f"Opening report: {latest_report}")
    webbrowser.open(f"file:///{report_path}")

if __name__ == "__main__":
    open_latest_report()


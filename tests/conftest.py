"""
Pytest configuration file for automatic test report generation
"""
import pytest
import sys
import os
from pathlib import Path

# Add tests directory to path
sys.path.insert(0, str(Path(__file__).parent))

def pytest_sessionfinish(session, exitstatus):
    """Generate test report after all tests complete"""
    try:
        # Check which tests were run
        has_signup = any('signup' in str(item.nodeid).lower() for item in session.items)
        has_login = any('login' in str(item.nodeid).lower() for item in session.items)
        has_material = any('material' in str(item.nodeid).lower() for item in session.items)
        has_project = any('project' in str(item.nodeid).lower() for item in session.items)
        
        if has_signup or has_login or has_material or has_project:
            print("\n" + "="*60)
            print("Generating test report with screenshots...")
            print("="*60)
            
            # Import and run report generator
            from generate_test_report import generate_test_report
            
            # Determine test type - material tests are included in "all"
            if has_signup and has_login:
                test_type = "all"
            elif has_signup:
                test_type = "signup"
            elif has_login:
                test_type = "login"
            elif has_material:
                test_type = "all"  # Material tests included in all reports
            else:
                test_type = "all"
            
            report_path = generate_test_report(test_type)
            
            print(f"\nReport available at: {report_path}")
            print("="*60 + "\n")
    except Exception as e:
        # Don't fail tests if report generation fails
        print(f"\n[WARN] Could not generate test report: {e}\n")


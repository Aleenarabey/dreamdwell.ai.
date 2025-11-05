import os
from datetime import datetime

class Config:
    """Configuration settings for tests"""
    
    BASE_URL = os.getenv("APP_URL", "http://localhost:3000")
    BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")
    
    # Browser settings
    BROWSER = os.getenv("BROWSER", "chrome")
    HEADLESS = os.getenv("HEADLESS", "false").lower() == "true"
    IMPLICIT_WAIT = 10
    EXPLICIT_WAIT = 20
    
    # Screenshot settings
    SCREENSHOT_DIR = "selenium-tests/screenshots"
    SCREENSHOT_ON_FAILURE = True
    
    # Test user data for Engineer signup
    TEST_USER = {
        "firstName": "John",
        "lastName": "Doe",
        "email": f"engineer{datetime.now().strftime('%Y%m%d%H%M%S')}@test.com",
        "password": "Test123456",
        "confirmPassword": "Test123456",
        "role": "engineer"
    }
    
    # Test user data for Customer signup
    TEST_CUSTOMER = {
        "firstName": "Jane",
        "lastName": "Smith",
        "email": f"customer{datetime.now().strftime('%Y%m%d%H%M%S')}@test.com",
        "password": "Test123456",
        "confirmPassword": "Test123456",
        "role": "customer"
    }
    
    # Existing user credentials for login testing
    # NOTE: Update these with actual registered user credentials from your database
    EXISTING_USER = {
        "email": "engineer@test.com",  # Use an actual registered engineer email
        "password": "Test123456",  # Use the actual password
        "role": "engineer"
    }
    
    EXISTING_CUSTOMER = {
        "email": "customer@test.com",  # Use an actual registered customer email
        "password": "Test123456",  # Use the actual password
        "role": "customer"
    }
    
    # Admin credentials for material management tests
    ADMIN_CREDENTIALS = {
        "email": "admin@test.com",  # Use actual admin email
        "password": "admin123",  # Use actual admin password
        "role": "admin"
    }
    
    # Timeouts
    PAGE_LOAD_TIMEOUT = 30
    SCRIPT_TIMEOUT = 30


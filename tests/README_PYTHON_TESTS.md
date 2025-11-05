# Python Selenium Tests for DreamDwell

## Setup

1. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

2. **Install ChromeDriver:**
   - Download from: https://chromedriver.chromium.org/
   - Or use webdriver-manager (already in requirements.txt)

3. **Set environment variables (optional):**
```bash
# Windows
set APP_URL=http://localhost:3000
set HEADLESS=false

# Linux/Mac
export APP_URL=http://localhost:3000
export HEADLESS=false
```

## Running Tests

### Run all signup tests:
```bash
pytest tests/test_signup.py -v
```

### Run specific test:
```bash
pytest tests/test_signup.py::TestSignup::test_engineer_signup -v
```

### Run with screenshots:
```bash
pytest tests/test_signup.py -v -s
```

### Run in headless mode:
```bash
HEADLESS=true pytest tests/test_signup.py -v
```

## Test Cases

1. **test_engineer_signup** - Tests Engineer user registration
2. **test_customer_signup** - Tests Customer user registration
3. **test_signup_validation_errors** - Tests form validation

## Screenshots

Screenshots are automatically saved to the `screenshots/` directory for each test step.

## Notes

- Make sure the frontend server is running on `http://localhost:3000`
- Make sure the backend server is running on `http://localhost:5000`
- Tests use unique email addresses with timestamps to avoid conflicts


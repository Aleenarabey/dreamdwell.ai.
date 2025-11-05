import os
import time
import pytest
import sys
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from config import Config

# ANSI color codes for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

# Check if running on Windows and if terminal supports colors
def supports_color():
    """Check if terminal supports ANSI colors"""
    if sys.platform == 'win32':
        try:
            import ctypes
            kernel32 = ctypes.windll.kernel32
            # Try to enable ANSI escape sequences on Windows 10+
            kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)
            return True
        except:
            return False
    return True

USE_COLORS = supports_color()

def safe_print(text):
    """Safely print text with encoding fallback"""
    try:
        print(text)
    except UnicodeEncodeError:
        # Fallback to ASCII if encoding fails
        try:
            print(text.encode('ascii', 'replace').decode('ascii'))
        except:
            print(str(text).encode('ascii', 'replace').decode('ascii'))

def print_success(message):
    """Print success message with checkmark"""
    try:
        if USE_COLORS:
            safe_print(f"{Colors.GREEN}✓{Colors.RESET} {message}")
        else:
            safe_print(f"✓ {message}")
    except:
        safe_print(f"[OK] {message}")

def print_error(message):
    """Print error message"""
    try:
        if USE_COLORS:
            safe_print(f"{Colors.RED}✗ {message}{Colors.RESET}")
        else:
            safe_print(f"✗ {message}")
    except:
        safe_print(f"[ERROR] {message}")

def print_warning(message):
    """Print warning message"""
    try:
        if USE_COLORS:
            safe_print(f"{Colors.YELLOW}▲{Colors.RESET} {message}")
        else:
            safe_print(f"▲ {message}")
    except:
        safe_print(f"[WARN] {message}")

class BaseTest:
    """Base test class with common utilities"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup and teardown for each test"""
        self.driver = self.create_driver()
        self.wait = WebDriverWait(self.driver, Config.EXPLICIT_WAIT)
        
        # Create screenshots directory
        os.makedirs(Config.SCREENSHOT_DIR, exist_ok=True)
        
        yield
        
        # Teardown
        if hasattr(self, 'driver') and self.driver:
            self.driver.quit()
    
    def create_driver(self):
        """Create and configure WebDriver"""
        if Config.BROWSER.lower() == "chrome":
            chrome_options = Options()
            
            if Config.HEADLESS:
                chrome_options.add_argument("--headless=new")
            
            chrome_options.add_argument("--start-maximized")
            chrome_options.add_argument("--disable-blink-features=AutomationControlled")
            chrome_options.add_experimental_option("excludeSwitches", ["enable-logging"])
            
            driver = webdriver.Chrome(options=chrome_options)
            driver.implicitly_wait(Config.IMPLICIT_WAIT)
            driver.set_page_load_timeout(Config.PAGE_LOAD_TIMEOUT)
            driver.set_script_timeout(Config.SCRIPT_TIMEOUT)
            
            return driver
        else:
            raise ValueError(f"Unsupported browser: {Config.BROWSER}")
    
    def wait_for_element(self, by, value, timeout=None):
        """Wait for element to be present"""
        timeout = timeout or Config.EXPLICIT_WAIT
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.presence_of_element_located((by, value)))
    
    def wait_for_clickable(self, by, value, timeout=None):
        """Wait for element to be clickable"""
        timeout = timeout or Config.EXPLICIT_WAIT
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.element_to_be_clickable((by, value)))
    
    def wait_for_visible(self, by, value, timeout=None):
        """Wait for element to be visible"""
        timeout = timeout or Config.EXPLICIT_WAIT
        wait = WebDriverWait(self.driver, timeout)
        return wait.until(EC.visibility_of_element_located((by, value)))
    
    def safe_click(self, element):
        """Safely click an element with retry"""
        try:
            element.click()
        except Exception as e:
            # Try JavaScript click as fallback
            self.driver.execute_script("arguments[0].click();", element)
    
    def safe_send_keys(self, element, text, clear_first=True):
        """Safely send keys to an element"""
        if clear_first:
            element.clear()
        element.send_keys(text)
    
    def take_screenshot(self, name):
        """Take a screenshot with date-based timestamp"""
        # Create directory if it doesn't exist
        os.makedirs(Config.SCREENSHOT_DIR, exist_ok=True)
        
        # Format: name_YYYYMMDD_HHMMSS.png
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        screenshot_path = os.path.join(Config.SCREENSHOT_DIR, f"{name}_{timestamp}.png")
        self.driver.save_screenshot(screenshot_path)
        print(f"Screenshot saved: {screenshot_path}")
        return screenshot_path
    
    def wait_for_alert(self, timeout=5):
        """Wait for alert to appear"""
        try:
            wait = WebDriverWait(self.driver, timeout)
            alert = wait.until(EC.alert_is_present())
            return alert
        except TimeoutException:
            return None
    
    def accept_alert(self, timeout=5):
        """Accept alert if present"""
        alert = self.wait_for_alert(timeout)
        if alert:
            text = alert.text
            alert.accept()
            return text
        return None
    
    def get_current_url(self):
        """Get current page URL"""
        return self.driver.current_url
    
    def navigate_to(self, url):
        """Navigate to URL"""
        self.driver.get(url)
        time.sleep(2)  # Wait for page load


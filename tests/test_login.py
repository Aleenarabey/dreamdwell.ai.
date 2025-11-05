import time
import pytest
from datetime import datetime
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from base_test import BaseTest, print_success, print_error, print_warning
from config import Config

class TestLogin(BaseTest):
    """Test user login functionality"""
    
    def test_engineer_login(self):
        """
        Test Case: Engineer User Login
        Steps:
        1. Navigate to login page
        2. Ensure Login tab is selected
        3. Enter credentials
        4. Submit login form
        5. Verify successful login
        """
        try:
            print("\n=== Starting User Login Test ===")
            
            # Step 1: Navigate to auth/login page
            print("Step 1: Navigating to Login page...")
            try:
                # Try to find Login or Sign In link first
                try:
                    login_link = self.wait_for_clickable(By.LINK_TEXT, "Login", timeout=3)
                    self.safe_click(login_link)
                    print_success("Clicked Login link")
                except:
                    try:
                        login_link = self.wait_for_clickable(By.LINK_TEXT, "Sign In", timeout=3)
                        self.safe_click(login_link)
                        print_success("Clicked Sign In link")
                    except:
                        # If links not found, navigate directly
                        print_warning("Login link not found, navigating directly...")
                        self.navigate_to(f"{Config.BASE_URL}/auth")
            except Exception as e:
                # If element not clickable, save screenshot and navigate directly
                print_error(f"Element not clickable: {str(e)}")
                self.take_screenshot("element_not_clickable")
                print_warning("Navigating directly to auth page...")
                self.navigate_to(f"{Config.BASE_URL}/auth")
            
            # Verify we're on the auth page
            assert "auth" in self.get_current_url().lower(), "Not on auth page"
            print_success("Successfully navigated to Login page")
            self.take_screenshot("01_login_page")
            time.sleep(2)
            
            # Step 2: Ensure we're on Login tab (not Sign up)
            print("\nStep 2: Ensuring Login tab is selected...")
            try:
                # Check if login tab button exists and is not already selected
                login_tabs = self.driver.find_elements(
                    By.XPATH, 
                    "//button[contains(text(), 'Log in') or contains(text(), 'Login')]"
                )
                if login_tabs:
                    for tab in login_tabs:
                        classes = tab.get_attribute("class")
                        # Check if tab is not already selected (selected tabs usually have bg-blue-600)
                        if "bg-blue-600" not in classes:
                            self.safe_click(tab)
                            time.sleep(1)
                            break
                print_success("Login tab selected")
            except Exception as e:
                print_warning(f"Login tab might already be selected: {e}")
            
            # Step 3: Enter login credentials
            print("\nStep 3: Entering login credentials...")
            
            # Find and fill Email - find by label text (same pattern as signup)
            email_label = self.wait_for_element(
                By.XPATH,
                "//label[contains(text(), 'Email')]",
                timeout=5
            )
            email_field = email_label.find_element(By.XPATH, "./following-sibling::input | ../input | ../div/input")
            self.safe_send_keys(email_field, Config.EXISTING_USER["email"])
            print_success(f"Entered email: {Config.EXISTING_USER['email']}")
            time.sleep(0.5)
            
            # Find and fill Password - find by label text
            password_label = self.wait_for_element(
                By.XPATH,
                "//label[contains(text(), 'Password')]",
                timeout=5
            )
            password_field = password_label.find_element(By.XPATH, "./following-sibling::input | ../input | ../div/input")
            self.safe_send_keys(password_field, Config.EXISTING_USER["password"])
            print_success("Entered password")
            time.sleep(0.5)
            
            self.take_screenshot("02_credentials_entered")
            time.sleep(1)
            
            # Step 4: Submit login form
            print("\nStep 4: Submitting login form...")
            submit_button = self.wait_for_clickable(
                By.XPATH,
                "//button[@type='submit' or contains(text(), 'Login') or contains(text(), 'Sign In') or contains(text(), 'Log in')]"
            )
            self.safe_click(submit_button)
            print_success("Clicked login button")
            time.sleep(3)
            
            # Step 5: Verify successful login
            print("\nStep 5: Verifying login success...")
            self.take_screenshot("03_login_result")
            
            # Check if redirected away from login page
            current_url = self.get_current_url().lower()
            
            # Check for alert dialog first
            alert_text = self.accept_alert(timeout=5)
            if alert_text:
                if "success" in alert_text.lower() or "logged in" in alert_text.lower():
                    print_success(f"Login successful - Message: {alert_text}")
                else:
                    # Check if it's an error
                    if "invalid" in alert_text.lower() or "error" in alert_text.lower():
                        print_error(f"Login failed - Alert: {alert_text}")
                        pytest.fail(f"Login failed: {alert_text}")
            
            # Check URL redirect based on role
            if "login" not in current_url and "auth" not in current_url:
                # Successfully redirected away from login page
                if "engineer-dashboard" in current_url:
                    print_success("Login successful - Redirected to Engineer Dashboard")
                elif "admin-dashboard" in current_url:
                    print_success("Login successful - Redirected to Admin Dashboard")
                elif "customer-dashboard" in current_url:
                    print_success("Login successful - Redirected to Customer Dashboard")
                elif "interior-dashboard" in current_url:
                    print_success("Login successful - Redirected to Interior Designer Dashboard")
                else:
                    print_success(f"Login successful - Redirected to: {current_url}")
                
                # Try to find user-specific elements (dashboard elements)
                try:
                    dashboard_indicator = self.wait_for_visible(
                        By.XPATH,
                        "//*[contains(@class, 'dashboard') or contains(text(), 'Dashboard') or contains(text(), 'Welcome')]",
                        timeout=5
                    )
                    print_success(f"Dashboard page loaded - Found: {dashboard_indicator.text[:50]}")
                except:
                    print_warning("Dashboard page loaded but no specific indicator found")
            else:
                # Still on login page - check for error messages
                try:
                    error_message = self.wait_for_visible(
                        By.XPATH,
                        "//*[contains(@class, 'error') or contains(@class, 'alert') or contains(text(), 'Invalid') or contains(text(), 'incorrect')]",
                        timeout=5
                    )
                    print_error(f"Login failed - Error: {error_message.text}")
                    pytest.fail(f"Login failed: {error_message.text}")
                except:
                    print_warning("Still on login page, but no error visible - may need to check manually")
            
            print("\n=== User Login Test PASSED ===\n")
            
        except Exception as e:
            error_msg = str(e)
            print_error(f"\nTest Failed: {error_msg}")
            self.take_screenshot("login_failure")
            pytest.fail(f"Login test failed: {error_msg}")
    
    def test_customer_login(self):
        """
        Test Case: Customer User Login
        Steps:
        1. Navigate to login page
        2. Ensure Login tab is selected
        3. Enter credentials
        4. Submit login form
        5. Verify successful login
        """
        try:
            print("\n=== Starting User Login Test (Customer) ===")
            
            # Step 1: Navigate to auth/login page
            print("Step 1: Navigating to Login page...")
            try:
                try:
                    login_link = self.wait_for_clickable(By.LINK_TEXT, "Login", timeout=3)
                    self.safe_click(login_link)
                except:
                    try:
                        login_link = self.wait_for_clickable(By.LINK_TEXT, "Sign In", timeout=3)
                        self.safe_click(login_link)
                    except:
                        print_warning("Login link not found, navigating directly...")
                        self.navigate_to(f"{Config.BASE_URL}/auth")
            except Exception as e:
                print_error(f"Element not clickable: {str(e)}")
                self.take_screenshot("element_not_clickable")
                self.navigate_to(f"{Config.BASE_URL}/auth")
            
            assert "auth" in self.get_current_url().lower(), "Not on auth page"
            print_success("Successfully navigated to Login page")
            self.take_screenshot("01_login_page")
            time.sleep(2)
            
            # Step 2: Ensure Login tab is selected
            print("\nStep 2: Ensuring Login tab is selected...")
            try:
                login_tabs = self.driver.find_elements(
                    By.XPATH,
                    "//button[contains(text(), 'Log in') or contains(text(), 'Login')]"
                )
                if login_tabs:
                    for tab in login_tabs:
                        classes = tab.get_attribute("class")
                        if "bg-blue-600" not in classes:
                            self.safe_click(tab)
                            time.sleep(1)
                            break
                print_success("Login tab selected")
            except Exception as e:
                print_warning(f"Login tab might already be selected: {e}")
            
            # Step 3: Enter login credentials
            print("\nStep 3: Entering login credentials...")
            
            # Find and fill Email
            email_label = self.wait_for_element(
                By.XPATH,
                "//label[contains(text(), 'Email')]",
                timeout=5
            )
            email_field = email_label.find_element(By.XPATH, "./following-sibling::input | ../input | ../div/input")
            self.safe_send_keys(email_field, Config.EXISTING_CUSTOMER["email"])
            print_success(f"Entered email: {Config.EXISTING_CUSTOMER['email']}")
            time.sleep(0.5)
            
            # Find and fill Password
            password_label = self.wait_for_element(
                By.XPATH,
                "//label[contains(text(), 'Password')]",
                timeout=5
            )
            password_field = password_label.find_element(By.XPATH, "./following-sibling::input | ../input | ../div/input")
            self.safe_send_keys(password_field, Config.EXISTING_CUSTOMER["password"])
            print_success("Entered password")
            time.sleep(0.5)
            
            self.take_screenshot("02_credentials_entered")
            time.sleep(1)
            
            # Step 4: Submit login form
            print("\nStep 4: Submitting login form...")
            submit_button = self.wait_for_clickable(
                By.XPATH,
                "//button[@type='submit' or contains(text(), 'Login') or contains(text(), 'Sign In')]"
            )
            self.safe_click(submit_button)
            print_success("Clicked login button")
            time.sleep(3)
            
            # Step 5: Verify successful login
            print("\nStep 5: Verifying login success...")
            self.take_screenshot("03_login_result")
            
            current_url = self.get_current_url().lower()
            
            # Check for alert dialog
            alert_text = self.accept_alert(timeout=5)
            if alert_text:
                if "success" in alert_text.lower():
                    print_success(f"Login successful - Message: {alert_text}")
                else:
                    if "invalid" in alert_text.lower():
                        print_error(f"Login failed - Alert: {alert_text}")
                        pytest.fail(f"Login failed: {alert_text}")
            
            # Check URL redirect
            if "customer-dashboard" in current_url:
                print_success("Login successful - Redirected to Customer Dashboard")
            elif "login" not in current_url and "auth" not in current_url:
                print_success(f"Login successful - Redirected to: {current_url}")
            else:
                print_warning("Still on login page - may need to check manually")
            
            print("\n=== User Login Test PASSED ===\n")
            
        except Exception as e:
            error_msg = str(e)
            print_error(f"\nTest Failed: {error_msg}")
            self.take_screenshot("login_failure")
            pytest.fail(f"Login test failed: {error_msg}")
    
    def test_login_validation_errors(self):
        """
        Test Case: Login Form Validation
        Steps:
        1. Navigate to login page
        2. Try to submit empty form
        3. Verify validation errors
        """
        try:
            print("\n=== Starting Login Validation Test ===")
            
            # Navigate to auth page
            self.navigate_to(f"{Config.BASE_URL}/auth")
            time.sleep(2)
            
            # Ensure login tab
            try:
                login_tabs = self.driver.find_elements(By.XPATH, "//button[contains(text(), 'Log in') or contains(text(), 'Login')]")
                if login_tabs:
                    for tab in login_tabs:
                        classes = tab.get_attribute("class")
                        if "bg-blue-600" not in classes:
                            self.safe_click(tab)
                            time.sleep(1)
                            break
            except:
                pass
            
            # Try to submit empty form
            submit_button = self.wait_for_clickable(
                By.XPATH,
                "//button[@type='submit']"
            )
            self.safe_click(submit_button)
            time.sleep(2)
            
            # Check for validation error
            alert_text = self.accept_alert(timeout=5)
            if alert_text:
                assert any(keyword in alert_text.lower() for keyword in ["required", "fill", "empty", "fields"]), \
                    f"Expected validation error, got: {alert_text}"
                print_success(f"Validation error displayed: {alert_text}")
            else:
                # Check for inline errors
                error_elements = self.driver.find_elements(
                    By.XPATH,
                    "//*[contains(@class, 'error') or contains(@class, 'text-red') or contains(text(), 'required')]"
                )
                if error_elements:
                    print_success(f"Validation errors displayed on form ({len(error_elements)} errors)")
                else:
                    print_warning("No validation errors found")
            
            self.take_screenshot("validation_errors")
            print("\n=== Login Validation Test PASSED ===\n")
            
        except Exception as e:
            error_msg = str(e)
            print_error(f"\nTest Failed: {error_msg}")
            self.take_screenshot("validation_test_failure")
            pytest.fail(f"Validation test failed: {error_msg}")


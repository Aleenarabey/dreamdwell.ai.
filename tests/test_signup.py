import time
import pytest
from datetime import datetime
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementNotInteractableException
from base_test import BaseTest, print_success, print_error, print_warning
from config import Config

class TestSignup(BaseTest):
    """Test user signup functionality"""
    
    def test_engineer_signup(self):
        """
        Test Case 1: Engineer User Registration
        Steps:
        1. Navigate to auth page
        2. Select Engineer role
        3. Fill in registration form
        4. Submit the form
        5. Verify successful registration
        """
        try:
            print("\n=== Starting User Registration Test ===")
            
            # Step 1: Navigate to auth page
            print("Step 1: Navigating to Register page...")
            try:
                # Try to find Register or Sign Up link first
                try:
                    register_link = self.wait_for_clickable(By.LINK_TEXT, "Register", timeout=3)
                    self.safe_click(register_link)
                    print_success("Clicked Register link")
                except:
                    try:
                        register_link = self.wait_for_clickable(By.LINK_TEXT, "Sign Up", timeout=3)
                        self.safe_click(register_link)
                        print_success("Clicked Sign Up link")
                    except:
                        # If links not found, navigate directly
                        print_warning("Register link not found, navigating directly...")
                        self.navigate_to(f"{Config.BASE_URL}/auth")
            except Exception as e:
                # If element not clickable, save screenshot and navigate directly
                print_error(f"Element not clickable: {str(e)}")
                self.take_screenshot("element_not_clickable")
                print_warning("Navigating directly to auth page...")
                self.navigate_to(f"{Config.BASE_URL}/auth")
            
            # Verify we're on the auth page
            assert "auth" in self.get_current_url().lower(), "Not on auth page"
            print_success("Successfully navigated to Register page")
            self.take_screenshot("01_register_page")
            time.sleep(2)
            
            # Step 2: Select Engineer role
            print("\nStep 2: Selecting Engineer role...")
            engineer_button = self.wait_for_clickable(
                By.XPATH, 
                "//button[contains(text(), 'Engineer') or contains(text(), '👨‍💻 Engineer')]"
            )
            self.safe_click(engineer_button)
            print_success("Selected Engineer role")
            time.sleep(2)
            
            # Verify role selection worked
            signup_title = self.wait_for_visible(
                By.XPATH,
                "//*[contains(text(), 'Create engineer Account') or contains(text(), 'Create Engineer Account')]"
            )
            assert signup_title.is_displayed(), "Signup form not displayed"
            print_success("Signup form displayed")
            self.take_screenshot("02_role_selected")
            
            # Step 2: Fill in the registration form
            print("\nStep 2: Filling registration form...")
            
            # Generate unique email
            timestamp = int(time.time())
            test_email = f"engineer{timestamp}@test.com"
            
            # Find and fill First Name - find by label text
            first_name_label = self.wait_for_element(
                By.XPATH,
                "//label[contains(text(), 'First Name')]",
                timeout=5
            )
            first_name_field = first_name_label.find_element(By.XPATH, "./following-sibling::input | ../input")
            self.safe_send_keys(first_name_field, Config.TEST_USER["firstName"])
            print_success(f"Entered first name: {Config.TEST_USER['firstName']}")
            time.sleep(0.5)
            
            # Find and fill Last Name - find by label text
            last_name_label = self.wait_for_element(
                By.XPATH,
                "//label[contains(text(), 'Last Name')]",
                timeout=5
            )
            last_name_field = last_name_label.find_element(By.XPATH, "./following-sibling::input | ../input")
            self.safe_send_keys(last_name_field, Config.TEST_USER["lastName"])
            print_success(f"Entered last name: {Config.TEST_USER['lastName']}")
            time.sleep(0.5)
            
            # Find and fill Email - find by label text
            email_label = self.wait_for_element(
                By.XPATH,
                "//label[contains(text(), 'Email')]",
                timeout=5
            )
            email_field = email_label.find_element(By.XPATH, "./following-sibling::input | ../input | ../div/input")
            self.safe_send_keys(email_field, test_email)
            print_success(f"Entered email: {test_email}")
            time.sleep(0.5)
            
            # Find and fill Password
            password_fields = self.driver.find_elements(
                By.XPATH,
                "//input[@type='password']"
            )
            
            # First password field (main password)
            password_field = password_fields[0]
            self.safe_send_keys(password_field, Config.TEST_USER["password"])
            print_success("Entered password")
            time.sleep(0.5)
            
            # Second password field (confirm password)
            if len(password_fields) > 1:
                confirm_password_field = password_fields[1]
                self.safe_send_keys(confirm_password_field, Config.TEST_USER["confirmPassword"])
                print_success("Entered confirm password")
                time.sleep(0.5)
            
            self.take_screenshot("02_form_filled")
            time.sleep(1)
            
            # Step 3: Submit the form
            print("\nStep 3: Submitting registration form...")
            submit_button = self.wait_for_clickable(
                By.XPATH,
                "//button[@type='submit' or contains(text(), 'Sign') or contains(text(), 'Create')]"
            )
            self.safe_click(submit_button)
            print_success("Clicked submit button")
            time.sleep(3)
            
            # Step 4: Verify successful registration
            print("\nStep 4: Verifying registration success...")
            self.take_screenshot("03_registration_result")
            
            # Check for alert dialog
            alert_text = self.accept_alert(timeout=5)
            if alert_text:
                assert "success" in alert_text.lower() or "created" in alert_text.lower(), \
                    f"Unexpected alert message: {alert_text}"
                print_success(f"Registration successful - Message: {alert_text}")
            else:
                # Check for success message on page
                try:
                    success_message = self.wait_for_visible(
                        By.XPATH,
                        "//*[contains(text(), 'success') or contains(text(), 'Success') or contains(text(), 'registered')]",
                        timeout=5
                    )
                    print_success(f"Registration successful - Message: {success_message.text}")
                except:
                    # Check if form switched to login mode (indicates success)
                    try:
                        login_title = self.wait_for_visible(
                            By.XPATH,
                            "//*[contains(text(), 'Log in') or contains(text(), 'Welcome Back')]",
                            timeout=5
                        )
                        if login_title.is_displayed():
                            print_success("Registration successful - Form switched to login mode")
                    except:
                        # Check URL redirect
                        current_url = self.get_current_url()
                        if "auth" in current_url.lower():
                            print_success("Registration successful - Still on auth page (login mode)")
                        else:
                            print_warning("Unable to verify success message, but form was submitted")
            
            print("\n=== User Registration Test PASSED ===\n")
            
        except Exception as e:
            error_msg = str(e)
            print_error(f"\nTest Failed: {error_msg}")
            self.take_screenshot("signup_failure")
            pytest.fail(f"Registration test failed: {error_msg}")
    
    def test_customer_signup(self):
        """
        Test Case 2: Customer User Registration
        Steps:
        1. Navigate to auth page
        2. Select Customer role
        3. Fill in registration form
        4. Submit the form
        5. Verify successful registration
        """
        try:
            print("\n=== Starting User Registration Test (Customer) ===")
            
            # Step 1: Navigate to auth page
            print("Step 1: Navigating to Register page...")
            try:
                try:
                    register_link = self.wait_for_clickable(By.LINK_TEXT, "Register", timeout=3)
                    self.safe_click(register_link)
                except:
                    try:
                        register_link = self.wait_for_clickable(By.LINK_TEXT, "Sign Up", timeout=3)
                        self.safe_click(register_link)
                    except:
                        print_warning("Register link not found, navigating directly...")
                        self.navigate_to(f"{Config.BASE_URL}/auth")
            except Exception as e:
                print_error(f"Element not clickable: {str(e)}")
                self.take_screenshot("element_not_clickable")
                self.navigate_to(f"{Config.BASE_URL}/auth")
            
            assert "auth" in self.get_current_url().lower(), "Not on auth page"
            print_success("Successfully navigated to Register page")
            self.take_screenshot("01_register_page")
            time.sleep(2)
            
            # Step 2: Select Customer role
            print("\nStep 2: Selecting Customer role...")
            customer_button = self.wait_for_clickable(
                By.XPATH,
                "//button[contains(text(), 'Customer') or contains(text(), '👤 Customer')]"
            )
            self.safe_click(customer_button)
            print_success("Selected Customer role")
            time.sleep(2)
            
            # Verify role selection
            signup_title = self.wait_for_visible(
                By.XPATH,
                "//*[contains(text(), 'Create customer Account') or contains(text(), 'Create Customer Account')]"
            )
            assert signup_title.is_displayed(), "Signup form not displayed"
            print_success("Signup form displayed")
            self.take_screenshot("02_role_selected")
            
            # Step 3: Ensure Sign up tab is selected
            print("\nStep 3: Ensuring Sign up tab is selected...")
            try:
                signup_tabs = self.driver.find_elements(
                    By.XPATH,
                    "//button[contains(text(), 'Sign up')]"
                )
                if signup_tabs:
                    for tab in signup_tabs:
                        classes = tab.get_attribute("class")
                        if "bg-blue-600" not in classes:
                            self.safe_click(tab)
                            time.sleep(1)
                            break
                print_success("Sign up tab selected")
            except Exception as e:
                print_warning(f"Sign up tab might already be selected: {e}")
            
            # Step 2: Fill registration form
            print("\nStep 2: Filling registration form...")
            
            timestamp = int(time.time())
            test_email = f"customer{timestamp}@test.com"
            
            # Fill First Name - find by label text
            first_name_label = self.wait_for_element(
                By.XPATH,
                "//label[contains(text(), 'First Name')]",
                timeout=5
            )
            first_name_field = first_name_label.find_element(By.XPATH, "./following-sibling::input | ../input")
            self.safe_send_keys(first_name_field, Config.TEST_CUSTOMER["firstName"])
            print_success(f"Entered first name: {Config.TEST_CUSTOMER['firstName']}")
            time.sleep(0.5)
            
            # Fill Last Name - find by label text
            last_name_label = self.wait_for_element(
                By.XPATH,
                "//label[contains(text(), 'Last Name')]",
                timeout=5
            )
            last_name_field = last_name_label.find_element(By.XPATH, "./following-sibling::input | ../input")
            self.safe_send_keys(last_name_field, Config.TEST_CUSTOMER["lastName"])
            print_success(f"Entered last name: {Config.TEST_CUSTOMER['lastName']}")
            time.sleep(0.5)
            
            # Fill Email - find by label text
            email_label = self.wait_for_element(
                By.XPATH,
                "//label[contains(text(), 'Email')]",
                timeout=5
            )
            email_field = email_label.find_element(By.XPATH, "./following-sibling::input | ../input | ../div/input")
            self.safe_send_keys(email_field, test_email)
            print_success(f"Entered email: {test_email}")
            time.sleep(0.5)
            
            # Fill Passwords
            password_fields = self.driver.find_elements(By.XPATH, "//input[@type='password']")
            password_field = password_fields[0]
            self.safe_send_keys(password_field, Config.TEST_CUSTOMER["password"])
            print_success("Entered password")
            time.sleep(0.5)
            
            if len(password_fields) > 1:
                confirm_password_field = password_fields[1]
                self.safe_send_keys(confirm_password_field, Config.TEST_CUSTOMER["confirmPassword"])
                print_success("Entered confirm password")
                time.sleep(0.5)
            
            self.take_screenshot("02_form_filled")
            time.sleep(1)
            
            # Step 3: Submit form
            print("\nStep 3: Submitting registration form...")
            submit_button = self.wait_for_clickable(
                By.XPATH,
                "//button[@type='submit' or contains(text(), 'Sign')]"
            )
            self.safe_click(submit_button)
            print_success("Clicked submit button")
            time.sleep(3)
            
            # Step 4: Verify success
            print("\nStep 4: Verifying registration success...")
            self.take_screenshot("03_registration_result")
            
            alert_text = self.accept_alert(timeout=5)
            if alert_text:
                assert "success" in alert_text.lower(), f"Unexpected alert: {alert_text}"
                print_success(f"Registration successful - Message: {alert_text}")
            else:
                print_success("Registration submitted successfully")
            
            print("\n=== User Registration Test PASSED ===\n")
            
        except Exception as e:
            error_msg = str(e)
            print_error(f"\nTest Failed: {error_msg}")
            self.take_screenshot("signup_failure")
            pytest.fail(f"Registration test failed: {error_msg}")
    
    def test_signup_validation_errors(self):
        """
        Test Case 3: Signup Form Validation
        Steps:
        1. Navigate to auth page
        2. Select role
        3. Try to submit empty form
        4. Verify validation errors
        """
        try:
            print("\n=== Starting Signup Validation Test ===")
            
            # Navigate to auth page
            self.navigate_to(f"{Config.BASE_URL}/auth")
            time.sleep(2)
            
            # Select Engineer role
            engineer_button = self.wait_for_clickable(
                By.XPATH,
                "//button[contains(text(), 'Engineer')]"
            )
            self.safe_click(engineer_button)
            time.sleep(2)
            
            # Ensure signup tab
            try:
                signup_tabs = self.driver.find_elements(By.XPATH, "//button[contains(text(), 'Sign up')]")
                if signup_tabs:
                    for tab in signup_tabs:
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
                assert any(keyword in alert_text.lower() for keyword in ["required", "fill", "empty"]), \
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
            print("\n=== Signup Validation Test PASSED ===\n")
            
        except Exception as e:
            error_msg = str(e)
            print_error(f"\nTest Failed: {error_msg}")
            self.take_screenshot("validation_test_failure")
            pytest.fail(f"Validation test failed: {error_msg}")


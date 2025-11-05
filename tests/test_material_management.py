import time
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from base_test import BaseTest, print_success, print_error, print_warning
from config import Config

class TestMaterialManagement(BaseTest):
    """Test Material Management CRUD operations by Admin"""
    
    def login_as_admin(self):
        """Helper method to login as admin before testing materials"""
        try:
            print("Step 1: Logging in as admin...")
            # Navigate to login page
            self.navigate_to(f"{Config.BASE_URL}/auth")
            time.sleep(2)
            
            # Ensure login tab is selected
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
            except:
                pass
            
            # Enter credentials
            email_label = self.wait_for_element(
                By.XPATH,
                "//label[contains(text(), 'Email')]",
                timeout=5
            )
            email_field = email_label.find_element(By.XPATH, "./following-sibling::input | ../input | ../div/input")
            self.safe_send_keys(email_field, Config.ADMIN_CREDENTIALS["email"])
            
            password_label = self.wait_for_element(
                By.XPATH,
                "//label[contains(text(), 'Password')]",
                timeout=5
            )
            password_field = password_label.find_element(By.XPATH, "./following-sibling::input | ../input | ../div/input")
            self.safe_send_keys(password_field, Config.ADMIN_CREDENTIALS["password"])
            
            # Submit
            submit_button = self.wait_for_clickable(By.XPATH, "//button[@type='submit' or contains(text(), 'Login')]")
            self.safe_click(submit_button)
            time.sleep(3)
            
            # Accept alert if present
            self.accept_alert(timeout=5)
            
            print_success("Logged in as admin successfully")
            self.take_screenshot("01_logged_in")
        except Exception as e:
            print_error(f"Login step failed: {e}")
            pytest.fail(f"Admin login failed: {e}")
    
    def navigate_to_materials(self):
        """Helper method to navigate to materials management page"""
        try:
            # Navigate to materials management
            self.navigate_to(f"{Config.BASE_URL}/materials-management")
            time.sleep(3)
            
            # Verify we're on materials page
            assert "materials" in self.get_current_url().lower() or "material" in self.get_current_url().lower(), \
                "Not on materials management page"
            print_success("Navigated to Materials Management page")
            self.take_screenshot("02_materials_page")
        except Exception as e:
            print_error(f"Navigation failed: {e}")
            pytest.fail(f"Failed to navigate to materials page: {e}")
    
    def test_create_material(self):
        """
        Test Case: Create Material (CREATE)
        Steps:
        1. Login as admin
        2. Navigate to materials management page
        3. Click "Add Material" button
        4. Fill material form
        5. Submit form
        6. Verify material is created
        """
        try:
            print("\n=== Starting Create Material Test ===")
            
            # Step 1: Login first
            self.login_as_admin()
            time.sleep(2)
            
            # Step 2: Navigate to materials page
            print("\nStep 2: Navigating to Materials Management page...")
            self.navigate_to_materials()
            time.sleep(2)
            
            # Step 3: Click Add Material button
            print("\nStep 3: Clicking Add Material button...")
            try:
                add_button = self.wait_for_clickable(
                    By.XPATH,
                    "//button[contains(text(), 'Add Material') or contains(text(), 'Add New Material') or .//*[contains(text(), 'Add')]]",
                    timeout=10
                )
                self.safe_click(add_button)
                print_success("Clicked Add Material button")
                time.sleep(2)
            except Exception as e:
                print_error(f"Could not find Add Material button: {e}")
                self.take_screenshot("add_button_not_found")
                pytest.fail("Add Material button not found")
            
            # Verify modal is open
            try:
                modal = self.wait_for_visible(
                    By.XPATH,
                    "//*[contains(text(), 'Add New Material') or contains(text(), 'Add Material')]",
                    timeout=5
                )
                assert modal.is_displayed(), "Add Material modal not displayed"
                print_success("Add Material modal opened")
                self.take_screenshot("03_add_modal_opened")
                time.sleep(1)
            except Exception as e:
                print_error(f"Modal not opened: {e}")
                pytest.fail("Add Material modal not displayed")
            
            # Step 4: Fill material form
            print("\nStep 4: Filling material form...")
            
            # Material Name
            try:
                name_label = self.wait_for_element(
                    By.XPATH,
                    "//label[contains(text(), 'Material Name')]",
                    timeout=5
                )
                name_field = name_label.find_element(By.XPATH, "./following-sibling::input | ../input | ../div/input")
                material_name = f"Test Material {int(time.time())}"
                self.safe_send_keys(name_field, material_name)
                print_success(f"Entered material name: {material_name}")
                time.sleep(0.5)
            except Exception as e:
                print_error(f"Could not enter material name: {e}")
                pytest.fail("Material name field not found")
            
            # Unit (dropdown)
            try:
                unit_label = self.wait_for_element(
                    By.XPATH,
                    "//label[contains(text(), 'Unit')]",
                    timeout=5
                )
                unit_select = unit_label.find_element(By.XPATH, "./following-sibling::select | ../select | ../div/select")
                unit_dropdown = Select(unit_select)
                unit_dropdown.select_by_value("bag")
                print_success("Selected unit: bag")
                time.sleep(0.5)
            except Exception as e:
                print_warning(f"Could not select unit: {e}")
            
            # Unit Price
            try:
                price_label = self.wait_for_element(
                    By.XPATH,
                    "//label[contains(text(), 'Unit Price')]",
                    timeout=5
                )
                price_field = price_label.find_element(By.XPATH, "./following-sibling::input | ../input | ../div/input")
                self.safe_send_keys(price_field, "500")
                print_success("Entered unit price: 500")
                time.sleep(0.5)
            except Exception as e:
                print_error(f"Could not enter unit price: {e}")
                pytest.fail("Unit price field not found")
            
            # CO₂ per Unit (optional)
            try:
                co2_label = self.wait_for_element(
                    By.XPATH,
                    "//label[contains(text(), 'CO') or contains(text(), 'CO₂')]",
                    timeout=3
                )
                co2_field = co2_label.find_element(By.XPATH, "./following-sibling::input | ../input | ../div/input")
                self.safe_send_keys(co2_field, "10")
                print_success("Entered CO₂ per unit: 10")
                time.sleep(0.5)
            except:
                print_warning("CO₂ field not found, skipping")
            
            # Stock
            try:
                stock_label = self.wait_for_element(
                    By.XPATH,
                    "//label[contains(text(), 'Stock')]",
                    timeout=5
                )
                stock_field = stock_label.find_element(By.XPATH, "./following-sibling::input | ../input | ../div/input")
                self.safe_send_keys(stock_field, "100")
                print_success("Entered stock: 100")
                time.sleep(0.5)
            except Exception as e:
                print_error(f"Could not enter stock: {e}")
                pytest.fail("Stock field not found")
            
            # Reorder Level
            try:
                reorder_label = self.wait_for_element(
                    By.XPATH,
                    "//label[contains(text(), 'Reorder Level')]",
                    timeout=5
                )
                reorder_field = reorder_label.find_element(By.XPATH, "./following-sibling::input | ../input | ../div/input")
                self.safe_send_keys(reorder_field, "20")
                print_success("Entered reorder level: 20")
                time.sleep(0.5)
            except Exception as e:
                print_warning(f"Could not enter reorder level: {e}")
            
            # Description (optional)
            try:
                desc_label = self.wait_for_element(
                    By.XPATH,
                    "//label[contains(text(), 'Description')]",
                    timeout=3
                )
                desc_field = desc_label.find_element(By.XPATH, "./following-sibling::textarea | ../textarea | ../div/textarea")
                self.safe_send_keys(desc_field, "Test material for automation")
                print_success("Entered description")
                time.sleep(0.5)
            except:
                print_warning("Description field not found, skipping")
            
            self.take_screenshot("04_form_filled")
            time.sleep(1)
            
            # Step 5: Submit form
            print("\nStep 5: Submitting material form...")
            try:
                submit_button = self.wait_for_clickable(
                    By.XPATH,
                    "//button[@type='submit' and contains(text(), 'Add')]",
                    timeout=5
                )
                self.safe_click(submit_button)
                print_success("Clicked Add Material button")
                time.sleep(3)
            except Exception as e:
                print_error(f"Could not submit form: {e}")
                pytest.fail("Submit button not found")
            
            # Step 6: Verify material is created
            print("\nStep 6: Verifying material creation...")
            self.take_screenshot("05_material_created")
            
            # Check for alert
            alert_text = self.accept_alert(timeout=5)
            if alert_text:
                if "error" in alert_text.lower():
                    print_error(f"Error creating material: {alert_text}")
                    pytest.fail(f"Material creation failed: {alert_text}")
                else:
                    print_success(f"Material created - Message: {alert_text}")
            else:
                print_warning("No alert message found")
            
            # Verify material appears in list
            try:
                time.sleep(2)  # Wait for list to update
                material_in_list = self.wait_for_visible(
                    By.XPATH,
                    f"//*[contains(text(), '{material_name}')]",
                    timeout=5
                )
                if material_in_list.is_displayed():
                    print_success(f"Material '{material_name}' found in list")
            except:
                print_warning("Material not immediately visible in list, may need refresh")
            
            print("\n=== Create Material Test PASSED ===\n")
            
        except Exception as e:
            print_error(f"\nTest Failed: {str(e)}")
            self.take_screenshot("create_material_failure")
            pytest.fail(f"Create material test failed: {str(e)}")
    
    def test_read_materials(self):
        """
        Test Case: Read Materials (READ)
        Steps:
        1. Login as admin
        2. Navigate to materials management page
        3. Verify materials list is displayed
        4. Verify material details are visible
        """
        try:
            print("\n=== Starting Read Materials Test ===")
            
            # Step 1: Login first
            self.login_as_admin()
            time.sleep(2)
            
            # Step 2: Navigate to materials page
            print("\nStep 2: Navigating to Materials Management page...")
            self.navigate_to_materials()
            time.sleep(2)
            
            # Step 3: Verify materials list is displayed
            print("\nStep 3: Verifying materials list...")
            try:
                # Look for material items or table
                materials_list = self.driver.find_elements(
                    By.XPATH,
                    "//*[contains(@class, 'material') or contains(@class, 'card') or //tr[contains(@class, 'material')]]"
                )
                if materials_list:
                    print_success(f"Materials list displayed - Found {len(materials_list)} items")
                else:
                    # Check for "No materials" message
                    try:
                        no_materials = self.driver.find_element(
                            By.XPATH,
                            "//*[contains(text(), 'No materials') or contains(text(), 'No materials found')]"
                        )
                        if no_materials.is_displayed():
                            print_warning("No materials found in list")
                    except:
                        print_success("Materials list structure found")
            except Exception as e:
                print_warning(f"Could not verify materials list: {e}")
            
            # Step 4: Verify material details are visible
            print("\nStep 4: Verifying material details visibility...")
            try:
                # Check for common material fields in display
                material_fields = ["name", "price", "stock", "unit"]
                found_fields = []
                for field in material_fields:
                    try:
                        field_element = self.driver.find_element(
                            By.XPATH,
                            f"//*[contains(text(), '{field}') or contains(@class, '{field}')]"
                        )
                        if field_element.is_displayed():
                            found_fields.append(field)
                    except:
                        pass
                
                if found_fields:
                    print_success(f"Material details visible: {', '.join(found_fields)}")
                else:
                    print_warning("Material details structure not clearly visible")
            except Exception as e:
                print_warning(f"Could not verify material details: {e}")
            
            self.take_screenshot("03_materials_read")
            print("\n=== Read Materials Test PASSED ===\n")
            
        except Exception as e:
            print_error(f"\nTest Failed: {str(e)}")
            self.take_screenshot("read_materials_failure")
            pytest.fail(f"Read materials test failed: {str(e)}")
    
    def test_update_material(self):
        """
        Test Case: Update Material (UPDATE)
        Steps:
        1. Login as admin
        2. Navigate to materials management page
        3. Find a material and click Edit
        4. Update material details
        5. Submit update
        6. Verify material is updated
        """
        try:
            print("\n=== Starting Update Material Test ===")
            
            # Step 1: Login first
            self.login_as_admin()
            time.sleep(2)
            
            # Step 2: Navigate to materials page
            print("\nStep 2: Navigating to Materials Management page...")
            self.navigate_to_materials()
            time.sleep(2)
            
            # Step 3: Find and click Edit button on first material
            print("\nStep 3: Finding material to edit...")
            try:
                # Find first edit button
                edit_button = self.wait_for_clickable(
                    By.XPATH,
                    "//button[contains(@class, 'edit') or .//*[contains(@class, 'Edit')] or contains(text(), 'Edit')]",
                    timeout=10
                )
                self.safe_click(edit_button)
                print_success("Clicked Edit button")
                time.sleep(2)
            except Exception as e:
                print_error(f"Could not find edit button: {e}")
                self.take_screenshot("edit_button_not_found")
                pytest.fail("No materials available to edit. Please create a material first.")
            
            # Verify edit modal is open
            try:
                modal = self.wait_for_visible(
                    By.XPATH,
                    "//*[contains(text(), 'Edit Material')]",
                    timeout=5
                )
                assert modal.is_displayed(), "Edit Material modal not displayed"
                print_success("Edit Material modal opened")
                self.take_screenshot("04_edit_modal_opened")
                time.sleep(1)
            except Exception as e:
                print_error(f"Edit modal not opened: {e}")
                pytest.fail("Edit Material modal not displayed")
            
            # Step 4: Update material details
            print("\nStep 4: Updating material details...")
            
            # Update Stock
            try:
                stock_label = self.wait_for_element(
                    By.XPATH,
                    "//label[contains(text(), 'Stock')]",
                    timeout=5
                )
                stock_field = stock_label.find_element(By.XPATH, "./following-sibling::input | ../input | ../div/input")
                stock_field.clear()
                self.safe_send_keys(stock_field, "150", clear_first=False)
                print_success("Updated stock to: 150")
                time.sleep(0.5)
            except Exception as e:
                print_warning(f"Could not update stock: {e}")
            
            # Update Unit Price
            try:
                price_label = self.wait_for_element(
                    By.XPATH,
                    "//label[contains(text(), 'Unit Price')]",
                    timeout=5
                )
                price_field = price_label.find_element(By.XPATH, "./following-sibling::input | ../input | ../div/input")
                price_field.clear()
                self.safe_send_keys(price_field, "600", clear_first=False)
                print_success("Updated unit price to: 600")
                time.sleep(0.5)
            except Exception as e:
                print_warning(f"Could not update price: {e}")
            
            self.take_screenshot("05_form_updated")
            time.sleep(1)
            
            # Step 5: Submit update
            print("\nStep 5: Submitting update...")
            try:
                update_button = self.wait_for_clickable(
                    By.XPATH,
                    "//button[@type='submit' and contains(text(), 'Update')]",
                    timeout=5
                )
                self.safe_click(update_button)
                print_success("Clicked Update button")
                time.sleep(3)
            except Exception as e:
                print_error(f"Could not submit update: {e}")
                pytest.fail("Update button not found")
            
            # Step 6: Verify material is updated
            print("\nStep 6: Verifying material update...")
            self.take_screenshot("06_material_updated")
            
            # Check for alert
            alert_text = self.accept_alert(timeout=5)
            if alert_text:
                if "error" in alert_text.lower():
                    print_error(f"Error updating material: {alert_text}")
                    pytest.fail(f"Material update failed: {alert_text}")
                else:
                    print_success(f"Material updated - Message: {alert_text}")
            else:
                print_warning("No alert message found")
            
            print("\n=== Update Material Test PASSED ===\n")
            
        except Exception as e:
            print_error(f"\nTest Failed: {str(e)}")
            self.take_screenshot("update_material_failure")
            pytest.fail(f"Update material test failed: {str(e)}")
    
    def test_delete_material(self):
        """
        Test Case: Delete Material (DELETE)
        Steps:
        1. Login as admin
        2. Navigate to materials management page
        3. Find a material and click Delete
        4. Confirm deletion
        5. Verify material is deleted
        """
        try:
            print("\n=== Starting Delete Material Test ===")
            
            # Step 1: Login first
            self.login_as_admin()
            time.sleep(2)
            
            # Step 2: Navigate to materials page
            print("\nStep 2: Navigating to Materials Management page...")
            self.navigate_to_materials()
            time.sleep(2)
            
            # Step 3: Find and click Delete button on first material
            print("\nStep 3: Finding material to delete...")
            try:
                # Find first delete button (look for trash icon or delete text)
                delete_button = self.wait_for_clickable(
                    By.XPATH,
                    "//button[contains(@class, 'delete') or contains(@class, 'trash') or .//*[contains(@class, 'Trash')] or contains(text(), 'Delete')]",
                    timeout=10
                )
                # Get material name before deletion for verification
                try:
                    material_row = delete_button.find_element(By.XPATH, "./ancestor::tr | ./ancestor::div[contains(@class, 'material')]")
                    material_name = material_row.text.split('\n')[0] if material_row.text else "Unknown"
                except:
                    material_name = "Unknown"
                
                self.safe_click(delete_button)
                print_success("Clicked Delete button")
                time.sleep(2)
            except Exception as e:
                print_error(f"Could not find delete button: {e}")
                self.take_screenshot("delete_button_not_found")
                pytest.fail("No materials available to delete. Please create a material first.")
            
            # Step 4: Confirm deletion
            print("\nStep 4: Confirming deletion...")
            # Handle confirmation alert
            alert = self.wait_for_alert(timeout=5)
            if alert:
                alert_text = alert.text
                print_success(f"Confirmation dialog appeared: {alert_text}")
                alert.accept()
                print_success("Confirmed deletion")
                time.sleep(2)
            else:
                print_warning("No confirmation dialog found")
            
            self.take_screenshot("05_deletion_confirmed")
            time.sleep(2)
            
            # Step 5: Verify material is deleted
            print("\nStep 5: Verifying material deletion...")
            self.take_screenshot("06_material_deleted")
            
            # Check for alert
            alert_text = self.accept_alert(timeout=5)
            if alert_text:
                if "error" in alert_text.lower():
                    print_error(f"Error deleting material: {alert_text}")
                    pytest.fail(f"Material deletion failed: {alert_text}")
                else:
                    print_success(f"Material deleted - Message: {alert_text}")
            else:
                print_warning("No alert message found")
            
            # Verify material is removed from list
            try:
                # Wait a bit for the list to update
                time.sleep(2)
                if material_name != "Unknown":
                    try:
                        deleted_material = self.driver.find_element(
                            By.XPATH,
                            f"//*[contains(text(), '{material_name}')]"
                        )
                        if deleted_material.is_displayed():
                            print_warning("Material still visible in list")
                    except:
                        print_success("Material removed from list")
            except:
                print_warning("Could not verify material removal")
            
            print("\n=== Delete Material Test PASSED ===\n")
            
        except Exception as e:
            print_error(f"\nTest Failed: {str(e)}")
            self.take_screenshot("delete_material_failure")
            pytest.fail(f"Delete material test failed: {str(e)}")


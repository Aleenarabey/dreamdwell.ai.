"""Test script for ML service"""
import urllib.request
import urllib.parse
import json
import time

# Wait for service to start
time.sleep(2)

base_url = "http://localhost:8001"

print("Testing ML Service...")
print("=" * 50)

# Test health endpoint
try:
    with urllib.request.urlopen(f"{base_url}/health") as response:
        data = json.loads(response.read())
        print(f"[OK] Health check: {response.status}")
        print(f"  Response: {data}")
except Exception as e:
    print(f"[FAIL] Health check failed: {e}")
    exit(1)

# Test root endpoint
try:
    with urllib.request.urlopen(f"{base_url}/") as response:
        data = json.loads(response.read())
        print(f"\n[OK] Root endpoint: {response.status}")
        print(f"  Response: {json.dumps(data, indent=2)}")
except Exception as e:
    print(f"\n[FAIL] Root endpoint failed: {e}")

# Test prediction endpoint (will fail if model not trained, but should not crash)
print("\n" + "=" * 50)
print("Testing prediction endpoint...")
try:
    test_data = {
        "project_budget": 100000,
        "current_spent": 45000,
        "progress_percentage": 40,
        "days_elapsed": 30,
        "project_duration": 90
    }
    data = json.dumps(test_data).encode('utf-8')
    req = urllib.request.Request(f"{base_url}/predict/budget-overrun", data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read())
        print(f"Response status: {response.status}")
        print(f"Response: {json.dumps(result, indent=2)}")
except Exception as e:
    print(f"Prediction test result: {e}")
    if hasattr(e, 'read'):
        try:
            print(f"Error response: {e.read().decode()}")
        except:
            pass

print("\n" + "=" * 50)
print("Test complete!")

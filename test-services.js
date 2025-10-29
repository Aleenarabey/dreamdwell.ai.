/**
 * Test script to verify all services are running
 */

async function testServices() {
  console.log('🧪 Testing DreamDwell Services\n');
  
  // Test 1: Node.js Backend
  console.log('1️⃣ Testing Node.js Backend (Port 5000)...');
  try {
    const backendResponse = await fetch('http://localhost:5000/api/floorplans');
    console.log('✅ Node.js Backend is running');
  } catch (error) {
    console.log('❌ Node.js Backend not running');
    console.log('   Please run: cd backend && npm start');
    return;
  }
  
  // Test 2: FastAPI Service
  console.log('\n2️⃣ Testing FastAPI Service (Port 8000)...');
  try {
    const fastapiResponse = await fetch('http://127.0.0.1:8000/health');
    const data = await fastapiResponse.json();
    console.log('✅ FastAPI Service is running:', data);
  } catch (error) {
    console.log('❌ FastAPI Service not running');
    console.log('   Please run: cd py-processing && python main.py');
    return;
  }
  
  // Test 3: React Frontend
  console.log('\n3️⃣ Testing React Frontend (Port 3000)...');
  try {
    const frontendResponse = await fetch('http://localhost:3000');
    console.log('✅ React Frontend is running');
  } catch (error) {
    console.log('❌ React Frontend not running');
    console.log('   Please run: npm start');
    return;
  }
  
  console.log('\n🎉 All services are running correctly!');
  console.log('\n📋 Service URLs:');
  console.log('   Backend: http://localhost:5000');
  console.log('   FastAPI: http://127.0.0.1:8000');
  console.log('   Frontend: http://localhost:3000');
}

// Run the test
testServices().catch(console.error);

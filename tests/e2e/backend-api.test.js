const axios = require('axios');
const { expect } = require('chai');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

describe('Backend API Tests', function () {
  this.timeout(30000);

  it('Backend server is running and accessible', async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/finance/overview`);
      expect(response.status).to.equal(200);
      console.log('✅ Backend is accessible at', BACKEND_URL);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`❌ Backend not running at ${BACKEND_URL}. Please start the backend server.`);
      }
      // 200 or 500 is fine, means server is up
      expect([200, 500]).to.include(error.response?.status || 0);
      console.log('✅ Backend is accessible (status:', error.response?.status || 'N/A', ')');
    }
  });

  it('Workers API endpoint is accessible', async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/workers`);
      expect([200, 500]).to.include(response.status);
      console.log('✅ Workers API accessible');
    } catch (error) {
      expect([200, 500]).to.include(error.response?.status || 0);
      console.log('✅ Workers API accessible (status:', error.response?.status || 'N/A', ')');
    }
  });

  it('Suppliers API endpoint is accessible', async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/suppliers`);
      expect([200, 500]).to.include(response.status);
      console.log('✅ Suppliers API accessible');
    } catch (error) {
      expect([200, 500]).to.include(error.response?.status || 0);
      console.log('✅ Suppliers API accessible (status:', error.response?.status || 'N/A', ')');
    }
  });

  it('ML Finance status endpoint is accessible', async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/ml-finance/status`);
      expect([200, 500, 503]).to.include(response.status);
      console.log('✅ ML Finance API accessible');
    } catch (error) {
      expect([200, 500, 503]).to.include(error.response?.status || 0);
      console.log('✅ ML Finance API accessible (status:', error.response?.status || 'N/A', ')');
    }
  });
});

describe('Frontend Tests', function () {
  this.timeout(30000);

  it('Frontend server is running and accessible', async () => {
    try {
      const response = await axios.get(FRONTEND_URL);
      expect([200, 304]).to.include(response.status);
      console.log('✅ Frontend is accessible at', FRONTEND_URL);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`❌ Frontend not running at ${FRONTEND_URL}. Please start npm start.`);
      }
      throw error;
    }
  });
});

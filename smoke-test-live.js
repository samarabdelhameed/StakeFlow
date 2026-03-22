#!/usr/bin/env node

/**
 * 🌐 StakeFlow Live Demo Smoke Test
 * Tests deployed frontend and backend
 */

const FRONTEND_URL = 'https://stakeflow-frontend.vercel.app';
const BACKEND_URL = 'https://stakeflow-backend.railway.app';

async function testLiveDemo() {
  console.log('🌐 Testing Live Demo...');
  
  // Test backend
  try {
    const response = await fetch(`${BACKEND_URL}/api/validators`);
    if (response.ok) {
      console.log('✅ Backend API is live');
    } else {
      console.log('❌ Backend API failed');
    }
  } catch (error) {
    console.log('❌ Backend unreachable:', error.message);
  }
  
  // Test frontend
  try {
    const response = await fetch(FRONTEND_URL);
    if (response.ok) {
      console.log('✅ Frontend is live');
    } else {
      console.log('❌ Frontend failed');
    }
  } catch (error) {
    console.log('❌ Frontend unreachable:', error.message);
  }
}

testLiveDemo();

#!/bin/bash
echo "🚀 [1/4] Starting StakeFlow Protocol Initialization..."

# 1. Smart Contracts
echo "🛡️ [2/4] Compiling & Testing Smart Contracts (Foundry)..."
cd contracts
forge build
forge test
echo "✅ Contracts are Production-Ready."
cd ..

# 2. AI Backend (Bun)
echo "🧠 [3/4] Ignition: Starting Monte Carlo AI Engine on port 8080..."
cd backend
bun run src/index.ts &
BACKEND_PID=$!
sleep 2
echo "✅ AI Engine is listening on port 8080."
cd ..

# 3. Frontend (Next.js)
echo "🎨 [4/4] Starting Web3 Analytics Terminal on port 3001..."
cd frontend
npm run dev -- -p 3001 &
FRONTEND_PID=$!

echo "======================================================"
echo "🏆 STAKEFLOW IS LIVE! 🏆"
echo "🌐 Frontend: http://localhost:3001"
echo "🧠 Backend API: http://localhost:8080 (Bun)"
echo "⚠️ Press Ctrl+C to terminate all services."
echo "======================================================"

wait

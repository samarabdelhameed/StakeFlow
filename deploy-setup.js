#!/usr/bin/env node

/**
 * 🚀 StakeFlow Auto-Deployment Setup Script
 * Prepares frontend and backend for live demo deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const COLORS = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m'
};

const log = (message, color = COLORS.RESET) => {
  console.log(`${color}${message}${COLORS.RESET}`);
};

const logStep = (step, message) => {
  log(`\n${COLORS.BOLD}${COLORS.CYAN}[${step}]${COLORS.RESET} ${message}`);
};

const logSuccess = (message) => {
  log(`✅ ${message}`, COLORS.GREEN);
};

const logError = (message) => {
  log(`❌ ${message}`, COLORS.RED);
};

const logWarning = (message) => {
  log(`⚠️  ${message}`, COLORS.YELLOW);
};

function createVercelConfig() {
  const vercelConfig = {
    "name": "stakeflow-frontend",
    "version": 2,
    "builds": [
      {
        "src": "package.json",
        "use": "@vercel/next"
      }
    ],
    "routes": [
      {
        "src": "/(.*)",
        "dest": "/$1"
      }
    ],
    "env": {
      "NEXT_PUBLIC_API_URL": "https://stakeflow-backend.railway.app"
    },
    "functions": {
      "app/api/**/*.js": {
        "maxDuration": 30
      }
    }
  };

  fs.writeFileSync('frontend/vercel.json', JSON.stringify(vercelConfig, null, 2));
  logSuccess('Created Vercel configuration');
}

function createRailwayConfig() {
  const railwayConfig = {
    "build": {
      "builder": "NIXPACKS"
    },
    "deploy": {
      "startCommand": "bun run start",
      "restartPolicyType": "ON_FAILURE",
      "restartPolicyMaxRetries": 10
    },
    "environments": {
      "production": {
        "variables": {
          "NODE_ENV": "production",
          "PORT": "${{RAILWAY_PORT}}"
        }
      }
    }
  };

  fs.writeFileSync('backend/railway.json', JSON.stringify(railwayConfig, null, 2));
  logSuccess('Created Railway configuration');
}

function createDockerfiles() {
  // Frontend Dockerfile
  const frontendDockerfile = `# Frontend Dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-slim
WORKDIR /app

COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/node_modules ./node_modules

EXPOSE 3000
CMD ["bun", "run", "start"]
`;

  // Backend Dockerfile
  const backendDockerfile = `# Backend Dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

EXPOSE 8080
CMD ["bun", "run", "start"]
`;

  fs.writeFileSync('frontend/Dockerfile', frontendDockerfile);
  fs.writeFileSync('backend/Dockerfile', backendDockerfile);
  logSuccess('Created Dockerfiles for both frontend and backend');
}

function createNetlifyConfig() {
  const netlifyConfig = `# Netlify Configuration
[build]
  command = "bun run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NEXT_PUBLIC_API_URL = "https://stakeflow-backend.railway.app"

[[redirects]]
  from = "/api/*"
  to = "https://stakeflow-backend.railway.app/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[dev]
  command = "bun run dev"
  port = 3000
`;

  fs.writeFileSync('frontend/netlify.toml', netlifyConfig);
  logSuccess('Created Netlify configuration');
}

function updatePackageJsonForProduction() {
  // Update frontend package.json
  const frontendPkg = JSON.parse(fs.readFileSync('frontend/package.json', 'utf8'));
  frontendPkg.scripts = {
    ...frontendPkg.scripts,
    "build": "next build",
    "start": "next start -p $PORT",
    "export": "next export"
  };
  fs.writeFileSync('frontend/package.json', JSON.stringify(frontendPkg, null, 2));

  // Update backend package.json
  const backendPkg = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  backendPkg.scripts = {
    ...backendPkg.scripts,
    "start": "bun run src/index.ts"
  };
  fs.writeFileSync('backend/package.json', JSON.stringify(backendPkg, null, 2));

  logSuccess('Updated package.json files for production');
}

function createEnvironmentFiles() {
  // Frontend environment
  const frontendEnv = `# Frontend Environment Variables
NEXT_PUBLIC_API_URL=https://stakeflow-backend.railway.app
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_APP_NAME=StakeFlow
NEXT_PUBLIC_APP_DESCRIPTION=Risk-Aware Restaking Protocol
`;

  // Backend environment
  const backendEnv = `# Backend Environment Variables
NODE_ENV=production
PORT=8080
CORS_ORIGIN=https://stakeflow-frontend.vercel.app,https://stakeflow.netlify.app
API_VERSION=v1
`;

  fs.writeFileSync('frontend/.env.production', frontendEnv);
  fs.writeFileSync('backend/.env.production', backendEnv);
  logSuccess('Created production environment files');
}

function createDeploymentGuide() {
  const guide = `# 🚀 StakeFlow Deployment Guide

## Quick Deploy Commands

### Frontend (Vercel)
\`\`\`bash
cd frontend
vercel --prod
\`\`\`

### Frontend (Netlify)
\`\`\`bash
cd frontend
netlify deploy --prod --dir=.next
\`\`\`

### Backend (Railway)
\`\`\`bash
cd backend
railway login
railway link
railway up
\`\`\`

### Backend (Render)
\`\`\`bash
# Connect your GitHub repo to Render
# Use these settings:
# - Build Command: bun install && bun run build
# - Start Command: bun run start
# - Environment: Node.js
\`\`\`

## Live Demo URLs (Update after deployment)

- **Frontend**: https://stakeflow-frontend.vercel.app
- **Backend**: https://stakeflow-backend.railway.app
- **Alternative Frontend**: https://stakeflow.netlify.app

## Environment Variables to Set

### Vercel (Frontend)
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_CHAIN_ID
- NEXT_PUBLIC_PROJECT_ID

### Railway (Backend)
- NODE_ENV=production
- PORT (auto-set by Railway)
- CORS_ORIGIN

## Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] API endpoints respond
- [ ] 3D animations work
- [ ] All routes accessible
- [ ] Mobile responsive
- [ ] CORS configured
- [ ] SSL certificates active

## Smoke Test Live Demo
\`\`\`bash
node smoke-test-live.js
\`\`\`
`;

  fs.writeFileSync('DEPLOYMENT.md', guide);
  logSuccess('Created deployment guide');
}

function createLiveSmokeTest() {
  const liveSmokeTest = `#!/usr/bin/env node

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
    const response = await fetch(\`\${BACKEND_URL}/api/validators\`);
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
`;

  fs.writeFileSync('smoke-test-live.js', liveSmokeTest);
  fs.chmodSync('smoke-test-live.js', '755');
  logSuccess('Created live demo smoke test');
}

function generateReadmeScreenshots() {
  const screenshotGuide = `# 📸 Screenshot Guide for README

## Required Screenshots

1. **Dashboard Overview** (1920x1080)
   - URL: http://localhost:3001/
   - Show: 3D stats cards, portfolio donut, performance charts
   - Highlight: AI allocation, real-time data

2. **Deposit Flow** (1920x1080)
   - URL: http://localhost:3001/deposit
   - Show: Amount input, validator selection, 3D estimation card
   - Highlight: Smart allocation preview

3. **3D Allocation Visualization** (1920x1080)
   - URL: http://localhost:3001/allocation
   - Show: Interactive 3D bar chart, flip cards
   - Highlight: Hover effects, validator details

4. **Analytics Dashboard** (1920x1080)
   - URL: http://localhost:3001/analytics
   - Show: Advanced charts, risk analysis, performance metrics
   - Highlight: Multi-dimensional visualizations

5. **Rewards Center** (1920x1080)
   - URL: http://localhost:3001/rewards
   - Show: Earnings timeline, validator breakdown, claim interface
   - Highlight: Real-time rewards tracking

6. **Mobile Responsive** (375x812)
   - URL: http://localhost:3001/
   - Show: Mobile layout, touch interactions
   - Highlight: 3D effects on mobile

## Screenshot Commands

\`\`\`bash
# Install screenshot tool
npm install -g puppeteer-screenshot-cli

# Take screenshots
screenshot http://localhost:3001/ --width 1920 --height 1080 --output dashboard.png
screenshot http://localhost:3001/deposit --width 1920 --height 1080 --output deposit.png
screenshot http://localhost:3001/allocation --width 1920 --height 1080 --output allocation.png
screenshot http://localhost:3001/analytics --width 1920 --height 1080 --output analytics.png
screenshot http://localhost:3001/rewards --width 1920 --height 1080 --output rewards.png
screenshot http://localhost:3001/ --width 375 --height 812 --output mobile.png
\`\`\`

## Video Demo Script

1. **Opening** (5s): Show dashboard loading with 3D animations
2. **Navigation** (10s): Quick tour of all pages via sidebar
3. **Deposit Flow** (15s): Complete deposit → allocation → confirmation
4. **3D Interactions** (10s): Hover effects, chart interactions
5. **Mobile Demo** (10s): Responsive design showcase
6. **Closing** (5s): Logo and "StakeFlow - Where DeFi meets 3D"

Total: 55 seconds (perfect for social media)
`;

  fs.writeFileSync('SCREENSHOTS.md', screenshotGuide);
  logSuccess('Created screenshot guide');
}

async function runDeploymentSetup() {
  log(`\n${COLORS.BOLD}${COLORS.MAGENTA}🚀 StakeFlow Deployment Setup 🚀${COLORS.RESET}`);
  log(`${COLORS.CYAN}Preparing for Hackathon Glory - Live Demo Deployment${COLORS.RESET}\n`);

  logStep('1', 'Creating Deployment Configurations');
  createVercelConfig();
  createRailwayConfig();
  createNetlifyConfig();

  logStep('2', 'Setting up Docker Containers');
  createDockerfiles();

  logStep('3', 'Updating Package.json for Production');
  updatePackageJsonForProduction();

  logStep('4', 'Creating Environment Files');
  createEnvironmentFiles();

  logStep('5', 'Generating Deployment Guide');
  createDeploymentGuide();

  logStep('6', 'Creating Live Demo Tests');
  createLiveSmokeTest();

  logStep('7', 'Setting up Screenshot Guide');
  generateReadmeScreenshots();

  log(`\n${COLORS.BOLD}${COLORS.GREEN}🎉 Deployment Setup Complete!${COLORS.RESET}`);
  log(`${COLORS.CYAN}📋 Next Steps:${COLORS.RESET}`);
  log(`${COLORS.YELLOW}1. Deploy Frontend: cd frontend && vercel --prod${COLORS.RESET}`);
  log(`${COLORS.YELLOW}2. Deploy Backend: cd backend && railway up${COLORS.RESET}`);
  log(`${COLORS.YELLOW}3. Update URLs in configs${COLORS.RESET}`);
  log(`${COLORS.YELLOW}4. Run live smoke test: node smoke-test-live.js${COLORS.RESET}`);
  log(`${COLORS.YELLOW}5. Take screenshots for README${COLORS.RESET}`);
  
  log(`\n${COLORS.BOLD}📄 Files Created:${COLORS.RESET}`);
  const files = [
    'frontend/vercel.json',
    'frontend/netlify.toml', 
    'frontend/Dockerfile',
    'backend/railway.json',
    'backend/Dockerfile',
    'DEPLOYMENT.md',
    'smoke-test-live.js',
    'SCREENSHOTS.md'
  ];
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      log(`✅ ${file}`, COLORS.GREEN);
    } else {
      log(`❌ ${file}`, COLORS.RED);
    }
  });

  log(`\n${COLORS.BOLD}${COLORS.CYAN}🔥 Ready for Hackathon Demo Deployment! 🔥${COLORS.RESET}`);
}

// Run deployment setup
if (import.meta.url === `file://${process.argv[1]}`) {
  runDeploymentSetup().catch(console.error);
}

export default runDeploymentSetup;
# 📸 Screenshot Guide for README

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

```bash
# Install screenshot tool
npm install -g puppeteer-screenshot-cli

# Take screenshots
screenshot http://localhost:3001/ --width 1920 --height 1080 --output dashboard.png
screenshot http://localhost:3001/deposit --width 1920 --height 1080 --output deposit.png
screenshot http://localhost:3001/allocation --width 1920 --height 1080 --output allocation.png
screenshot http://localhost:3001/analytics --width 1920 --height 1080 --output analytics.png
screenshot http://localhost:3001/rewards --width 1920 --height 1080 --output rewards.png
screenshot http://localhost:3001/ --width 375 --height 812 --output mobile.png
```

## Video Demo Script

1. **Opening** (5s): Show dashboard loading with 3D animations
2. **Navigation** (10s): Quick tour of all pages via sidebar
3. **Deposit Flow** (15s): Complete deposit → allocation → confirmation
4. **3D Interactions** (10s): Hover effects, chart interactions
5. **Mobile Demo** (10s): Responsive design showcase
6. **Closing** (5s): Logo and "StakeFlow - Where DeFi meets 3D"

Total: 55 seconds (perfect for social media)

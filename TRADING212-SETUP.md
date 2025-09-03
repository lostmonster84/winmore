# Trading 212 API Integration Setup Guide

## Overview

The WinMore Trading System now includes read-only Trading 212 API integration to sync your real account balance and portfolio data automatically.

## Quick Setup

### 1. Get Your Trading 212 API Key

1. Log into your Trading 212 account
2. Navigate to Settings → API
3. Generate a new API key with these scopes:
   - `metadata` (for instrument data)
   - `portfolio` (for positions and account info)
   - `history:orders` (for order history)
   - `history:dividends` (for dividend history)
   - `history:transactions` (for transaction history)

### 2. Configure Environment Variables

Add your API key to `.env.local`:

```bash
# Trading 212 API Integration (Read-Only)
TRADING212_API_KEY=your-trading212-api-key-here
TRADING212_BASE_URL=https://live.trading212.com/api/v0
```

### 3. Restart the Development Server

```bash
npm run dev
```

## Features

### ✅ Implemented

- **Portfolio Summary**: Total value, cash, invested amount, P&L
- **Live Position Sync**: All open positions with real-time data
- **Account Integration**: Automatic balance sync with WinMore system
- **Health Monitoring**: API connectivity and status checking
- **Error Handling**: Rate limiting, retries, and graceful degradation
- **Security**: Server-side only API calls, never exposes keys to client

### 🔄 API Endpoints

All endpoints are protected and require authentication:

- `GET /api/broker/trading212/portfolio` - Complete portfolio summary
- `GET /api/broker/trading212/positions` - All open positions
- `GET /api/broker/trading212/account` - Account cash and balance
- `GET /api/broker/trading212/orders?limit=50` - Order history
- `GET /api/broker/trading212/health` - API connectivity status

### 🎯 WinMore Integration

When Trading 212 is connected:

1. **Real Account Balance**: Position sizes automatically calculated from your live Trading 212 balance
2. **Live Portfolio Sync**: View all positions in the Portfolio section
3. **Integration Status**: Visual indicators showing connection health
4. **Automatic Updates**: Data refreshes every 30 seconds

## Usage

### Dashboard Integration

The WinMore dashboard shows a Trading 212 integration card that:

- ✅ **Connected**: Shows your total account value and P&L, syncs balance automatically
- ⚠️ **Not Connected**: Provides setup instructions and uses manual input

### Portfolio View

Navigate to the Portfolio section to see:

- Complete portfolio overview with all metrics
- Individual position details with P&L
- Real-time price and value updates
- Position-level performance tracking

## Security & Privacy

- **Read-Only Access**: Integration can only read data, never place trades
- **Server-Side Only**: API key never sent to browser/client
- **Rate Limiting**: Respects Trading 212 API limits with automatic backoff
- **Caching**: 30-second cache reduces API calls and improves performance
- **Error Handling**: Graceful fallbacks when API is unavailable

## Troubleshooting

### API Key Issues

1. **"Trading 212 Not Connected"**: Check your API key in `.env.local`
2. **Rate Limited**: Wait a minute and refresh - automatic retry will resume
3. **Authentication Failed**: Verify your API key hasn't expired

### Common Solutions

```bash
# Check environment variables are loaded
cat .env.local

# Restart development server
npm run dev

# Test API connectivity (requires authentication)
curl http://localhost:3001/api/broker/trading212/health
```

### Manual Fallback

If Trading 212 API is unavailable, the system automatically falls back to manual account balance input. All WinMore features continue to work normally.

## API Rate Limits

- **Requests per minute**: 100 (Trading 212 standard)
- **Automatic retry**: Exponential backoff on failures
- **Caching**: 30-second cache reduces API usage
- **Health checks**: Monitor API status and latency

## Next Steps

1. **Add API Key**: Follow setup instructions above
2. **Test Connection**: Check the Trading 212 integration card on dashboard
3. **Verify Data**: Navigate to Portfolio section to see live data
4. **Monitor Health**: Use the health endpoint to check API status

The integration will automatically sync your Trading 212 account balance with the WinMore position sizing system, ensuring your 5% and 10% position calculations are always based on your real account value.

---

**🔒 Security Note**: Your Trading 212 API key is never exposed to the browser and all requests are made server-side only. The integration has read-only access and cannot place trades or modify your account.
# **OUTPOST DASHBOARD - Product Requirements Document**

## **Executive Summary**

**Product:** Outpost Dashboard - A dead-simple stocks monitoring system for momentum traders  
**Mission:** Alert when stocks hit prime entry conditions, nothing more  
**User:** Single trader (James) managing £30K→£100K journey  
**Platform:** Web app (desktop-first, mobile-responsive)

---

## **Core Product Vision**

**What it is:** A focused dashboard that watches for your specific entry signals and alerts you when to strike.

**What it's NOT:**
- Not another bloated trading platform
- Not a social trading app
- Not an AI prediction tool
- Not a portfolio manager

**One-line pitch:** *"Cursor for trading - simple, focused, gets out of your way"*

---

## **MVP Features (v1.0)**

### **1. Watchlist Monitor** *(Main Screen)*
```
┌─────────────────────────────────────────────────┐
│ WATCHLIST               VIX: 18.5 ↓   Mode: MIX │
├─────────────────────────────────────────────────┤
│ NVDA  $898  ↓5.2%  🔥 OVERSOLD  Score: 7/10     │
│ TSLA  $412  ↓2.1%  📊 MOMENTUM  14d left        │
│ MSFT  $445  ↑0.8%  ⏸️  WATCHING               │
│ AMD   $178  ↓8.1%  🎯 ENTRY!   Score: 9/10     │
└─────────────────────────────────────────────────┘
```

**Core functionality:**
- Add/remove tickers (max 20 active)
- Real-time price & % change
- Entry signal detection
- Momentum window countdown
- VIX level display

### **2. Entry Signal Engine**

**Oversold Hunter Signals:**
- Gap down >5% from previous close
- RSI <30
- Near 52-week low (<10% away)
- Volume spike (>2x average)
- VIX above threshold
- **Output:** Confluence score 0-10

**Momentum Signals:**
- Earnings beat + guidance raise
- Breaking key resistance
- Unusual options activity
- Volume breakout
- **Output:** 14-30 day window timer

### **3. Quick Entry Calculator**
```
Entry Calculator
━━━━━━━━━━━━━━━━
Stock: AMD
Price: $178
Portfolio: £30,000
Risk Level: [A] B C
━━━━━━━━━━━━━━━━
Position Size: £4,500 (15%)
Shares: 25
Stop Loss: £169 (-5%)
```

One-click position sizing based on:
- A-grade: 15-20%
- B-grade: 10%
- C-grade: 5%

### **4. Active Positions Tracker**
```
ACTIVE POSITIONS (4)          Heat: 8% ✓
────────────────────────────────────────
NVDA  +12.3%  Day 8/14   🔥 PROTECTED
TSLA  -2.1%   Day 3/14   🔥 PROTECTED  
PLTR  +5.2%   Day 45     ✂️ TRIMMABLE
COIN  -8.2%   Day 2      ⚠️ STOP: $145
```

**Shows:**
- P&L %
- Momentum window status (sacred 14 days)
- Stop loss alerts
- Portfolio heat (total unrealized loss %)

### **5. Daily Pulse** *(Morning Brief)*
```
DAILY PULSE - Tuesday 3 Sept
━━━━━━━━━━━━━━━━━━━━━━━━━━
Market Mode: RISK-ON (VIX: 18.5)
Seasonal: SEPTEMBER (20% cash target)
━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 3 ENTRY SIGNALS ACTIVE
⚠️ 2 STOPS NEED ADJUSTMENT  
📊 4 EARNINGS THIS WEEK
💰 Portfolio: £34,250 (+14.2%)
```

---

## **Technical Architecture**

### **Data Pipeline**
- **Primary:** Trading 212 API (when available) or manual sync
- **Market Data:** Yahoo Finance API / Alpha Vantage (free tier)
- **VIX Feed:** CBOE real-time
- **Refresh Rate:** 1-minute during market hours

### **Tech Stack (Simple)**
- **Frontend:** Next.js + Tailwind (clean, no gradients)
- **Backend:** Node.js + Redis (for alerts)
- **Database:** PostgreSQL (positions, history)
- **Hosting:** Vercel/Railway (simple deployment)
- **Alerts:** Browser notifications + optional Discord webhook

### **Design Principles**
- **Brutal simplicity** - No charts, no news, no fluff
- **Information density** - Everything visible at a glance
- **Speed** - Instant load, instant updates
- **Focus** - Only shows what affects TODAY's decisions
- **Mobile-ready** - But desktop-first

---

## **User Flow**

1. **Open dashboard** → See all watchlist at a glance
2. **Spot entry signal** → Click for position calculator
3. **Execute trade** → Add to active positions
4. **Monitor momentum** → Sacred window countdown
5. **Get alerts** → Stop adjustments, exit signals

**Total clicks from alert to trade: 2**

---

## **Non-Features (Explicitly Excluded)**

- ❌ Charts (use TradingView)
- ❌ News feed (use Twitter/Bloomberg)
- ❌ Backtesting (use separate tools)
- ❌ Social features (trade alone)
- ❌ AI predictions (use confluence scoring)
- ❌ Options flow (too complex for MVP)
- ❌ Multiple portfolios (one account, one focus)

---

## **Success Metrics**

1. **Speed:** Page load <500ms, updates <100ms
2. **Accuracy:** 100% correct signal detection
3. **Usage:** Checked every market open
4. **Actionability:** >50% of signals result in trades
5. **Simplicity:** <5 minute learning curve

---

## **Development Phases**

### **Phase 1: Core MVP (Week 1-2)**
- Watchlist with real-time prices
- Oversold signal detection
- Position calculator
- Basic active positions tracker

### **Phase 2: Intelligence (Week 3-4)**
- Momentum window tracking
- VIX integration
- Stop loss monitoring
- Daily pulse summary

### **Phase 3: Alerts (Week 5)**
- Browser notifications
- Discord integration
- End-of-day summary
- Stop adjustment reminders

### **Phase 4: Polish (Week 6)**
- Performance optimization
- Mobile responsiveness
- Data export
- Settings/preferences

---

## **Key Differentiators**

**vs TradingView:** No charts, just signals  
**vs Bloomberg Terminal:** 0.01% of features, 100% of what you need  
**vs Robinhood:** No social, no gamification, pure utility  
**vs Excel:** Real-time, automated, purposeful

---

## **Constraints & Decisions**

- **Single user:** No auth needed initially (localhost or password-protected)
- **Trading 212 limits:** Manual position entry if API unavailable
- **Market hours:** Must work during UK evening (US market hours)
- **Data costs:** Use free tiers, upgrade only if essential
- **No perfection:** Ship fast, iterate based on actual trading

---

## **MVP Definition of Done**

✅ Can monitor 20 stocks simultaneously  
✅ Alerts on oversold conditions (>5% gap down)  
✅ Shows position sizing instantly  
✅ Tracks momentum windows  
✅ Runs on a £5/month server  
✅ Loads in under 1 second  
✅ Zero maintenance required  

---

## **The One Thing**

If this dashboard does ONE thing perfectly, it should:

**Alert you within 30 seconds when any watched stock hits your pre-defined entry criteria, with position size calculated and ready to execute.**

Everything else is secondary.

---

## **Next Steps**

1. **Validate core concept** with paper trading for 1 week
2. **Build MVP** in Next.js (est. 40 hours)
3. **Test with real positions** (small size)
4. **Iterate based on actual usage**
5. **Add features only when pain is real**

---

**Remember:** This isn't about building the perfect trading platform. It's about building YOUR perfect entry alert system. Every feature should directly contribute to the £30K→£100K goal.

**Ship it simple. Make it work. Then make it better.**



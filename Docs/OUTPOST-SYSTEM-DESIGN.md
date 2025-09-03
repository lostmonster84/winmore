# OUTPOST System Design & Delivery Plan

Purpose: Translate Win More System docs and Claude V2/V3 guidance into an implementable product architecture for Outpost. This is the specification we will build.

---

## 1) Product Goals and Operating Principles

- Win-rate first: Help James win more trades than he loses.
- Mechanical execution: +10% target, -5% stop, 3 trades/day max.
- Monthly/dynamic allocation: Seasonal guidance (V2) plus adaptive VIX/market context (V3).
- One-setup focus per period: Screen, score, and execute only the chosen setup.
- Discipline guardrails: Prevent rule violations (sizing, timing, allocation).
- Fast daily workflow: 10–15 minutes from screening to decision.

---

## 2) Core Capabilities

- Account Tracker: Persistent balance, position sizes, allocations, recent performance, streaks.
- Market Context: VIX, SPY/QQQ trend, time/market status, holiday calendar.
- Setup Engine: 5 setups with rules, validation, and dynamic prioritization.
- Screening Assist: Shortcuts, links, and inputs to capture candidate validations quickly.
- Conviction Scoring: Consistent scoring framework (base + dynamic thresholds).
- Trade Ticket: Pre-filled execution plan (size, stop, target) for Trading 212.
- Guardrails: Proactive checks on sizing, allocation, windows, daily limits.
- Logging & Reviews: Daily/weekly/monthly logs and analytics.

---

## 3) High-Level Architecture

- Frontend (Next.js 14 App Router, React, Tailwind):
  - Pages: Dashboard, Screening, Trade (ticket), Reviews, Settings.
  - Components: Context banner, Metric cards, Watchlist, Setup widgets, Guardrails toasts/modals.
  - State: Client store for session/UI; server actions for critical ops.
  - Real-time: SSE or WebSocket for streaming market and VIX.

- Backend (Next.js API Routes + Server Actions):
  - Account service: Read/write `account-tracker.json` (phase 1), Postgres later.
  - Market service: VIX level, quotes, indicators (RSI, SMA, performance windows).
  - Rules Engine: Deterministic library implementing V2 (calendar) + V3 (adaptive) logic.
  - Guardrails service: Centralized checks for sizing, allocation, timing, limits.
  - Logging service: Append-only trade logs, analytics aggregation.

- Data Stores:
  - Phase 1: Local JSON (`account-tracker.json`, `trade-log.json`).
  - Phase 2: Postgres (accounts, sessions, trades, metrics, configs), Redis cache.

- Integrations:
  - Market Data: Polygon.io/Alpaca/IEX for quotes; CBOE VIX; Yahoo fallback.
  - Calendars: US market holidays (NPM lib or static table).
  - Notifications: Email (Resend), push (Web Push), optional SMS (Twilio).

---

## 4) Domain Model (Phase 2: Postgres)

- account(id, owner, balance, invested_amount, monthly_max_allocation_pct, updated_at)
- account_metrics(id, account_id, rolling_win_rate_20, mtm_return_mtd, streak_win, streak_loss)
- rules_config(id, account_id, mode: ['calendar','adaptive','hybrid'], daily_trade_limit, stop_pct, target_pct)
- session_context(id, account_id, vix, vix_avg_20d, spy_5d, spy_20d, trend, market_status, created_at)
- setup_focus(id, account_id, primary_setup, secondary_setup, conviction_threshold)
- candidate(id, account_id, ticker, setup, rsi, above_sma200, news_clear, score, created_at)
- trade(id, account_id, ticker, setup, entry_price, stop_price, target_price, size_gbp, size_pct, opened_at, closed_at, pnl_pct, pnl_gbp, exit_reason)
- alert(id, account_id, type, payload, status, created_at)

---

## 5) Rules & Algorithms

- Allocation (Calendar V2): Month → max invested percent.
- Allocation (Adaptive V3): Function of VIX, trend, seasonality; capped 20–90%.
- Position Sizing: Standard/exceptional percentages; volatility/performance adjustments.
- Conviction Thresholds: Base 5 with dynamic 4–6 range by VIX/opportunity density.
- Setup Selection: Score each setup using VIX, trend, earnings, sector rotation; pick top.
- Trading Windows: UK-time windows with VIX-based wait adjustments.
- Guardrails: Hard stops on rule violations; explanatory prompts.

---

## 6) User Flows

- Daily Start (9:00 AM): Context refresh → positions review → focus confirm.
- Pre-open (1:00–2:30 PM): Gappers, earnings reactions prep.
- Execution (3:00–8:00 PM): Screen → score → guardrails → ticket → log.
- End-of-day (9:00 PM): Update logs, metrics, plan tomorrow.

---

## 7) UI Design Principles (Trading UX Best Practices)

- Information density with clarity: modular widgets, progressive disclosure.
- Real-time responsiveness: optimistic UI, latency-tolerant streams.
- Customizable layouts: resizable panels, dark/light, keyboard shortcuts.
- Visual hierarchy: color-safe alerts, consistent iconography, accessible contrast.
- Error-prevention first: confirmations for destructive actions, guardrail banners.
- Mobile priority tasks: status, watchlist, single-ticket flow, thumb reach.

---

## 8) Screens & Components

- Dashboard:
  - Context Banner (Date/Time UK, Market status, VIX, Trend)
  - Account Metrics (balance, 5%/10% sizes, allocation used)
  - Setup Focus Card (primary/secondary, conviction threshold)
  - Opportunity Feed (watchlist movers, candidates)

- Screening:
  - Setup tabs (1–5) with checklists
  - Candidate form (ticker, RSI, news, MA state, notes) → score
  - External links (Finviz, TradingView, Yahoo) prefilled

- Trade Ticket:
  - Auto-calculated size, stop, target
  - Trading 212 step-by-step overlay
  - Guardrails summary and confirmations

- Reviews:
  - Daily log table, weekly/monthly analytics
  - Setup performance breakdown and streaks

- Settings:
  - Account value, rules mode, alerts, integrations

---

## 9) Security & Privacy

- Local-first in phase 1; env-separated secrets; HTTPS only.
- Auth via NextAuth (email/pass or OAuth) when multi-user.
- PII minimization; audit logs for critical actions.

---

## 10) Observability

- Structured logs for decisions, guardrail hits, and scoring.
- Metrics: time-to-decision, win-rate, rule adherence.
- Error tracking (Sentry) and uptime (health endpoints).

---

## 11) Delivery Milestones & Backlog

Milestone A: Foundations (Week 1–2)
- Create design doc (this file)
- Account Tracker JSON read/write with derived sizes
- Static Market Context (mock VIX/Trend) + clock/market status
- UI shell: layout, sidebar, context banner, metric cards

Milestone B: Rules & Guardrails (Week 3–4)
- Implement Rules Engine (calendar + adaptive + hybrid switch)
- Guardrails service with all error-prevention checks
- Screening forms with conviction scoring and setup checklists

Milestone C: Market Data & Indicators (Week 5–6)
- Integrate live VIX and quotes; compute RSI, SMA, 5d/20d perf
- SSE/WebSocket streaming to UI; loading states; retry/backoff

Milestone D: Trade Workflow (Week 7)
- Trade Ticket generator with auto stop/target
- Trading 212 overlay and copy-to-clipboard helpers
- Logging pipeline to `trade-log.json`

Milestone E: Analytics & Reviews (Week 8)
- Daily/weekly/monthly review pages with charts
- Setup performance analytics and streak tracking

Milestone F: Reliability & Mobile (Week 9)
- Notifications (email/push) for alerts and guardrails
- Mobile layout polish and accessibility improvements

Milestone G: Data Store & Auth (Week 10+)
- Migrate to Postgres; add NextAuth
- Background jobs (cron) for metrics rollups

---

## 12) Acceptance Criteria (Phase 1)

- End-to-end daily flow works with live VIX/quotes.
- Guardrails block violations reliably with clear messages.
- One-setup focus enforced via UI and server checks.
- Trade ticket outputs exact numbers for size/stop/target.
- Logs and review pages render accurate metrics.

---

## 13) Open Questions

- Preferred market data vendor and budget?
- Do we need broker APIs later, or keep Trading 212 manual?
- Threshold tuning strategy cadence (weekly autopilot vs manual)?

---

## 14) Implementation TODOs

- Design/Docs
  - Finalize setup checklists content parity with Docs
  - Define UX copy for guardrails

- Backend
  - Account service (JSON + schema for PG)
  - Rules Engine library (calendar, adaptive, hybrid)
  - Market service with vendor abstraction + indicators
  - Guardrails service (central checks)
  - Logging service (append-only)

- Frontend
  - Dashboard context and metrics
  - Screening forms + scoring
  - Trade ticket overlay + calculator
  - Reviews analytics pages
  - Alerts UI (toasts, modals, settings)

- Ops
  - Secrets management and environment setup
  - Telemetry + error tracking
  - CI for type/lint/test

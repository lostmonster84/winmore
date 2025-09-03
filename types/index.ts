// WIN MORE TRADING SYSTEM V2 - Type Definitions
// Comprehensive type definitions for disciplined, consistent trading
// Updated from aggressive OUTPOST to disciplined Win More methodology

// Import Win More System types
export * from './win-more';

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  high52Week: number;
  low52Week: number;
  dayHigh: number;
  dayLow: number;
  lastUpdated: Date;
}

export interface TechnicalIndicators {
  rsi: number;
  sma20: number;
  sma50: number;
  sma200: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  volumeSpike: number; // Multiple of average volume
  gapPercent: number; // Gap up/down from previous close
  nearLow52Week: number; // Percentage away from 52-week low
  nearHigh52Week: number; // Percentage away from 52-week high
}

export interface OversoldSignal {
  symbol: string;
  score: number; // 0-10 confluence score
  signals: {
    gapDown: boolean; // >5% gap down
    lowRSI: boolean; // RSI <30
    nearLow: boolean; // <10% from 52-week low
    volumeSpike: boolean; // >2x average volume
    vixElevated: boolean; // VIX >21
  };
  timestamp: Date;
}

export interface MomentumSignal {
  symbol: string;
  type: 'earnings' | 'breakout' | 'options' | 'catalyst';
  windowStart: Date;
  windowEnd: Date; // 14-day protection window
  catalyst: string;
  confidence: 'high' | 'medium' | 'low';
  timestamp: Date;
}

export interface Position {
  id: string;
  symbol: string;
  shares: number;
  entryPrice: number;
  currentPrice: number;
  entryDate: Date;
  positionSize: number; // Percentage of portfolio
  stopLoss: number;
  targetPrice?: number;
  riskGrade: 'A' | 'B' | 'C';
  momentumProtected: boolean; // Within 14-day window
  unrealizedPL: number;
  unrealizedPLPercent: number;
  daysHeld: number;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  addedDate: Date;
  alertConditions: {
    oversoldScore?: number; // Alert when score >= this
    priceBelow?: number; // Alert when price drops below
    volumeSpike?: number; // Alert when volume >= this multiple
    rsiBelow?: number; // Alert when RSI drops below
  };
  lastAlerted?: Date;
}

export interface VIXData {
  value: number;
  change: number;
  changePercent: number;
  timestamp: Date;
  mode: 'EXTREME_CALM' | 'NORMAL' | 'GETTING_SPICY' | 'MODERATE_FEAR' | 'HIGH_FEAR' | 'RARE_EVENT';
  deploymentLevel: number; // Percentage to deploy based on VIX
}

export interface MarketMode {
  current: 'OVERSOLD_HUNTER' | 'EARNINGS_MOMENTUM' | 'PORTFOLIO_BUILDER' | 'CASH_PRESERVATION' | 'MIXED';
  confidence: number; // 1-10
  reason: string;
  seasonalAllocation: number; // Target percentage invested
  vixMode: VIXData['mode'];
  timestamp: Date;
}

export interface Portfolio {
  totalValue: number;
  cash: number;
  invested: number;
  investedPercent: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  portfolioHeat: number; // Total unrealized loss percentage
  positions: Position[];
  largestPosition: number; // Percentage
  correlationClusters: string[]; // Sectors with >2 positions
  lastUpdated: Date;
}

export interface Alert {
  id: string;
  type: 'ENTRY_SIGNAL' | 'STOP_LOSS' | 'MOMENTUM_WINDOW' | 'PORTFOLIO_HEAT' | 'VIX_CHANGE';
  symbol?: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  dismissed: boolean;
  actionRequired: boolean;
}

export interface DailyPulse {
  date: Date;
  marketMode: MarketMode;
  vixData: VIXData;
  entrySignals: number;
  stopAdjustments: number;
  earningsThisWeek: number;
  portfolioValue: number;
  portfolioChange: number;
  keyAlerts: Alert[];
}

export interface EarningsData {
  symbol: string;
  reportDate: Date;
  estimates: {
    eps: number;
    revenue: number;
    whisperEPS?: number;
  };
  actual?: {
    eps: number;
    revenue: number;
    surprise?: number;
  };
  guidance?: string;
}

export interface OptionsFlow {
  symbol: string;
  type: 'call' | 'put';
  strike: number;
  expiration: Date;
  volume: number;
  openInterest: number;
  premium: number;
  unusualActivity: boolean;
  timestamp: Date;
}

export interface TradingSettings {
  portfolioSize: number; // Current portfolio value
  maxPositionSize: number; // Maximum single position percentage
  defaultStopLoss: number; // Default stop loss percentage
  riskGrades: {
    A: { min: number; max: number }; // 15-20%
    B: { min: number; max: number }; // 10%
    C: { min: number; max: number }; // 5%
  };
  alertSettings: {
    browserNotifications: boolean;
    discordWebhook?: string;
    telegramBot?: string;
  };
  dataRefreshInterval: number; // Seconds
  marketHours: {
    start: string; // "14:30" (UK time for US market)
    end: string; // "21:00"
    preMarket: string; // "13:00"
  };
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: Date;
}

export interface ChartData {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// AI Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: {
    portfolio?: Portfolio;
    watchlist?: WatchlistItem[];
    currentSymbol?: string;
  };
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastActive: Date;
  title?: string;
}

// Database Schema Types
export interface DatabaseSchema {
  stocks: Stock;
  positions: Position;
  watchlist: WatchlistItem;
  alerts: Alert;
  settings: TradingSettings;
  chat_sessions: ChatSession;
  chat_messages: ChatMessage;
}
// WIN MORE SYSTEM V2 - Type Definitions
// Disciplined trading system focused on consistency over aggression

export type SetupType = 1 | 2 | 3 | 4 | 5;

export interface WinMoreAccount {
  currentBalance: number;
  currency: 'GBP' | 'USD';
  lastUpdated: Date;
  
  // Position sizing (always calculated dynamically)
  standardPositionPercent: 5; // Always 5%
  exceptionalPositionPercent: 10; // Always 10% 
  standardPositionSize: number; // currentBalance * 0.05
  exceptionalPositionSize: number; // currentBalance * 0.10
  
  // Monthly allocation limits
  currentMonth: number; // 1-12
  monthlyAllocationLimit: number; // 30%-80% based on month
  currentlyInvested: number;
  currentlyInvestedPercent: number;
  availableToDeploy: number;
  
  // Performance tracking
  monthlyReturn: number;
  yearToDateReturn: number;
  totalTrades: number;
  winningTrades: number;
  currentWinRate: number; // Target: 60%+
}

export interface WinMoreSetup {
  id: SetupType;
  name: string;
  description: string;
  targetWinRate: number;
  criteria: {
    priceChange: { min: number; max: number };
    rsiThreshold?: number;
    maRequirement?: '50-day' | '200-day' | 'above-both';
    newsRequirement: 'no-bad-news' | 'earnings-miss' | 'sector-selloff' | 'gap-no-news';
    volumeRequirement?: number; // Multiple of average
    holdTime: { min: number; max: number }; // Days
  };
  profitTarget: number; // Always +10% except Setup 3 (+10-15%)
  stopLoss: number; // Always -5% except Setup 3 (-7%)
}

export interface SetupCandidate {
  symbol: string;
  setupType: SetupType;
  convictionScore: number; // 0-10 based on Win More criteria
  convictionBreakdown: {
    matchesSetup: number; // 0-3 points
    technicalConfirmation: number; // 0-2 points
    noBadNews: number; // 0-2 points
    businessUnderstanding: number; // 0-2 points
    vixElevated: number; // 0-1 points
  };
  currentPrice: number;
  recommendedEntry: number;
  calculatedStop: number; // -5% or -7%
  calculatedTarget: number; // +10% or +10-15%
  rsi: number;
  above200DayMA: boolean;
  above50DayMA: boolean;
  volumeVsAverage: number;
  lastNewsCheck: Date;
  newsClean: boolean;
  timestamp: Date;
}

export interface WinMoreTrade {
  id: string;
  symbol: string;
  setupType: SetupType;
  convictionScore: number;
  
  // Entry details
  entryDate: Date;
  entryPrice: number;
  positionSizePercent: 5 | 10; // Only these two options
  positionSizePounds: number;
  accountBalanceAtEntry: number;
  
  // Risk management
  stopLoss: number; // -5% or -7%
  profitTarget: number; // +10% or +10-15%
  
  // Exit details (when closed)
  exitDate?: Date;
  exitPrice?: number;
  realizedPL?: number;
  realizedPLPercent?: number;
  holdDays?: number;
  exitReason?: 'PROFIT_TARGET' | 'STOP_LOSS' | 'MANUAL';
  
  // Performance tracking
  isWinner?: boolean;
  followedRules: {
    correctPositionSize: boolean;
    setStopLoss: boolean;
    setProfitTarget: boolean;
    mechanicalExit: boolean;
  };
}

export interface MonthlyAllocationLimits {
  JANUARY: 70;
  FEBRUARY: 80;
  MARCH: 70;
  APRIL: 70;
  MAY: 60;
  JUNE: 50;
  JULY: 50;
  AUGUST: 40;
  SEPTEMBER: 30; // Worst month historically
  OCTOBER: 60;
  NOVEMBER: 80; // Best month historically  
  DECEMBER: 70;
}

export interface DailyTradingLimits {
  maxTradesPerDay: 3;
  tradesExecutedToday: number;
  canTrade: boolean;
  nextResetTime: Date; // Midnight UK time
}

export interface WinMoreVIX {
  value: number;
  timestamp: Date;
  opportunityLevel: 'NORMAL' | 'STANDARD' | 'INTERESTING' | 'OPPORTUNITIES' | 'RARE_GIFT';
  interpretation: string;
  positionSizeRecommendation: '5% only' | '5% standard' | '5-10% available';
}

export interface MonthlyPerformance {
  month: number;
  year: number;
  startingBalance: number;
  endingBalance: number;
  monthlyReturn: number;
  totalTrades: number;
  winningTrades: number;
  winRate: number;
  setupFocus: SetupType;
  ruleCompliance: number; // Percentage
  success: boolean; // Any green amount = true
  target: 'GREAT' | 'GOOD' | 'OKAY' | 'SUCCESS'; // Based on return
}

export interface SetupFocus {
  currentMonth: number;
  chosenSetup: SetupType;
  lastChanged: Date;
  tradesThisMonth: number;
  winRateThisMonth: number;
  shouldRotateNextMonth: boolean;
}

export interface RuleEnforcement {
  // Position sizing validation
  validatePositionSize(accountBalance: number, positionSize: number): {
    valid: boolean;
    maxAllowed: number;
    error?: string;
  };
  
  // Daily limits
  validateDailyTradeLimit(tradesExecutedToday: number): {
    valid: boolean;
    remaining: number;
    error?: string;
  };
  
  // Monthly allocation
  validateMonthlyAllocation(currentMonth: number, currentInvestment: number, accountBalance: number): {
    valid: boolean;
    maxAllowed: number;
    error?: string;
  };
  
  // Setup focus
  validateSetupFocus(tradeSetup: SetupType, monthlyFocus: SetupType): {
    valid: boolean;
    error?: string;
  };
}

export interface WinMoreSettings {
  // Account management
  accountValue: number;
  platform: 'Trading 212';
  timezone: 'Europe/London';
  
  // Trading hours (UK time for US market)
  marketHours: {
    preMarket: '13:00';
    open: '14:30';
    waitPeriod: 30; // Minutes to wait after open
    firstTradeWindow: '15:00';
    secondTradeWindow: '16:30';
    finalTradeWindow: '19:00';
    close: '21:00';
  };
  
  // Current month setup focus
  setupFocus: SetupType;
  
  // Performance targets
  targets: {
    winRate: 60; // Percentage
    monthlyTargets: {
      great: { min: 5; max: 8 }; // Percentage
      good: { min: 3; max: 5 };
      okay: { min: 1; max: 3 };
      success: 0.1; // Any green amount
    };
    annualTarget: { min: 25; max: 40 }; // Percentage
  };
  
  // Risk management
  stopLoss: -5; // Always -5% (except Setup 3: -7%)
  profitTarget: 10; // Always +10% (except Setup 3: +10-15%)
  positionSizes: {
    standard: 5; // Percentage
    exceptional: 10; // Percentage
  };
}

export interface WinMoreDashboard {
  account: WinMoreAccount;
  currentSetupFocus: SetupFocus;
  todaysTradingLimits: DailyTradingLimits;
  setupCandidates: SetupCandidate[];
  openTrades: WinMoreTrade[];
  monthlyPerformance: MonthlyPerformance;
  vixData: WinMoreVIX;
  nextAction: string;
}

// Claude AI Integration Types
export interface ClaudeContext {
  currentDate: Date;
  ukTime: string;
  marketStatus: 'PRE_MARKET' | 'WAIT_PERIOD' | 'TRADING_WINDOW' | 'CLOSED';
  currentMonth: string;
  monthlyCharacter: string; // "Worst month", "Best month", etc.
  maxAllocation: number;
  accountValue: number;
  setupFocus: SetupType;
  tradesExecutedToday: number;
}

export interface ClaudeResponse {
  context: ClaudeContext;
  recommendation: 'TRADE' | 'NO_TRADE' | 'HOLD' | 'ALLOCATION_LIMIT';
  trade?: {
    symbol: string;
    setupType: SetupType;
    convictionScore: number;
    entry: number;
    stop: number;
    target: number;
    positionSize: number;
    reasoning: string;
  };
  portfolioStatus: {
    currentAccount: number;
    standardPosition: number;
    exceptionalPosition: number;
    monthlyMaximum: number;
    currentlyInvested: number;
    availableToDeploy: number;
  };
  message: string;
}

// API Response types
export interface WinMoreAPIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}
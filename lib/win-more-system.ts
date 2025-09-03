// WIN MORE SYSTEM V2 - Core System Logic
// The disciplined trading system that enforces good habits

import { 
  WinMoreAccount, 
  SetupType, 
  WinMoreSetup, 
  SetupCandidate, 
  MonthlyAllocationLimits,
  DailyTradingLimits,
  WinMoreVIX,
  MonthlyPerformance,
  RuleEnforcement
} from '@/types/win-more';

// The 5 Setup Definitions (Core of Win More System)
export const WIN_MORE_SETUPS: Record<SetupType, WinMoreSetup> = {
  1: {
    id: 1,
    name: "Oversold Quality Bounce",
    description: "Stock down 8-15% on market fear (no bad news), RSI <40, above 200-day MA",
    targetWinRate: 70,
    criteria: {
      priceChange: { min: -15, max: -8 },
      rsiThreshold: 40,
      maRequirement: '200-day',
      newsRequirement: 'no-bad-news',
      volumeRequirement: 1.5,
      holdTime: { min: 3, max: 7 }
    },
    profitTarget: 10,
    stopLoss: -5
  },
  2: {
    id: 2,
    name: "Support Bounce",
    description: "Stock at 50 or 200-day MA, 3+ previous bounces, volume confirmation",
    targetWinRate: 68,
    criteria: {
      priceChange: { min: -5, max: 2 },
      maRequirement: 'above-both',
      newsRequirement: 'no-bad-news',
      volumeRequirement: 1.3,
      holdTime: { min: 5, max: 10 }
    },
    profitTarget: 10,
    stopLoss: -5
  },
  3: {
    id: 3,
    name: "Earnings Overreaction",
    description: "Good company drops >10% on slight miss, revenue growing, guidance maintained",
    targetWinRate: 65,
    criteria: {
      priceChange: { min: -25, max: -10 },
      newsRequirement: 'earnings-miss',
      holdTime: { min: 5, max: 14 }
    },
    profitTarget: 12.5, // +10-15% average
    stopLoss: -7
  },
  4: {
    id: 4,
    name: "Sympathy Selloff",
    description: "Best company down with weak peers, no company-specific news",
    targetWinRate: 62,
    criteria: {
      priceChange: { min: -12, max: -5 },
      newsRequirement: 'sector-selloff',
      holdTime: { min: 3, max: 5 }
    },
    profitTarget: 9, // +8-10% average
    stopLoss: -5
  },
  5: {
    id: 5,
    name: "Gap Fill",
    description: "Gap down >5% on no news, holding above support",
    targetWinRate: 60,
    criteria: {
      priceChange: { min: -15, max: -5 },
      newsRequirement: 'gap-no-news',
      holdTime: { min: 1, max: 3 }
    },
    profitTarget: 6, // +5-7% average
    stopLoss: -5
  }
};

// Monthly Allocation Limits (Seasonal Intelligence)
export const MONTHLY_ALLOCATION_LIMITS: MonthlyAllocationLimits = {
  JANUARY: 70,
  FEBRUARY: 80,
  MARCH: 70,
  APRIL: 70,
  MAY: 60,
  JUNE: 50,
  JULY: 50,
  AUGUST: 40,
  SEPTEMBER: 30, // Worst month - survival mode
  OCTOBER: 60,
  NOVEMBER: 80, // Best month historically
  DECEMBER: 70
};

// Get current month's allocation limit
export function getCurrentMonthAllocationLimit(): number {
  const now = typeof window !== 'undefined' ? new Date() : new Date(2024, 8, 1); // Default to September (conservative)
  const month = now.toLocaleString('en-US', { month: 'long' }).toUpperCase() as keyof MonthlyAllocationLimits;
  return MONTHLY_ALLOCATION_LIMITS[month];
}

// Get month character description
export function getMonthCharacter(month?: number): string {
  const currentMonth = month || (typeof window !== 'undefined' ? new Date().getMonth() + 1 : 9); // Default to September (conservative)
  
  const descriptions: Record<number, string> = {
    1: "New year momentum - Quality setups only",
    2: "Earnings season - Best opportunities only", 
    3: "Quarter-end - Book profits",
    4: "Spring trading - Stay selective",
    5: "Sell in May - Reduce activity",
    6: "Summer begins - Defensive",
    7: "Low volume - Minimal trades",
    8: "Pre-September - Build cash",
    9: "WORST MONTH - Survival mode only",
    10: "Volatility - Selective buying",
    11: "BEST MONTH - Most active",
    12: "Year-end - Take profits"
  };
  
  return descriptions[currentMonth] || "Unknown month";
}

// Dynamic Position Size Calculator
export class PositionSizeCalculator {
  static calculateStandardPosition(accountBalance: number): number {
    return accountBalance * 0.05; // Always 5%
  }
  
  static calculateExceptionalPosition(accountBalance: number): number {
    return accountBalance * 0.10; // Always 10%
  }
  
  static validatePositionSize(accountBalance: number, positionSize: number): {
    valid: boolean;
    error?: string;
    maxAllowed: number;
  } {
    const maxAllowed = this.calculateExceptionalPosition(accountBalance);
    
    if (positionSize > maxAllowed) {
      return {
        valid: false,
        error: `Position size £${positionSize} exceeds maximum £${maxAllowed} (10% of account)`,
        maxAllowed
      };
    }
    
    return { valid: true, maxAllowed };
  }
}

// Monthly Allocation Calculator
export class AllocationCalculator {
  static getCurrentLimit(accountBalance: number): {
    limitPercent: number;
    limitAmount: number;
    character: string;
  } {
    const limitPercent = getCurrentMonthAllocationLimit();
    const limitAmount = accountBalance * (limitPercent / 100);
    const character = getMonthCharacter();
    
    return {
      limitPercent,
      limitAmount,
      character
    };
  }
  
  static validateAllocation(
    accountBalance: number, 
    currentInvestment: number, 
    newPositionSize: number
  ): {
    valid: boolean;
    error?: string;
    available: number;
    limit: number;
  } {
    const { limitAmount } = this.getCurrentLimit(accountBalance);
    const totalAfterTrade = currentInvestment + newPositionSize;
    
    if (totalAfterTrade > limitAmount) {
      return {
        valid: false,
        error: `Trade would exceed monthly limit. Available: £${limitAmount - currentInvestment}`,
        available: Math.max(0, limitAmount - currentInvestment),
        limit: limitAmount
      };
    }
    
    return {
      valid: true,
      available: limitAmount - totalAfterTrade,
      limit: limitAmount
    };
  }
}

// Daily Trading Limits Manager
export class DailyLimitsManager {
  private static readonly MAX_TRADES_PER_DAY = 3;
  
  static getDailyLimits(tradesExecutedToday: number): DailyTradingLimits {
    const now = typeof window !== 'undefined' ? new Date() : new Date(2024, 0, 1);
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0); // Next midnight UK time
    
    return {
      maxTradesPerDay: this.MAX_TRADES_PER_DAY,
      tradesExecutedToday,
      canTrade: tradesExecutedToday < this.MAX_TRADES_PER_DAY,
      nextResetTime: nextMidnight
    };
  }
  
  static validateDailyLimit(tradesExecutedToday: number): {
    valid: boolean;
    error?: string;
    remaining: number;
  } {
    const remaining = this.MAX_TRADES_PER_DAY - tradesExecutedToday;
    
    if (remaining <= 0) {
      return {
        valid: false,
        error: `Daily limit reached (${this.MAX_TRADES_PER_DAY} trades maximum)`,
        remaining: 0
      };
    }
    
    return { valid: true, remaining };
  }
}

// Conviction Scoring System (0-10 scale)
export class ConvictionScorer {
  static scoreSetupCandidate(
    candidate: Partial<SetupCandidate>,
    vixLevel: number
  ): {
    score: number;
    breakdown: SetupCandidate['convictionBreakdown'];
    recommendation: '5% standard' | '10% exceptional' | 'NO TRADE';
  } {
    const breakdown: SetupCandidate['convictionBreakdown'] = {
      matchesSetup: 0,
      technicalConfirmation: 0,
      noBadNews: 0,
      businessUnderstanding: 0,
      vixElevated: 0
    };
    
    // Matches setup perfectly (0-3 points)
    if (candidate.setupType && this.validateSetupCriteria(candidate)) {
      breakdown.matchesSetup = 3;
    }
    
    // Technical confirmation (0-2 points)
    if (candidate.rsi && candidate.rsi < 40) breakdown.technicalConfirmation += 1;
    if (candidate.above200DayMA) breakdown.technicalConfirmation += 1;
    
    // No bad news (0-2 points)
    if (candidate.newsClean) breakdown.noBadNews = 2;
    
    // Business understanding (0-2 points)
    // This should be user input - for now assume 2 points for major stocks
    breakdown.businessUnderstanding = 2;
    
    // VIX elevated (0-1 points)
    if (vixLevel > 19) breakdown.vixElevated = 1;
    
    const totalScore = Object.values(breakdown).reduce((sum, points) => sum + points, 0);
    
    let recommendation: '5% standard' | '10% exceptional' | 'NO TRADE';
    if (totalScore < 5) {
      recommendation = 'NO TRADE';
    } else if (totalScore >= 8) {
      recommendation = '10% exceptional';
    } else {
      recommendation = '5% standard';
    }
    
    return {
      score: totalScore,
      breakdown,
      recommendation
    };
  }
  
  private static validateSetupCriteria(candidate: Partial<SetupCandidate>): boolean {
    if (!candidate.setupType) return false;
    
    const setup = WIN_MORE_SETUPS[candidate.setupType];
    
    // Basic validation - more sophisticated logic would go here
    return true;
  }
}

// VIX Opportunity Assessor
export class VIXAssessor {
  static assessVIX(vixValue: number): WinMoreVIX {
    let opportunityLevel: WinMoreVIX['opportunityLevel'];
    let interpretation: string;
    let positionSizeRecommendation: WinMoreVIX['positionSizeRecommendation'];
    
    if (vixValue < 15) {
      opportunityLevel = 'NORMAL';
      interpretation = 'Normal market conditions. Trade carefully, small sizes only.';
      positionSizeRecommendation = '5% only';
    } else if (vixValue < 17) {
      opportunityLevel = 'STANDARD';
      interpretation = 'Standard market conditions. Regular 5% positions acceptable.';
      positionSizeRecommendation = '5% standard';
    } else if (vixValue < 19) {
      opportunityLevel = 'INTERESTING';
      interpretation = 'Market getting interesting. Better setups appearing.';
      positionSizeRecommendation = '5% standard';
    } else if (vixValue < 21) {
      opportunityLevel = 'OPPORTUNITIES';
      interpretation = 'Market opportunities emerging. Quality stocks on sale.';
      positionSizeRecommendation = '5-10% available';
    } else {
      opportunityLevel = 'RARE_GIFT';
      interpretation = 'Rare opportunity environment. Can use 10% positions on best setups.';
      positionSizeRecommendation = '5-10% available';
    }
    
    return {
      value: vixValue,
      timestamp: typeof window !== 'undefined' ? new Date() : new Date(2024, 0, 1),
      opportunityLevel,
      interpretation,
      positionSizeRecommendation
    };
  }
}

// Rule Enforcement Engine
export class WinMoreRuleEngine implements RuleEnforcement {
  validatePositionSize(accountBalance: number, positionSize: number) {
    return PositionSizeCalculator.validatePositionSize(accountBalance, positionSize);
  }
  
  validateDailyTradeLimit(tradesExecutedToday: number) {
    return DailyLimitsManager.validateDailyLimit(tradesExecutedToday);
  }
  
  validateMonthlyAllocation(currentMonth: number, currentInvestment: number, accountBalance: number) {
    const validation = AllocationCalculator.validateAllocation(
      accountBalance,
      currentInvestment,
      0 // Just checking current allocation
    );
    
    return {
      valid: validation.valid,
      maxAllowed: validation.limit,
      error: validation.error
    };
  }
  
  validateSetupFocus(tradeSetup: SetupType, monthlyFocus: SetupType) {
    if (tradeSetup !== monthlyFocus) {
      return {
        valid: false,
        error: `Current month focus is Setup ${monthlyFocus}. Cannot trade Setup ${tradeSetup}.`
      };
    }
    
    return { valid: true };
  }
  
  // Master validation method
  validateTrade(params: {
    accountBalance: number;
    positionSize: number;
    tradesExecutedToday: number;
    currentInvestment: number;
    tradeSetup: SetupType;
    monthlyFocus: SetupType;
  }): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check position size
    const positionValidation = this.validatePositionSize(params.accountBalance, params.positionSize);
    if (!positionValidation.valid) {
      errors.push(positionValidation.error!);
    }
    
    // Check daily limits
    const dailyValidation = this.validateDailyTradeLimit(params.tradesExecutedToday);
    if (!dailyValidation.valid) {
      errors.push(dailyValidation.error!);
    }
    
    // Check monthly allocation
    const allocationValidation = AllocationCalculator.validateAllocation(
      params.accountBalance,
      params.currentInvestment,
      params.positionSize
    );
    if (!allocationValidation.valid) {
      errors.push(allocationValidation.error!);
    }
    
    // Check setup focus
    const setupValidation = this.validateSetupFocus(params.tradeSetup, params.monthlyFocus);
    if (!setupValidation.valid) {
      errors.push(setupValidation.error!);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Account Manager
export class WinMoreAccountManager {
  static createAccount(currentBalance: number): WinMoreAccount {
    // Use a fixed timestamp to avoid hydration issues - will be updated on client
    const fixedTime = typeof window !== 'undefined' ? new Date() : new Date(2024, 0, 1);
    const currentMonth = fixedTime.getMonth() + 1;
    const { limitPercent, limitAmount } = AllocationCalculator.getCurrentLimit(currentBalance);
    
    return {
      currentBalance,
      currency: 'GBP',
      lastUpdated: fixedTime,
      
      standardPositionPercent: 5,
      exceptionalPositionPercent: 10,
      standardPositionSize: PositionSizeCalculator.calculateStandardPosition(currentBalance),
      exceptionalPositionSize: PositionSizeCalculator.calculateExceptionalPosition(currentBalance),
      
      currentMonth,
      monthlyAllocationLimit: limitAmount,
      currentlyInvested: 0,
      currentlyInvestedPercent: 0,
      availableToDeploy: limitAmount,
      
      monthlyReturn: 0,
      yearToDateReturn: 0,
      totalTrades: 0,
      winningTrades: 0,
      currentWinRate: 0
    };
  }
  
  static updateAccount(
    account: WinMoreAccount, 
    newBalance: number,
    currentInvestment: number = account.currentlyInvested
  ): WinMoreAccount {
    const { limitAmount } = AllocationCalculator.getCurrentLimit(newBalance);
    
    return {
      ...account,
      currentBalance: newBalance,
      lastUpdated: typeof window !== 'undefined' ? new Date() : account.lastUpdated,
      standardPositionSize: PositionSizeCalculator.calculateStandardPosition(newBalance),
      exceptionalPositionSize: PositionSizeCalculator.calculateExceptionalPosition(newBalance),
      monthlyAllocationLimit: limitAmount,
      currentlyInvested: currentInvestment,
      currentlyInvestedPercent: (currentInvestment / newBalance) * 100,
      availableToDeploy: Math.max(0, limitAmount - currentInvestment)
    };
  }
}

// Export the main rule engine instance
export const winMoreRuleEngine = new WinMoreRuleEngine();
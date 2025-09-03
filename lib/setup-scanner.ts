// THE 5 SETUP SYSTEM - Pattern Recognition Engine
// Identifies trading opportunities based on Win More methodology

import { 
  SetupType, 
  SetupCandidate, 
  Stock,
  TechnicalIndicators,
  WinMoreVIX
} from '@/types';
import type { WinMoreSetup } from '@/types/win-more';
import { WIN_MORE_SETUPS, ConvictionScorer, VIXAssessor } from './win-more-system';

// Extended stock data with technical indicators
export interface EnhancedStock extends Stock {
  technicals: TechnicalIndicators;
  newsAnalysis: {
    clean: boolean;
    lastChecked: Date;
    sentiment: 'positive' | 'neutral' | 'negative';
    hasEarnings: boolean;
    earningsDate?: Date;
  };
}

// Setup Scanner Engine
export class SetupScanner {
  private vixData: WinMoreVIX | null = null;
  
  constructor(vixData?: WinMoreVIX) {
    this.vixData = vixData || null;
  }
  
  // Main scanning method - returns candidates for specific setup
  async scanForSetup(
    setupType: SetupType, 
    stocks: EnhancedStock[]
  ): Promise<SetupCandidate[]> {
    const candidates: SetupCandidate[] = [];
    
    for (const stock of stocks) {
      const candidate = await this.evaluateStockForSetup(stock, setupType);
      if (candidate) {
        candidates.push(candidate);
      }
    }
    
    // Sort by conviction score (highest first)
    return candidates.sort((a, b) => b.convictionScore - a.convictionScore);
  }
  
  // Evaluate single stock against specific setup
  private async evaluateStockForSetup(
    stock: EnhancedStock, 
    setupType: SetupType
  ): Promise<SetupCandidate | null> {
    const setup = WIN_MORE_SETUPS[setupType];
    
    // Quick elimination checks
    if (!this.passesBasicCriteria(stock, setup)) {
      return null;
    }
    
    // Setup-specific evaluation
    let isValidCandidate = false;
    
    switch (setupType) {
      case 1:
        isValidCandidate = this.evaluateSetup1(stock);
        break;
      case 2:
        isValidCandidate = this.evaluateSetup2(stock);
        break;
      case 3:
        isValidCandidate = this.evaluateSetup3(stock);
        break;
      case 4:
        isValidCandidate = this.evaluateSetup4(stock);
        break;
      case 5:
        isValidCandidate = this.evaluateSetup5(stock);
        break;
      default:
        return null;
    }
    
    if (!isValidCandidate) return null;
    
    // Calculate conviction score
    const vixLevel = this.vixData?.value || 16;
    const scoring = ConvictionScorer.scoreSetupCandidate({
      setupType,
      rsi: stock.technicals.rsi,
      above200DayMA: stock.price > stock.technicals.sma200,
      newsClean: stock.newsAnalysis.clean
    }, vixLevel);
    
    // Only return candidates with score >= 5
    if (scoring.score < 5) return null;
    
    const stopPrice = stock.price * (1 + setup.stopLoss / 100);
    const targetPrice = stock.price * (1 + setup.profitTarget / 100);
    
    return {
      symbol: stock.symbol,
      setupType,
      convictionScore: scoring.score,
      convictionBreakdown: scoring.breakdown,
      currentPrice: stock.price,
      recommendedEntry: stock.price,
      calculatedStop: stopPrice,
      calculatedTarget: targetPrice,
      rsi: stock.technicals.rsi,
      above200DayMA: stock.price > stock.technicals.sma200,
      above50DayMA: stock.price > stock.technicals.sma50,
      volumeVsAverage: stock.technicals.volumeSpike,
      lastNewsCheck: stock.newsAnalysis.lastChecked,
      newsClean: stock.newsAnalysis.clean,
      timestamp: new Date()
    };
  }
  
  // Basic criteria all setups must pass
  private passesBasicCriteria(stock: EnhancedStock, setup: WinMoreSetup): boolean {
    // Price change within setup range
    const priceChange = stock.changePercent;
    if (priceChange < setup.criteria.priceChange.min || priceChange > setup.criteria.priceChange.max) {
      return false;
    }
    
    // Basic quality filters
    if (stock.price < 10) return false; // No penny stocks
    if (stock.marketCap < 1000000000) return false; // Min $1B market cap
    
    return true;
  }
  
  // SETUP 1: Oversold Quality Bounce (70% Win Rate)
  private evaluateSetup1(stock: EnhancedStock): boolean {
    const { technicals, newsAnalysis } = stock;
    
    // Core criteria
    if (technicals.rsi >= 40) return false; // Must be oversold
    if (stock.price <= technicals.sma200) return false; // Must be above 200-day MA
    if (!newsAnalysis.clean) return false; // No bad news
    if (technicals.volumeSpike < 1.5) return false; // Volume confirmation
    
    // Additional quality checks
    if (stock.changePercent > -8 || stock.changePercent < -15) return false;
    
    return true;
  }
  
  // SETUP 2: Support Bounce (68% Win Rate)
  private evaluateSetup2(stock: EnhancedStock): boolean {
    const { technicals, newsAnalysis } = stock;
    
    // Core criteria
    if (!newsAnalysis.clean) return false; // No bad news
    if (technicals.volumeSpike < 1.3) return false; // Volume confirmation
    
    // Support level criteria (simplified - real implementation would check historical bounces)
    const near50DayMA = Math.abs(stock.price - technicals.sma50) / stock.price < 0.02; // Within 2%
    const near200DayMA = Math.abs(stock.price - technicals.sma200) / stock.price < 0.02; // Within 2%
    
    if (!near50DayMA && !near200DayMA) return false;
    
    // Must be above both MAs (not breaking support)
    if (stock.price < technicals.sma50 || stock.price < technicals.sma200) return false;
    
    return true;
  }
  
  // SETUP 3: Earnings Overreaction (65% Win Rate)
  private evaluateSetup3(stock: EnhancedStock): boolean {
    const { newsAnalysis } = stock;
    
    // Must have recent earnings
    if (!newsAnalysis.hasEarnings) return false;
    if (!newsAnalysis.earningsDate) return false;
    
    // Must be within 2 days of earnings
    const daysSinceEarnings = (Date.now() - newsAnalysis.earningsDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceEarnings > 2 || daysSinceEarnings < 0) return false;
    
    // Must be significant drop
    if (stock.changePercent > -10) return false;
    
    // Quality company check (simplified)
    if (stock.marketCap < 5000000000) return false; // Min $5B for earnings plays
    
    return true;
  }
  
  // SETUP 4: Sympathy Selloff (62% Win Rate)
  private evaluateSetup4(stock: EnhancedStock): boolean {
    const { newsAnalysis } = stock;
    
    // Must have clean news (no company-specific issues)
    if (!newsAnalysis.clean) return false;
    
    // Moderate decline (sympathy, not company-specific)
    if (stock.changePercent > -5 || stock.changePercent < -12) return false;
    
    // Quality company in sector selloff (simplified check)
    if (stock.marketCap < 2000000000) return false; // Min $2B
    
    // Additional sector analysis would go here in full implementation
    
    return true;
  }
  
  // SETUP 5: Gap Fill (60% Win Rate)
  private evaluateSetup5(stock: EnhancedStock): boolean {
    const { technicals, newsAnalysis } = stock;
    
    // Must have significant gap down
    if (Math.abs(technicals.gapPercent) < 5) return false;
    if (technicals.gapPercent > 0) return false; // Must be gap down
    
    // Must have clean news (no fundamental reason for gap)
    if (!newsAnalysis.clean) return false;
    
    // Must be holding above next support level (simplified check)
    if (stock.price < stock.dayLow * 1.02) return false; // Above today's low by 2%
    
    // Check time - only valid early in trading day
    const now = new Date();
    const ukHour = now.getUTCHours() + 1; // Approximate UK time
    if (ukHour < 15 || ukHour > 17) return false; // Only 3-5 PM UK (early US market)
    
    return true;
  }
  
  // Batch scan all setups for multiple stocks
  async scanAllSetups(stocks: EnhancedStock[]): Promise<Record<SetupType, SetupCandidate[]>> {
    const results: Record<SetupType, SetupCandidate[]> = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: []
    };
    
    for (let setupType = 1; setupType <= 5; setupType++) {
      results[setupType as SetupType] = await this.scanForSetup(setupType as SetupType, stocks);
    }
    
    return results;
  }
  
  // Get top candidates for current month's focus
  async getTopCandidatesForFocus(
    focusSetup: SetupType, 
    stocks: EnhancedStock[], 
    limit: number = 10
  ): Promise<SetupCandidate[]> {
    const candidates = await this.scanForSetup(focusSetup, stocks);
    return candidates.slice(0, limit);
  }
}

// News Analysis Helper (simplified)
export class NewsAnalyzer {
  static async analyzeStock(stock: Stock): Promise<EnhancedStock['newsAnalysis']> {
    // In real implementation, this would call news APIs
    // For now, return mock analysis
    
    return {
      clean: Math.random() > 0.3, // 70% chance of clean news
      lastChecked: new Date(),
      sentiment: 'neutral',
      hasEarnings: Math.random() > 0.9, // 10% chance of recent earnings
      earningsDate: Math.random() > 0.9 ? new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000) : undefined
    };
  }
}

// Technical Indicators Calculator (simplified)
export class TechnicalCalculator {
  static calculateIndicators(stock: Stock): TechnicalIndicators {
    // In real implementation, this would calculate from historical data
    // For now, return reasonable mock values
    
    const rsi = 30 + Math.random() * 40; // 30-70 range
    const sma50 = stock.price * (0.95 + Math.random() * 0.1); // Within 5%
    const sma200 = stock.price * (0.90 + Math.random() * 0.2); // Within 10%
    
    return {
      rsi,
      sma20: stock.price * (0.98 + Math.random() * 0.04),
      sma50,
      sma200,
      macd: {
        value: (Math.random() - 0.5) * 2,
        signal: (Math.random() - 0.5) * 2,
        histogram: (Math.random() - 0.5) * 1
      },
      volumeSpike: 0.5 + Math.random() * 3, // 0.5x to 3.5x average
      gapPercent: (Math.random() - 0.5) * 10, // -5% to +5%
      nearLow52Week: Math.random() * 50, // 0-50% from 52-week low
      nearHigh52Week: Math.random() * 50 // 0-50% from 52-week high
    };
  }
}

// Enhanced Stock Factory
export class EnhancedStockFactory {
  static async createEnhancedStock(stock: Stock): Promise<EnhancedStock> {
    const [technicals, newsAnalysis] = await Promise.all([
      Promise.resolve(TechnicalCalculator.calculateIndicators(stock)),
      NewsAnalyzer.analyzeStock(stock)
    ]);
    
    return {
      ...stock,
      technicals,
      newsAnalysis
    };
  }
  
  static async createEnhancedStocks(stocks: Stock[]): Promise<EnhancedStock[]> {
    return Promise.all(stocks.map(stock => this.createEnhancedStock(stock)));
  }
}

// Export main scanner instance
export const setupScanner = new SetupScanner();
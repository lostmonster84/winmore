// OUTPOST Trading System - Market Data Integration
// Using authorized platforms from researchlinks-master.md

import { Stock, VIXData, TechnicalIndicators, StockQuote } from '@/types';

export class MarketDataService {
  private static readonly ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_API_KEY;
  private static readonly IEX_CLOUD_KEY = process.env.IEX_CLOUD_API_KEY;
  
  // Cache to prevent excessive API calls
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static readonly CACHE_DURATION = 30 * 1000; // 30 seconds

  private static isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  private static setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private static getCache(key: string): any {
    return this.cache.get(key)?.data;
  }

  // Yahoo Finance API (primary source - free)
  static async fetchYahooQuote(symbol: string): Promise<StockQuote | null> {
    const cacheKey = `yahoo_${symbol}`;
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      // Yahoo Finance API endpoint
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'WinMore Trading System',
        },
      });

      if (!response.ok) {
        throw new Error(`Yahoo API error: ${response.status}`);
      }

      const data = await response.json();
      const result = data.chart?.result?.[0];
      
      if (!result) {
        throw new Error('No data from Yahoo Finance');
      }

      const meta = result.meta;
      const quote: StockQuote = {
        symbol: symbol.toUpperCase(),
        price: meta.regularMarketPrice || 0,
        change: (meta.regularMarketPrice || 0) - (meta.previousClose || 0),
        changePercent: ((meta.regularMarketPrice || 0) - (meta.previousClose || 0)) / (meta.previousClose || 1) * 100,
        volume: meta.regularMarketVolume || 0,
        timestamp: new Date(meta.regularMarketTime * 1000 || Date.now())
      };

      this.setCache(cacheKey, quote);
      return quote;

    } catch (error) {
      console.error(`Error fetching Yahoo quote for ${symbol}:`, error);
      return null;
    }
  }

  // Alpha Vantage API (fallback with more detailed data)
  static async fetchAlphaVantageQuote(symbol: string): Promise<Stock | null> {
    if (!this.ALPHA_VANTAGE_KEY) {
      console.warn('Alpha Vantage API key not configured');
      return null;
    }

    const cacheKey = `alpha_${symbol}`;
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.ALPHA_VANTAGE_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Alpha Vantage API error: ${response.status}`);
      }

      const data = await response.json();
      const quote = data['Global Quote'];

      if (!quote || Object.keys(quote).length === 0) {
        throw new Error('No data from Alpha Vantage');
      }

      const stock: Stock = {
        symbol: quote['01. symbol'] || symbol.toUpperCase(),
        name: '', // Alpha Vantage doesn't provide name in quote
        price: parseFloat(quote['05. price']) || 0,
        previousClose: parseFloat(quote['08. previous close']) || 0,
        change: parseFloat(quote['09. change']) || 0,
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')) || 0,
        volume: parseInt(quote['06. volume']) || 0,
        avgVolume: 0, // Not provided in real-time quote
        marketCap: 0, // Not provided in real-time quote
        high52Week: parseFloat(quote['03. high']) || 0,
        low52Week: parseFloat(quote['04. low']) || 0,
        dayHigh: parseFloat(quote['03. high']) || 0,
        dayLow: parseFloat(quote['04. low']) || 0,
        lastUpdated: new Date()
      };

      this.setCache(cacheKey, stock);
      return stock;

    } catch (error) {
      console.error(`Error fetching Alpha Vantage quote for ${symbol}:`, error);
      return null;
    }
  }

  // IEX Cloud API (premium but reliable)
  static async fetchIEXQuote(symbol: string): Promise<Stock | null> {
    if (!this.IEX_CLOUD_KEY) {
      console.warn('IEX Cloud API key not configured');
      return null;
    }

    const cacheKey = `iex_${symbol}`;
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      // IEX Cloud batch request for comprehensive data
      const url = `https://cloud.iexapis.com/stable/stock/${symbol}/batch?types=quote,stats&token=${this.IEX_CLOUD_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`IEX Cloud API error: ${response.status}`);
      }

      const data = await response.json();
      const quote = data.quote;
      const stats = data.stats;

      if (!quote) {
        throw new Error('No quote data from IEX Cloud');
      }

      const stock: Stock = {
        symbol: quote.symbol || symbol.toUpperCase(),
        name: quote.companyName || '',
        price: quote.latestPrice || 0,
        previousClose: quote.previousClose || 0,
        change: quote.change || 0,
        changePercent: quote.changePercent ? quote.changePercent * 100 : 0,
        volume: quote.latestVolume || 0,
        avgVolume: quote.avgTotalVolume || 0,
        marketCap: quote.marketCap || 0,
        high52Week: quote.week52High || 0,
        low52Week: quote.week52Low || 0,
        dayHigh: quote.high || 0,
        dayLow: quote.low || 0,
        lastUpdated: new Date(quote.latestUpdate || Date.now())
      };

      this.setCache(cacheKey, stock);
      return stock;

    } catch (error) {
      console.error(`Error fetching IEX quote for ${symbol}:`, error);
      return null;
    }
  }

  // VIX Data from CBOE (your authorized source)
  static async fetchVIXData(): Promise<VIXData | null> {
    const cacheKey = 'vix_data';
    if (this.isCacheValid(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      // Use Yahoo Finance for VIX as it's more accessible
      const vixQuote = await this.fetchYahooQuote('^VIX');
      
      if (!vixQuote) {
        throw new Error('Failed to fetch VIX data');
      }

      // Apply your VIX deployment scale from CLAUDE.md
      let mode: VIXData['mode'];
      let deploymentLevel: number;

      if (vixQuote.price >= 23) {
        mode = 'RARE_EVENT';
        deploymentLevel = 15; // A+ setups only, maximum care
      } else if (vixQuote.price >= 21) {
        mode = 'HIGH_FEAR';
        deploymentLevel = 70; // Aggressive buying (10-15% positions)
      } else if (vixQuote.price >= 19) {
        mode = 'MODERATE_FEAR';
        deploymentLevel = 50; // Begin deploying (5-10% positions)
      } else if (vixQuote.price >= 17) {
        mode = 'GETTING_SPICY';
        deploymentLevel = 30; // Increase scanning, prep deployment
      } else if (vixQuote.price >= 15) {
        mode = 'NORMAL';
        deploymentLevel = 20; // Selective single-name trades (5% max)
      } else {
        mode = 'EXTREME_CALM';
        deploymentLevel = 10; // Cash position, scan watchlists only
      }

      const vixData: VIXData = {
        value: vixQuote.price,
        change: vixQuote.change,
        changePercent: vixQuote.changePercent,
        timestamp: vixQuote.timestamp,
        mode,
        deploymentLevel
      };

      this.setCache(cacheKey, vixData);
      return vixData;

    } catch (error) {
      console.error('Error fetching VIX data:', error);
      return null;
    }
  }

  // Main quote fetcher with fallbacks
  static async getStockQuote(symbol: string): Promise<Stock | null> {
    // Try Yahoo Finance first (free and reliable)
    let yahooQuote = await this.fetchYahooQuote(symbol);
    
    if (yahooQuote) {
      // Convert Yahoo quote to Stock format
      return {
        symbol: yahooQuote.symbol,
        name: '', // Yahoo doesn't provide name in this endpoint
        price: yahooQuote.price,
        previousClose: yahooQuote.price - yahooQuote.change,
        change: yahooQuote.change,
        changePercent: yahooQuote.changePercent,
        volume: yahooQuote.volume,
        avgVolume: 0, // Not available in real-time quote
        marketCap: 0, // Not available in real-time quote
        high52Week: 0, // Not available in real-time quote
        low52Week: 0, // Not available in real-time quote
        dayHigh: 0, // Not available in real-time quote
        dayLow: 0, // Not available in real-time quote
        lastUpdated: yahooQuote.timestamp
      };
    }

    // Fallback to Alpha Vantage
    let alphaQuote = await this.fetchAlphaVantageQuote(symbol);
    if (alphaQuote) return alphaQuote;

    // Fallback to IEX Cloud
    let iexQuote = await this.fetchIEXQuote(symbol);
    if (iexQuote) return iexQuote;

    console.error(`Failed to fetch quote for ${symbol} from all sources`);
    return null;
  }

  // Batch quote fetcher for watchlist
  static async getBatchQuotes(symbols: string[]): Promise<Map<string, Stock>> {
    const quotes = new Map<string, Stock>();
    
    // Process in parallel but limit concurrency to avoid rate limits
    const BATCH_SIZE = 5;
    for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
      const batch = symbols.slice(i, i + BATCH_SIZE);
      
      const batchPromises = batch.map(async (symbol) => {
        const quote = await this.getStockQuote(symbol);
        if (quote) {
          quotes.set(symbol, quote);
        }
        return quote;
      });

      await Promise.all(batchPromises);
      
      // Small delay between batches to be respectful to APIs
      if (i + BATCH_SIZE < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return quotes;
  }

  // Technical indicators calculation
  static async getTechnicalIndicators(symbol: string): Promise<TechnicalIndicators | null> {
    // This would require historical data - implement based on your needs
    // For MVP, we'll calculate basic indicators from available data
    
    const quote = await this.getStockQuote(symbol);
    if (!quote) return null;

    // Basic calculations with available data
    const indicators: TechnicalIndicators = {
      rsi: 50, // Default neutral - would need historical data for accurate RSI
      sma20: quote.price, // Placeholder - would need 20 days of data
      sma50: quote.price, // Placeholder - would need 50 days of data  
      sma200: quote.price, // Placeholder - would need 200 days of data
      macd: {
        value: 0,
        signal: 0,
        histogram: 0
      },
      volumeSpike: quote.avgVolume > 0 ? quote.volume / quote.avgVolume : 1,
      gapPercent: quote.changePercent,
      nearLow52Week: quote.low52Week > 0 ? ((quote.price - quote.low52Week) / quote.low52Week) * 100 : 0,
      nearHigh52Week: quote.high52Week > 0 ? ((quote.high52Week - quote.price) / quote.high52Week) * 100 : 0
    };

    return indicators;
  }

  // Clear cache manually if needed
  static clearCache(): void {
    this.cache.clear();
  }
}

export default MarketDataService;
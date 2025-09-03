// Trading 212 Read-Only API Adapter
// Server-side only - never expose API key to client

import {
  Trading212Position,
  Trading212Account,
  Trading212Order,
  Trading212Dividend,
  Trading212Transaction,
  Trading212Instrument,
  Trading212Exchange,
  Trading212ApiResponse,
  Trading212Config,
  Trading212PortfolioSummary
} from '@/types/trading212';

export class Trading212ReadOnlyAdapter {
  private config: Trading212Config;
  private cache = new Map<string, { data: any; expiry: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds

  constructor() {
    this.config = {
      apiKey: process.env.TRADING212_API_KEY || '',
      baseUrl: process.env.TRADING212_BASE_URL || 'https://live.trading212.com/api/v0',
      timeout: 10000,
      retryAttempts: 3
    };

    if (!this.config.apiKey) {
      throw new Error('TRADING212_API_KEY environment variable is required');
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    retryCount = 0
  ): Promise<Trading212ApiResponse<T>> {
    const cacheKey = endpoint;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return { success: true, data: cached.data };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': this.config.apiKey,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
        console.warn(`Trading 212 rate limited. Retry after ${retryAfter}s`);
        return { success: false, error: 'Rate limited', rateLimited: true };
      }

      if (!response.ok) {
        throw new Error(`Trading 212 API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Cache successful response
      this.cache.set(cacheKey, {
        data,
        expiry: Date.now() + this.CACHE_TTL
      });

      return { success: true, data };

    } catch (error) {
      console.error(`Trading 212 API request failed for ${endpoint}:`, error);

      // Retry logic
      if (retryCount < (this.config.retryAttempts || 3)) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest<T>(endpoint, retryCount + 1);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Portfolio Methods
  async getAccount(): Promise<Trading212ApiResponse<Trading212Account>> {
    return this.makeRequest<Trading212Account>('/equity/account/cash');
  }

  async getPositions(): Promise<Trading212ApiResponse<Trading212Position[]>> {
    return this.makeRequest<Trading212Position[]>('/equity/portfolio');
  }

  async getPosition(ticker: string): Promise<Trading212ApiResponse<Trading212Position>> {
    return this.makeRequest<Trading212Position>(`/equity/portfolio/${encodeURIComponent(ticker)}`);
  }

  // History Methods
  async getOrders(limit = 50): Promise<Trading212ApiResponse<Trading212Order[]>> {
    return this.makeRequest<Trading212Order[]>(`/equity/history/orders?limit=${limit}`);
  }

  async getDividends(limit = 50): Promise<Trading212ApiResponse<Trading212Dividend[]>> {
    return this.makeRequest<Trading212Dividend[]>(`/equity/history/dividends?limit=${limit}`);
  }

  async getTransactions(limit = 50): Promise<Trading212ApiResponse<Trading212Transaction[]>> {
    return this.makeRequest<Trading212Transaction[]>(`/equity/history/transactions?limit=${limit}`);
  }

  // Metadata Methods
  async getInstruments(): Promise<Trading212ApiResponse<Trading212Instrument[]>> {
    return this.makeRequest<Trading212Instrument[]>('/equity/metadata/instruments');
  }

  async getExchanges(): Promise<Trading212ApiResponse<Trading212Exchange[]>> {
    return this.makeRequest<Trading212Exchange[]>('/equity/metadata/exchanges');
  }

  // Convenience method for WinMore dashboard
  async getPortfolioSummary(): Promise<Trading212ApiResponse<Trading212PortfolioSummary>> {
    try {
      const [accountResult, positionsResult] = await Promise.all([
        this.getAccount(),
        this.getPositions()
      ]);

      if (!accountResult.success || !positionsResult.success) {
        return {
          success: false,
          error: 'Failed to fetch portfolio data'
        };
      }

      const account = accountResult.data!;
      const positions = positionsResult.data!;

      const summary: Trading212PortfolioSummary = {
        totalValue: account.total,
        cash: account.cash,
        investedValue: account.investedValue,
        totalPnL: account.ppl,
        totalPnLPercent: account.investedValue > 0 ? (account.ppl / account.investedValue) * 100 : 0,
        positions,
        lastUpdated: new Date().toISOString()
      };

      return { success: true, data: summary };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // Health check
  async healthCheck(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      const result = await this.getAccount();
      const latency = Date.now() - startTime;
      
      return {
        healthy: result.success,
        latency,
        error: result.error
      };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Singleton instance for server-side use
let trading212Instance: Trading212ReadOnlyAdapter | null = null;

export function getTrading212Adapter(): Trading212ReadOnlyAdapter {
  if (!trading212Instance) {
    trading212Instance = new Trading212ReadOnlyAdapter();
  }
  return trading212Instance;
}
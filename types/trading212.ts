// Trading 212 API Types
// Based on: https://trading212.com/api

export interface Trading212Position {
  ticker: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  fxPnl: number;
  initialFillDate: string;
  ppl: number;
}

export interface Trading212Account {
  currecyCode: string;
  cash: number;
  ppl: number;
  pieCash: number;
  result: number;
  blockedForStocks: number;
  investedValue: number;
  total: number;
}

export interface Trading212Order {
  creationTime: string;
  dateCreated: string;
  dateExecuted: string;
  dateModified: string;
  id: number;
  status: 'FILLED' | 'CANCELLED' | 'OPEN';
  strategy: 'QUANTITY' | 'VALUE';
  type: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
  ticker: string;
  quantity: number;
  unitPrice: number;
  value: number;
  taxes: number;
  fillPrice: number;
  fillResult: number;
  fillType: 'FILL' | 'PARTIAL_FILL';
}

export interface Trading212Dividend {
  amountInEuro: number;
  grossAmountPerShare: number;
  netAmountPerShare: number;
  paidOn: string;
  quantity: number;
  reference: string;
  ticker: string;
  type: 'ORDINARY' | 'SPECIAL';
}

export interface Trading212Transaction {
  amount: number;
  dateTime: string;
  reference: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'DIVIDEND' | 'MARKET_ORDER' | 'LIMIT_ORDER' | 'STOP_ORDER';
}

export interface Trading212Instrument {
  addedOn: string;
  currencyCode: string;
  isin: string;
  maxOpenQuantity: number;
  minTradeQuantity: number;
  name: string;
  shortName: string;
  ticker: string;
  type: 'STOCK' | 'ETF';
}

export interface Trading212Exchange {
  id: number;
  name: string;
  workingSchedules: Array<{
    id: number;
    timeEvents: Array<{
      date: string;
      type: string;
    }>;
  }>;
}

// API Response wrappers
export interface Trading212ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  rateLimited?: boolean;
}

// Configuration
export interface Trading212Config {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
  retryAttempts?: number;
}

// Portfolio summary for WinMore integration
export interface Trading212PortfolioSummary {
  totalValue: number;
  cash: number;
  investedValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  positions: Trading212Position[];
  lastUpdated: string;
}
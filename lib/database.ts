// OUTPOST Trading System Database
// In-memory storage for local privacy (will add SQLite later)

import { 
  Stock, 
  Position, 
  WatchlistItem, 
  Alert, 
  TradingSettings,
  ChatSession,
  ChatMessage 
} from '@/types';

// In-memory storage
interface InMemoryStore {
  stocks: Map<string, Stock>;
  watchlist: WatchlistItem[];
  positions: Position[];
  alerts: Alert[];
  settings: Map<string, string>;
  chatSessions: ChatSession[];
  chatMessages: ChatMessage[];
}

class OutpostDatabase {
  private store: InMemoryStore;

  constructor() {
    this.store = {
      stocks: new Map(),
      watchlist: [],
      positions: [],
      alerts: [],
      settings: new Map(),
      chatSessions: [],
      chatMessages: []
    };
    
    console.log('✅ OUTPOST In-Memory Database initialized successfully');
  }

  // Stock data methods
  updateStock(stock: Stock) {
    this.store.stocks.set(stock.symbol, {
      ...stock,
      lastUpdated: new Date()
    });
    return { changes: 1 };
  }

  getStock(symbol: string): Stock | null {
    return this.store.stocks.get(symbol) || null;
  }

  getAllStocks(): Stock[] {
    return Array.from(this.store.stocks.values())
      .sort((a, b) => a.symbol.localeCompare(b.symbol));
  }

  // Watchlist methods
  addToWatchlist(item: WatchlistItem) {
    this.store.watchlist.push(item);
    return { changes: 1 };
  }

  getWatchlist(): WatchlistItem[] {
    return [...this.store.watchlist]
      .sort((a, b) => b.addedDate.getTime() - a.addedDate.getTime());
  }

  removeFromWatchlist(id: string) {
    const index = this.store.watchlist.findIndex(item => item.id === id);
    if (index !== -1) {
      this.store.watchlist.splice(index, 1);
      return { changes: 1 };
    }
    return { changes: 0 };
  }

  // Position methods
  addPosition(position: Position) {
    this.store.positions.push(position);
    return { changes: 1 };
  }

  updatePosition(id: string, updates: Partial<Position>) {
    const index = this.store.positions.findIndex(pos => pos.id === id);
    if (index !== -1) {
      this.store.positions[index] = {
        ...this.store.positions[index],
        ...updates
      };
      return { changes: 1 };
    }
    return { changes: 0 };
  }

  getPositions(): Position[] {
    return [...this.store.positions]
      .sort((a, b) => b.entryDate.getTime() - a.entryDate.getTime());
  }

  removePosition(id: string) {
    const index = this.store.positions.findIndex(pos => pos.id === id);
    if (index !== -1) {
      this.store.positions.splice(index, 1);
      return { changes: 1 };
    }
    return { changes: 0 };
  }

  // Alert methods
  addAlert(alert: Alert) {
    this.store.alerts.push(alert);
    return { changes: 1 };
  }

  getAlerts(limit = 50): Alert[] {
    return [...this.store.alerts]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  dismissAlert(id: string) {
    const index = this.store.alerts.findIndex(alert => alert.id === id);
    if (index !== -1) {
      this.store.alerts[index].dismissed = true;
      return { changes: 1 };
    }
    return { changes: 0 };
  }

  // Settings methods
  getSetting(key: string): string | null {
    return this.store.settings.get(key) || null;
  }

  setSetting(key: string, value: string) {
    this.store.settings.set(key, value);
    return { changes: 1 };
  }

  // Chat methods (for future AI integration)
  addChatSession(session: ChatSession) {
    this.store.chatSessions.push(session);
    return { changes: 1 };
  }

  getChatSessions(): ChatSession[] {
    return [...this.store.chatSessions]
      .sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime());
  }

  addChatMessage(message: ChatMessage) {
    this.store.chatMessages.push(message);
    return { changes: 1 };
  }

  getChatMessages(sessionId: string): ChatMessage[] {
    return this.store.chatMessages
      .filter(msg => msg.context?.portfolio !== undefined || msg.role === 'user')
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // Utility methods
  clearCache() {
    this.store.stocks.clear();
    console.log('Stock cache cleared');
  }

  getStats() {
    return {
      stocks: this.store.stocks.size,
      watchlist: this.store.watchlist.length,
      positions: this.store.positions.length,
      alerts: this.store.alerts.length,
      settings: this.store.settings.size,
      chatSessions: this.store.chatSessions.length,
      chatMessages: this.store.chatMessages.length
    };
  }

  // No need to close anything for in-memory storage
  close() {
    console.log('Database connection closed (in-memory)');
  }
}

// Singleton instance
let dbInstance: OutpostDatabase | null = null;

export function getDatabase(): OutpostDatabase {
  if (!dbInstance) {
    dbInstance = new OutpostDatabase();
  }
  return dbInstance;
}

export default OutpostDatabase;
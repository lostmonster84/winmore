'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  RefreshCw, 
  AlertTriangle,
  Target,
  Clock,
  Eye,
  MoreHorizontal,
  BarChart3,
  PlusCircle,
  Copy,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Search
} from 'lucide-react';
import { Stock, WatchlistItem, VIXData } from '@/types';

interface WatchlistMonitorProps {
  watchlist: WatchlistItem[];
  onAddSymbol: (symbol: string) => void;
  onRemoveSymbol: (id: string) => void;
  vixData: VIXData | null;
}

interface StockWithSignal extends Stock {
  signal: 'ENTRY' | 'MOMENTUM' | 'WATCHING' | 'PROTECTED';
  signalScore?: number;
  daysLeft?: number;
}

export default function WatchlistMonitor({ 
  watchlist, 
  onAddSymbol, 
  onRemoveSymbol,
  vixData 
}: WatchlistMonitorProps) {
  const [stocks, setStocks] = useState<Map<string, StockWithSignal>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [newSymbol, setNewSymbol] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputError, setInputError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, itemId: string} | null>(null);
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change' | 'changePercent' | 'signal' | 'volume'>('symbol');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterSignal, setFilterSignal] = useState<'all' | 'ENTRY' | 'MOMENTUM' | 'PROTECTED' | 'WATCHING'>('all');
  const [recentSymbols] = useState(['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NFLX', 'AMD', 'INTC', 'CRM', 'ADBE']);
  const [error, setError] = useState<string | null>(null);

  // Fetch stock quotes for watchlist
  const fetchWatchlistData = useCallback(async () => {
    if (watchlist.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const symbols = watchlist.map(item => item.symbol);
      
      const response = await fetch('/api/market/batch-quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ symbols }),
      });

      const result = await response.json();
      
      if (result.success) {
        const newStocks = new Map<string, StockWithSignal>();
        
        Object.entries(result.data).forEach(([symbol, stock]: [string, any]) => {
          const signal = calculateSignal(stock, vixData);
          
          newStocks.set(symbol, {
            ...stock,
            signal: signal.type,
            signalScore: signal.score,
            daysLeft: signal.daysLeft
          });
        });

        setStocks(newStocks);
        setLastUpdate(new Date());
      } else {
        setError(result.error || 'Failed to fetch market data');
      }
    } catch (err) {
      console.error('Watchlist fetch error:', err);
      setError('Failed to fetch market data');
    } finally {
      setIsLoading(false);
    }
  }, [watchlist, vixData]);

  // Signal calculation logic
  const calculateSignal = (stock: Stock, vix: VIXData | null): {
    type: 'ENTRY' | 'MOMENTUM' | 'WATCHING' | 'PROTECTED';
    score?: number;
    daysLeft?: number;
  } => {
    let confluenceScore = 0;
    
    if (stock.changePercent <= -8) confluenceScore += 3;
    else if (stock.changePercent <= -5) confluenceScore += 2;
    else if (stock.changePercent <= -3) confluenceScore += 1;
    
    if (stock.avgVolume > 0) {
      const volumeRatio = stock.volume / stock.avgVolume;
      if (volumeRatio >= 3) confluenceScore += 2;
      else if (volumeRatio >= 2) confluenceScore += 1;
    }
    
    if (stock.low52Week > 0) {
      const distanceFromLow = ((stock.price - stock.low52Week) / stock.low52Week) * 100;
      if (distanceFromLow <= 5) confluenceScore += 2;
      else if (distanceFromLow <= 15) confluenceScore += 1;
    }
    
    if (vix) {
      if (vix.value >= 23) confluenceScore += 2;
      else if (vix.value >= 21) confluenceScore += 1;
    }
    
    if (Math.abs(stock.changePercent) >= 10) confluenceScore += 1;
    
    if (confluenceScore >= 7) {
      return { type: 'ENTRY', score: Math.min(confluenceScore, 10) };
    }
    
    if (stock.changePercent >= 3 && stock.changePercent <= 15) {
      return { type: 'MOMENTUM', daysLeft: 14, score: Math.floor(stock.changePercent / 3) };
    }
    
    if (stock.changePercent >= 1 && stock.changePercent < 3) {
      return { type: 'PROTECTED', daysLeft: Math.floor(Math.random() * 14) + 1 };
    }
    
    return { type: 'WATCHING', score: confluenceScore > 0 ? confluenceScore : undefined };
  };

  const validateSymbol = (symbol: string): string | null => {
    if (!symbol || symbol.length === 0) return 'Symbol is required';
    if (symbol.length > 5) return 'Symbol too long (max 5 characters)';
    if (!/^[A-Z]+$/.test(symbol)) return 'Symbol must contain only letters';
    if (watchlist.some(item => item.symbol === symbol)) return `${symbol} is already in your watchlist`;
    return null;
  };

  const handleSymbolInputChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setNewSymbol(upperValue);
    setInputError('');
    
    if (upperValue.length > 0) {
      const allSuggestions = recentSymbols
        .filter(symbol => 
          symbol.startsWith(upperValue) && 
          !watchlist.some(item => item.symbol === symbol)
        )
        .slice(0, 6);
      
      setSuggestions(allSuggestions);
      setShowSuggestions(allSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleAddSymbol = (symbolToAdd?: string) => {
    const symbol = (symbolToAdd || newSymbol).trim().toUpperCase();
    
    const error = validateSymbol(symbol);
    if (error) {
      setInputError(error);
      return;
    }
    
    onAddSymbol(symbol);
    setNewSymbol('');
    setShowSuggestions(false);
    setSuggestions([]);
    setInputError('');
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const getSortedAndFilteredWatchlist = () => {
    let filteredList = watchlist;
    
    if (filterSignal !== 'all') {
      filteredList = watchlist.filter(item => {
        const stock = stocks.get(item.symbol);
        return stock && stock.signal === filterSignal;
      });
    }
    
    return [...filteredList].sort((a, b) => {
      const stockA = stocks.get(a.symbol);
      const stockB = stocks.get(b.symbol);
      
      let valueA: any, valueB: any;
      
      switch (sortBy) {
        case 'symbol':
          valueA = a.symbol;
          valueB = b.symbol;
          break;
        case 'price':
          valueA = stockA?.price || 0;
          valueB = stockB?.price || 0;
          break;
        case 'change':
          valueA = stockA?.change || 0;
          valueB = stockB?.change || 0;
          break;
        case 'changePercent':
          valueA = stockA?.changePercent || 0;
          valueB = stockB?.changePercent || 0;
          break;
        case 'volume':
          valueA = stockA?.volume || 0;
          valueB = stockB?.volume || 0;
          break;
        case 'signal':
          const signalOrder = { 'ENTRY': 4, 'MOMENTUM': 3, 'PROTECTED': 2, 'WATCHING': 1 };
          valueA = signalOrder[stockA?.signal || 'WATCHING'];
          valueB = signalOrder[stockB?.signal || 'WATCHING'];
          break;
        default:
          valueA = a.symbol;
          valueB = b.symbol;
      }
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        const comparison = valueA.localeCompare(valueB);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      
      const comparison = valueA - valueB;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-3 h-3" /> : 
      <ArrowDown className="w-3 h-3" />;
  };

  const getSignalDisplay = (stock: StockWithSignal) => {
    switch (stock.signal) {
      case 'ENTRY':
        return {
          icon: <Target className="w-3 h-3" />,
          text: `Entry Signal`,
          score: stock.signalScore,
          variant: 'success'
        };
      case 'MOMENTUM':
        return {
          icon: <TrendingUp className="w-3 h-3" />,
          text: `Momentum`,
          score: stock.daysLeft,
          variant: 'info'
        };
      case 'PROTECTED':
        return {
          icon: <Clock className="w-3 h-3" />,
          text: `Protected`,
          score: stock.daysLeft,
          variant: 'warning'
        };
      default:
        return {
          icon: <Eye className="w-3 h-3" />,
          text: `Watching`,
          score: stock.signalScore,
          variant: 'default'
        };
    }
  };

  useEffect(() => {
    fetchWatchlistData();
    const interval = setInterval(fetchWatchlistData, 30000);
    return () => clearInterval(interval);
  }, [fetchWatchlistData]);

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header">
        <div className="flex items-center justify-between w-full">
          <div>
            <h3 className="card-title">Watchlist</h3>
            {lastUpdate && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Filter */}
            <select
              value={filterSignal}
              onChange={(e) => setFilterSignal(e.target.value as typeof filterSignal)}
              className="input h-9 text-xs"
            >
              <option value="all">All Signals</option>
              <option value="ENTRY">Entry</option>
              <option value="MOMENTUM">Momentum</option>
              <option value="PROTECTED">Protected</option>
              <option value="WATCHING">Watching</option>
            </select>
            
            <button
              onClick={fetchWatchlistData}
              disabled={isLoading}
              className="btn-ghost btn-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="card-content space-y-4">
        {/* Add Symbol */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Add symbol (e.g., AAPL, TSLA)"
              value={newSymbol}
              onChange={(e) => handleSymbolInputChange(e.target.value)}
              className={`input ${inputError ? 'border-destructive' : ''}`}
              maxLength={5}
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 card max-h-48 overflow-y-auto">
                <div className="p-2 space-y-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleAddSymbol(suggestion)}
                      className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-accent"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => handleAddSymbol()}
            disabled={!newSymbol.trim() || !!inputError}
            className="btn-default"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {inputError && (
          <div className="flex items-center space-x-2 text-destructive text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>{inputError}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 text-destructive text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Watchlist Table */}
        {watchlist.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2">No symbols in watchlist</h3>
            <p className="text-muted-foreground mb-4">Add your first stock symbol to begin monitoring</p>
            <div className="flex justify-center gap-2">
              {recentSymbols.slice(0, 4).map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => handleAddSymbol(symbol)}
                  className="btn-secondary btn-sm"
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-md border">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <button
                      onClick={() => handleSort('symbol')}
                      className="flex items-center space-x-1 hover:text-foreground"
                    >
                      <span>Symbol</span>
                      {getSortIcon('symbol')}
                    </button>
                  </th>
                  <th>
                    <button
                      onClick={() => handleSort('price')}
                      className="flex items-center space-x-1 hover:text-foreground"
                    >
                      <span>Price</span>
                      {getSortIcon('price')}
                    </button>
                  </th>
                  <th>
                    <button
                      onClick={() => handleSort('changePercent')}
                      className="flex items-center space-x-1 hover:text-foreground"
                    >
                      <span>Change</span>
                      {getSortIcon('changePercent')}
                    </button>
                  </th>
                  <th>
                    <button
                      onClick={() => handleSort('signal')}
                      className="flex items-center space-x-1 hover:text-foreground"
                    >
                      <span>Signal</span>
                      {getSortIcon('signal')}
                    </button>
                  </th>
                  <th>Volume</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {getSortedAndFilteredWatchlist().map((item) => {
                  const stock = stocks.get(item.symbol);
                  const signal = stock ? getSignalDisplay(stock) : null;
                  
                  return (
                    <tr key={item.id}>
                      <td>
                        <div>
                          <div className="font-medium">{item.symbol}</div>
                          {stock?.name && (
                            <div className="text-xs text-muted-foreground truncate">
                              {stock.name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        {stock ? (
                          <div className="font-mono font-medium">
                            ${stock.price.toFixed(2)}
                          </div>
                        ) : (
                          <div className="w-16 h-4 bg-muted animate-pulse rounded"></div>
                        )}
                      </td>
                      <td>
                        {stock ? (
                          <div className="flex items-center space-x-1">
                            {stock.change >= 0 ? (
                              <TrendingUp className="w-3 h-3 text-success" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-destructive" />
                            )}
                            <div className="text-sm">
                              <div className={`font-medium ${
                                stock.changePercent >= 0 ? 'text-success' : 'text-destructive'
                              }`}>
                                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-20 h-4 bg-muted animate-pulse rounded"></div>
                        )}
                      </td>
                      <td>
                        {stock && signal ? (
                          <div className={`status-${signal.variant} flex items-center space-x-1`}>
                            {signal.icon}
                            <span className="text-xs">
                              {signal.text}
                              {signal.score && ` (${signal.score})`}
                            </span>
                          </div>
                        ) : (
                          <div className="w-16 h-4 bg-muted animate-pulse rounded"></div>
                        )}
                      </td>
                      <td>
                        {stock ? (
                          <div className="text-sm text-muted-foreground">
                            {(stock.volume / 1000000).toFixed(1)}M
                          </div>
                        ) : (
                          <div className="w-12 h-4 bg-muted animate-pulse rounded"></div>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => onRemoveSymbol(item.id)}
                          className="btn-ghost p-1 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {watchlist.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {getSortedAndFilteredWatchlist().length} of {watchlist.length} symbols
            </span>
            <span>Auto-refresh: 30s</span>
          </div>
        )}
      </div>
    </div>
  );
}
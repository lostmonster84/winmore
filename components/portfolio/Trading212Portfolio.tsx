'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, RefreshCw, AlertTriangle } from 'lucide-react';
import { Trading212PortfolioSummary, Trading212Position } from '@/types/trading212';

interface Trading212PortfolioProps {
  className?: string;
}

export default function Trading212Portfolio({ className = '' }: Trading212PortfolioProps) {
  const [portfolio, setPortfolio] = useState<Trading212PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPortfolio = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/broker/trading212/portfolio', {
        credentials: 'include'
      });
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch portfolio');
      }
      
      setPortfolio(result.data);
      setLastUpdated(new Date());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchPortfolio, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatPercent = (percent: number): string => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  if (error) {
    return (
      <div className={`card ${className}`}>
        <div className="card-header">
          <h3 className="card-title flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Trading 212 Portfolio Error
          </h3>
        </div>
        <div className="card-content">
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <button
              onClick={fetchPortfolio}
              disabled={isLoading}
              className="btn btn-outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Portfolio Overview */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="card-title flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Trading 212 Portfolio
            </h3>
            <button
              onClick={fetchPortfolio}
              disabled={isLoading}
              className="btn-ghost p-2"
              title="Refresh portfolio data"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {portfolio ? (
          <div className="card-content">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Total Value</span>
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(portfolio.totalValue)}
                </div>
              </div>

              <div className="p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Cash</span>
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(portfolio.cash)}
                </div>
              </div>

              <div className="p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Invested</span>
                </div>
                <div className="text-xl font-bold">
                  {formatCurrency(portfolio.investedValue)}
                </div>
              </div>

              <div className="p-4 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {portfolio.totalPnL >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm font-medium">P&L</span>
                </div>
                <div className={`text-xl font-bold ${portfolio.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(portfolio.totalPnL)}
                </div>
                <div className={`text-sm ${portfolio.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(portfolio.totalPnLPercent)}
                </div>
              </div>
            </div>

            {/* Last Updated */}
            {lastUpdated && (
              <div className="text-xs text-muted-foreground text-center mb-4">
                Last updated: {lastUpdated.toLocaleString()}
              </div>
            )}
          </div>
        ) : (
          <div className="card-content">
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Positions List */}
      {portfolio && portfolio.positions.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Open Positions ({portfolio.positions.length})</h3>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {portfolio.positions.map((position: Trading212Position, index: number) => (
                <div key={`${position.ticker}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{position.ticker}</div>
                    <div className="text-sm text-muted-foreground">
                      {position.quantity} shares @ {formatCurrency(position.averagePrice)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(position.currentPrice * position.quantity)}
                    </div>
                    <div className={`text-sm ${position.ppl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(position.ppl)} 
                      <span className="ml-1">
                        ({formatPercent((position.ppl / (position.averagePrice * position.quantity)) * 100)})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {portfolio && portfolio.positions.length === 0 && (
        <div className="card">
          <div className="card-content">
            <div className="text-center py-8 text-muted-foreground">
              <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No open positions found</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
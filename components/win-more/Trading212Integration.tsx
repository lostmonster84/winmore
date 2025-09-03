'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, DollarSign, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { Trading212PortfolioSummary } from '@/types/trading212';

interface Trading212IntegrationProps {
  className?: string;
  onAccountUpdate?: (balance: number) => void;
}

export default function Trading212Integration({ 
  className = '', 
  onAccountUpdate 
}: Trading212IntegrationProps) {
  const [portfolio, setPortfolio] = useState<Trading212PortfolioSummary | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async () => {
    try {
      const response = await fetch('/api/broker/trading212/portfolio', {
        credentials: 'include'
      });
      const result = await response.json();
      
      if (result.success) {
        setPortfolio(result.data);
        // Update WinMore system with real account balance
        if (onAccountUpdate && result.data.totalValue) {
          onAccountUpdate(result.data.totalValue);
        }
      }
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
    }
  }, [onAccountUpdate]);

  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch('/api/broker/trading212/health', {
        credentials: 'include'
      });
      const result = await response.json();
      
      if (result.success && result.data.trading212.healthy) {
        setIsConnected(true);
        fetchPortfolio();
      } else {
        setIsConnected(false);
        setError(result.data.trading212.error || 'API not configured');
      }
    } catch (err) {
      setIsConnected(false);
      setError('Connection failed');
    } finally {
      setIsLoading(false);
    }
  }, [fetchPortfolio]);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className={`card ${className}`}>
        <div className="card-content">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Connecting to Trading 212...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <h3 className="card-title flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Trading 212 Integration
          {isConnected ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
        </h3>
      </div>
      
      <div className="card-content">
        {isConnected && portfolio ? (
          <div className="space-y-4">
            {/* Account Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Total Value</span>
                </div>
                <div className="text-lg font-bold">
                  {formatCurrency(portfolio.totalValue)}
                </div>
              </div>
              
              <div className="p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">P&L</span>
                </div>
                <div className={`text-lg font-bold ${portfolio.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(portfolio.totalPnL)}
                </div>
              </div>
            </div>

            {/* Integration Status */}
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">Live sync active</span>
              </div>
              <div className="text-xs text-green-700 mt-1">
                Your Trading 212 account is connected and position sizes will be calculated from your real balance: {formatCurrency(portfolio.totalValue)}
              </div>
            </div>

            {/* Position Count */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Open Positions:</span>
              <span className="font-medium">{portfolio.positions.length}</span>
            </div>
            
            {/* View Full Portfolio Link */}
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'portfolio' }))}
              className="w-full btn-outline flex items-center justify-center gap-2 text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              View Full Portfolio
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Not Connected */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Trading 212 Not Connected</span>
              </div>
              <div className="text-xs text-amber-700 mt-1">
                {error || 'Add your Trading 212 API key to .env.local to sync your real account balance'}
              </div>
            </div>

            {/* Manual Mode Notice */}
            <div className="text-sm text-muted-foreground">
              <p>Currently using manual account balance input.</p>
              <p className="mt-2">To connect Trading 212:</p>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Get your API key from Trading 212</li>
                <li>Add TRADING212_API_KEY to your .env.local</li>
                <li>Restart the development server</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
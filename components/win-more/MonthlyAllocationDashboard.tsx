'use client';

import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { 
  getCurrentMonthAllocationLimit, 
  getMonthCharacter, 
  AllocationCalculator 
} from '@/lib/win-more-system';

interface MonthlyAllocationDashboardProps {
  accountBalance: number;
  currentInvestment: number;
  className?: string;
}

export default function MonthlyAllocationDashboard({ 
  accountBalance, 
  currentInvestment,
  className = '' 
}: MonthlyAllocationDashboardProps) {
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [allocationLimit, setAllocationLimit] = useState<number>(0);
  const [monthCharacter, setMonthCharacter] = useState<string>('');
  const [investedPercent, setInvestedPercent] = useState<number>(0);
  const [available, setAvailable] = useState<number>(0);
  const [status, setStatus] = useState<'safe' | 'warning' | 'limit' | 'over'>('safe');

  useEffect(() => {
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'long' });
    const { limitPercent, limitAmount } = AllocationCalculator.getCurrentLimit(accountBalance);
    const character = getMonthCharacter();
    
    setCurrentMonth(month);
    setAllocationLimit(limitAmount);
    setMonthCharacter(character);
    
    const invested = (currentInvestment / accountBalance) * 100;
    setInvestedPercent(invested);
    setAvailable(Math.max(0, limitAmount - currentInvestment));
    
    // Determine status
    if (invested > limitPercent) {
      setStatus('over');
    } else if (invested > limitPercent * 0.9) {
      setStatus('limit');
    } else if (invested > limitPercent * 0.7) {
      setStatus('warning');
    } else {
      setStatus('safe');
    }
  }, [accountBalance, currentInvestment]);

  const formatCurrency = (amount: number) => {
    return `£${amount.toLocaleString('en-GB', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    })}`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'safe': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'limit': return 'text-orange-600';
      case 'over': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'safe': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'limit': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'over': return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getProgressBarColor = () => {
    switch (status) {
      case 'safe': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'limit': return 'bg-orange-500';
      case 'over': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'safe': return 'Healthy allocation level';
      case 'warning': return 'Approaching monthly limit';
      case 'limit': return 'Near monthly limit - be selective';
      case 'over': return 'OVER LIMIT - Cannot trade until positions close';
    }
  };

  // Calculate limit percentage from account balance
  const limitPercent = (allocationLimit / accountBalance) * 100;

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="card-title">Monthly Allocation - {currentMonth}</h3>
        </div>
      </div>

      <div className="card-content space-y-4">
        {/* Month Character */}
        <div className="p-3 bg-muted/20 rounded-lg">
          <div className="text-sm font-medium mb-1">Market Character</div>
          <div className="text-sm text-muted-foreground">
            {monthCharacter}
          </div>
        </div>

        {/* Allocation Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Current Allocation</span>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {investedPercent.toFixed(1)}% of {limitPercent}%
              </span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${getProgressBarColor()}`}
              style={{ width: `${Math.min(100, (investedPercent / limitPercent) * 100)}%` }}
            />
            {/* Limit marker */}
            <div 
              className="absolute top-0 w-1 h-full bg-gray-400 opacity-50"
              style={{ left: '100%' }}
            />
          </div>
          
          <div className={`text-xs ${getStatusColor()}`}>
            {getStatusMessage()}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Currently Invested</div>
            <div className="text-lg font-bold">{formatCurrency(currentInvestment)}</div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Monthly Limit</div>
            <div className="text-lg font-bold">{formatCurrency(allocationLimit)}</div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Available</div>
            <div className={`text-lg font-bold ${available > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(available)}
            </div>
          </div>
        </div>

        {/* Historical Context */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Seasonal Context</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            {currentMonth === 'September' && (
              <p className="text-red-600 font-medium">
                ⚠️ September is historically the worst month. 30% limit enforced for capital preservation.
              </p>
            )}
            {currentMonth === 'November' && (
              <p className="text-green-600 font-medium">
                🎯 November is historically the best month. 80% allocation allows for more opportunities.
              </p>
            )}
            {(currentMonth === 'June' || currentMonth === 'July' || currentMonth === 'August') && (
              <p className="text-yellow-600">
                ☀️ Summer months typically have lower volatility. Reduced allocation preserves capital.
              </p>
            )}
            <p>
              These limits are based on historical market patterns and help maintain discipline 
              during different seasonal conditions.
            </p>
          </div>
        </div>

        {/* Action Items */}
        {status === 'over' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Action Required</span>
            </div>
            <div className="text-sm text-red-700">
              You&apos;re over the monthly allocation limit. Close some positions before opening new trades.
            </div>
          </div>
        )}

        {status === 'limit' && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800 mb-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Approach with Caution</span>
            </div>
            <div className="text-sm text-orange-700">
              Near monthly limit. Only take exceptional setups (conviction score 8+).
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
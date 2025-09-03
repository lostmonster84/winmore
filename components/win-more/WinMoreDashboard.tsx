'use client';

import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Calendar, Target, AlertTriangle } from 'lucide-react';
import PositionSizeCalculator from './PositionSizeCalculator';
import MonthlyAllocationDashboard from './MonthlyAllocationDashboard';
import SetupFocusSelector from './SetupFocusSelector';
import Trading212Integration from './Trading212Integration';
import { SetupType, WinMoreAccount, WinMoreVIX } from '@/types/win-more';
import { WinMoreAccountManager, VIXAssessor } from '@/lib/win-more-system';

interface WinMoreDashboardProps {
  initialAccountBalance?: number;
  className?: string;
}

export default function WinMoreDashboard({ 
  initialAccountBalance = 30000,
  className = '' 
}: WinMoreDashboardProps) {
  const [account, setAccount] = useState<WinMoreAccount | null>(null);
  const [currentSetup, setCurrentSetup] = useState<SetupType>(1);
  const [vixData, setVixData] = useState<WinMoreVIX | null>(null);
  const [tradesExecutedToday, setTradesExecutedToday] = useState(0);

  // Initialize account on mount
  useEffect(() => {
    const initialAccount = WinMoreAccountManager.createAccount(initialAccountBalance);
    setAccount(initialAccount);
    
    // Mock VIX data - in real app, this would come from API
    const mockVix = VIXAssessor.assessVIX(16.5);
    setVixData(mockVix);
  }, [initialAccountBalance]);

  const handleAccountBalanceChange = (newBalance: number) => {
    if (account) {
      const updatedAccount = WinMoreAccountManager.updateAccount(account, newBalance);
      setAccount(updatedAccount);
    }
  };

  const handleSetupChange = (setupType: SetupType) => {
    setCurrentSetup(setupType);
    // In real app, this would save to localStorage or backend
  };

  if (!account) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const canTrade = tradesExecutedToday < 3 && account.availableToDeploy > 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            WinMore Trading System
          </h1>
          <p className="text-muted-foreground">
            Disciplined trading focused on consistency over aggression
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Current Goal</div>
          <div className="text-lg font-bold">Win More Than Lose</div>
        </div>
      </div>

      {/* System Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Account Balance</span>
          </div>
          <div className="text-xl font-bold">
            £{account.currentBalance.toLocaleString('en-GB')}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Month Limit</span>
          </div>
          <div className="text-xl font-bold">
            {((account.monthlyAllocationLimit / account.currentBalance) * 100).toFixed(0)}%
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">Setup Focus</span>
          </div>
          <div className="text-xl font-bold">
            Setup {currentSetup}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={`h-4 w-4 ${canTrade ? 'text-green-600' : 'text-red-600'}`} />
            <span className="text-sm font-medium">Trading Status</span>
          </div>
          <div className={`text-xl font-bold ${canTrade ? 'text-green-600' : 'text-red-600'}`}>
            {canTrade ? 'ACTIVE' : 'BLOCKED'}
          </div>
        </div>
      </div>

      {/* VIX Status */}
      {vixData && (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium mb-1">Market Opportunity Level (VIX)</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{vixData.value.toFixed(1)}</span>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {vixData.opportunityLevel.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground max-w-md">
              {vixData.interpretation}
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <PositionSizeCalculator
            accountBalance={account.currentBalance}
            onAccountBalanceChange={handleAccountBalanceChange}
          />
          
          <SetupFocusSelector
            currentSetup={currentSetup}
            onSetupChange={handleSetupChange}
          />
          
          <Trading212Integration
            onAccountUpdate={handleAccountBalanceChange}
          />
        </div>

        {/* Middle Column */}
        <div className="space-y-6">
          <MonthlyAllocationDashboard
            accountBalance={account.currentBalance}
            currentInvestment={account.currentlyInvested}
          />

          {/* Daily Trading Limits */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Daily Trading Limits</h3>
            </div>
            <div className="card-content">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm">Trades Executed Today</span>
                <span className="text-lg font-bold">
                  {tradesExecutedToday} / 3
                </span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    tradesExecutedToday === 0 ? 'bg-green-500' :
                    tradesExecutedToday < 3 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(tradesExecutedToday / 3) * 100}%` }}
                />
              </div>
              
              <div className="text-xs text-muted-foreground text-center">
                {tradesExecutedToday < 3 
                  ? `${3 - tradesExecutedToday} trades remaining today`
                  : 'Daily limit reached - quality over quantity'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Performance Summary */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Performance Summary</h3>
            </div>
            <div className="card-content space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-lg font-bold">{account.currentWinRate.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Win Rate</div>
                </div>
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-lg font-bold">
                    {account.monthlyReturn > 0 ? '+' : ''}{account.monthlyReturn.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">This Month</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Trades:</span>
                  <span className="font-medium">{account.totalTrades}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Winning Trades:</span>
                  <span className="font-medium text-green-600">{account.winningTrades}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Losing Trades:</span>
                  <span className="font-medium text-red-600">
                    {account.totalTrades - account.winningTrades}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Win More Rules Reminder */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Win More Rules</h3>
            </div>
            <div className="card-content">
              <div className="text-xs space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>5% standard, 10% maximum positions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>+10% profit, -5% stop loss (mechanical)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>Maximum 3 trades per day</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>One setup focus per month</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>Monthly allocation limits enforced</span>
                </div>
              </div>
              
              <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                <div className="font-medium">Success Definition:</div>
                <div>Any green month = victory</div>
              </div>
            </div>
          </div>

          {/* Next Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Next Actions</h3>
            </div>
            <div className="card-content">
              <div className="space-y-2 text-sm">
                {canTrade ? (
                  <>
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Ready to scan for Setup {currentSetup}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Look for opportunities matching your monthly focus
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-red-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Trading blocked</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {tradesExecutedToday >= 3 
                        ? 'Daily limit reached'
                        : 'Monthly allocation limit reached'
                      }
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
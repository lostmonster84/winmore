'use client';

import { useState, useEffect } from 'react';
import { Calculator, TrendingUp, Shield, AlertCircle } from 'lucide-react';
import { PositionSizeCalculator as Calculator_Class } from '@/lib/win-more-system';

interface PositionSizeCalculatorProps {
  accountBalance: number;
  onAccountBalanceChange?: (newBalance: number) => void;
  className?: string;
}

export default function PositionSizeCalculator({ 
  accountBalance, 
  onAccountBalanceChange,
  className = '' 
}: PositionSizeCalculatorProps) {
  const [inputBalance, setInputBalance] = useState(accountBalance);
  const [standardPosition, setStandardPosition] = useState(0);
  const [exceptionalPosition, setExceptionalPosition] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate position sizes when balance changes
  useEffect(() => {
    const standard = Calculator_Class.calculateStandardPosition(accountBalance);
    const exceptional = Calculator_Class.calculateExceptionalPosition(accountBalance);
    
    setStandardPosition(standard);
    setExceptionalPosition(exceptional);
    setInputBalance(accountBalance);
  }, [accountBalance]);

  // Prevent hydration mismatch by not rendering currency until mounted
  if (!mounted) {
    return (
      <div className={`card ${className}`}>
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <h3 className="card-title">Win More Position Sizing</h3>
          </div>
        </div>
        <div className="card-content">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted/20 rounded-lg"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 bg-muted/20 rounded-lg"></div>
              <div className="h-24 bg-muted/20 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleBalanceUpdate = () => {
    if (inputBalance > 0 && inputBalance !== accountBalance) {
      onAccountBalanceChange?.(inputBalance);
    }
    setShowCalculator(false);
  };

  const formatCurrency = (amount: number) => {
    return `£${amount.toLocaleString('en-GB', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    })}`;
  };

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <h3 className="card-title">Win More Position Sizing</h3>
          </div>
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="text-sm text-primary hover:text-primary/80"
          >
            Update Balance
          </button>
        </div>
      </div>

      <div className="card-content space-y-4">
        {/* Current Account Balance */}
        <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
          <span className="text-sm font-medium">Current Account</span>
          <span className="text-lg font-bold">{formatCurrency(accountBalance)}</span>
        </div>

        {/* Balance Update Input */}
        {showCalculator && (
          <div className="p-4 border-2 border-dashed border-primary/20 rounded-lg space-y-3">
            <label className="block text-sm font-medium">
              Update Account Balance
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputBalance}
                onChange={(e) => setInputBalance(parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter new balance..."
                min="0"
                step="100"
              />
              <button
                onClick={handleBalanceUpdate}
                className="btn-primary px-4"
              >
                Update
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Position sizes will automatically recalculate
            </p>
          </div>
        )}

        {/* Position Size Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Standard Position (5%) */}
          <div className="p-4 border-2 border-green-400 bg-green-100 dark:border-green-600/30 dark:bg-green-600/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-700 dark:text-green-400" />
              <span className="text-sm font-medium text-green-800 dark:text-green-300">Standard (5%)</span>
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100 mb-1">
              {formatCurrency(standardPosition)}
            </div>
            <p className="text-xs text-green-700 dark:text-green-400">
              90% of your trades should use this size
            </p>
          </div>

          {/* Exceptional Position (10%) */}
          <div className="p-4 border-2 border-orange-400 bg-orange-100 dark:border-orange-600/30 dark:bg-orange-600/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-orange-700 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-800 dark:text-orange-300">Exceptional (10%)</span>
            </div>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-1">
              {formatCurrency(exceptionalPosition)}
            </div>
            <p className="text-xs text-orange-700 dark:text-orange-400">
              Only for conviction score 8-10 setups
            </p>
          </div>
        </div>

        {/* Win More Rules Reminder */}
        <div className="flex items-start gap-2 p-3 bg-blue-100 border-2 border-blue-400 dark:bg-blue-600/10 dark:border-blue-600/30 rounded-lg">
          <AlertCircle className="h-4 w-4 text-blue-700 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-100">
            <div className="font-medium mb-1 text-blue-900 dark:text-blue-200">Win More Rules:</div>
            <ul className="text-xs space-y-1 text-blue-700 dark:text-blue-300">
              <li>• Position sizes always calculated from current balance</li>
              <li>• Maximum 10% position size (never exceed)</li>
              <li>• 5% standard for conviction score 5-7</li>
              <li>• 10% exceptional for conviction score 8-10</li>
              <li>• Never use fixed amounts - always percentages</li>
            </ul>
          </div>
        </div>

        {/* Quick Position Calculator */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Quick Calculator:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span>1% =</span>
              <span className="font-mono">{formatCurrency(accountBalance * 0.01)}</span>
            </div>
            <div className="flex justify-between">
              <span>2.5% =</span>
              <span className="font-mono">{formatCurrency(accountBalance * 0.025)}</span>
            </div>
            <div className="flex justify-between">
              <span>7.5% =</span>
              <span className="font-mono">{formatCurrency(accountBalance * 0.075)}</span>
            </div>
            <div className="flex justify-between">
              <span>15% =</span>
              <span className="font-mono text-red-600">
                {formatCurrency(accountBalance * 0.15)} ❌
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Red values exceed Win More maximum position size
          </p>
        </div>
      </div>
    </div>
  );
}
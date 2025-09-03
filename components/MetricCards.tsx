'use client';

import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Target,
  Activity
} from 'lucide-react';
import { VIXData } from '@/types';

interface MetricCardsProps {
  portfolioValue: number;
  vixData: VIXData | null;
}

export default function MetricCards({ portfolioValue, vixData }: MetricCardsProps) {
  // Calculate metrics
  const startingValue = 30000;
  const dayChange = portfolioValue - startingValue;
  const dayChangePercent = (dayChange / startingValue) * 100;
  const progressToTarget = (portfolioValue / 100000) * 100;
  const targetRemaining = 100000 - portfolioValue;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getVIXStatus = (value?: number) => {
    if (!value) return { label: 'Unknown', variant: 'default' };
    
    if (value >= 25) return { label: 'High Fear', variant: 'error' };
    if (value >= 20) return { label: 'Moderate Fear', variant: 'warning' };
    if (value >= 15) return { label: 'Normal', variant: 'success' };
    return { label: 'Low Volatility', variant: 'info' };
  };

  const vixStatus = getVIXStatus(vixData?.value);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Portfolio Value */}
      <div className="metric-card">
        <div className="card-header">
          <h3 className="card-title">Portfolio Value</h3>
          <DollarSign className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="card-content">
          <div className="metric-value">{formatCurrency(portfolioValue)}</div>
          <p className="metric-label">Current total value</p>
        </div>
      </div>

      {/* Day P&L */}
      <div className="metric-card">
        <div className="card-header">
          <h3 className="card-title">Day P&L</h3>
          {dayChange >= 0 ? (
            <TrendingUp className="w-4 h-4 text-success" />
          ) : (
            <TrendingDown className="w-4 h-4 text-destructive" />
          )}
        </div>
        <div className="card-content">
          <div className={`metric-value ${dayChange >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(dayChange)}
          </div>
          <p className={`metric-change ${dayChange >= 0 ? 'positive' : 'negative'}`}>
            {formatPercent(dayChangePercent)}
          </p>
        </div>
      </div>

      {/* Target Progress */}
      <div className="metric-card">
        <div className="card-header">
          <h3 className="card-title">Target Progress</h3>
          <Target className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="card-content">
          <div className="metric-value">{progressToTarget.toFixed(1)}%</div>
          <p className="metric-label">
            {formatCurrency(targetRemaining)} remaining to £100K
          </p>
        </div>
      </div>

      {/* VIX Status */}
      <div className="metric-card">
        <div className="card-header">
          <h3 className="card-title">Market Fear (VIX)</h3>
          <Activity className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="card-content">
          <div className="metric-value">
            {vixData?.value ? vixData.value.toFixed(1) : '--'}
          </div>
          <div className="flex items-center space-x-2">
            <span className={`status-${vixStatus.variant}`}>
              {vixStatus.label}
            </span>
            {vixData?.change && (
              <span className={`metric-change ${vixData.change >= 0 ? 'negative' : 'positive'}`}>
                {vixData.change >= 0 ? '+' : ''}{vixData.change.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
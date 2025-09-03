'use client';

import { useState, useEffect } from 'react';
import { VIXData } from '@/types';

interface TerminalStatusBarProps {
  vixData: VIXData | null;
  portfolioValue: number;
}

export default function TerminalStatusBar({ vixData, portfolioValue }: TerminalStatusBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [marketStatus, setMarketStatus] = useState<'OPEN' | 'CLOSED' | 'PRE' | 'AFTER'>('CLOSED');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simple market hours check (NYSE: 9:30 AM - 4:00 PM ET)
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentTimeNum = hours * 100 + minutes;
      
      if (currentTimeNum >= 930 && currentTimeNum <= 1600) {
        setMarketStatus('OPEN');
      } else if (currentTimeNum >= 400 && currentTimeNum < 930) {
        setMarketStatus('PRE');
      } else if (currentTimeNum > 1600 && currentTimeNum <= 2000) {
        setMarketStatus('AFTER');
      } else {
        setMarketStatus('CLOSED');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const dayChange = portfolioValue - 30000; // Simple calculation
  const dayChangePercent = (dayChange / 30000) * 100;

  return (
    <div className="terminal-header flex items-center justify-between text-xs font-terminal">
      {/* Left Section: Market Status & Time */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className={`status-indicator ${
            marketStatus === 'OPEN' ? 'status-live' : 
            marketStatus === 'PRE' || marketStatus === 'AFTER' ? 'status-warning' : 'status-error'
          }`}></div>
          <span className={`font-bold ${
            marketStatus === 'OPEN' ? 'text-green-400' : 
            marketStatus === 'PRE' || marketStatus === 'AFTER' ? 'text-yellow-400' : 'text-gray-400'
          }`}>
            NYSE: {marketStatus}
          </span>
        </div>
        
        <div className="text-blue-400">
          {currentTime.toLocaleDateString('en-GB', { 
            weekday: 'short', 
            day: '2-digit', 
            month: 'short' 
          })}
        </div>
        
        <div className="font-bold text-white">
          {currentTime.toLocaleTimeString('en-GB', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </div>
      </div>

      {/* Center Section: Portfolio Performance */}
      <div className="flex items-center space-x-8">
        <div className="text-center">
          <div className="text-gray-400">PORTFOLIO</div>
          <div className="font-bold text-lg">{formatCurrency(portfolioValue)}</div>
        </div>
        
        <div className="text-center">
          <div className="text-gray-400">DAY P&L</div>
          <div className={`font-bold text-lg ${
            dayChange >= 0 ? 'price-positive' : 'price-negative'
          }`}>
            {dayChange >= 0 ? '+' : ''}{formatCurrency(dayChange)}
            <span className="text-sm ml-1">
              ({dayChange >= 0 ? '+' : ''}{dayChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-gray-400">TARGET</div>
          <div className="font-bold text-blue-400">
            {((portfolioValue / 100000) * 100).toFixed(1)}% → £100K
          </div>
        </div>
      </div>

      {/* Right Section: VIX & Market Data */}
      <div className="flex items-center space-x-6">
        {vixData && (
          <>
            <div className="text-center">
              <div className="text-gray-400">VIX</div>
              <div className={`font-bold ${
                vixData.value >= 25 ? 'text-red-400' :
                vixData.value >= 20 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {vixData.value.toFixed(1)}
                <span className={`text-xs ml-1 ${
                  vixData.change >= 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {vixData.change >= 0 ? '▲' : '▼'}{Math.abs(vixData.changePercent).toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-gray-400">MODE</div>
              <div className={`font-bold text-xs ${
                vixData.mode === 'HIGH_FEAR' ? 'text-red-400' :
                vixData.mode === 'MODERATE_FEAR' ? 'text-yellow-400' : 'text-blue-400'
              }`}>
                {vixData.mode.replace('_', ' ')}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-gray-400">DEPLOY</div>
              <div className="font-bold text-white">
                {vixData.deploymentLevel}%
              </div>
            </div>
          </>
        )}
        
        <div className="flex items-center space-x-1">
          <div className="status-indicator status-live"></div>
          <span className="text-green-400 font-bold">LIVE</span>
        </div>
      </div>
    </div>
  );
}
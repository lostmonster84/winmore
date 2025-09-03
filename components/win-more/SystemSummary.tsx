'use client';

import { CheckCircle, Target, Calculator, Calendar, Zap, Trophy } from 'lucide-react';

interface SystemSummaryProps {
  className?: string;
}

export default function SystemSummary({ className = '' }: SystemSummaryProps) {
  const features = [
    {
      icon: Trophy,
      title: "Win More Philosophy",
      description: "Focus on winning more trades than losing, not chasing big returns",
      status: "implemented"
    },
    {
      icon: Calculator,
      title: "Dynamic Position Sizing",
      description: "5% standard, 10% exceptional - calculated from current account balance",
      status: "implemented"
    },
    {
      icon: Calendar,
      title: "Monthly Allocation Limits",
      description: "30% September (survival) to 80% November (opportunity) based on seasonality",
      status: "implemented"
    },
    {
      icon: Target,
      title: "5 Setup System",
      description: "One setup focus per month: Oversold, Support, Earnings, Sympathy, Gap Fill",
      status: "implemented"
    },
    {
      icon: Zap,
      title: "Rule Enforcement Engine",
      description: "Prevents bad decisions: max 3 trades/day, position limits, setup focus",
      status: "implemented"
    }
  ];

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <h3 className="card-title">🎯 WinMore System - Implementation Status</h3>
      </div>
      <div className="card-content space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div>
                  <div className="font-medium text-sm mb-1">{feature.title}</div>
                  <div className="text-xs text-muted-foreground">{feature.description}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="font-medium text-green-800 mb-2">🎉 System Successfully Implemented!</div>
          <div className="text-sm text-green-700 space-y-1">
            <p>• Complete transformation from aggressive OUTPOST to disciplined Win More System</p>
            <p>• All components working together: position sizing, allocation limits, rule enforcement</p>
            <p>• Ready for live trading with built-in discipline and risk management</p>
            <p>• Next phase: Claude AI integration for setup recommendations</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-muted/20 rounded-lg">
            <div className="text-xl font-bold text-primary">5-10%</div>
            <div className="text-xs text-muted-foreground">Position Sizes</div>
          </div>
          <div className="p-3 bg-muted/20 rounded-lg">
            <div className="text-xl font-bold text-primary">3</div>
            <div className="text-xs text-muted-foreground">Max Trades/Day</div>
          </div>
        </div>
      </div>
    </div>
  );
}
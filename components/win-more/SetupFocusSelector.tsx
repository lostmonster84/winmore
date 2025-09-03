'use client';

import { useState } from 'react';
import { Target, TrendingUp, BarChart, Zap, Activity, CheckCircle } from 'lucide-react';
import { SetupType, WinMoreSetup } from '@/types/win-more';
import { WIN_MORE_SETUPS } from '@/lib/win-more-system';

interface SetupFocusSelectorProps {
  currentSetup: SetupType;
  onSetupChange: (setupType: SetupType) => void;
  className?: string;
}

export default function SetupFocusSelector({ 
  currentSetup, 
  onSetupChange,
  className = '' 
}: SetupFocusSelectorProps) {
  const [showSelector, setShowSelector] = useState(false);

  const setupIcons: Record<SetupType, React.ComponentType<any>> = {
    1: TrendingUp,  // Oversold bounce
    2: BarChart,    // Support bounce
    3: Activity,    // Earnings reaction
    4: Zap,         // Sympathy selloff
    5: Target       // Gap fill
  };

  const setupColors: Record<SetupType, string> = {
    1: 'text-green-600 bg-green-50 border-green-200',
    2: 'text-blue-600 bg-blue-50 border-blue-200',
    3: 'text-purple-600 bg-purple-50 border-purple-200',
    4: 'text-orange-600 bg-orange-50 border-orange-200',
    5: 'text-red-600 bg-red-50 border-red-200'
  };

  const getSetupDescription = (setup: WinMoreSetup): string => {
    return `${setup.targetWinRate}% win rate • Hold ${setup.criteria.holdTime.min}-${setup.criteria.holdTime.max} days • ${setup.profitTarget}% target`;
  };

  const handleSetupSelect = (setupType: SetupType) => {
    onSetupChange(setupType);
    setShowSelector(false);
  };

  const currentSetupInfo = WIN_MORE_SETUPS[currentSetup];
  const CurrentIcon = setupIcons[currentSetup];

  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h3 className="card-title">Monthly Setup Focus</h3>
          </div>
          <button
            onClick={() => setShowSelector(!showSelector)}
            className="text-sm text-primary hover:text-primary/80"
          >
            Change Focus
          </button>
        </div>
      </div>

      <div className="card-content space-y-4">
        {/* Current Setup Display */}
        <div className={`p-4 border-2 rounded-lg ${setupColors[currentSetup]}`}>
          <div className="flex items-center gap-3 mb-2">
            <CurrentIcon className="h-6 w-6" />
            <div>
              <div className="font-bold text-lg">Setup {currentSetup}: {currentSetupInfo.name}</div>
              <div className="text-sm opacity-75">
                {getSetupDescription(currentSetupInfo)}
              </div>
            </div>
          </div>
          <div className="text-sm mt-2">
            {currentSetupInfo.description}
          </div>
        </div>

        {/* Setup Selection Modal */}
        {showSelector && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-center p-2 bg-muted/20 rounded-lg">
              Choose Your Focus for This Month
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {(Object.entries(WIN_MORE_SETUPS) as [string, WinMoreSetup][]).map(([key, setup]) => {
                const setupType = parseInt(key) as SetupType;
                const Icon = setupIcons[setupType];
                const isSelected = setupType === currentSetup;
                
                return (
                  <button
                    key={setupType}
                    onClick={() => handleSetupSelect(setupType)}
                    className={`p-3 text-left border-2 rounded-lg transition-all hover:shadow-md ${
                      isSelected 
                        ? setupColors[setupType]
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-4 w-4 ${isSelected ? '' : 'text-muted-foreground'}`} />
                      <span className="font-medium">
                        Setup {setupType}: {setup.name}
                      </span>
                      {isSelected && <CheckCircle className="h-4 w-4 ml-auto" />}
                    </div>
                    <div className={`text-xs ${isSelected ? 'opacity-75' : 'text-muted-foreground'}`}>
                      {getSetupDescription(setup)}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <div className="font-medium mb-1">📚 Win More Rule:</div>
              <div>Pick ONE setup type each month and ONLY trade that pattern. This helps you master the setup and avoid confusion from too many strategies.</div>
            </div>
          </div>
        )}

        {/* Focus Stats (if we had historical data) */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">This Month&apos;s Progress</h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-muted/20 rounded-lg">
              <div className="text-lg font-bold">0</div>
              <div className="text-xs text-muted-foreground">Trades</div>
            </div>
            <div className="p-2 bg-muted/20 rounded-lg">
              <div className="text-lg font-bold">-</div>
              <div className="text-xs text-muted-foreground">Win Rate</div>
            </div>
            <div className="p-2 bg-muted/20 rounded-lg">
              <div className="text-lg font-bold">-</div>
              <div className="text-xs text-muted-foreground">Avg Return</div>
            </div>
          </div>
        </div>

        {/* Setup Tips */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Focus Tips</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            {currentSetup === 1 && (
              <>
                <p>• Look for quality stocks down 8-15% on market fear</p>
                <p>• Verify RSI below 40 and price above 200-day MA</p>
                <p>• Check for volume spike and absence of bad news</p>
                <p>• Best during high VIX environments ({'>'}19)</p>
              </>
            )}
            {currentSetup === 2 && (
              <>
                <p>• Find stocks testing 50-day or 200-day moving averages</p>
                <p>• Look for 3+ previous successful bounces from level</p>
                <p>• Confirm with volume increase on bounce attempt</p>
                <p>• Works best in uptrending or sideways markets</p>
              </>
            )}
            {currentSetup === 3 && (
              <>
                <p>• Target stocks down {'>'}10% after earnings</p>
                <p>• Focus on quality companies with slight misses</p>
                <p>• Ensure revenue is still growing</p>
                <p>• Wait until Day 2 after earnings for entry</p>
              </>
            )}
            {currentSetup === 4 && (
              <>
                <p>• Find best company in a sector that&apos;s selling off</p>
                <p>• Verify no company-specific negative news</p>
                <p>• Look for 5-12% decline from sector weakness</p>
                <p>• Enter when sector panic peaks</p>
              </>
            )}
            {currentSetup === 5 && (
              <>
                <p>• Target gap-downs {'>'}5% with no fundamental news</p>
                <p>• Ensure stock holds above next support level</p>
                <p>• Trade only in first 2 hours after market open</p>
                <p>• Quick 1-3 day holds for gap fill moves</p>
              </>
            )}
          </div>
        </div>

        {/* Reminder */}
        <div className="text-xs text-center text-muted-foreground p-2 bg-muted/10 rounded">
          Master this setup before moving to another. Consistency beats complexity.
        </div>
      </div>
    </div>
  );
}
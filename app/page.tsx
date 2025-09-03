'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import MetricCards from '@/components/MetricCards';
import WatchlistMonitor from '@/components/WatchlistMonitor';
import WinMoreDashboard from '@/components/win-more/WinMoreDashboard';
import Trading212Portfolio from '@/components/portfolio/Trading212Portfolio';
import { clientAuth } from '@/lib/client-auth';
import { WatchlistItem, VIXData } from '@/types';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [portfolioValue] = useState(30000);
  const [vixData, setVixData] = useState<VIXData | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    setMounted(true);
    let isMounted = true;
    
    const checkAuth = async () => {
      if (!isMounted) return;
      
      try {
        const authenticated = await clientAuth.checkSession();
        
        if (!isMounted) return;
        
        if (!authenticated) {
          router.replace('/login');
          return;
        }
        
        setIsAuthenticated(true);
        
        // Only load data after authentication is confirmed
        loadWatchlist();
        fetchVIXData();
        
        setIsLoading(false);
      } catch (error) {
        if (!isMounted) return;
        
        setAuthError(error instanceof Error ? error.message : 'Authentication failed');
        setIsLoading(false);
        
        setTimeout(() => {
          if (isMounted) router.replace('/login');
        }, 1000);
      }
    };
    
    checkAuth();
    
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Auto-refresh VIX data
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(fetchVIXData, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchVIXData = async () => {
    try {
      const response = await fetch('/api/market/vix', {
        credentials: 'include',
      });
      const result = await response.json();
      
      if (result.success) {
        setVixData(result.data);
      }
    } catch (error) {
      console.error('Error fetching VIX data:', error);
    }
  };

  const loadWatchlist = () => {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('winmore-watchlist');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert date strings back to Date objects
        const hydratedWatchlist = parsed.map((item: any) => ({
          ...item,
          addedDate: new Date(item.addedDate)
        }));
        setWatchlist(hydratedWatchlist);
      } else {
        // Create default watchlist - use consistent timestamp
        const baseTime = 1704067200000; // Fixed timestamp to avoid hydration issues
        const defaultWatchlist: WatchlistItem[] = [
          {
            id: 'nvda-1',
            symbol: 'NVDA',
            name: 'NVIDIA Corporation',
            addedDate: new Date(baseTime),
            alertConditions: {
              oversoldScore: 7,
              priceBelow: 400,
              volumeSpike: 2
            }
          },
          {
            id: 'tsla-1', 
            symbol: 'TSLA',
            name: 'Tesla, Inc.',
            addedDate: new Date(baseTime + 1000),
            alertConditions: {
              oversoldScore: 7,
              priceBelow: 200,
              volumeSpike: 2
            }
          },
          {
            id: 'aapl-1',
            symbol: 'AAPL', 
            name: 'Apple Inc.',
            addedDate: new Date(baseTime + 2000),
            alertConditions: {
              oversoldScore: 6,
              priceBelow: 150,
              volumeSpike: 1.5
            }
          }
        ];
        setWatchlist(defaultWatchlist);
        localStorage.setItem('winmore-watchlist', JSON.stringify(defaultWatchlist));
      }
    } catch (error) {
      console.error('Error loading watchlist:', error);
    }
  };

  const saveWatchlist = (newWatchlist: WatchlistItem[]) => {
    try {
      localStorage.setItem('winmore-watchlist', JSON.stringify(newWatchlist));
      setWatchlist(newWatchlist);
    } catch (error) {
      console.error('Error saving watchlist:', error);
    }
  };

  const handleAddSymbol = (symbol: string) => {
    if (watchlist.some(item => item.symbol === symbol)) {
      return;
    }

    // Generate timestamp only on client side to avoid hydration issues
    const timestamp = typeof window !== 'undefined' ? Date.now() : 0;
    const newItem: WatchlistItem = {
      id: `${symbol.toLowerCase()}-${timestamp}`,
      symbol: symbol.toUpperCase(),
      name: '',
      addedDate: new Date(timestamp),
      alertConditions: {
        oversoldScore: 7,
        priceBelow: undefined,
        volumeSpike: 2,
        rsiBelow: 30
      }
    };

    const newWatchlist = [...watchlist, newItem];
    saveWatchlist(newWatchlist);
  };

  const handleRemoveSymbol = (id: string) => {
    const newWatchlist = watchlist.filter(item => item.id !== id);
    saveWatchlist(newWatchlist);
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {authError ? `Error: ${authError}` : 'Loading WinMore...'}
          </p>
          {authError && (
            <p className="text-xs text-muted-foreground mt-2">Redirecting to login...</p>
          )}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'watchlist':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Watchlist</h1>
              <p className="text-muted-foreground">Monitor your trading opportunities</p>
            </div>
            <WatchlistMonitor
              watchlist={watchlist}
              onAddSymbol={handleAddSymbol}
              onRemoveSymbol={handleRemoveSymbol}
              vixData={vixData}
            />
          </div>
        );
      case 'portfolio':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Portfolio</h1>
              <p className="text-muted-foreground">Track your investments and performance</p>
            </div>
            <Trading212Portfolio />
          </div>
        );
      case 'alerts':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Alerts</h1>
              <p className="text-muted-foreground">Trading signals and notifications</p>
            </div>
            <div className="card">
              <div className="card-content">
                <p className="text-center text-muted-foreground py-8">
                  Alert system coming soon...
                </p>
              </div>
            </div>
          </div>
        );
      case 'analysis':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Analysis</h1>
              <p className="text-muted-foreground">Market research and technical analysis</p>
            </div>
            <div className="card">
              <div className="card-content">
                <p className="text-center text-muted-foreground py-8">
                  Analysis tools coming soon...
                </p>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Configure your trading preferences</p>
            </div>
            <div className="card">
              <div className="card-content">
                <p className="text-center text-muted-foreground py-8">
                  Settings panel coming soon...
                </p>
              </div>
            </div>
          </div>
        );
      default: // dashboard
        return <WinMoreDashboard initialAccountBalance={portfolioValue} />;
    }
  };

  return (
    <div className="dashboard-layout flex">
      <Sidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="dashboard-main">
        <div className="dashboard-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
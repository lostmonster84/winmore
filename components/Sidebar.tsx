'use client';

import { useState } from 'react';
import { 
  LayoutDashboard, 
  Eye, 
  TrendingUp, 
  Bell, 
  BarChart3, 
  Settings, 
  LogOut,
  Sun,
  Moon,
  Menu
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { clientAuth } from '@/lib/client-auth';

interface SidebarProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export default function Sidebar({ activeSection = 'dashboard', onSectionChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme, mounted } = useTheme();
  
  if (!mounted) {
    return <div className="w-64 bg-card border-r border-border flex-shrink-0"></div>;
  }

  const handleLogout = async () => {
    await clientAuth.logout();
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      section: 'main'
    },
    {
      id: 'watchlist',
      label: 'Watchlist',
      icon: Eye,
      section: 'main'
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: TrendingUp,
      section: 'main'
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      section: 'main'
    },
    {
      id: 'analysis',
      label: 'Analysis',
      icon: BarChart3,
      section: 'main'
    }
  ];

  const settingsItems = [
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <div className={`dashboard-sidebar ${collapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">WINMORE</h1>
              <p className="text-xs text-muted-foreground">Trading System</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn-ghost p-2 ml-auto"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        {/* Main Navigation */}
        <div className="sidebar-section">
          {!collapsed && (
            <div className="sidebar-section-title">Navigation</div>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange?.(item.id)}
                className={`nav-link w-full ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Settings */}
        <div className="sidebar-section mt-8">
          {!collapsed && (
            <div className="sidebar-section-title">System</div>
          )}
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="nav-link w-full"
            title={collapsed ? 'Toggle theme' : undefined}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 flex-shrink-0" />
            ) : (
              <Moon className="w-4 h-4 flex-shrink-0" />
            )}
            {!collapsed && (
              <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
            )}
          </button>

          {/* Settings */}
          {settingsItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange?.(item.id)}
                className={`nav-link w-full ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="nav-link w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="mt-auto p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <div>Version 2.0</div>
            <div>Win More Edition</div>
          </div>
        </div>
      )}
    </div>
  );
}
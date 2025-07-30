import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Sidebar } from './components/Sidebar';
import { StatsView } from './components/StatsView';
import { ChartsView } from './components/ChartsView';
import { RankingsView } from './components/RankingsView';
import './App.css';

type ViewType = 'dashboard' | 'stats' | 'charts' | 'rankings';

declare global {
  interface Window {
    electronAPI: {
      getAppStats: (timeRange: string) => Promise<any[]>;
      getDailyUsage: (startDate: string, endDate: string) => Promise<any[]>;
      getAppRankings: () => Promise<any[]>;
    };
  }
}

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [appStats, setAppStats] = useState<any[]>([]);
  const [dailyUsage, setDailyUsage] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    loadData(true);
    
    // Refresh data every 10 seconds (without loading state)
    const interval = setInterval(() => loadData(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async (showLoading: boolean = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      const [todayStats, weeklyUsage, appRankings] = await Promise.all([
        window.electronAPI.getAppStats('today'),
        window.electronAPI.getDailyUsage(
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        ),
        window.electronAPI.getAppRankings()
      ]);

      setAppStats(todayStats);
      setDailyUsage(weeklyUsage);
      setRankings(appRankings);
      
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const renderCurrentView = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>正在加载数据...</p>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <Dashboard appStats={appStats} dailyUsage={dailyUsage} />;
      case 'stats':
        return <StatsView appStats={appStats} onRefresh={loadData} />;
      case 'charts':
        return <ChartsView dailyUsage={dailyUsage} onRefresh={loadData} />;
      case 'rankings':
        return <RankingsView rankings={rankings} onRefresh={loadData} />;
      default:
        return <Dashboard appStats={appStats} dailyUsage={dailyUsage} />;
    }
  };

  return (
    <div className="app">
      <div className="app-header">
        <h1>PC 使用时间统计</h1>
      </div>
      
      <div className="app-content">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        <main className="main-content">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}

export default App;
import * as path from 'path';
import { app } from 'electron';

export interface AppUsage {
  id?: number;
  appName: string;
  appPath: string;
  windowTitle: string;
  startTime: number;
  endTime: number;
  duration: number;
  date: string;
}

export interface DailyUsage {
  date: string;
  totalTime: number;
  apps: { [key: string]: number };
}

export class DatabaseManager {
  private data: { [key: string]: AppUsage[] } = {};
  private dbPath: string;

  constructor() {
    try {
      const userDataPath = app.getPath('userData');
      this.dbPath = path.join(userDataPath, 'pc_timer.db');
      console.log('Using in-memory database for now. Path would be:', this.dbPath);
      
      // Initialize in-memory storage
      this.data = {
        app_usage: []
      };
      
      console.log('In-memory database initialized successfully');
    } catch (error) {
      console.error('Error in database constructor:', error);
      throw error;
    }
  }

  private initDatabase(): void {
    // No-op for in-memory database
    console.log('In-memory database structure ready');
  }

  public async saveAppUsage(usage: AppUsage): Promise<void> {
    const newUsage = {
      ...usage,
      id: this.data.app_usage.length + 1
    };
    
    this.data.app_usage.push(newUsage);
    console.log(`Saved usage: ${usage.appName} - ${Math.round(usage.duration / 1000)}s`);
  }

  public async getAppStats(timeRange: string): Promise<any[]> {
    const today = new Date().toISOString().split('T')[0];
    let filteredData = this.data.app_usage;
    
    switch (timeRange) {
      case '7days':
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
        filteredData = this.data.app_usage.filter(usage => usage.date >= sevenDaysAgoStr);
        break;
      case '30days':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
        filteredData = this.data.app_usage.filter(usage => usage.date >= thirtyDaysAgoStr);
        break;
      case 'today':
      default:
        filteredData = this.data.app_usage.filter(usage => usage.date === today);
        break;
    }

    // Group by app name
    const grouped: { [key: string]: { total_duration: number; session_count: number } } = {};
    
    filteredData.forEach(usage => {
      if (!grouped[usage.appName]) {
        grouped[usage.appName] = { total_duration: 0, session_count: 0 };
      }
      grouped[usage.appName].total_duration += usage.duration;
      grouped[usage.appName].session_count += 1;
    });

    // Convert to array and sort
    const result = Object.entries(grouped).map(([app_name, stats]) => ({
      app_name,
      total_duration: stats.total_duration,
      session_count: stats.session_count
    })).sort((a, b) => b.total_duration - a.total_duration);

    return result;
  }

  public async getDailyUsage(startDate: string, endDate: string): Promise<DailyUsage[]> {
    const filteredData = this.data.app_usage.filter(usage => 
      usage.date >= startDate && usage.date <= endDate
    );

    const dailyUsageMap: { [key: string]: DailyUsage } = {};
    
    filteredData.forEach(usage => {
      if (!dailyUsageMap[usage.date]) {
        dailyUsageMap[usage.date] = {
          date: usage.date,
          totalTime: 0,
          apps: {}
        };
      }
      
      dailyUsageMap[usage.date].totalTime += usage.duration;
      if (!dailyUsageMap[usage.date].apps[usage.appName]) {
        dailyUsageMap[usage.date].apps[usage.appName] = 0;
      }
      dailyUsageMap[usage.date].apps[usage.appName] += usage.duration;
    });

    return Object.values(dailyUsageMap).sort((a, b) => a.date.localeCompare(b.date));
  }

  public async getAppRankings(): Promise<any[]> {
    const grouped: { [key: string]: { 
      total_duration: number; 
      active_days: Set<string>; 
      sessions: number[] 
    } } = {};
    
    this.data.app_usage.forEach(usage => {
      if (!grouped[usage.appName]) {
        grouped[usage.appName] = {
          total_duration: 0,
          active_days: new Set(),
          sessions: []
        };
      }
      grouped[usage.appName].total_duration += usage.duration;
      grouped[usage.appName].active_days.add(usage.date);
      grouped[usage.appName].sessions.push(usage.duration);
    });

    const result = Object.entries(grouped).map(([app_name, stats]) => ({
      app_name,
      total_duration: stats.total_duration,
      active_days: stats.active_days.size,
      avg_session_duration: stats.sessions.length > 0 
        ? stats.sessions.reduce((a, b) => a + b, 0) / stats.sessions.length 
        : 0
    })).sort((a, b) => b.total_duration - a.total_duration).slice(0, 20);

    return result;
  }

  public async close(): Promise<void> {
    console.log('In-memory database closed');
    // Clear data if needed
    this.data = { app_usage: [] };
  }
}
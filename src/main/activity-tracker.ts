import { exec } from 'child_process';
import { promisify } from 'util';
import { DatabaseManager, AppUsage } from './database';

const execAsync = promisify(exec);

interface ActiveWindow {
  processName: string;
  windowTitle: string;
  processPath: string;
}

export class ActivityTracker {
  private database: DatabaseManager;
  private currentApp: string | null = null;
  private currentStartTime: number = 0;
  private trackingInterval: NodeJS.Timeout | null = null;
  private readonly TRACKING_INTERVAL = 5000; // 5 seconds

  constructor(database: DatabaseManager) {
    this.database = database;
  }

  public start(): void {
    console.log('Starting activity tracking...');
    this.trackingInterval = setInterval(() => {
      this.trackCurrentActivity();
    }, this.TRACKING_INTERVAL);
  }

  public stop(): void {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
    
    // Save current session if exists
    if (this.currentApp && this.currentStartTime) {
      this.saveCurrentSession();
    }
    
    console.log('Activity tracking stopped');
  }

  private async trackCurrentActivity(): Promise<void> {
    try {
      const activeWindow = await this.getActiveWindow();
      
      if (!activeWindow || !activeWindow.processName) {
        return;
      }

      const appName = activeWindow.processName;
      const now = Date.now();

      // If app changed, save previous session and start new one
      if (this.currentApp !== appName) {
        if (this.currentApp && this.currentStartTime) {
          await this.saveCurrentSession();
        }

        this.currentApp = appName;
        this.currentStartTime = now;
        console.log(`Started tracking: ${appName} at ${new Date(now).toLocaleTimeString()}`);
      } else {
        const duration = now - this.currentStartTime;
        console.log(`Still using ${appName} (${Math.round(duration/1000)}s so far)`);
      }
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  private async getActiveWindow(): Promise<ActiveWindow | null> {
    try {
      // Use external PowerShell script
      const scriptPath = require('path').join(__dirname, 'get-foreground-window.ps1');
      const { stdout } = await execAsync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`);
      
      if (stdout.trim()) {
        const result = JSON.parse(stdout.trim());
        console.log(`✓ Active window: ${result.ProcessName} - "${result.WindowTitle}"`);
        return {
          processName: result.ProcessName || 'Unknown',
          windowTitle: result.WindowTitle || '',
          processPath: result.ProcessPath || ''
        };
      }
    } catch (error) {
      console.error('Error getting active window:', error);
      
      // Fallback: try simpler approach
      try {
        const { stdout } = await execAsync('tasklist /fi "STATUS eq running" /fo csv | findstr /i "chrome\\|firefox\\|notepad\\|code\\|explorer"');
        const lines = stdout.trim().split('\n');
        if (lines.length > 0) {
          const firstLine = lines[0];
          const processName = firstLine.split(',')[0].replace(/"/g, '');
          console.log(`✓ Fallback detected: ${processName}`);
          return {
            processName: processName,
            windowTitle: 'Unknown',
            processPath: ''
          };
        }
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError);
      }
    }

    return null;
  }

  private async saveCurrentSession(): Promise<void> {
    if (!this.currentApp || !this.currentStartTime) {
      return;
    }

    const endTime = Date.now();
    const duration = endTime - this.currentStartTime;

    // Only save sessions longer than 10 seconds
    if (duration > 10000) {
      const usage: AppUsage = {
        appName: this.currentApp,
        appPath: '', // Will be filled by getActiveWindow if available
        windowTitle: '', // Will be filled by getActiveWindow if available
        startTime: this.currentStartTime,
        endTime: endTime,
        duration: duration,
        date: new Date().toISOString().split('T')[0]
      };

      try {
        await this.database.saveAppUsage(usage);
        console.log(`Saved session: ${this.currentApp} - ${Math.round(duration / 1000)}s`);
      } catch (error) {
        console.error('Error saving usage:', error);
      }
    }

    this.currentApp = null;
    this.currentStartTime = 0;
  }
}
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
  private readonly TRACKING_INTERVAL = 2000; // 2 seconds (for testing)

  constructor(database: DatabaseManager) {
    this.database = database;
  }

  public start(): void {
    console.log('Starting activity tracking...');
    console.log(`Tracking interval: ${this.TRACKING_INTERVAL}ms`);
    console.log(`Minimum session duration: 3000ms`);
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
      console.log('--- Checking activity ---');
      const activeWindow = await this.getActiveWindow();
      
      if (!activeWindow || !activeWindow.processName) {
        console.log('No active window detected');
        return;
      }

      const appName = activeWindow.processName;
      const now = Date.now();
      console.log(`Current app: ${this.currentApp} -> New app: ${appName}`);

      // If app changed, save previous session and start new one
      if (this.currentApp !== appName) {
        if (this.currentApp && this.currentStartTime) {
          console.log(`App switched from ${this.currentApp} to ${appName}, saving session...`);
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
      // Method 1: Use PowerShell script file to get actual foreground window
      const scriptPath = 'get-active-window.ps1';
      const { stdout } = await execAsync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, { timeout: 5000 });
      
      if (stdout.trim()) {
        try {
          const result = JSON.parse(stdout.trim());
          if (result && result.ProcessName) {
            console.log(`Foreground window: ${result.ProcessName} - "${result.WindowTitle}"`);
            return {
              processName: result.ProcessName,
              windowTitle: result.WindowTitle || 'Active Window',
              processPath: result.ProcessPath || ''
            };
          }
        } catch (parseError) {
          console.error('Failed to parse PowerShell result:', parseError);
        }
      }
    } catch (error) {
      console.error('PowerShell script method failed:', (error as Error).message);
    }

    try {
      // Method 2: Direct PowerShell command as fallback
      const { stdout } = await execAsync('powershell -Command "Add-Type -TypeDefinition \'using System; using System.Runtime.InteropServices; public class User32 { [DllImport(\\\"user32.dll\\\")] public static extern IntPtr GetForegroundWindow(); [DllImport(\\\"user32.dll\\\")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId); }\'; $hwnd = [User32]::GetForegroundWindow(); $pid = 0; [User32]::GetWindowThreadProcessId($hwnd, [ref]$pid); if($pid -gt 0) { $proc = Get-Process -Id $pid -EA 0; if($proc) { $proc.ProcessName } }"', { timeout: 3000 });
      
      if (stdout.trim()) {
        const processName = stdout.trim();
        console.log(`Direct PowerShell foreground: ${processName}`);
        return {
          processName: processName,
          windowTitle: 'Active Window',
          processPath: ''
        };
      }
    } catch (error) {
      console.error('Direct PowerShell method failed:', (error as Error).message);
    }

    try {
      // Method 3: Use Node.js native module (if available)
      const { stdout } = await execAsync('powershell -Command "Get-Process | Where-Object { $_.MainWindowTitle -ne \\\"\\\" } | Sort-Object CPU -Descending | Select-Object -First 1 | Select-Object ProcessName | ConvertTo-Json"', { timeout: 3000 });
      
      if (stdout.trim()) {
        try {
          const result = JSON.parse(stdout.trim());
          if (result && result.ProcessName) {
            console.log(`Most active process: ${result.ProcessName}`);
            return {
              processName: result.ProcessName,
              windowTitle: 'Active Window',
              processPath: ''
            };
          }
        } catch (parseError) {
          console.error('Failed to parse active process result:', parseError);
        }
      }
    } catch (error) {
      console.error('Active process method failed:', (error as Error).message);
    }

    console.log('All detection methods failed, no active window found');
    return null;
  }

  private async saveCurrentSession(): Promise<void> {
    if (!this.currentApp || !this.currentStartTime) {
      return;
    }

    const endTime = Date.now();
    const duration = endTime - this.currentStartTime;

    // Only save sessions longer than 3 seconds (for testing)
    if (duration > 3000) {
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
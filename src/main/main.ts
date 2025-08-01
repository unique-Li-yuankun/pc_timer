import { app, BrowserWindow, ipcMain } from 'electron';
import { execSync } from 'child_process';
import * as path from 'path';
import { isDev } from '../shared/utils';
import { DatabaseManager } from './database';
import { ActivityTracker } from './activity-tracker';

class Main {
  private mainWindow: BrowserWindow | null = null;
  private database: DatabaseManager;
  private activityTracker: ActivityTracker;

  constructor() {
    try {
      console.log('Initializing main process...');
      this.database = new DatabaseManager();
      this.activityTracker = new ActivityTracker(this.database);
      console.log('Main process initialized successfully');
    } catch (error) {
      console.error('Error initializing main process:', error);
      throw error;
    }
  }

  private createWindow(): void {
    this.mainWindow = new BrowserWindow({
      height: 800,
      width: 1200,
      minWidth: 1000,
      minHeight: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
      titleBarStyle: 'hidden',
      titleBarOverlay: {
        color: '#2f3241',
        symbolColor: '#74b1be'
      }
    });

    if (isDev) {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, 'index.html'));
    }
  }

  private setupIpcHandlers(): void {
    ipcMain.handle('get-app-stats', async (_, timeRange: string) => {
      return await this.database.getAppStats(timeRange);
    });

    ipcMain.handle('get-daily-usage', async (_, startDate: string, endDate: string) => {
      return await this.database.getDailyUsage(startDate, endDate);
    });

    ipcMain.handle('get-app-rankings', async () => {
      return await this.database.getAppRankings();
    });

    ipcMain.handle('get-auto-start-status', async () => {
      return this.getAutoStartStatus();
    });

    ipcMain.handle('set-auto-start', async (_, enabled: boolean) => {
      return this.setAutoStart(enabled);
    });
  }

  private getAutoStartStatus(): boolean {
    try {
      const appName = 'PC Timer';
      const command = `reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${appName}"`;
      execSync(command, { stdio: 'ignore' });
      return true;
    } catch (error) {
      return false;
    }
  }

  private setAutoStart(enabled: boolean): boolean {
    try {
      const appName = 'PC Timer';
      const appPath = process.execPath;
      
      if (enabled) {
        const command = `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${appName}" /d "${appPath}" /f`;
        execSync(command);
      } else {
        const command = `reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v "${appName}" /f`;
        execSync(command);
      }
      return true;
    } catch (error) {
      console.error('Error setting auto start:', error);
      return false;
    }
  }

  public init(): void {
    app.whenReady().then(() => {
      this.createWindow();
      this.setupIpcHandlers();
      this.activityTracker.start();

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow();
        }
      });
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('before-quit', async () => {
      await this.activityTracker.stop();
      await this.database.close();
    });
  }
}

const main = new Main();
main.init();
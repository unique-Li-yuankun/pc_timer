import { contextBridge, ipcRenderer } from 'electron';

export type ElectronAPI = {
  getAppStats: (timeRange: string) => Promise<any[]>;
  getDailyUsage: (startDate: string, endDate: string) => Promise<any[]>;
  getAppRankings: () => Promise<any[]>;
};

const electronAPI: ElectronAPI = {
  getAppStats: (timeRange: string) => ipcRenderer.invoke('get-app-stats', timeRange),
  getDailyUsage: (startDate: string, endDate: string) => ipcRenderer.invoke('get-daily-usage', startDate, endDate),
  getAppRankings: () => ipcRenderer.invoke('get-app-rankings'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
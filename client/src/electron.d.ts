export interface IElectronAPI {
  ipcRenderer: {
    send: (channel: string, data?: any) => void;
    on: (channel: string, func: (...args: any[]) => void) => void;
  };
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}


import { contextBridge, ipcRenderer as ipc } from 'electron';

const api: ScrapbookApi = {
  quit: () => ipc.invoke('quit')
};

contextBridge.exposeInMainWorld('scrapbookApi', api);

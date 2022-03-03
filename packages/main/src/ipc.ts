import { app, ipcMain as ipc } from 'electron';

export function registerIPC(): void {
  ipc.handle('quit', () => {
    app.quit();
  });
}

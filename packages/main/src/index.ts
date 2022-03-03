import { app } from 'electron';
import isDev from 'electron-is-dev';

import { registerIPC } from './ipc';
import { createWindow, showWindow, window } from './window';

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    showWindow();
  });

  app.on('ready', () => {
    registerIPC();

    const window = createWindow();

    const url = isDev ?
      import.meta.env.VITE_DEV_SERVER_URL as string :
      new URL('../renderer/dist/index.html', 'file://' + __dirname).href;

    window?.loadURL(url);

    //if (isDev) {
      window?.webContents.openDevTools();
    //} else {
      //window?.removeMenu();
    //}

    window?.webContents.on('devtools-opened', () => {
      window?.focus();
      setImmediate(() => {
        window?.focus();
      });
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (window === null) {
    createWindow();
  }
});

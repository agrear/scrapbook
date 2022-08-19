import { app, type BrowserWindow } from 'electron';
import isDev from 'electron-is-dev';

import { registerIPC } from './ipc';
import { store } from './store';
import { createWindow, showWindow, window } from './window';

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const state = store.get('preferences.window.state') as WindowState;

    showWindow(state === 'borderless');
  });

  app.on('ready', () => {
    registerIPC();

    const windowState = store.get('preferences.window.state') as WindowState;

    let window: BrowserWindow | null = null;
    if (windowState === 'windowed') {
      window = createWindow({
        ...store.get('preferences.window.size'),
        center: true,
        show: false
      });

      if (store.get('preferences.window.maximized')) {
        window.once('ready-to-show', () => {
          window?.maximize();
        });
      }
    } else if (windowState === 'borderless') {
      window = createWindow({
        frame: false,
        movable: false,
        resizable: false,
        show: false
      });

      window.maximize();
    } else {
      window = createWindow({
        fullscreen: true,
        show: false
      });
    }

    window.on('maximize', () => {
      if (store.get('preferences.window.state') === 'windowed') {
        store.set('preferences.window.maximized', true);
      }
    });

    window.on('minimize', (event: Event) => {
      if (store.get('preferences.minimizeToTray')) {
        event.preventDefault();
        window?.hide();
      }
    });

    window.on('unmaximize', () => {
      if (store.get('preferences.window.state') === 'windowed') {
        store.set('preferences.window.maximized', false);
      }
    });

    window.on('resize', () => {
      if (store.get('preferences.window.state') === 'windowed') {
        if (window === null || window.isMaximized()) {
          return;
        }

        const [width, height] = window.getSize();
        store.set('preferences.window.size', {
          width,
          height
        });
      }
    });

    const url = isDev ?
      `http://${process.env['VITE_DEV_SERVER_HOST']}:${process.env['VITE_DEV_SERVER_PORT']}` :
      new URL('../packages/renderer/dist/client/index.html', 'file://' + __dirname).href;

    window?.loadURL(url);

    if (isDev) {
      window?.webContents.openDevTools();
    } else {
      window?.removeMenu();
    }

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

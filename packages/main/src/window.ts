import { BrowserWindow } from 'electron';
import path from 'path';

export let window: BrowserWindow | null = null;
let hasFrame = true;

export function createWindow(
  options: Electron.BrowserWindowConstructorOptions = {}
): BrowserWindow {
  if (window !== null) {
    window.destroy();
  }

  window = new BrowserWindow({
    width: 1024,
    height: 800,
    resizable: true,
    backgroundColor: '#202020',
    ...options,
    webPreferences: {
      sandbox: true,
      preload: path.join(__dirname, '../../preload/dist/index.cjs')
    }
  });

  hasFrame = options?.frame ?? true;

  window.on('closed', () => {
    window = null;
  });

  if (options?.show === true) {
    window.once('ready-to-show', () => {
      window?.focus();
    });
  }

  window.once('ready-to-show', () => {
    window?.show();
    window?.focus();
  });

  window.webContents.on('devtools-opened', () => {
    window?.focus();

    setImmediate(() => {
      window?.focus();
    });
  });

  return window;
}

export function showWindow(): void {
  if (window === null) {
    return;
  }

  if (!window.isVisible()) {
    window.show();
  } else if (window.isMinimized()) {
    window.restore();
  }

  window.focus();
}

import { app, ipcMain as ipc } from 'electron';
import path from 'path';

import { createDatabase } from './database';
import { registerQueries } from './queries';
import { store } from './store';
import { createThumbnail, getFiles, loadImage } from './util';
import { getWindowHasFrame, window } from './window';

const db = createDatabase(path.join(app.getPath('userData'), 'scrapbook.db'));

export function registerIPC(): void {
  registerQueries(db);

  ipc.handle('getFiles', async (_event, fileOrFolder: string) => {
    return getFiles(fileOrFolder);
  });

  ipc.handle('getHistory', () => store.get('history'));

  ipc.handle('getPreferences', () => store.get('preferences'));

  ipc.handle('loadImage', async (_event, file: string) => {
    const image = await loadImage(file);

    Object.assign(image, await createThumbnail(image.data));

    return image;
  });

  ipc.handle('quit', () => {
    app.quit();
  });

  ipc.handle('setPreferences', (_event, preferences: Partial<Preferences>) => {
    if (preferences.brightness !== undefined) {
      store.set('preferences.brightness', preferences.brightness);
    }

    if (preferences.layout !== undefined) {
      store.set('preferences.layout', preferences.layout);
    }

    if (preferences.zoom !== undefined) {
      store.set('preferences.zoom', preferences.zoom);
    }
  });

  ipc.handle('setWindowState', (_event, state: WindowState) => {
    if (window === null) {
      return false;
    }

    let success = false;

    if (state === 'windowed') {
      window.setFullScreen(false);

      if (getWindowHasFrame()) {
        success = true;
      }
    } else if (state === 'borderless') {
      window.setFullScreen(false);

      if (!getWindowHasFrame()) {
        success = true;
      }
    } else if (state === 'fullscreen') {
      window.setFullScreen(true);
      success = true;
    }

    store.set('preferences.window.state', state);

    return success;
  });

  ipc.handle('toggleFullscreen', () => {
    if (window === null) {
      return false;
    }

    const state = store.get('preferences.window.state') as WindowState;
    let updatedWindowState: WindowState | null = null;

    if (state === 'windowed' || state === 'borderless') {
      window.setFullScreen(true);
      updatedWindowState = 'fullscreen';
    } else if (state === 'fullscreen') {
      window.setFullScreen(false);
      updatedWindowState = getWindowHasFrame() ? 'windowed' : 'borderless';
    }

    store.set('preferences.window.state', updatedWindowState);

    return updatedWindowState;
  });

  ipc.handle('updateHistory', (_event, bookId: string | null) => {
    store.set('history.bookId', bookId);
  });
}

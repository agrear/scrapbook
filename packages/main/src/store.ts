import Store from 'electron-store';

interface Schema {
  history: AppHistory,
  preferences: Preferences
}

const defaults: Schema = {
  history: {
    bookId: null
  },
  preferences: {
    brightness: 1.0,
    layout: {
      fit: 'none',
      position: 'center center'
    },
    window: {
      maximized: false,
      state: 'windowed',
      size: {
        width: 1024,
        height: 800
      }
    },
    zoom: 1.0
  }
};

export const store = new Store<Schema>({
  clearInvalidConfig: true,
  defaults
});

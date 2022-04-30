/**
 * @type {import('electron-builder').Configuration}
 * @see https://www.electron.build/configuration/configuration
 */
const config = {
  appId: 'com.electron.scrapbook',
  productName: 'Scrapbook',
  artifactName: '${name}-${version}-${os}-${arch}-setup.${ext}',
  directories: {
    output: 'dist',
    buildResources: 'buildResources'
  },
  files: [
    'packages/**/dist/**'
  ],
  nsis: {
    oneClick: false,
    perMachine: false,
    createDesktopShortcut: false,
    createStartMenuShortcut: true,
    runAfterFinish: false
  },
  win: {
    target: {
      target: 'nsis',
      arch: 'x64'
    }
  }
};

module.exports = config;

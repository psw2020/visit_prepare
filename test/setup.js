const path = require('path');
const { Application } = require('spectron');

const appPath = () => {
  switch (process.platform) {
    case 'darwin':
      return path.join(__dirname, '..', '.tmp', 'mac', 'VisitPrepare.app', 'Contents', 'MacOS', 'VisitPrepare');
    case 'linux':
      return path.join(__dirname, '..', '.tmp', 'linux', 'VisitPrepare');
    case 'win32':
      return path.join(__dirname, '..', '.tmp', 'win-unpacked', 'VisitPrepare.exe');
    default:
      throw Error(`Unsupported platform ${process.platform}`);
  }
};
global.app = new Application({ path: appPath() });

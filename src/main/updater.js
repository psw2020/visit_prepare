import {autoUpdater} from 'electron-updater';

autoUpdater.logger = require("electron-log")
autoUpdater.logger.transports.file.level = "info"

export const checkForUpdates = ()=>{
 autoUpdater.checkForUpdates();
}
import {autoUpdater} from 'electron-updater';
import path from "path";

autoUpdater.logger = require("electron-log")
autoUpdater.logger.transports.file.resolvePath = () => path.join(process.env.APPDATA, 'VisitPrepare/logs/main.log');
autoUpdater.logger.transports.file.level = "info"

export const checkForUpdates = ()=>{
 autoUpdater.checkForUpdatesAndNotify();
}
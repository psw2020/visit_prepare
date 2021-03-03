import {app, BrowserWindow, screen, Tray, ipcMain} from 'electron';
import path from "path";
import icon from 'trayTemplate.png';

export default class VisitPrepare {
    constructor() {
        this.tray = true;
        this.win = null;
        this.lock = app.requestSingleInstanceLock();
        app.whenReady().then(() => this.createWindow());
            }

    createWindow() {
        if (!this.lock) {
            app.quit();
        } else {
            /*app.on('second-instance', () => { проверка количества окон, блокировка запуска

                app.focus();
                if (win) {
                    win.focus();
                }
            });*/
        }
        const {width, height} = screen.getPrimaryDisplay().workAreaSize;
        this.window = new BrowserWindow({
            width: 800,
            height: 600,
            minWidth: Math.round(width / 3),
            minHeight: Math.round(height / 3),
            maxWidth: width,
            maxHeight: height,
            show: false,
            title: 'Подготовка к визиту',
            titleBarStyle: 'hidden',
            autoHideMenuBar: true,
            backgroundColor: '#2980b9',
            closable: true,
            webPreferences: {
                preload : path.join(app.getAppPath(),'preload','index.js')
            }
        })
        this.window.loadFile('renderer/index.html');
        this.window.webContents.openDevTools({mode: 'detach'});

        this.tray = new Tray(path.resolve(__dirname, icon));
        this.tray.on("double-click", ()=>{
            this.window.isVisible() ? this.window.hide() : this.window.show();
        })

        this.window.on("ready-to-show", () => this.window.show());



        this.window.webContents.on('did-finish-load', () => {

        })

        this.window.on('closed', () => {
            this.window = null;
        })

    }

}
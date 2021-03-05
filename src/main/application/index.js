import {app, BrowserWindow, screen, Tray, ipcMain} from 'electron';
import path from "path";
import icon from 'trayTemplate.png';
import Api from './api';


export default class VisitPrepare {
    constructor() {
        this.tray = true;
        this.win = null;
        this.api = new Api();
        this.subscribeForIPC();
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
            width: 1024,
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
                preload: path.join(app.getAppPath(), 'preload', 'index.js')
            }
        })
        this.window.loadFile('renderer/index.html');
        this.window.webContents.openDevTools({mode: 'detach'});

        this.tray = new Tray(path.resolve(__dirname, icon));
        this.tray.on("double-click", () => {
            this.window.isVisible() ? this.window.hide() : this.window.show();
        })

        this.window.on("ready-to-show", () => this.window.show());


        this.window.webContents.on('did-finish-load', () => {

        })

        this.window.on('closed', () => {
            this.window = null;
        })

    }

    subscribeForIPC() {
        ipcMain.on('getTaskList', () => {
            const from = 0;
            const to = 0;
            this.api.req(`task/getTaskList?from=${from}&to=${to}`)
                .then(res => this.window.webContents.send('taskList', res))
                .catch(() => this.window.webContents.send('getTaskListErr'));
        });

        ipcMain.on('getOrderInfo', async (_, data) => {
            let contact = await this.api.req(`contact/getContact?id=${data.contact}`);
            let client = await this.api.req(`client/getBaseInfo/${data.clid}`);
            let orderList = await this.api.req(`order/getOrderListFromClient?id=${data.clid}`);
            console.log(client);


        })


    }

}
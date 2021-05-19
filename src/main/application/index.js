import {app, BrowserWindow, screen, Tray, ipcMain, Menu} from 'electron';
import path from "path";
import icon from 'tray_16.png';
import Api from './api';
import {DateTime} from 'luxon';
import {adws} from "../../preload/helpers/additionalWorksSetup";

export default class VisitPrepare {
    constructor() {
        this.tray = true;
        this.win = BrowserWindow.getAllWindows().length;
        this.api = new Api();
        this.cache = {};
        this.dateTime = DateTime;
        this.subscribeForIPC();
        this.lock = app.requestSingleInstanceLock();
        app.whenReady().then(() => this.createWindow());
        app.setLoginItemSettings({
            openAtLogin: true
        });
    }

    createWindow() {
        this.createMenu();
        if (!this.lock) {
            app.quit();
        } else {
            app.on('second-instance', () => {

                app.focus();
                if (this.window) {
                    this.window.show();
                    this.window.focus();
                }
            });
        }


        const {width, height} = screen.getPrimaryDisplay().workAreaSize;
        this.window = new BrowserWindow({
            width: 1024,
            height: 800,
            minWidth: Math.round(width / 3),
            minHeight: Math.round(height / 3),
            maxWidth: width,
            maxHeight: height,
            skipTaskbar: true,
            show: false,
            closable: false,
            title: 'Подготовка к визиту',
            titleBarStyle: 'hidden',
            autoHideMenuBar: true,
            backgroundColor: '#2980b9',
            webPreferences: {
                preload: path.join(app.getAppPath(), 'preload', 'index.js')
            }
        })
        this.window.loadFile('renderer/index.html');
        this.window.webContents.openDevTools({mode: 'detach'});

        this.tray = new Tray(path.resolve(__dirname, icon));
        this.tray.setToolTip('Подготовка к визиту');
        this.tray.on("double-click", () => {
            this.window.isVisible() ? this.window.hide() : this.window.show();
        })
        const sendExit = () => {
            this.window.webContents.send('showExitPass');
        }

        this.tray.setContextMenu(Menu.buildFromTemplate([
                {
                    label: 'Выход',
                    click() {
                        sendExit();
                    }
                }
            ]
        ))

        this.window.on("ready-to-show", () => this.window.show());


        this.window.webContents.on('did-finish-load', () => {

        })

        this.window.on('closed', () => {
            this.window = null;
        })

        this.window.on('minimize', () => {
            this.window.hide();
        })

    }

    clearCache() { //Очистка кеша
        this.cache = {};
    }

    async createMenu() { //Создание главного меню
        const refresh = () => {
            this.getTaskList();
        }
        const cache = () => this.clearCache();
        const handler = (data) => {
            this.window.webContents.send('adwSetupInterfaceLoaded', {data})
        }
        const adw = await adws.createMenuObj(handler);

        const mainMenu = [
            {
                label: 'Обновить список задач',
                click() {
                    refresh();
                }
            },
            {
                label: 'Обновить основную информацию о клиенте',
                click() {
                    cache();
                    refresh();
                }
            },
            {
                label: 'Изменить дополнительные работы',
                submenu: adw
            }
        ]
        const menu = new Menu.buildFromTemplate(mainMenu);
        Menu.setApplicationMenu(menu);

    }

    getTaskList() { //Запрос списка заданий
        const from = 0;
        const to = 1;
        this.api.get(`task/taskList?from=${from}&to=${to}`)
            .then(res => this.window.webContents.send('taskList', res))
            .catch(() => this.window.webContents.send('getTaskListErr'));
    }

    async getOrderInfo(data) {
        const obj = await this.createOrderObj(data);
        this.window.webContents.send('getOrderInfo', obj);
    }

    subscribeForIPC() { //Подписка на сообщения с рендер процесса

        ipcMain.on('getEmployeeList', () => { //Список исполнителей
            this.api.get(`employee/employeeList`)
                .then(res => {
                    this.window.webContents.send('employeeList', res);
                    this.window.autoHideMenuBar = false;
                    this.window.menuBarVisible = true;
                })
                .catch(() => this.window.webContents.send('getEmployeeListErr'));
        })

        ipcMain.on('getTaskList', () => { //Спискок заданий
            this.getTaskList();
        });

        ipcMain.on('getOrderInfo', (_, data) => { //Формирования объекта подробностей задания
            this.getOrderInfo(data);
        });

        ipcMain.on('saveOrder', async (_, data) => { //сохранить или оформить задание
            await this.saveOrder(data);
        })

        ipcMain.on('showWindow', () => {
            this.window.show();
            this.window.focus();
        })

        ipcMain.on('fullScreenAndMaximizable', (_, data) => { //развернуть и отобразить поверх всех окон на data.second секунд
            this.window.maximize();
            this.window.setMinimizable(false);
            this.window.setAlwaysOnTop(true);
            this.window.setMaximizable(false);
            setTimeout(() => {
                this.window.unmaximize();
                this.window.setMaximizable(true);
                this.window.setMinimizable(true);
                this.window.setAlwaysOnTop(false);
            }, data.second * 1000)
        })

        ipcMain.on('exitCode', (_, data) => {
            if (+data.code !== 1426212) {
                this.window.webContents.send('badExitCode');
            } else {
                app.exit();
            }
        })

    }

    async saveOrder(data) { //сохранить задание
        let obj = {};
        const {...docInfo} = data.docInfo;
        const err = () => {
            this.window.webContents.send('saveOrderError');
        }

        try {
            if (data.confirm) {
                await this.api.put(`task/updateTaskMark?docpl=${docInfo.docplid}&mark=11`);
                obj.ok = true;
            }

            for (let v of data.workListCheck) {
                await this.api.put(`employee/setEmployeeOnWork?workid=${v.workId}&employee=${v.employee}&ready=${v.ready}`);
            }

            for (let v in data.additionalWorks) {
                const {...o} = data.additionalWorks[v];
                await this.api.delete(`order/orderDeleteWork`, {
                    docOutId: docInfo.docid,
                    code: 'fvp' + o.id
                });
                await this.api.post(`order/orderInsertWork`, {
                    docOutId: docInfo.docid,
                    name: o.name,
                    code: 'fvp' + o.id,
                    time: o.time,
                    price: o.price
                });
            }

        } catch (e) {
            err();
            return;
        }

        if (!data.confirm) { //если задание просто сохраняется, а не оформляется
            await this.getOrderInfo(docInfo);
        }

        this.window.webContents.send('saveOrderComplete', obj);
    }

    async createOrderObj(data) { //Создание объекта полного заказа
        try {
            let obj;
            const orderList = await this.api.get(`order/orderListFromClient?id=${data.clid}`);
            const orderWorkList = await this.api.get(`order/orderWorkList?id=${data.docid}`);
            const orderBaseInfo = (await this.api.get(`order/orderBaseInfo?id=${data.docid}`))[0];
            if (this.cache.hasOwnProperty(data.docplid)) {
                obj = this.cache[data.docplid];
                obj.orderWorkList = orderWorkList;
                obj.orderBaseInfo = orderBaseInfo;
            } else {
                obj = {
                    contact: (await this.api.get(`contact/contact?id=${data.contact}`))[0],
                    client: (await this.api.get(`client/baseInfo?id=${data.clid}`))[0],
                    orderWorkList,
                    orderBaseInfo,
                    paymentSum: (await this.api.get(`client/paymentSum?id=${data.clid}`))[0]['VAL'],
                    ownPartPercent: (await this.api.get(`client/ownPartsPercent?id=${data.clid}`))['VAL'],
                    bonusBalance: (await this.api.get(`client/bonusBalance?id=${data.clid}`))[0]['val'],
                    bonusFirstBurnDate: (await this.api.get(`client/bonusFirstBurnDate?id=${data.clid}`))[0],
                    firstVisit: (orderList.length) ? this.dateTime.fromISO(orderList[orderList.length - 1]['DATETIME']).toFormat('dd.LL.yyyy') : '---',
                    docPlan: data.docplid

                }

            }
            obj.middleCheck = (obj.paymentSum) ? Math.round(obj.paymentSum / orderList.length) : 0;
            this.cache[data.docplid] = obj;
            return obj;
        } catch (e) {
            console.log(e);
        }
    }


}
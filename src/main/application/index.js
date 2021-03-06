import {app, BrowserWindow, screen, Tray, ipcMain, Menu} from 'electron';
import path from "path";
import icon from 'trayTemplate.png';
import Api from './api';
import {DateTime} from 'luxon';

export default class VisitPrepare {
    constructor() {
        this.tray = true;
        this.win = null;
        this.api = new Api();
        this.cache = {};
        this.dateTime = DateTime;
        this.subscribeForIPC();
        this.lock = app.requestSingleInstanceLock();
        app.whenReady().then(() => this.createWindow());
    }

    createWindow() {
        this.createMenu();
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
            autoHideMenuBar: false,
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

    clearCache() { //Очистка кеша
        this.cache = {};
    }

    createMenu() { //Создание главного меню
        const refresh = () => {
            this.getTaskList();
        }
        const cache = () => this.clearCache();

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
        ]
        const menu = new Menu.buildFromTemplate(mainMenu);
        Menu.setApplicationMenu(menu);
    }

    getTaskList() { //Запрос списка заданий
        const from = 0;
        const to = 0;
        this.api.get(`task/taskList?from=${from}&to=${to}`)
            .then(res => this.window.webContents.send('taskList', res))
            .catch(() => this.window.webContents.send('getTaskListErr'));
    }

    subscribeForIPC() { //Подписка на сообщения с рендер процесса

        ipcMain.on('getEmployeeList', () => { //Список исполнителей
            this.api.get(`employee/employeeList`)
                .then(res => this.window.webContents.send('employeeList', res))
                .catch(() => this.window.webContents.send('getEmployeeListErr'));
        })


        ipcMain.on('getTaskList', () => { //Спискок заданий
            this.getTaskList();
        });

        ipcMain.on('getOrderInfo', async (_, data) => { //Формирования объекта подробностей задания
            const obj = await this.createOrderObj(data);
            this.window.webContents.send('getOrderInfo', obj);
        });

        ipcMain.on('saveOrder', async (_, data) => {
            await this.saveOrder(data);
        })

    }

    async saveOrder(data) {
        console.log(data);
        const err = () => {
            this.window.webContents.send('saveOrderError');
        }

        try {

            if (data.confirm) {
                await this.api.put(`task/updateTaskMark?docpl=${data.docPlan}&mark=11`);
            }

            await this.api.put(`order/updateRequiredRecommendation`, {docreg: data.docRegId, str: data.recommendation});

            for (let v of data.workListCheck) {
                await this.api.put(`employee/setEmployeeOnWork?workid=${v.workId}&employee=${v.employee}&ready=${v.ready}`);
            }
        } catch (e) {
            err();
            return;
        }

        this.window.webContents.send('saveOrderComplete');
    }

    async createOrderObj(data) { //Создание объекта полного заказа
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
                firstVisit: this.dateTime.fromISO(orderList[orderList.length - 1]['DATETIME']).toFormat('dd.LL.yyyy'),
                docPlan: data.docplid
            }
        }
        obj.middleCheck = Math.round(obj.paymentSum / orderList.length);
        this.cache[data.docplid] = obj;
        return obj;
    }


}
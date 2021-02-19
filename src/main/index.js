import path from 'path';
import {app, BrowserWindow, screen, Menu, Tray} from 'electron';
import {menuTemplate} from '../menu/index';
import icon from 'trayTemplate.png';
const lock = app.requestSingleInstanceLock();
let tray ='';

if (!lock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        app.focus();
        if (win) {
            win.focus();
        }
    });
}

const ctxMenu = new Menu.buildFromTemplate(menuTemplate.ctx);

const createMenu = () => {
    const menu = new Menu.buildFromTemplate(menuTemplate.main);
    Menu.setApplicationMenu(menu);
}

const createWindow = () => {
    const {width, height} = screen.getPrimaryDisplay().workAreaSize;
    const window = new BrowserWindow({
        width: 800,
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
        closable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    window.loadFile('renderer/index.html');
    window.on("ready-to-show", () => window.show());
    window.webContents.on("context-menu", (event, params) => {
        ctxMenu.popup(window, params.x, params.y);
    })
    const trayMenu = Menu.buildFromTemplate([
        {label:'point1'},
        {label:'point2'},
        {label:'point3'}
    ])
    tray = new Tray(path.resolve(__dirname, icon));
    tray.setToolTip('app2');
    tray.setContextMenu(trayMenu);
    tray.on("double-click", ()=>{
    window.isVisible() ? window.hide() : window.show();
    })
    // window.webContents.openDevTools();
}

app.on('ready', () => {
    createMenu();
    createWindow();
});
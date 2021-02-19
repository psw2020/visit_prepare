import {app, BrowserWindow, screen, Menu, MenuItem} from 'electron';

import {menuTemplate} from '../menu/index';
const lock = app.requestSingleInstanceLock();

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

const createWindow = options => {
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
        webPreferences: {
            nodeIntegration: true
        }
    });
    window.loadFile('renderer/index.html');
    window.on("ready-to-show", () => window.show());
    window.webContents.on("context-menu", (event, params) => {
        ctxMenu.popup(window, params.x, params.y);
    })
    // window.webContents.openDevTools();
}

app.on('ready', () => {
    createMenu();
    createWindow();

});
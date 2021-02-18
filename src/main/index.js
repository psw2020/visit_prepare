import {app} from 'electron';

const lock = app.requestSingleInstanceLock();

if (!lock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        app.focus();
        if (win) {
            win.focus();
        }
    })
}

app.whenReady().then(() => {
    app.showAboutPanel();
});


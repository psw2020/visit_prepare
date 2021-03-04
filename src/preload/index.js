import {ipcRenderer, shell} from 'electron';
import {DateTime} from 'luxon';

window.openURL = url => {
    shell.openExternal(url);
}

window.getTaskList = () => {
    ipcRenderer.send('getTaskList');
}


window.onload = () => {

}

ipcRenderer.on('taskList', (_, data) => {
    window.createTaskList(clearObj(data));
});

function clearObj(arr) {
    let a = [];
    arr.forEach(v => {
        let {DATE_START: date, DOCUMENT_OUT_HEADER_ID: doh, MARK: mark, MODEL: model, REGNO: regno} = v;
        let dateFormat = DateTime.fromISO(date).toFormat('dd.LL HH:mm');
        a.push({date: dateFormat, doh, mark, model, regno});
    });
    return a;
}
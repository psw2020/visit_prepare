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

ipcRenderer.on('getTaskListErr', (_, data) => {
    window.getTaskListErr();
});

function clearObj(arr) {
    let a = [];
    arr.forEach(v => {
        let {DATE_START: date, DOCUMENT_OUT_HEADER_ID: doh, MARK: mark, MODEL: model, REGNO: regno, CLIENT_ID:clid, CLIENT_CONTACT_ID:contact} = v;
        let dateFormat = DateTime.fromISO(date).toFormat('dd.LL HH:mm');
        a.push({date: dateFormat, doh, mark, model, regno, clid, contact});
    });
    return a;
}

window.getOrderInfo = (doh, clid, contact)=> {
    ipcRenderer.send('getOrderInfo',{doh,clid,contact});
}
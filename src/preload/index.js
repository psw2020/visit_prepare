import {ipcRenderer} from 'electron';
import {orderHelpers} from './helpers/order';
import {taskListHelpers} from './helpers/tasklist';
import {addWorks} from "./helpers/additionalWorkList";


/*Список заданий*/
window.getTaskList = () => { //Запрос списка задач с сервера
    ipcRenderer.send('getTaskList');
}

ipcRenderer.on('taskList', (_, data) => { //Построение списка из ответа сервера
    if (!data) {
        newMessage('Нет заданий', 'success');
        return;
    }
    cache.hasExploitedTask = false; //сбросить признак просроченного задания в кеше
    appendInTaskList(taskListHelpers.createTaskList(data));
    addEventForTaskList();

    const date = new Date();
    if (date.getHours() > 19) { //Разворачивать приложение на весь экран поверх всех окон, если после 19 часов есть необработанные задания
        ipcRenderer.send('fullScreenAndMaximizable', {second: 20});
        newMessage('Пора обрабатывать задания!!!', 'warning');
    } else if (cache.hasExploitedTask) { //Если появились просроченные задание сделать тоже самое
        ipcRenderer.send('fullScreenAndMaximizable', {second: 20});
        newMessage('Есть просроченные задания!', 'danger');
    }

});

ipcRenderer.on('getTaskListErr', () => { //Если сервер вернул ошибку
    getTaskListErr();
});

/*Список исполнителей*/
window.getEmployeeList = () => { //Запрос списка исполнителей с сервера
    ipcRenderer.send('getEmployeeList');
}

ipcRenderer.on('employeeList', (_, data) => { //Запись исполнителей в кеш, построение списка заданий
    cache.employeeList = data;
    getTaskList();
    setInterval(getTaskList, 10 * 60000);
    setInterval(showByTime, 20 * 60000);
})

ipcRenderer.on('getEmployeeListErr', () => { //Если вернулась ошибка
    newMessage('Ошибка соединения с сервером', 'danger');
    appendInTaskList();
})

/*Заказ наряд*/
window.getOrderInfo = (docid, clid, contact, docplid) => { //Запрос информации по заказу с сервера
    window.loaderShow();
    ipcRenderer.send('getOrderInfo', {docid, clid, contact, docplid});
}

ipcRenderer.on('getOrderInfo', async (_, data) => { //Вывод полной инфы по заказу
    cache.addedAdditionalWorks = {}; //обнулить список выбранных работ в кеше
    cache.additionalWorks = await addWorks.getWorkList(data.orderBaseInfo['NAME'],data.orderBaseInfo['RUN_BEFORE']) || [];
    createFullOrder(orderHelpers.renderFullOrder(data, cache));
    window.addEventForButton();
    window.addEventForAdditionalWorksItem();
})

/*Сохранение*/

window.sendOrderData = (obj) => {
    ipcRenderer.send('saveOrder', obj);
}

ipcRenderer.on('saveOrderError', () => {
    newMessage('Ошибка сохранения', 'danger');
})

ipcRenderer.on('saveOrderComplete', (_, data) => {
    if (data.ok) {
        newMessage('Задание оформлено, выберите следующее', 'success');
        appendInWorkArea();
        window.getTaskList();
    } else {
        newMessage('Успешно сохранено', 'success');
    }
})

/*other*/

const showByTime = () => {
    const hour = new Date().getHours();
    if (!cache.wasShownByTime && hour > 17) {
        ipcRenderer.send('showWindow');
        cache.wasShownByTime = true;
    }
}

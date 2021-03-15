import {ipcRenderer} from 'electron';
import {orderHelpers} from './helpers/order';
import {taskListHelpers} from './helpers/tasklist';


/*Список заданий*/
window.getTaskList = () => { //Запрос списка задач с сервера
    ipcRenderer.send('getTaskList');
}

ipcRenderer.on('taskList', (_, data) => { //Построение списка из ответа сервера
    if (!data) {
        document.getElementById('taskList').innerHTML = `<div class="alert alert-success" role="alert">Нет заданий</div>`;
        return;
    }
    document.getElementById('taskList').innerHTML = taskListHelpers.createTaskList(data);
    document.getElementById('workArea').innerHTML = `<h2>Выберите задание</h2>`;
    window.addEventForTaskList();

});

ipcRenderer.on('getTaskListErr', () => { //Если сервер вернул ошибку
    window.getTaskListErr();
});

/*Список исполнителей*/
window.getEmployeeList = () => { //Запрос списка исполнителей с сервера
    ipcRenderer.send('getEmployeeList');
}

ipcRenderer.on('employeeList', (_, data) => { //Запись исполнителей в кеш, построение списка заданий
    window.cache.employeeList = data;
    window.getTaskList();
})

ipcRenderer.on('getEmployeeListErr', () => { //Если вернулась ошибка
    newMessage('Ошибка соединения с сервером', 'danger');
    document.getElementById('taskList').innerHTML = '';
})

/*Заказ наряд*/
window.getOrderInfo = (docid, clid, contact, docplid) => { //Запрос информации по заказу с сервера
    window.loaderShow();
    ipcRenderer.send('getOrderInfo', {docid, clid, contact, docplid});
}

ipcRenderer.on('getOrderInfo', (_, data) => { //Вывод полной инфы по заказу
    createFullOrder(orderHelpers.renderFullOrder(data, cache.employeeList));
    window.addEventForButton();

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
        document.getElementById('workArea').innerHTML = '';
        window.getTaskList();
    } else {
        newMessage('Успешно сохранено', 'success');
    }
})
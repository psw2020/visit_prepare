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
    window.addEventForTaskList();

});

ipcRenderer.on('getTaskListErr', () => { //Если сервер вернул ошибку
    window.getTaskListErr();
});

/*Список исполнителей*/
window.getEmployeeList = ()=>{ //Запрос списка исполнителей с сервера
    ipcRenderer.send('getEmployeeList');
}

ipcRenderer.on('employeeList',(_,data)=>{ //Запись исполнителей в кеш, построение списка заданий
    window.cache.employeeList = data;
    window.getTaskList();
})

ipcRenderer.on('getEmployeeListErr',()=>{ //Если вернулась ошибка
    alert('getEmployeeListErr');
})

/*Заказ наряд*/
window.getOrderInfo = (docid, clid, contact,docplid)=> { //Запрос информации по заказу с сервера
    window.loaderShow();
    ipcRenderer.send('getOrderInfo',{docid,clid,contact,docplid});
}

ipcRenderer.on('getOrderInfo', (_,data)=>{ //Вывод полной инфы по заказу
    createFullOrder(orderHelpers.renderFullOrder(data, cache.employeeList));

})

/*Сохранение*/

window.setReadyWork = (workId, val, employee)=> {
    console.log(workId, val, employee);
}
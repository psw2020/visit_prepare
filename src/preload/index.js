import {ipcRenderer} from 'electron';
import {orderHelpers} from './helpers/order';
import {taskListHelpers} from './helpers/tasklist';
import {addWorks} from "./helpers/additionalWorkList";
import {adws} from "./helpers/additionalWorksSetup";


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
    cache.additionalWorks = await addWorks.getWorkList(data.orderBaseInfo['NAME'], data.orderBaseInfo['RUN_BEFORE']) || [];
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

/*настройка доп работ*/

ipcRenderer.on('adwSetupInterfaceLoaded', (_, {data}) => { //принимаем объет с html и meta с бэка
    document.getElementById('workArea').hidden = true;
    document.getElementById('taskList').hidden = true;
    appendInAdwSetup(data.html);// вставляем таблицу

    for (let i = 0; i < data.meta.length; i++) {
        document.getElementById(`${data.meta[i]['work_id'] + 'm' + data.meta[i]['mileage']}`).checked = true; //отмечаем в таблице чекбоксы из мета
    }

    document.getElementById('adwSetup').hidden = false; //отображаем таблицу

    document.getElementById('saveAdwTable').addEventListener('click', async (e) => { //обработчик кнопки "Сохранить"
        (e.target).setAttribute('disabled','disabled');
        await saveAdwTable(data.modelId); //сохранение таблицы
    })

    document.getElementById('closeAdwTable').addEventListener('click', () => { //Обработчик кнопки "Закрыть"
        document.getElementById('adwSetup').hidden = true;
        document.getElementById('workArea').hidden = false;
        document.getElementById('taskList').hidden = false;
    })
})

async function saveAdwTable(id) {
    let meta = [];
    const tb = document.getElementsByClassName('adwTable')[0];
    const checked = tb.querySelectorAll('input[type="checkbox"]:checked'); //коллекция отмеченных чекбоксов

    checked.forEach(v => { //создаем новые комбинации перебором коллекции
        meta.push({workId: v.dataset.workid, mileage: v.dataset.mileage});
    })
    await adws.saveMetadata(id, meta);
    document.getElementById('saveAdwTable').removeAttribute('disabled');
    newMessage('Успешно сохранено', 'success');
}

/*other*/

const showByTime = () => {
    const hour = new Date().getHours();
    if (!cache.wasShownByTime && hour > 17) {
        ipcRenderer.send('showWindow');
        cache.wasShownByTime = true;
    }
}

const appendInAdwSetup = str => {
    document.getElementById('adwSetup').innerHTML = str;
}
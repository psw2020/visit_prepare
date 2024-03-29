require('bootstrap.min.css');
require('application.css');

window.cache = { //Кеш
    wasShownByTime: false,
    addedAdditionalWorks: {}
};

window.onload = () => {
    window.getEmployeeList(); //Запрос списка исполнителей
    document.getElementById('exitPass').addEventListener('submit', (e) => {
        e.preventDefault();
        const code = e.target[0].value;
        window.sendExitCode(code);
    })
    document.getElementById('closeExitPass').addEventListener('click', () => {
        document.getElementById('prompt').style.display = 'none';
    })
}

window.createFullOrder = (str) => { //Вставить html в workArea
    document.getElementById('workArea').innerHTML = str;
}

window.getTaskListErr = () => { //Ошибка получения списка заданий
    newMessage('Не удалось загрузить список заданий :(', 'danger');
}

window.newMessage = (str, type = "primary") => { //всплывающее сообщение
    const el = document.getElementById('alert');
    el.innerHTML = `<div class="alert alert-${type} taskListError" role="alert">${str}</div>`;
    setTimeout(() => {
        el.children[0].classList.add('hide');
        setTimeout(() => {
            el.innerHTML = '';
        }, 500);
    }, 2000);
}

window.loaderShow = () => {
    document.getElementById('workArea').innerHTML = `<div class="loader">
<div class="spinner-border" style="width: 3rem; height: 3rem;" role="status"></div>
</div>`;
}

window.addEventForButton = () => { //обработчики для кнопок сохранить / оформить
    document.getElementById('save').addEventListener('click', () => window.saveOrder());
    document.getElementById('confirm').addEventListener('click', () => window.saveOrder(1));
}

window.addEventForAdditionalWorksItem = () => { //обработчики для элементов списка дополнительных работ (добавить / удалить и пр.)
    const el = document.getElementsByClassName('additionalWorksItem');
    const addUl = document.getElementById('addUl');
    for (let i = 0; i < el.length; i++) {
        el[i].addEventListener('click', () => {
            const id = el[i].dataset.id;
            const time = el[i].dataset.time;
            const price = el[i].dataset.price;
            const name = el[i].textContent;
            cache.addedAdditionalWorks[id] = {id, time, price, name}; /* пишем в кеш выбранную работу */

            const li = document.createElement('li'); //создаем элемент списка выбранных работ
            li.innerHTML = `${name} <span id="${id}">X</span>`;
            addUl.append(li);
            el[i].hidden = true; //скрываем работу из списка выбора

            const span = li.children[0];
            span.addEventListener('click', () => {
                delete cache.addedAdditionalWorks[span.id]; //удалить выбранную работу из кеша
                el[i].hidden = false; //отобразить ранее скрытую работу в списке выбора
                li.remove(); //удалить элемент из списка выбранных работ
            })
        })
    }
}

window.addEventForTaskList = () => { //обработчики элементов списка заданий
    let items = document.querySelectorAll('.taskListItem');

    items.forEach(v => {
            if (+v.dataset.docid && +v.dataset.clid) {
                cache.currentOrderInfo = {...v.dataset}; //записать в кеш инфу по текущему заказ наряду для его обновления после сохранения
                v.addEventListener('click', () => getOrderInfo(v.dataset.docid, v.dataset.clid, v.dataset.contact, v.dataset.docplid, v.dataset.leavesNight));
            } else if (!+v.dataset.clid) {
                v.addEventListener('click', () => newMessage('Заданию не назначен клиент', 'warning'));
            } else {
                v.addEventListener('click', () => newMessage('К заданию не привязан заказ наряд', 'warning'));
            }
        }
    )
}

window.saveOrder = (confirm = null) => { //сохранение или оформление заказ наряда
    let obj = {}
    if (confirm) { //если "оформление"
        if (checkWorkList()) {
            obj.confirm = true;
        } else {
            return;
        }
    } else {
        obj.confirm = false;
    }

    obj.workListCheck = createWorkListCheckArr(); //создание списка работ для сохранения
    obj.docInfo = cache.currentOrderInfo; //основные id документа
    obj.additionalWorks = cache.addedAdditionalWorks; //дополнительные работы
    obj.leavesNight = document.getElementById('leavesNight').checked;
    cache.currentOrderInfo['leave_night'] = obj.leavesNight;
    window.sendOrderData(obj);
}


function checkWorkList() { //проверка списка работ
    const workReadyList = document.getElementsByClassName('workCheck');
    const employeeList = document.getElementsByClassName('employeeSelect');

    if (workReadyList.length === 0) {
        newMessage('В заказ наряде отсутствуют работы!', 'danger');
        return false;
    }

    for (let i = 0; i < workReadyList.length; i++) {
        let check = workReadyList[i].checked;
        let employee = employeeList[i].value;

        if (!check) {
            newMessage('Подтвердите возможность выполнения всех работ!', 'warning');
            return false;
        } else if (isNaN(employee)) {
            newMessage('Назначьте исполнителей на все работы!', 'warning');
            return false
        }
    }

    if (Object.keys(cache.addedAdditionalWorks).length) { //если в заказ были добавлены дополнительные работы и была нажата кнопка "оформить" без сохранения и назначения исполнителя
        newMessage('В заказ добавлены дополнительные работы, сохраните наряд и назначьте исполнителей!', 'warning');
        return false
    }

    return true;
}

function createWorkListCheckArr() { //создает массив списка работ
    let arr = [];
    const workReadyList = document.getElementsByClassName('workCheck');
    const employeeList = document.getElementsByClassName('employeeSelect');

    for (let i = 0; i < workReadyList.length; i++) {
        arr.push({
            workId: workReadyList[i].dataset.swid,
            ready: +workReadyList[i].checked,
            employee: employeeList[i].value
        });
    }
    return arr;
}

window.appendInTaskList = (str = '') => {
    document.getElementById('taskList').innerHTML = str;
}

window.appendInWorkArea = (str = '') => {
    document.getElementById('workArea').innerHTML = str;
}

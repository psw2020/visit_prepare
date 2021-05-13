require('bootstrap.min.css');
require('application.css');

window.cache = {
    wasShownByTime: false,
    addedAdditionalWorks: {}
}; //Кеш

window.onload = () => {
    window.getEmployeeList(); //Запрос списка исполнителей
}

window.createFullOrder = (str) => { //Вставить html в workArea
    document.getElementById('workArea').innerHTML = str;
}

window.getTaskListErr = () => { //Ошибка получения списка заданий
    newMessage('Не удалось загрузить список заданий :(', 'danger');
}

window.newMessage = (str, type = "primary") => {
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

window.addEventForButton = () => {
    document.getElementById('save').addEventListener('click', () => window.saveOrder());
    document.getElementById('confirm').addEventListener('click', () => window.saveOrder(1));
}

window.addEventForAdditionalWorksItem = () => {
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

window.addEventForTaskList = () => {
    let items = document.querySelectorAll('.taskListItem');

    items.forEach(v => {
            if (+v.dataset.docid && +v.dataset.clid) {
                cache.currentOrderInfo = {...v.dataset}; //записать в кеш инфу по текущему заказ наряду для обновления после сохранения
                v.addEventListener('click', () => getOrderInfo(v.dataset.docid, v.dataset.clid, v.dataset.contact, v.dataset.docplid));
            } else if (!+v.dataset.clid) {
                v.addEventListener('click', () => newMessage('Заданию не назначен клиент', 'warning'));
            } else {
                v.addEventListener('click', () => newMessage('К заданию не привязан заказ наряд', 'warning'));
            }
        }
    )
}

window.saveOrder = (confirm = null) => {
    let obj = {}
    if (confirm) {
        if (checkWorkList()) {
            obj.confirm = true;
        } else {
            return;
        }
    } else {
        obj.confirm = false;
    }

    obj.workListCheck = createWorkListCheckArr();
    obj.docInfo = cache.currentOrderInfo;
    obj.additionalWorks = cache.addedAdditionalWorks;
    window.sendOrderData(obj);
}


function checkWorkList() {
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

    if(Object.keys(cache.addedAdditionalWorks).length){
        newMessage('В заказ добавлены дополнительные работы, сохраните наряд и назначьте исполнителей!', 'warning');
        return false
    }

    return true;
}

function createWorkListCheckArr() {
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
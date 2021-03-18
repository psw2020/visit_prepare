require('bootstrap.min.css');
require('application.css');

window.cache = {}; //Кеш

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

window.addEventForTaskList = () => {
    let items = document.querySelectorAll('.taskListItem');

    items.forEach(v => {
            if (+v.dataset.docid && +v.dataset.clid) {
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
    obj.docRegId = document.getElementById('recommendation').dataset.docregisid;
    obj.docPlan = document.getElementsByClassName('buttons')[0].dataset.docplan;
    obj.recommendation = document.getElementById('recommendation').value;
    window.sendOrderData(obj);
}


function checkWorkList() {
    const workReadyList = document.getElementsByClassName('workCheck');
    const employeeList = document.getElementsByClassName('employeeSelect');
    const recommendation = document.getElementById('recommendation').value;

    for (let i = 0; i < workReadyList.length; i++) {
        let check = workReadyList[i].checked;
        let employee = employeeList[i].value;

        if (!check) {
            newMessage('Подтвердите возможноость выполнения всех работ!', 'warning');
            return false;
        } else if (isNaN(employee)) {
            newMessage('Назначьте исполнителей на все работы!', 'warning');
            return false
        }
    }

    if (!recommendation) {
        newMessage('Впишите обязательную рекомендацию для клиента!', 'warning');
        return false;
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

window.appendInTaskList= (str='')=>{
    document.getElementById('taskList').innerHTML = str;
}

window.appendInWorkArea= (str='')=>{
    document.getElementById('workArea').innerHTML = str;
}
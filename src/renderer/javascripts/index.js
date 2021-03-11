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
    newMessage('Не удалось загрузить список заданий :(','danger');
}

window.newMessage = (str, type="primary") => {
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

window.addEventForPartItem = () => {
    for (let v of document.getElementsByClassName('workCheck')) {
        v.addEventListener('click', () => window.setReadyWork(v.dataset.swid, v.att, v.dataset.employee))
    }
}

window.addEventForTaskList = () => {
    let items = document.querySelectorAll('.taskListItem');

    items.forEach(v => {
            if (+v.dataset.docid) {
                v.addEventListener('click', () => getOrderInfo(v.dataset.docid, v.dataset.clid, v.dataset.contact, v.dataset.docplid));
            } else {
                v.addEventListener('click', () => newMessage('К заданию не привязан заказ наряд','warning'));
            }
        }
    )
}

window.save = ()=>{
    let obj = {};
    for (let v of document.getElementsByClassName('workCheck')) {
        obj[v.dataset.swid] = {};
        obj[v.dataset.swid]['ready'] = +v.checked;
    }
    for(let v of document.getElementsByClassName('employeeSelect')){
        obj[v.dataset.swid]['employee'] = v.value;
    }
    return obj;
}
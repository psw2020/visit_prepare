require('bootstrap.min.css');
require('application.css');

window.cache = {};

window.onload = () => {
    window.getEmployeeList();
}

window.createTaskList = (arr) => {
    let str = '';

    if (!arr) {
        document.getElementsByClassName('taskList')[0].innerHTML = `<div class="alert alert-success" role="alert">Нет заданий</div>`;
        return;
    }

    arr.forEach(v => {
        str += `
          <div class="taskListItem" data-docid="${v.docid}" data-clid="${v.clid}" data-contact="${v.contact}" data-docplid="${v.docplid}">
            <p class="date">${v.date}</p>
            <p class="model">${v.mark} ${v.model}</p>
            <p class="gosnumber">${v.regno}</p>
        </div>
  `;
    });

    document.getElementById('taskList').innerHTML = str;
    let items = document.querySelectorAll('.taskListItem');

    items.forEach(v => v.addEventListener('click', () => {
        getOrderInfo(v.dataset.docid, v.dataset.clid, v.dataset.contact, v.dataset.docplid);
    }))

}

window.createFullOrder = (str) =>{
    document.getElementById('workArea').innerHTML = str;
}

window.getTaskListErr = () => {
    document.getElementsByClassName('taskList')[0].innerHTML = `
<div class="alert alert-danger taskListError" role="alert">Не удалось загрузить список заданий :(</div>`;
}
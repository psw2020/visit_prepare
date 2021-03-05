require('bootstrap.min.css');
require('application.css');

window.onload = () => {
    window.getTaskList();
}

window.createTaskList = (arr) => {
    let str = '';

    if (!arr) {
        document.getElementsByClassName('taskList')[0].innerHTML = `<div class="alert alert-success" role="alert">Нет заданий</div>`;
        return;
    }

    arr.forEach(v => {
        str += `
          <div class="taskListItem" data-doh="${v.doh}" data-clid="${v.clid}" data-contact="${v.contact}">
            <p class="date">${v.date}</p>
            <p class="model">${v.mark} ${v.model}</p>
            <p class="gosnumber">${v.regno}</p>
        </div>
  `;
    });

    document.getElementsByClassName('taskList')[0].innerHTML = str;
    let items = document.querySelectorAll('.taskListItem');

    items.forEach(v => v.addEventListener('click', () => {
        getOrderInfo(v.dataset.doh, v.dataset.clid, v.dataset.contact);
    }))

}

window.getTaskListErr = () => {
    document.getElementsByClassName('taskList')[0].innerHTML = `
<div class="alert alert-danger taskListError" role="alert">Не удалось загрузить список заданий :(</div>`;
}
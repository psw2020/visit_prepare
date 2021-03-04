require('bootstrap.min.css');
require('application.css');

window.onload = () => {
    window.getTaskList();
}

window.createTaskList = (arr) => {
    let str = '';

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
        loadBaseInfo(v.dataset.doh, v.dataset.clid, v.dataset.contact);
    }))

}


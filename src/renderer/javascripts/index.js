require('bootstrap.min.css');
require('application.css');

window.onload = () => {
    window.getTaskList();
}

window.createTaskList = (arr) => {
    let str = '';
    arr.forEach(v => {
        str += `
          <div class="taskListItem">
            <p class="date">${v.date}</p>
            <p class="model">${v.mark} ${v.model}</p>
            <p class="gosnumber">${v.regno}</p>
        </div>
  `;
        document.getElementsByClassName('taskList')[0].innerHTML = str;
    });
}
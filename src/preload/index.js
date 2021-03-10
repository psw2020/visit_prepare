import {ipcRenderer} from 'electron';
import {orderHelpers} from './helpers/order';


/*Список заданий*/
window.getTaskList = () => {
    ipcRenderer.send('getTaskList');
}

ipcRenderer.on('taskList', (_, data) => {
    window.createTaskList(orderHelpers.taskListObjClear(data));
});

ipcRenderer.on('getTaskListErr', () => {
    window.getTaskListErr();
});

/*Список исполнителей*/
window.getEmployeeList = ()=>{
    ipcRenderer.send('getEmployeeList');
}

ipcRenderer.on('employeeList',(_,data)=>{
    window.cache.employeeList = data;
    window.getTaskList();
})

ipcRenderer.on('getEmployeeListErr',()=>{
    alert('getEmployeeListErr');
})

//Заказ наряд
window.getOrderInfo = (docid, clid, contact,docplid)=> {
    ipcRenderer.send('getOrderInfo',{docid,clid,contact,docplid});
}

ipcRenderer.on('getOrderInfo', (_,data)=>{
    //console.log(data);
    createFullOrder(orderHelpers.renderFullOrder(data, cache.employeeList));
})

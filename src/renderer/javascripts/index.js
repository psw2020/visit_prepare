require('application.css');
import {ipcRenderer,remote} from 'electron';
const {app} = remote;
ipcRenderer.on('mainchannel', (_, data) => {
    console.log(data.message);
})

const loadAndDisplayData = () => {
    loadData().then(res => {
        document.getElementById('message').innerHTML = res.number;
    })
}

const loadData = () => {
    return new Promise((resolve)=>{
        ipcRenderer.send('data', {message: 'loaddata'});
        ipcRenderer.once('data', (_, data) => {
            resolve(data);
        })
    })
}


window.onload = () => {
    const act = document.getElementById('but1');
    const act2 = document.getElementById('but2');
    act.addEventListener("click", loadAndDisplayData);
    act2.addEventListener("click", ()=>{
       // dialog.showErrorBox('Error','ti mena nazivala');
       // dialog.showMessageBox({title:'ffff',message:'ti mena nazivala'});
        //let win = new BrowserWindow({width:500,height:600});
        app.quit();
    });

}
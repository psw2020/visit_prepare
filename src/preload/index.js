import {ipcRenderer, shell} from 'electron';

window.openURL = url => {
    shell.openExternal(url);
}

window.onload = () => {

}
import {ipcRenderer, shell} from 'electron';

window.openURL = url => {
    shell.openExternal(url);
}

window.onload = () => {
    const button = document.getElementById('but1');
    button.addEventListener('click', () => openURL('https://renault-remont.ru'));
}
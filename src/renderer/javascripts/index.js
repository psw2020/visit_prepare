require('application.css');

window.onload = () => {
    window.addEventListener('online', () => {
        document.getElementById('online').innerHTML = 'app online';
        document.getElementById('offline').innerHTML = null;
    });
    window.addEventListener('offline', () => {
        document.getElementById('offline').innerHTML = 'app offline';
        document.getElementById('online').innerHTML = null;
    });
}
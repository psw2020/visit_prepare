require('application.css');

window.onload = () => {
    window.addEventListener('online', () => {
    const alert = new Notification('Title',{
        body: 'MEssage body online',
        silent: true
    })
    });
    window.addEventListener('offline', () => {
        const alert = new Notification('Title',{
            body: 'MEssage body offline',
            silent: true
        })
    });
}
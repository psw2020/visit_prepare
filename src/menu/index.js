const menuTemplate = {
    main: [
        {
            label: 'Обновить список задач',
            click() {
                console.log(222);
            }
        },
        {
            label: 'Очистить кеш', click() {
                console.log(444)
            }
        },
    ],
    ctx: [
        {label:'Refresh'},
        {label:'Nothing'}
    ]
}

export {menuTemplate};
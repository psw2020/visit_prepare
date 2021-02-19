import {Menu} from "electron";

const menuTemplate = {
    main: [
        {
            label: 'main',
            submenu: Menu.buildFromTemplate([
                {
                    label: 'sub1',
                    submenu: Menu.buildFromTemplate([
                        {role: 'about'},
                        {label: 'sub2'},
                        {label: 'sub3'},
                    ])
                },
                {label: 'sub2'},
                {label: 'sub3'},
            ]),
            click() {
                console.log(222);
            }
        },
        {
            label: 'main2', click() {
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
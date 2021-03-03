require('bootstrap.min.css');
require('application.css');


window.onload = () => {
    let user = {login: 'visitPrepare', password: 'PPS4BHTcId'};

    async function auth(user) {
        let res = await fetch('http://127.0.0.1:3010/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        return await res.json();
    }


    async function getClientBaseInfo(clid) {
        let token = '';

        await auth(user).then(res => {
            token = res.accessToken
        });

        let res = await fetch('http://127.0.0.1:3010/client/getBaseInfo/' + clid, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            }
        });

        return await res.json();
    }

    getClientBaseInfo(299).then(res => console.log(res))
}


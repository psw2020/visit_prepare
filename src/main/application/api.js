import fetch from 'cross-fetch';

export default class Api{
    constructor() {
        this.user = {login: 'visitPrepare', password: 'PPS4BHTcId'};
        this.apiHost = 'http://127.0.0.1:3010/';
        this.token = '';
    }

    async auth() {
        let res = await fetch(this.apiHost + 'signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(this.user)
        });
        if (res.ok) {
            return await res.json();
        } else {
            throw('auth error');
        }
    }

    async getClientBaseInfo(id) {
        await this.auth(this.user).then(res => {
            this.token = res.accessToken
        });

        let res = await fetch(this.apiHost + 'client/getBaseInfo/' + id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
            }
        });

        return await res.json();
    }

    async getTaskList(from, to) {
        await this.auth(this.user).then(res => {
            this.token = res.accessToken
        });

        let res = await fetch(this.apiHost + `task/getTaskList?from=${from}&to=${to}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
            }
        });

        return await res.json();
    }
}
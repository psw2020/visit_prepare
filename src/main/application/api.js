import fetch from 'cross-fetch';
import user from '../../../private/api';

export default class Api{
    constructor() {
        this.user = user;
        this.apiHost = 'http://172.16.1.20:3010/';
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

    async get(url) {
        await this.auth(this.user).then(res => {
            this.token = res.accessToken
        });

        let res = await fetch(this.apiHost + url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
            }
        });

        if (res.ok) {
            return await res.json();
        } else {
            throw(`request error ${res.status}`);
        }
    }

    async put(url, body ={}) {
        await this.auth(this.user).then(res => {
            this.token = res.accessToken
        });

        let res = await fetch(this.apiHost + url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.token
            },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            return await res.json();
        } else {
            throw(`request error ${res.status}`);
        }
    }
}
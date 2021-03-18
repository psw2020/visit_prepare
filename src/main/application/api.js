import fetch from 'cross-fetch';
import user from '../../../private/api';

export default class Api {
    constructor() {
        this.user = user;
        this.localhost = 'http://127.0.0.1:3010/';
        this.deployhost = 'http://172.16.1.20:3010/';
        this.apiHost = this.deployhost;
        this.token = null;
        this.refresh = null;
    }

    async getToken() {
        if (!this.token) {
            await this.auth();
        }
        return this.token;
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
            const auth = await res.json();
            this.token = auth["accessToken"];
            this.refresh = auth["refreshToken"];
        } else {
            throw('auth error');
        }
    }

    async get(url, retry = false) {
        let res = await fetch(this.apiHost + url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': await this.getToken()
            }
        });
        if (res.status === 401 && !retry) {
            console.log(401);
            await this.auth();
            return await this.get(url, true);
        }
        if (res.ok) {
            return await res.json();
        } else {
            throw(`"${url}" request error ${res.status}`);
        }
    }

    async put(url, body = {}, retry = false) {
        let res = await fetch(this.apiHost + url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': await this.getToken()
            },
            body: JSON.stringify(body)
        });
        if (res.status === 401 && !retry) {
            console.log(401);
            await this.auth();
            return await this.put(url, body, true);
        }
        if (res.ok) {
            return await res.json();
        } else {
            throw(`"${url}" request error ${res.status}`);
        }
    }
}
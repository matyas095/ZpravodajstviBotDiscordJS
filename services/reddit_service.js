// Imports
const axios = require("axios");

// Modules
const config = require("../config/config.js");

// Class
class RedditService {
    constructor() {
        this.init();
    };

    async init() {
        this.access_token = await this.refreshAccessToken();
    };

    async refreshAccessToken() {
        const data = {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(config.REDDIT_CLIENT_ID + ":" + config.REDDIT_PASSWORD).toString("base64")}`
            },
            body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: config.REDDIT_REFRESH_TOKEN
            })
        };

        const res = await fetch("https://www.reddit.com/api/v1/access_token", data).catch(er => console.error(er));
        return (await res.json()).access_token;
    };

    async runRequest(url) {
        const data = {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-Requested-With": "XMLHttpRequest",
                "Authorization": `Bearer ${this.access_token}`
            },
            withCredentials: true
        };
        const response = await axios.get(url, data).then((response) => {
            if(response.request.res.statusCode == 200) {
                return response.data.data.children;
            };
            return undefined;
        }).catch(function(err) {
            if(err.status == 404) return console.log(`GET 404 -- ${url}`);
            if(err.status == 401) return this.access_token = this.refreshAccessToken();
            console.error(err);
        });

        return response;
    };

    static build () {
        /* return doSomeAsyncStuff()
            .then(function(async_result){
                return new myClass(async_result);
            }); */
    };
};

module.exports = new RedditService();
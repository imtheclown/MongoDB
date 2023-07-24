const https = require("https");
const { default: axios } = require("axios");

// https.Agent configuration
const errorCertAgent = new https.Agent({
        rejectUnauthorized: false,
    })
    //customized instance of axios
const axiosInstance = axios.create({
    timeout: 30000,
    headers: { 'X-Custom-Header': 'foobar' },
    httpsAgent: errorCertAgent,
});
axios.interceptors.response.use(undefined, (err) => {
    const { config, message } = err;
    console.log(message)
    if (!config || !config.retry) {
        return Promise.reject(err);
    }
    // retry while Network timeout or Network Error
    if (!(message.includes("timeout") || message.includes("Network Error"))) {
        return Promise.reject(err);
    }
    config.retry -= 1;
    const delayRetryRequest = new Promise((resolve) => {
        setTimeout(() => {
            console.log("retry the request", config.url);
            resolve();
        }, config.retryDelay || 30000);
    });
    return delayRetryRequest.then(() => axios(config));
});

function axiosPromiseCreator(url) {
    if (url) {
        return new Promise((resolve, reject) => {
            axiosInstance({
                method: "GET",
                url: url
            }).then(res => {
                if (res) {
                    resolve(res);
                }
            }).catch(err => {
                reject(err)
            })
        })
    }
}

module.exports = { axiosInstance, axiosPromiseCreator }
const { CustomError } = require('./custom-error.js');
const Bottleneck      = require("bottleneck/es5");
const https           = require('https');
const fetch           = require('node-fetch');

const MAX_REQUESTS_PER_SECOND = 20;

const limiter = new Bottleneck({
    minTime: 1000/MAX_REQUESTS_PER_SECOND
  });


/* The replay API is different than the LCU API, so we can't use the League-Connect
package for making replay requests like we do for requests in league-client.js */
async function makeRequest( method, url, headers, body, retries = 3){
    const response = await limiter.schedule( () =>fetch(url, new RequestOptions(method, headers, body)));
    if(!response.ok){
        await parseResponseForErrors(response, retries-1);
        console.log(`retrying. retries = ${retries-1}`);
        return await makeRequest(method, url, headers, body, retries-1);
    }
    try {
        return await response.json()
    } catch(err) {
        return response;
    }
};

async function parseResponseForErrors(response, retries){  
    if(response.status === 404){
        throw new CustomError("Failed to find the requested resource.");
    }

    if(retries <= 0){
        throw new Error(`Client Request Error: ${response.status} ${response.statusText} - ${await response.text()}`);
    }
}

class RequestOptions{
    constructor(method, headers, body){
        this.method = method, // GET or POST
        this.headers = this.setHeaders(headers);
        this.agent = new https.Agent({rejectUnauthorized: false});
        this.body = (method.toLowerCase() == 'get') ? undefined : JSON.stringify(body);
    }

    setHeaders(headers){
        let myHeaders = new fetch.Headers();
        myHeaders.append('Content-Type', 'application/json');
        for(let key in headers){
            myHeaders.append(key, headers[key]);
        }
        return myHeaders;
    }
}

module.exports = { makeRequest };

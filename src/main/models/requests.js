const { CustomError } = require('./custom-error.js');
const Bottleneck      = require("bottleneck/es5");
const { authenticate, createHttp1Request } =  require('league-connect');
const { MAX_REQUESTS_PER_SECOND } = require('../constants.js')


const limiter = new Bottleneck({
    minTime: 1000/MAX_REQUESTS_PER_SECOND
  });

async function makeRequest( method, url, body = {}, retries = 3){
    const credentials = await authenticate()
    const response = await createHttp1Request({
        method: method,
        url: url,
        body: body
    }, credentials)
    
    if(!response.ok){
        await parseResponseForErrors(response, retries-1);
        console.log(`retrying. retries = ${retries-1}`);
        return await makeRequest(method, url, body, retries-1);
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

module.exports = { makeRequest };

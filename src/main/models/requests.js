import Bottleneck from 'bottleneck/es5';
import https from 'https';
import fetch from 'node-fetch';
import { authenticate, createHttp1Request } from 'league-connect';
import { MAX_REQUESTS_PER_SECOND } from '@main/constants';
import { CustomError } from './custom-error';

const limiter = new Bottleneck({
  minTime: 1000 / MAX_REQUESTS_PER_SECOND,
});

export async function makeRequest(method, url, body = {}, retries = 3) {
  const credentials = await authenticate();
  const response = await createHttp1Request({
    method,
    url,
    body,
  }, credentials);

  if (!response.ok) {
    await parseResponseForErrors(response, retries - 1);
    console.log(`retrying. retries = ${retries - 1}`);
    return await makeRequest(method, url, body, retries - 1);
  }
  try {
    return await response.json();
  } catch (err) {
    return response;
  }
}

async function parseResponseForErrors(response, retries) {
  if (response.status === 404) {
    throw new CustomError('Failed to find the requested resource.');
  }

  if (retries <= 0) {
    throw new Error(`Client Request Error: ${response.status} ${response.statusText} - ${await response.text()}`);
  }
}

// class RequestOptions{
//     constructor(method, headers, body){
//         this.method = method, // GET or POST
//         this.headers = this.setHeaders(headers);
//         this.agent = new https.Agent({rejectUnauthorized: false});
//         this.body = (method.toLowerCase() == 'get') ? undefined : JSON.stringify(body);
//     }

//     setHeaders(headers){
//         let myHeaders = new fetch.Headers();
//         myHeaders.append('Content-Type', 'application/json');
//         for(let key in headers){
//             myHeaders.append(key, headers[key]);
//         }
//         return myHeaders;
//     }
// }

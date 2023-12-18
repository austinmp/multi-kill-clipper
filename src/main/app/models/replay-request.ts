import Bottleneck from 'bottleneck';
import https from 'https';
import CustomError from './custom-error';
import { MAX_REQUESTS_PER_SECOND } from '../constants';

const limiter = new Bottleneck({
  minTime: 1000 / MAX_REQUESTS_PER_SECOND,
});

/* The replay API is different than the LCU API, so we can't use the League-Connect
package for making replay requests like we do for requests in league-client.js */
async function makeRequest(
  method: any,
  url: any,
  headers: any = null,
  body: any = null,
  retries: any = 3,
): Promise<any> {
  const newHeaders: any = { ...headers, 'Content-Type': 'application/json' };
  const response = await limiter.schedule(() =>
    fetch(url, new RequestOptions(method, newHeaders, body)),
  );
  if (!response.ok) {
    await parseResponseForErrors(response, retries - 1);
    console.log(`retrying. retries = ${retries - 1}`);
    return await makeRequest(method, url, headers, body, retries - 1);
  }
  try {
    return await response.json();
  } catch (err) {
    return response;
  }
}

async function parseResponseForErrors(response: any, retries: any) {
  if (response.status === 404) {
    throw new CustomError('Failed to find the requested resource.');
  }

  if (retries <= 0) {
    throw new Error(
      `Client Request Error: ${response.status} ${
        response.statusText
      } - ${await response.text()}`,
    );
  }
}

class RequestOptions {
  body: any;

  method: any;

  agent: any;

  headers: any;

  constructor(method: any, headers: any, body: any) {
    this.method = method; // GET or POST
    this.headers = headers;
    this.agent = new https.Agent({ rejectUnauthorized: false });
    this.body =
      method.toLowerCase() === 'get' ? undefined : JSON.stringify(body);
  }

  // setHeaders(headers: any) {
  //   const myHeaders = new fetch.Headers();
  //   myHeaders.append('Content-Type', 'application/json');
  //   for (const key in headers) {
  //     myHeaders.append(key, headers[key]);
  //   }
  //   return myHeaders;
  // }
}

export { makeRequest };

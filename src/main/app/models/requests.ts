import { authenticate, createHttp1Request } from 'league-connect';
import CustomError from './custom-error';

async function makeRequest(method: any, url: any, body: any = {}, retries: any = 3): Promise<any> {
  const credentials = await authenticate();
  const response = await createHttp1Request(
    {
      method,
      url,
      body,
    },
    credentials,
  );

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

export { makeRequest };
